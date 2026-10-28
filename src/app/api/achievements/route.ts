import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

// Achievement definitions
const ACHIEVEMENTS = [
  { id: "first-resume", name: "简历初稿", desc: "创建你的第一份简历", icon: "FileText", color: "emerald", condition: "resumeCount >= 1" },
  { id: "resume-master", name: "简历大师", desc: "创建 5 份以上简历", icon: "FileText", color: "violet", condition: "resumeCount >= 5" },
  { id: "ats-80", name: "ATS 达标", desc: "ATS 分数达到 80 分", icon: "Shield", color: "emerald", condition: "atsScore >= 80" },
  { id: "ats-90", name: "ATS 优秀", desc: "ATS 分数达到 90 分", icon: "Shield", color: "violet", condition: "atsScore >= 90" },
  { id: "first-apply", name: "首次投递", desc: "投递第一个岗位", icon: "Target", color: "emerald", condition: "applications >= 1" },
  { id: "apply-10", name: "积极投递", desc: "投递 10 个以上岗位", icon: "Target", color: "violet", condition: "applications >= 10" },
  { id: "apply-50", name: "投递达人", desc: "投递 50 个以上岗位", icon: "Target", color: "amber", condition: "applications >= 50" },
  { id: "first-interview", name: "初面邀请", desc: "获得第一次面试机会", icon: "Mic", color: "emerald", condition: "interviews >= 1" },
  { id: "interview-5", name: "面试常客", desc: "参加 5 场以上面试", icon: "Mic", color: "violet", condition: "interviews >= 5" },
  { id: "first-offer", name: "首个 Offer", desc: "收到第一个 Offer", icon: "Trophy", color: "emerald", condition: "offers >= 1" },
  { id: "offer-3", name: "Offer 收割机", desc: "收到 3 个以上 Offer", icon: "Trophy", color: "amber", condition: "offers >= 3" },
  { id: "learning-10", name: "学习达人", desc: "完成 10 个学习任务", icon: "BookOpen", color: "emerald", condition: "learningDone >= 10" },
  { id: "learning-50", name: "学习狂人", desc: "完成 50 个学习任务", icon: "BookOpen", color: "violet", condition: "learningDone >= 50" },
  { id: "ai-chat-100", name: "AI 对话达人", desc: "与 AI 对话 100 次", icon: "MessageSquare", color: "violet", condition: "aiChats >= 100" },
  { id: "agent-run", name: "Agent 启动者", desc: "运行 AI Job Agent", icon: "Bot", color: "emerald", condition: "agentRuns >= 1" },
  { id: "streak-7", name: "连续打卡 7 天", desc: "连续 7 天有求职活动", icon: "Flame", color: "amber", condition: "streak >= 7" },
  { id: "streak-30", name: "连续打卡 30 天", desc: "连续 30 天有求职活动", icon: "Flame", color: "rose", condition: "streak >= 30" },
];

// GET /api/achievements — list all achievements with unlock status
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    // Get user stats
    const [resumes, applications, interviews, offers, learningTasks, agentRuns, chatSessions] = await Promise.all([
      db.resume.count({ where: { userId } }),
      db.application.count({ where: { userId } }),
      db.application.count({ where: { userId, status: { in: ["hr", "tech1", "tech2", "hr-final"] } } }),
      db.application.count({ where: { userId, status: "offer" } }),
      db.learningTask.count({ where: { userId, status: "done" } }),
      db.agentRun.count({ where: { userId } }),
      db.chatSession.count({ where: { userId } }),
    ]);

    // Get best ATS score
    const allResumes = await db.resume.findMany({ where: { userId }, select: { atsScore: true } });
    const atsScore = allResumes.length > 0 ? Math.max(...allResumes.map((r) => r.atsScore)) : 0;

    // Calculate streak (simplified - count distinct days with activity in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentApps = await db.application.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const recentLearning = await db.learningTask.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const allDates = [...recentApps, ...recentLearning].map((d) =>
      d.createdAt.toISOString().split("T")[0]
    );
    const uniqueDates = [...new Set(allDates)];
    const streak = uniqueDates.length; // simplified

    const stats = {
      resumeCount: resumes,
      atsScore,
      applications,
      interviews,
      offers,
      learningDone: learningTasks,
      agentRuns,
      aiChats: chatSessions,
      streak,
    };

    // Evaluate each achievement
    const achievements = ACHIEVEMENTS.map((a) => {
      let unlocked = false;
      let progress = 0;

      // Simple condition evaluation
      if (a.condition.includes("resumeCount")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "1");
        unlocked = stats.resumeCount >= target;
        progress = Math.min(100, (stats.resumeCount / target) * 100);
      } else if (a.condition.includes("atsScore")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "80");
        unlocked = stats.atsScore >= target;
        progress = Math.min(100, (stats.atsScore / target) * 100);
      } else if (a.condition.includes("applications")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "1");
        unlocked = stats.applications >= target;
        progress = Math.min(100, (stats.applications / target) * 100);
      } else if (a.condition.includes("interviews")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "1");
        unlocked = stats.interviews >= target;
        progress = Math.min(100, (stats.interviews / target) * 100);
      } else if (a.condition.includes("offers")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "1");
        unlocked = stats.offers >= target;
        progress = Math.min(100, (stats.offers / target) * 100);
      } else if (a.condition.includes("learningDone")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "10");
        unlocked = stats.learningDone >= target;
        progress = Math.min(100, (stats.learningDone / target) * 100);
      } else if (a.condition.includes("aiChats")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "100");
        unlocked = stats.aiChats >= target;
        progress = Math.min(100, (stats.aiChats / target) * 100);
      } else if (a.condition.includes("agentRuns")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "1");
        unlocked = stats.agentRuns >= target;
        progress = Math.min(100, (stats.agentRuns / target) * 100);
      } else if (a.condition.includes("streak")) {
        const target = parseInt(a.condition.match(/\d+/)?.[0] || "7");
        unlocked = stats.streak >= target;
        progress = Math.min(100, (stats.streak / target) * 100);
      }

      return {
        ...a,
        unlocked,
        progress: Math.round(progress),
      };
    });

    const unlockedCount = achievements.filter((a) => a.unlocked).length;

    return NextResponse.json({
      achievements,
      stats,
      unlockedCount,
      totalCount: achievements.length,
    });
  } catch (error) {
    console.error("GET /api/achievements error:", error);
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 });
  }
}
