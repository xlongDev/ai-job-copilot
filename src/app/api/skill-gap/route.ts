import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { callAIWithCredits } from "@/lib/ai-metering";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";

const skillGapSchema = z.object({
  targetRole: z.string().min(1).max(200),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

interface SkillGapResult {
  currentSkills: { name: string; level: number }[];
  targetSkills: { name: string; required: number; current: number; gap: number }[];
  missingSkills: string[];
  learningPath: { skill: string; priority: "high" | "medium" | "low"; estimatedHours: number; resources: string[] }[];
  salaryProjection: string;
  overallMatch: number;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, skillGapSchema);
    if (!parsed.ok) return parsed.response;
    const {targetRole, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    // Get user's resume
    const resume = await db.resume.findFirst({
      where: { userId, isPrimary: true },
    });

    const resumeContent = resume?.content || "无简历内容";

    const resultMetered = await callAIWithCredits({ userId, feature: "skill-gap" }, {
      messages: [
        {
          role: "system",
          content: `你是技能差距分析专家。根据用户简历和目标岗位，分析技能差距。输出 JSON：
{
  "currentSkills": [{"name":"技能名","level":85}],
  "targetSkills": [{"name":"技能名","required":90,"current":75,"gap":15}],
  "missingSkills": ["缺失技能1","缺失技能2"],
  "learningPath": [{"skill":"技能","priority":"high","estimatedHours":40,"resources":["资源1"]}],
  "salaryProjection": "掌握这些技能后薪资预期提升 30-50%",
  "overallMatch": 68
}
只输出 JSON。`,
        },
        {
          role: "user",
          content: `目标岗位：${targetRole}\n\n我的简历：\n${resumeContent}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.4,
      maxTokens: 1500,
    });
    if (!resultMetered.ok) return resultMetered.response;
    const result = resultMetered.result;

    let analysis: SkillGapResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        currentSkills: [],
        targetSkills: [],
        missingSkills: [],
        learningPath: [],
        salaryProjection: "",
        overallMatch: 0,
      };
    } catch {
      analysis = {
        currentSkills: [],
        targetSkills: [],
        missingSkills: [],
        learningPath: [],
        salaryProjection: "",
        overallMatch: 0,
      };
    }

    return NextResponse.json({
      analysis,
      targetRole,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("Skill gap API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Skill gap analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
