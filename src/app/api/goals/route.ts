import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/goals — get user's job search goals
export async function GET() {
  try {
    const userId = await getDemoUserId();
    const user = await db.user.findUnique({ where: { id: userId } });

    // Default goals
    const defaultGoals = {
      targetRole: "Staff Frontend Engineer",
      targetCompany: "Tencent",
      weeklyApplyGoal: 10,
      weeklyApplyCount: 0,
      monthlyInterviewGoal: 5,
      monthlyInterviewCount: 0,
      targetSalary: "40-70K",
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({ goals: defaultGoals });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

// POST /api/goals — update goals
export async function POST(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const body = await req.json();
    const { targetRole, targetCompany, weeklyApplyGoal, monthlyInterviewGoal, targetSalary, deadline } = body;

    // In production, save to database. For now, return success.
    return NextResponse.json({
      success: true,
      goals: {
        targetRole: targetRole || "Staff Frontend Engineer",
        targetCompany: targetCompany || "Tencent",
        weeklyApplyGoal: weeklyApplyGoal || 10,
        monthlyInterviewGoal: monthlyInterviewGoal || 5,
        targetSalary: targetSalary || "40-70K",
        deadline: deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/goals error:", error);
    return NextResponse.json({ error: "Failed to update goals" }, { status: 500 });
  }
}
