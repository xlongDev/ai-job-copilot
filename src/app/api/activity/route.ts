import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

interface Activity {
  id: string;
  type: "resume" | "application" | "interview" | "learning" | "agent" | "ats";
  action: string;
  detail: string;
  timestamp: string;
}

// GET /api/activity — get recent activity timeline
export async function GET() {
  try {
    const userId = await getDemoUserId();
    const activities: Activity[] = [];

    // Fetch recent resumes
    const resumes = await db.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
    });
    resumes.forEach((r) => {
      activities.push({
        id: `resume-${r.id}`,
        type: "resume",
        action: "更新简历",
        detail: `${r.title} (ATS: ${r.atsScore})`,
        timestamp: r.updatedAt.toISOString(),
      });
    });

    // Fetch recent applications
    const apps = await db.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    apps.forEach((a) => {
      const statusMap: Record<string, string> = {
        applied: "投递岗位",
        hr: "进入 HR 面",
        tech1: "进入技术一面",
        tech2: "进入技术二面",
        "hr-final": "进入 HR 终面",
        offer: "收到 Offer",
        rejected: "未通过",
      };
      activities.push({
        id: `app-${a.id}`,
        type: "application",
        action: statusMap[a.status] || "更新投递",
        detail: `${a.company} - ${a.position}`,
        timestamp: a.createdAt.toISOString(),
      });
    });

    // Fetch recent learning tasks
    const tasks = await db.learningTask.findMany({
      where: { userId, status: "done" },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
    tasks.forEach((t) => {
      activities.push({
        id: `learn-${t.id}`,
        type: "learning",
        action: "完成学习任务",
        detail: `${t.title} (${t.duration}min)`,
        timestamp: t.createdAt.toISOString(),
      });
    });

    // Fetch recent agent runs
    const runs = await db.agentRun.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 2,
    });
    runs.forEach((r) => {
      activities.push({
        id: `agent-${r.id}`,
        type: "agent",
        action: "运行 AI Agent",
        detail: `目标: ${r.target}`,
        timestamp: r.createdAt.toISOString(),
      });
    });

    // Sort by timestamp desc
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ activities: activities.slice(0, 20) });
  } catch (error) {
    console.error("GET /api/activity error:", error);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
