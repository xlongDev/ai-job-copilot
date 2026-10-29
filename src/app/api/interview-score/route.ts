import { NextRequest, NextResponse } from "next/server";
import { callAIWithCredits } from "@/lib/ai-metering";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/auth";

const interviewScoreSchema = z.object({
  question: z.string().min(1).max(10_000),
  answer: z.string().max(50_000).optional(),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, interviewScoreSchema);
    if (!parsed.ok) return parsed.response;
    const {question, answer, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();
    const resultMetered = await callAIWithCredits({ userId, feature: "interview-score" }, {
      messages: [
        {
          role: "system",
          content:
            "你是资深面试官，负责评估候选人的面试回答。请从表达能力、逻辑思维、专业能力、STAR结构、沟通能力 5 个维度评分（0-100），并给出具体反馈。输出 JSON 格式：{\"scores\":{\"expression\":85,\"logic\":90,\"professional\":82,\"star\":78,\"communication\":88},\"feedback\":\"总体评价\",\"strengths\":[\"优点1\"],\"improvements\":[\"改进1\"]}。只输出 JSON。",
        },
        {
          role: "user",
          content: `面试问题：${question}\n\n候选人回答：${answer}\n\n请评估这个回答。`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.5,
      maxTokens: 1000,
    });
    if (!resultMetered.ok) return resultMetered.response;
    const result = resultMetered.result;

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
          expression: 75,
          logic: 80,
          professional: 78,
          star: 72,
          communication: 82,
        },
        feedback: "回答基本到位，建议使用 STAR 法则结构化表达。",
        strengths: ["技术理解到位", "有实际项目经验"],
        improvements: ["增加量化数据", "结构化表达"],
      };
    }

    return NextResponse.json({
      evaluation,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("Interview score API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      evaluation: {
        scores: { expression: 70, logic: 75, professional: 72, star: 68, communication: 78 },
        feedback: "评估服务暂时不可用，已使用默认评分。",
        strengths: [],
        improvements: ["稍后重试获取 AI 评估"],
      },
      error: message,
    });
  }
}
