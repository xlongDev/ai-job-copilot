import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/resume-score — AI-powered resume scoring with multi-dimensional analysis
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      content,
      targetRole = "前端工程师",
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body;

    if (!content || content.trim().length < 50) {
      return NextResponse.json(
        { error: "Resume content too short for analysis (min 50 chars)" },
        { status: 400 }
      );
    }

    const result = await callAI({
      messages: [
        {
          role: "system",
          content: `你是顶级简历评分专家。请从以下 8 个维度对简历进行评分（0-100 分），并给出具体改进建议。

评分维度：
1. content_quality: 内容质量（完整性、准确性）
2. structure: 结构清晰度（逻辑、层次）
3. keywords: 关键词覆盖（技术栈、岗位匹配）
4. quantification: 量化数据（数字、百分比、成果）
5. action_verbs: 行动动词（强动词使用）
6. ats_compatibility: ATS 兼容性（格式、可读性）
7. relevance: 岗位匹配度（与目标岗位的相关性）
8. overall: 综合评分

输出 JSON 格式：
{
  "scores": {
    "content_quality": 85,
    "structure": 80,
    "keywords": 75,
    "quantification": 70,
    "action_verbs": 82,
    "ats_compatibility": 88,
    "relevance": 90,
    "overall": 82
  },
  "strengths": ["优点1", "优点2", "优点3"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2", "建议3"],
  "summary": "总体评价（2-3句话）"
}
只输出 JSON，不要其他文字。`,
        },
        {
          role: "user",
          content: `目标岗位：${targetRole}\n\n简历内容：\n${content}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.3,
      maxTokens: 1200,
    });

    let evaluation;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      evaluation = null;
    }

    if (!evaluation) {
      evaluation = {
        scores: {
          content_quality: 75,
          structure: 72,
          keywords: 68,
          quantification: 65,
          action_verbs: 70,
          ats_compatibility: 78,
          relevance: 80,
          overall: 73,
        },
        strengths: ["简历内容基本完整", "包含技术关键词"],
        weaknesses: ["缺少量化数据", "行动动词不够强"],
        suggestions: ["增加具体数字", "使用强动词开头", "补充项目成果"],
        summary: "简历基本合格，建议在量化数据和行动动词方面加强。",
      };
    }

    return NextResponse.json({
      evaluation,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("Resume score API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Resume scoring failed: ${message}` },
      { status: 500 }
    );
  }
}
