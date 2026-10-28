import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getCurrentUserId();

    const [resumes, applications, interviews, learningTasks, knowledgeDocs] = await Promise.all([
      db.resume.findMany({ where: { userId }, select: { atsScore: true } }),
      db.application.findMany({ where: { userId }, select: { status: true } }),
      db.interview.findMany({ where: { userId }, select: { id: true } }),
      db.learningTask.findMany({ where: { userId }, select: { status: true, duration: true } }),
      db.knowledgeDoc.count({ where: { userId } }),
    ]);

    const stats = {
      atsScore: resumes.length > 0 ? Math.max(...resumes.map((r) => r.atsScore)) : 0,
      resumeCount: resumes.length,
      applications: applications.length,
      applied: applications.filter((a) => a.status === "applied").length,
      interviews: applications.filter(
        (a) => ["hr", "tech1", "tech2", "hr-final"].includes(a.status)
      ).length,
      offers: applications.filter((a) => a.status === "offer").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      interviewSessions: interviews.length,
      learningTasks: learningTasks.length,
      learningDone: learningTasks.filter((t) => t.status === "done").length,
      learningHours: Math.round(
        learningTasks.filter((t) => t.status === "done").reduce((sum, t) => sum + t.duration, 0) / 60
      ),
      knowledgeDocs,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
