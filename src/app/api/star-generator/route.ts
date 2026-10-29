import { NextRequest, NextResponse } from "next/server";
import { callAIWithCredits } from "@/lib/ai-metering";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/auth";

const starGeneratorSchema = z.object({
  projectDescription: z.string().min(1).max(50_000),
  role: z.string().max(200).optional(),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

interface STARResult {
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  businessValue: string;
}

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, starGeneratorSchema);
    if (!parsed.ok) return parsed.response;
    const {projectDescription, role = "", provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!projectDescription || projectDescription.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a project description (at least 10 characters)" },
        { status: 400 }
      );
    }

    const userId = await getCurrentUserId();
    const resultMetered = await callAIWithCredits({ userId, feature: "star-generator" }, {
      messages: [
        {
          role: "system",
          content: `你是 STAR 法则专家。将用户的项目描述重构为 STAR 结构（Situation, Task, Action, Result）。要求：
1. Situation: 项目背景、业务场景
2. Task: 你的具体职责和目标
3. Action: 你采取的技术行动（要具体，包含技术选型）
4. Result: 量化成果（必须有数字）
5. metrics: 提取所有量化指标（数组）
6. businessValue: 商业价值描述

输出 JSON 格式：
{"situation":"...","task":"...","action":"...","result":"...","metrics":["指标1","指标2"],"businessValue":"..."}
只输出 JSON。`,
        },
        {
          role: "user",
          content: `项目描述：${projectDescription}\n${role ? `我的角色：${role}` : ""}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.6,
      maxTokens: 1200,
    });
    if (!resultMetered.ok) return resultMetered.response;
    const result = resultMetered.result;

    let star: STARResult;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      star = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        situation: "",
        task: "",
        action: result.content,
        result: "",
        metrics: [],
        businessValue: "",
      };
    } catch {
      star = {
        situation: "",
        task: "",
        action: result.content,
        result: "",
        metrics: [],
        businessValue: "",
      };
    }

    return NextResponse.json({
      star,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("STAR generator API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `STAR generation failed: ${message}` },
      { status: 500 }
    );
  }
}
