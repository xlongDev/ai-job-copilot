import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { callAIWithCredits } from "@/lib/ai-metering";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/weekly-report — generate weekly report
export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const useAI = searchParams.get("ai") === "true";

    // Get data from last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [apps, interviews, learningTasks, resumes] = await Promise.all([
      db.application.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
      }),
      db.interview.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
      }),
      db.learningTask.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
      }),
      db.resume.findMany({
        where: { userId, updatedAt: { gte: sevenDaysAgo } },
      }),
    ]);

    const report = {
      period: `${sevenDaysAgo.toLocaleDateString("zh-CN")} - ${new Date().toLocaleDateString("zh-CN")}`,
      summary: {
        newApplications: apps.length,
        newInterviews: interviews.length,
        newLearningTasks: learningTasks.length,
        resumeUpdates: resumes.length,
      },
      applications: apps.map((a) => ({
        company: a.company,
        position: a.position,
        status: a.status,
        date: a.createdAt,
      })),
      interviews: interviews.map((i) => ({
        type: i.type,
        overallScore: i.overallScore,
        date: i.createdAt,
      })),
      learning: learningTasks.map((l) => ({
        title: l.title,
        status: l.status,
        duration: l.duration,
      })),
    };

    let aiSummary = "";
    if (useAI) {
      const summaryText = `本周求职活动：
- 新投递：${report.summary.newApplications} 个岗位
- 新面试：${report.summary.newInterviews} 场
- 学习任务：${report.summary.newLearningTasks} 个
- 简历更新：${report.summary.resumeUpdates} 次

投递详情：${report.applications.map((a) => `${a.company}(${a.status})`).join(", ") || "无"}

请生成一份简洁的周报总结，包括：1. 本周亮点 2. 需要改进的地方 3. 下周建议。控制在 200 字以内。`;

      const resultMetered = await callAIWithCredits({ userId, feature: "weekly-report" }, {
        messages: [
          { role: "system", content: "你是求职顾问，请根据用户本周的求职活动数据生成周报总结。" },
          { role: "user", content: summaryText },
        ],
        provider: "zai",
        temperature: 0.5,
        maxTokens: 500,
      });
      if (!resultMetered.ok) return resultMetered.response;
      const result = resultMetered.result;
      aiSummary = result.content;
    }

    return NextResponse.json({
      report,
      aiSummary,
    });
  } catch (error) {
    console.error("GET /api/weekly-report error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
