import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";

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
    const body = await req.json();
    const {
      projectDescription,
      role = "",
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body;

    if (!projectDescription || projectDescription.trim().length < 10) {
      return NextResponse.json(
        { error: "Please provide a project description (at least 10 characters)" },
        { status: 400 }
      );
    }

    const result = await callAI({
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
