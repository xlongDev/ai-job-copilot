import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";

const interviewQuestionsSchema = z.object({
  type: z.string().max(60).optional(),
  role: z.string().max(100).optional(),
  count: z.number().int().min(1).max(50).optional(),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, interviewQuestionsSchema);
    if (!parsed.ok) return parsed.response;
    const {type = "tech", role = "前端工程师", count = 5, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    const typeMap: Record<string, string> = {
      hr: "HR 行为面试（自我介绍、职业规划、薪资期望、团队协作）",
      tech: "技术面试（前端原理、框架、工程化、性能优化）",
      project: "项目面试（项目深挖、技术决策、难点解决）",
      algo: "算法面试（数据结构、算法题、复杂度分析）",
      behavior: "行为面试（STAR 法则、领导力、冲突处理）",
      system: "系统设计（架构设计、技术选型、扩展性）",
    };

    const result = await callAI({
      messages: [
        {
          role: "system",
          content:
            "你是资深技术面试官。根据岗位和面试类型生成高质量的面试问题。输出 JSON 数组格式，每个问题包含 question（问题）和 hint（考察点）字段。只输出 JSON，不要其他文字。",
        },
        {
          role: "user",
          content: `岗位：${role}\n面试类型：${typeMap[type] || typeMap.tech}\n生成 ${count} 道面试问题。\n\n输出格式：\n[{"question":"问题内容","hint":"考察点"}]`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.8,
      maxTokens: 1500,
    });

    // Try to parse JSON from the response
    let questions: { question: string; hint: string }[] = [];
    try {
      const jsonMatch = result.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback: split by newlines
      questions = result.content
        .split("\n")
        .filter((l) => l.trim().match(/^\d+[.、]/))
        .map((l) => ({
          question: l.replace(/^\d+[.、]\s*/, "").trim(),
          hint: "综合考察",
        }));
    }

    if (questions.length === 0) {
      // Final fallback with default questions
      questions = [
        { question: `请做一个简短的自我介绍，重点突出你作为${role}的技术亮点。`, hint: "表达能力与自我认知" },
        { question: "你遇到过最有挑战性的技术问题是什么？如何解决的？", hint: "问题解决能力" },
        { question: "讲一个你和团队意见不一致的经历，你是怎么处理的？", hint: "沟通与协作" },
        { question: "你最近在学习什么新技术？为什么？", hint: "学习能力与主动性" },
        { question: "你对未来 3 年的职业规划是什么？", hint: "职业规划" },
      ];
    }

    return NextResponse.json({
      questions,
      type,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("Interview questions API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      questions: [
        { question: "请做一个简短的自我介绍。", hint: "表达能力" },
        { question: "你遇到过最有挑战性的技术问题是什么？", hint: "问题解决" },
      ],
      error: message,
    });
  }
}
