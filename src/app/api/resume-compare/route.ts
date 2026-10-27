import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/resume-compare?ids=id1,id2 — compare multiple resumes
export async function GET(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids");

    if (!ids) {
      // Return all resumes for selection
      const resumes = await db.resume.findMany({
        where: { userId },
        select: { id: true, title: true, atsScore: true, version: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      });
      return NextResponse.json({ resumes });
    }

    const idArray = ids.split(",");
    const resumes = await db.resume.findMany({
      where: { id: { in: idArray }, userId },
    });

    if (resumes.length < 2) {
      return NextResponse.json({ error: "At least 2 resumes needed for comparison" }, { status: 400 });
    }

    // Generate diff
    const comparison = resumes.map((r) => ({
      id: r.id,
      title: r.title,
      atsScore: r.atsScore,
      version: r.version,
      content: r.content,
      wordCount: r.content.split(/\s+/).filter(Boolean).length,
      charCount: r.content.length,
      sections: (r.content.match(/^##\s+.+$/gm) || []).map((s) => s.replace(/^##\s+/, "")),
    }));

    // Find common and different sections
    const allSections = comparison.flatMap((c) => c.sections);
    const commonSections = allSections.filter((s, i) => allSections.indexOf(s) !== i);

    return NextResponse.json({
      comparison,
      commonSections: [...new Set(commonSections)],
      bestATS: Math.max(...comparison.map((c) => c.atsScore)),
      longestContent: comparison.reduce((max, c) => (c.charCount > max.charCount ? c : max)),
    });
  } catch (error) {
    console.error("GET /api/resume-compare error:", error);
    return NextResponse.json({ error: "Failed to compare resumes" }, { status: 500 });
  }
}
