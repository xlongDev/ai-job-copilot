import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const resumeUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(200_000).optional(),
  format: z.enum(["markdown","json","text"]).optional(),
  atsScore: z.number().int().min(0).max(100).optional(),
  isPrimary: z.boolean().optional(),
});

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resume = await db.resume.findUnique({ where: { id } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ resume });
  } catch (error) {
    console.error("GET /api/resumes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch resume" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = await parseBody(req, resumeUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const {title, content, format, atsScore, isPrimary} = parsed.data;

    const resume = await db.resume.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(format !== undefined && { format }),
        ...(atsScore !== undefined && { atsScore }),
        ...(isPrimary !== undefined && { isPrimary }),
        version: { increment: 1 },
      },
    });

    return NextResponse.json({ resume });
  } catch (error) {
    console.error("PUT /api/resumes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update resume" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.resume.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/resumes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
