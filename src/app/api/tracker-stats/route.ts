import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/tracker-stats — aggregated tracker statistics
export async function GET() {
  try {
    const userId = await getDemoUserId();
    const apps = await db.application.findMany({ where: { userId } });

    const total = apps.length;
    const byStatus = {
      wishlist: apps.filter((a) => a.status === "wishlist").length,
      applied: apps.filter((a) => a.status === "applied").length,
      hr: apps.filter((a) => a.status === "hr").length,
      tech1: apps.filter((a) => a.status === "tech1").length,
      tech2: apps.filter((a) => a.status === "tech2").length,
      "hr-final": apps.filter((a) => a.status === "hr-final").length,
      offer: apps.filter((a) => a.status === "offer").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    };

    const interviewCount = byStatus.hr + byStatus.tech1 + byStatus.tech2 + byStatus["hr-final"];
    const offerCount = byStatus.offer;
    const rejectedCount = byStatus.rejected;

    // Conversion rates
    const appliedToInterview = total > 0 ? Math.round((interviewCount / total) * 100) : 0;
    const interviewToOffer = interviewCount > 0 ? Math.round((offerCount / interviewCount) * 100) : 0;
    const overallSuccess = total > 0 ? Math.round((offerCount / total) * 100) : 0;

    // Average match score
    const matchScores = apps.filter((a) => a.matchScore && a.matchScore > 0).map((a) => a.matchScore!);
    const avgMatch = matchScores.length > 0 ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length) : 0;

    // Priority breakdown
    const byPriority = {
      high: apps.filter((a) => a.priority === "high").length,
      medium: apps.filter((a) => a.priority === "medium").length,
      low: apps.filter((a) => a.priority === "low").length,
    };

    // Company breakdown (top 5)
    const companyCount: Record<string, number> = {};
    apps.forEach((a) => {
      companyCount[a.company] = (companyCount[a.company] || 0) + 1;
    });
    const topCompanies = Object.entries(companyCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }));

    return NextResponse.json({
      total,
      byStatus,
      byPriority,
      topCompanies,
      rates: {
        appliedToInterview,
        interviewToOffer,
        overallSuccess,
      },
      avgMatch,
      interviewCount,
      offerCount,
      rejectedCount,
    });
  } catch (error) {
    console.error("GET /api/tracker-stats error:", error);
    return NextResponse.json({ error: "Failed to fetch tracker stats" }, { status: 500 });
  }
}
