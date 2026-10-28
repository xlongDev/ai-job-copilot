import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/calendar?month=2026-01 — get calendar events for a month
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month"); // format: 2026-01

    let startDate: Date;
    let endDate: Date;

    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0, 23, 59, 59);
    } else {
      // Current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    const [applications, interviews, learningTasks] = await Promise.all([
      db.application.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { id: true, company: true, position: true, status: true, createdAt: true },
      }),
      db.interview.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { id: true, type: true, overallScore: true, createdAt: true },
      }),
      db.learningTask.findMany({
        where: {
          userId,
          createdAt: { gte: startDate, lte: endDate },
        },
        select: { id: true, title: true, status: true, duration: true, createdAt: true },
      }),
    ]);

    const events = [
      ...applications.map((a) => ({
        id: `app-${a.id}`,
        type: "application" as const,
        title: `${a.company} - ${a.position}`,
        detail: a.status,
        date: a.createdAt.toISOString(),
        color: a.status === "offer" ? "emerald" : a.status === "rejected" ? "rose" : "violet",
      })),
      ...interviews.map((i) => ({
        id: `int-${i.id}`,
        type: "interview" as const,
        title: `${i.type} 面试`,
        detail: i.overallScore ? `${i.overallScore} 分` : "进行中",
        date: i.createdAt.toISOString(),
        color: "amber",
      })),
      ...learningTasks.map((l) => ({
        id: `learn-${l.id}`,
        type: "learning" as const,
        title: l.title,
        detail: `${l.duration}min · ${l.status}`,
        date: l.createdAt.toISOString(),
        color: "emerald",
      })),
    ];

    // Group by date (YYYY-MM-DD)
    const byDate: Record<string, typeof events> = {};
    events.forEach((e) => {
      const dateKey = new Date(e.date).toISOString().split("T")[0];
      if (!byDate[dateKey]) byDate[dateKey] = [];
      byDate[dateKey].push(e);
    });

    return NextResponse.json({
      events,
      byDate,
      month: monthParam || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`,
    });
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar" }, { status: 500 });
  }
}
