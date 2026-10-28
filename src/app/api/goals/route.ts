import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const goalsSchema = z.object({
  targetRole: z.string().max(200).optional(),
  targetCompany: z.string().max(200).optional(),
  weeklyApplyGoal: z.number().int().min(0).max(1000).optional(),
  monthlyInterviewGoal: z.number().int().min(0).max(1000).optional(),
  targetSalary: z.string().max(100).optional(),
  deadline: z.string().max(100).optional(),
});

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
    const parsed = await parseBody(req, goalsSchema);
    if (!parsed.ok) return parsed.response;
    const {targetRole, targetCompany, weeklyApplyGoal, monthlyInterviewGoal, targetSalary, deadline} = parsed.data;

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
