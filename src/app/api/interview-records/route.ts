import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/interview-records — list interview records
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const interviews = await db.interview.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const result = interviews.map((i) => ({
      id: i.id,
      type: i.type,
      questions: i.questions ? JSON.parse(i.questions) : [],
      answers: i.answers ? JSON.parse(i.answers) : [],
      scores: i.scores ? JSON.parse(i.scores) : null,
      overallScore: i.overallScore,
      duration: i.duration,
      feedback: i.feedback,
      createdAt: i.createdAt,
    }));

    return NextResponse.json({ interviews: result });
  } catch (error) {
    console.error("GET /api/interview-records error:", error);
    return NextResponse.json({ error: "Failed to fetch interview records" }, { status: 500 });
  }
}

// POST /api/interview-records — save interview record
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const { type, questions, answers, scores, overallScore, duration, feedback } = body;

    if (!type || !questions) {
      return NextResponse.json({ error: "Type and questions are required" }, { status: 400 });
    }

    const interview = await db.interview.create({
      data: {
        userId,
        type,
        questions: JSON.stringify(questions),
        answers: answers ? JSON.stringify(answers) : null,
        scores: scores ? JSON.stringify(scores) : null,
        overallScore: overallScore || null,
        duration: duration || null,
        feedback: feedback || null,
      },
    });

    return NextResponse.json({ interview }, { status: 201 });
  } catch (error) {
    console.error("POST /api/interview-records error:", error);
    return NextResponse.json({ error: "Failed to save interview record" }, { status: 500 });
  }
}
