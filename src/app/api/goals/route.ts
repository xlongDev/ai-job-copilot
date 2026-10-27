import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// GET /api/goals — get user's job search goals
// ponytail: 目标尚未持久化（schema 无 Goal 表），返回默认值；接真实存储时改为读库
export async function GET() {
  try {
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
    const body = await req.json();
    const { targetRole, targetCompany, weeklyApplyGoal, monthlyInterviewGoal, targetSalary, deadline } = body;

    // ponytail: 同上，未落库，仅回显；接真实存储时补 db 写入
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
