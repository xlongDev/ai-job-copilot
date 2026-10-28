import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const learningUpdateSchema = z.object({
  status: z.enum(["pending","in-progress","done"]),
});

export const runtime = "nodejs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsed = await parseBody(req, learningUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const {status} = parsed.data;

    const task = await db.learningTask.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("PUT /api/learning/[id] error:", error);
    return NextResponse.json({ error: "Failed to update learning task" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.learningTask.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/learning/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete learning task" }, { status: 500 });
  }
}
