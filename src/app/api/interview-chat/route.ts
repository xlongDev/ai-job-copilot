import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// POST /api/interview-chat — AI interviewer with multi-turn dialogue
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      interviewType = "tech",
      role = "前端工程师",
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body;

    const typeMap: Record<string, string> = {
      hr: "HR 行为面试官",
      tech: "技术面试官",
      project: "项目面试官",
      algo: "算法面试官",
      behavior: "行为面试官",
      system: "系统设计面试官",
    };

    const systemPrompt = `你是一位资深${typeMap[interviewType] || typeMap.tech}，正在面试一位应聘${role}的候选人。

你的任务：
1. 根据候选人的回答，提出有深度的追问
2. 评估回答质量，给出实时反馈
3. 逐步深入，从基础到高级
4. 面试风格：专业、友好但有挑战性
5. 每次只问一个问题，不要一次问多个
6. 如果候选人回答不够好，适当引导
7. 面试进行 5-8 轮后，给出总结评价

当前面试类型：${typeMap[interviewType] || typeMap.tech}
目标岗位：${role}

请开始面试，先做一个简短的自我介绍并问第一个问题。`;

    const result = await callAI({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.7,
      maxTokens: 800,
    });

    return NextResponse.json({
      content: result.content,
      role: "assistant" as const,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("Interview chat API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        content: `面试官遇到了一些问题：${message}\n\n请稍后重试，或检查 AI Provider 配置。`,
        role: "assistant" as const,
        provider: "error",
        model: "unknown",
        error: message,
      },
      { status: 200 }
    );
  }
}
