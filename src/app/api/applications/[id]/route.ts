import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const applicationUpdateSchema = z.object({
  status: z.enum(["wishlist","applied","hr","tech1","tech2","hr-final","offer","rejected"]).optional(),
  priority: z.enum(["low","medium","high"]).optional(),
  matchScore: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(20_000).optional(),
});

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = await parseBody(req, applicationUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const {status, priority, matchScore, notes} = parsed.data;

    const application = await db.application.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(matchScore !== undefined && { matchScore }),
        ...(notes !== undefined && { notes }),
      },
    });

    return NextResponse.json({ application });
  } catch (error) {
    console.error("PUT /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.application.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
