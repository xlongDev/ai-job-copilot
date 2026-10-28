import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const userUpdateSchema = z.object({
  name: z.string().max(100).optional(),
  avatar: z.string().max(500).optional(),
  role: z.string().max(200).optional(),
});

export const runtime = "nodejs";

// GET /api/user — get current user info
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "User",
        avatar: user.avatar || (user.name?.slice(0, 2).toUpperCase() || "U"),
        role: user.role,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("GET /api/user error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT /api/user — update user info
export async function PUT(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, userUpdateSchema);
    if (!parsed.ok) return parsed.response;
    const {name, avatar, role} = parsed.data;

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(role !== undefined && { role }),
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("PUT /api/user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
