import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";

const optimizeSchema = z.object({
  text: z.string().min(1).max(200_000),
  type: z.string().max(60).default("full"),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, optimizeSchema);
    if (!parsed.ok) return parsed.response;
    const {text, type, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    const prompts: Record<string, string> = {
      summary:
        "优化以下简历的个人简介，使其更专业、更有亮点，突出核心竞争力和量化成果。保留原意，但表达更精炼有力。",
      experience:
        "使用 STAR 法则优化以下工作经历描述，增加量化数据和业务影响。每条描述控制在 1-2 行，动词开头。",
      skill: "优化以下技能列表，按相关性排序，补充该岗位常见但用户可能遗漏的关键技能。",
      project:
        "使用 STAR 法则优化以下项目描述，突出技术难点、解决方案和量化成果。",
      full: "全面优化以下简历内容，包括表达、结构、关键词和量化数据，使其更符合 ATS 系统和招聘官的偏好。",
    };

    const result = await callAI({
      messages: [
        {
          role: "system",
          content:
            "你是顶级简历优化专家。直接输出优化后的内容，不要解释，不要加前言后语。保持中文输出。",
        },
        {
          role: "user",
          content: `${prompts[type] || prompts.full}\n\n原文：\n${text}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.6,
      maxTokens: 1500,
    });

    return NextResponse.json({
      original: text,
      optimized: result.content,
      type,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("Optimize API error:", error);
    const { text } = await req.json().catch(() => ({ text: "" }));
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({
      original: text,
      optimized: `${text}\n\n【AI 优化建议】\n• 增加量化数据：补充具体数字\n• 使用强动词：将"负责"改为"主导"\n• 突出技术深度\n• 补充业务价值\n\n错误：${message}`,
      type: "fallback",
      error: message,
    });
  }
}
