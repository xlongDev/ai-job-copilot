import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { callAIWithCredits } from "@/lib/ai-metering";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/ai-suggestions — generate personalized AI suggestions based on user data
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const [resumes, applications, interviews, learningTasks, knowledgeDocs] = await Promise.all([
      db.resume.findMany({ where: { userId }, select: { atsScore: true, title: true, updatedAt: true } }),
      db.application.findMany({ where: { userId }, select: { status: true, company: true, position: true, createdAt: true } }),
      db.interview.findMany({ where: { userId }, select: { type: true, overallScore: true, createdAt: true } }),
      db.learningTask.findMany({ where: { userId }, select: { status: true, title: true, duration: true } }),
      db.knowledgeDoc.count({ where: { userId } }),
    ]);

    const stats = {
      resumeCount: resumes.length,
      atsScore: resumes.length > 0 ? Math.max(...resumes.map((r) => r.atsScore)) : 0,
      applications: applications.length,
      applied: applications.filter((a) => a.status === "applied").length,
      interviews: applications.filter((a) => ["hr", "tech1", "tech2", "hr-final"].includes(a.status)).length,
      offers: applications.filter((a) => a.status === "offer").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      interviewSessions: interviews.length,
      learningTasks: learningTasks.length,
      learningDone: learningTasks.filter((t) => t.status === "done").length,
      knowledgeDocs,
    };

    // Generate rule-based suggestions
    const suggestions: { type: "success" | "warning" | "info"; title: string; desc: string; action?: string }[] = [];

    // ATS suggestions
    if (stats.atsScore < 70) {
      suggestions.push({
        type: "warning",
        title: "ATS 分数偏低",
        desc: `当前 ATS 分数 ${stats.atsScore}，建议优化简历关键词和格式，目标 80+`,
        action: "前往 ATS 扫描",
      });
    } else if (stats.atsScore >= 80) {
      suggestions.push({
        type: "success",
        title: "ATS 分数优秀",
        desc: `当前 ATS 分数 ${stats.atsScore}，超过 73% 的求职者`,
      });
    }

    // Application suggestions
    const conversionRate = stats.applications > 0 ? (stats.interviews / stats.applications) * 100 : 0;
    if (stats.applications === 0) {
      suggestions.push({
        type: "info",
        title: "开始投递",
        desc: "你还没有投递任何岗位，建议先完善简历再开始投递",
        action: "前往求职追踪",
      });
    } else if (conversionRate < 15 && stats.applications > 5) {
      suggestions.push({
        type: "warning",
        title: "面试转化率偏低",
        desc: `投递 ${stats.applications} 个岗位，面试转化率 ${conversionRate.toFixed(0)}%，建议优化简历匹配度`,
        action: "前往 JD 匹配",
      });
    } else if (conversionRate >= 25) {
      suggestions.push({
        type: "success",
        title: "面试转化率优秀",
        desc: `投递到面试的转化率 ${conversionRate.toFixed(0)}%，高于行业平均 15%`,
      });
    }

    // Interview suggestions
    if (stats.interviews > 0 && stats.offers === 0) {
      suggestions.push({
        type: "info",
        title: "面试准备建议",
        desc: `你有 ${stats.interviews} 场面试进行中，建议多做模拟面试提升通过率`,
        action: "前往模拟面试",
      });
    }

    // Learning suggestions
    const learningRate = stats.learningTasks > 0 ? (stats.learningDone / stats.learningTasks) * 100 : 0;
    if (stats.learningTasks === 0) {
      suggestions.push({
        type: "info",
        title: "制定学习计划",
        desc: "还没有学习任务，建议根据目标岗位制定学习路线",
        action: "前往学习路线",
      });
    } else if (learningRate < 50) {
      suggestions.push({
        type: "warning",
        title: "学习进度落后",
        desc: `完成率 ${learningRate.toFixed(0)}%，建议加快学习节奏`,
        action: "前往学习路线",
      });
    }

    // Offer suggestions
    if (stats.offers > 0) {
      suggestions.push({
        type: "success",
        title: "收到 Offer",
        desc: `恭喜收到 ${stats.offers} 个 Offer！建议使用 Offer 分析工具做决策`,
        action: "前往 Offer 分析",
      });
    }

    // Knowledge base
    if (stats.knowledgeDocs === 0) {
      suggestions.push({
        type: "info",
        title: "建立知识库",
        desc: "上传简历和项目文档到 RAG 知识库，AI 对话时自动引用",
        action: "前往 RAG 知识库",
      });
    }

    // AI-powered suggestion (optional, uses AI)
    try {
      const aiResultMetered = await callAIWithCredits({ userId, feature: "ai-suggestions" }, {
        messages: [
          {
            role: "system",
            content: "你是求职顾问。根据用户数据生成 1 条个性化建议（50字以内）。只输出建议文本。",
          },
          {
            role: "user",
            content: `我的求职数据：简历${stats.resumeCount}份(ATS ${stats.atsScore})，投递${stats.applications}个，面试${stats.interviews}场，Offer ${stats.offers}个，学习任务${stats.learningDone}/${stats.learningTasks}完成。请给一条建议。`,
          },
        ],
        provider: "zai",
        temperature: 0.5,
        maxTokens: 100,
      });
      if (!aiResultMetered.ok) return aiResultMetered.response;
      const aiResult = aiResultMetered.result;

      if (aiResult.content) {
        suggestions.unshift({
          type: "info",
          title: "AI 个性化建议",
          desc: aiResult.content,
        });
      }
    } catch {
      // AI suggestion is optional, skip on failure
    }

    return NextResponse.json({ suggestions, stats });
  } catch (error) {
    console.error("GET /api/ai-suggestions error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
