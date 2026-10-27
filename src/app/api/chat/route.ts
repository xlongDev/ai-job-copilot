import { NextRequest, NextResponse } from "next/server";
import { callAI, type ChatMessage } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      context,
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body as {
      messages: ChatMessage[];
      context?: string;
      provider?: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
    };

    const systemPrompt = `你是 AI Job Copilot，一个专业的 AI 求职助手。你的任务是帮助用户优化简历、准备面试、分析岗位匹配度、提供职业建议。

你的能力包括：
- 简历优化（STAR 法则、量化成果、关键词增强）
- ATS 兼容性分析
- JD 匹配度评估
- 模拟面试（技术、行为、系统设计）
- 职业规划与成长建议
- 学习路线制定

请用专业、简洁、有洞察力的方式回答。使用 Markdown 格式化输出。${
      context ? `\n\n用户上下文信息：\n${context}` : ""
    }`;

    const result = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        content: `抱歉，AI 服务暂时不可用。\n\n错误信息：${message}\n\n你可以：\n1. 检查 API Key 是否正确配置\n2. 切换到默认 ZAI 服务（无需 Key）\n3. 稍后重试`,
        role: "assistant" as const,
        provider: "error",
        model: "unknown",
        error: message,
      },
      { status: 200 }
    );
  }
}
