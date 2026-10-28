import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { callAI } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/cover-letter — list user's cover letters
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const letters = await db.coverLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ letters });
  } catch (error) {
    console.error("GET /api/cover-letter error:", error);
    return NextResponse.json({ error: "Failed to fetch cover letters" }, { status: 500 });
  }
}

// POST /api/cover-letter — generate a cover letter using AI
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const {
      company,
      position,
      resumeContent,
      jdContent,
      tone = "professional",
      language = "zh",
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body;

    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required" },
        { status: 400 }
      );
    }

    const toneMap: Record<string, string> = {
      professional: "专业、正式",
      casual: "轻松、亲和",
      formal: "非常正式、商务",
      creative: "有创意、个性化",
    };

    const langInstruction = language === "en"
      ? "Write the cover letter in English."
      : "用中文撰写求职信。";

    const result = await callAI({
      messages: [
        {
          role: "system",
          content: `你是顶级求职信撰写专家。根据用户的简历和目标岗位，撰写一封有说服力的求职信。要求：${toneMap[tone] || toneMap.professional}。${langInstruction} 控制在 400-600 字。突出与岗位的匹配度，展示对公司的了解，表达诚意。直接输出求职信正文，不要加标题或前言。`,
        },
        {
          role: "user",
          content: `目标公司：${company}\n目标岗位：${position}\n\n我的简历：\n${resumeContent || "（未提供简历，请根据岗位通用要求撰写）"}\n\n${jdContent ? `岗位 JD：\n${jdContent}` : ""}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // Save to database
    const letter = await db.coverLetter.create({
      data: {
        userId,
        company,
        position,
        content: result.content,
        tone,
        language,
      },
    });

    return NextResponse.json({
      letter,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("POST /api/cover-letter error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate cover letter: ${message}` },
      { status: 500 }
    );
  }
}
