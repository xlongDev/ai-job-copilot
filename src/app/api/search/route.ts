import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/search?q=keyword — global search across all entities
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim().toLowerCase();

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const [resumes, applications, learningTasks, knowledgeDocs] = await Promise.all([
      db.resume.findMany({
        where: {
          userId,
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, title: true, atsScore: true, updatedAt: true },
      }),
      db.application.findMany({
        where: {
          userId,
          OR: [
            { company: { contains: q } },
            { position: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, company: true, position: true, status: true, createdAt: true },
      }),
      db.learningTask.findMany({
        where: {
          userId,
          title: { contains: q },
        },
        take: 5,
        select: { id: true, title: true, status: true, category: true },
      }),
      db.knowledgeDoc.findMany({
        where: {
          userId,
          OR: [
            { name: { contains: q } },
            { content: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, name: true, type: true, createdAt: true },
      }),
    ]);

    const results = [
      ...resumes.map((r) => ({
        id: r.id,
        type: "resume" as const,
        title: r.title,
        subtitle: `ATS: ${r.atsScore}`,
        view: "resume",
        updatedAt: r.updatedAt,
      })),
      ...applications.map((a) => ({
        id: a.id,
        type: "application" as const,
        title: `${a.company} - ${a.position}`,
        subtitle: a.status,
        view: "tracker",
        updatedAt: a.createdAt,
      })),
      ...learningTasks.map((l) => ({
        id: l.id,
        type: "learning" as const,
        title: l.title,
        subtitle: `${l.category} · ${l.status}`,
        view: "learning",
        updatedAt: null,
      })),
      ...knowledgeDocs.map((d) => ({
        id: d.id,
        type: "knowledge" as const,
        title: d.name,
        subtitle: d.type,
        view: "rag",
        updatedAt: d.createdAt,
      })),
    ];

    return NextResponse.json({
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
