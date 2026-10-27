import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/team — list team members
export async function GET() {
  try {
    const userId = await getDemoUserId();
    const members = await db.teamMember.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    // If no members, create default team
    if (members.length === 0) {
      const defaultMembers = await Promise.all([
        db.teamMember.create({
          data: { userId, email: "alex.chen@email.com", name: "Alex Chen", avatar: "AC", role: "owner", status: "active", creditsUsed: 1450, lastActive: "在线" },
        }),
        db.teamMember.create({
          data: { userId, email: "sarah@company.com", name: "Sarah Wang", avatar: "SW", role: "admin", status: "active", creditsUsed: 890, lastActive: "5分钟前" },
        }),
        db.teamMember.create({
          data: { userId, email: "mike@company.com", name: "Mike Liu", avatar: "ML", role: "member", status: "active", creditsUsed: 620, lastActive: "1小时前" },
        }),
      ]);
      return NextResponse.json({ members: defaultMembers });
    }

    return NextResponse.json({ members });
  } catch (error) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

// POST /api/team — invite a team member
export async function POST(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const body = await req.json();
    const { email, name, role = "member" } = body;

    if (!email || !name) {
      return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
    }

    const member = await db.teamMember.create({
      data: {
        userId,
        email,
        name,
        avatar: name.slice(0, 2).toUpperCase(),
        role,
        status: "invited",
        creditsUsed: 0,
        lastActive: "待接受",
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ error: "Failed to invite member" }, { status: 500 });
  }
}
