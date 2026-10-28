import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";

const promptSchema = z.object({
  prompt: z.string().min(1).max(20_000),
  input: z.string().max(200_000).optional(),
  resumeContent: z.string().max(200_000).optional(),
  ...aiProviderFields,
});

export const runtime = "nodejs";

// Official prompt library
const OFFICIAL_PROMPTS = [
  {
    id: "official-1",
    title: "简历项目经历优化",
    category: "简历优化",
    prompt: "请使用 STAR 法则优化以下项目经历描述，增加量化数据和业务影响。每条描述控制在 1-2 行，动词开头。\n\n原文：{input}",
    isOfficial: true,
    tags: ["STAR", "量化", "项目经历"],
  },
  {
    id: "official-2",
    title: "工作经历量化增强",
    category: "简历优化",
    prompt: "优化以下工作经历，补充具体的量化数据（如性能提升百分比、用户规模、业务影响）。使用强动词开头。\n\n原文：{input}",
    isOfficial: true,
    tags: ["量化", "工作经历"],
  },
  {
    id: "official-3",
    title: "技能列表优化",
    category: "简历优化",
    prompt: "优化以下技能列表，按相关性排序，补充该岗位常见但用户可能遗漏的关键技能。\n\n原文：{input}",
    isOfficial: true,
    tags: ["技能", "关键词"],
  },
  {
    id: "official-4",
    title: "模拟 HR 面试",
    category: "模拟面试",
    prompt: "你是一位资深 HR 面试官。请针对以下岗位，生成 5 个行为面试问题，并模拟面试对话。使用 STAR 法则评估我的回答。\n\n岗位：{input}",
    isOfficial: true,
    tags: ["HR", "行为面试"],
  },
  {
    id: "official-5",
    title: "模拟技术面试",
    category: "模拟面试",
    prompt: "你是一位资深技术面试官。请针对以下技术方向，生成 5 个深度技术面试问题，考察原理理解和实战经验。\n\n方向：{input}",
    isOfficial: true,
    tags: ["技术面试", "原理"],
  },
  {
    id: "official-6",
    title: "求职信生成",
    category: "求职信",
    prompt: "根据以下简历和岗位信息，撰写一封专业的求职信。突出与岗位的匹配度，展示对公司的了解，表达诚意。控制在 400-600 字。\n\n简历：{resume}\n岗位：{input}",
    isOfficial: true,
    tags: ["求职信", "Cover Letter"],
  },
  {
    id: "official-7",
    title: "职业规划分析",
    category: "职业规划",
    prompt: "作为职业规划师，根据以下信息分析我的职业发展路径，给出 3 个月、6 个月、1 年的成长计划。\n\n我的情况：{input}",
    isOfficial: true,
    tags: ["职业规划", "成长路线"],
  },
  {
    id: "official-8",
    title: "JD 匹配度分析",
    category: "JD 分析",
    prompt: "分析以下 JD，提取核心要求、技能关键词、职责。然后与我的简历对比，给出匹配度和缺失项。\n\nJD：{input}\n我的简历：{resume}",
    isOfficial: true,
    tags: ["JD", "匹配度"],
  },
  {
    id: "official-9",
    title: "面试复盘",
    category: "模拟面试",
    prompt: "我刚完成一场面试，以下是面试问题和我的回答。请评估我的表现，给出改进建议。\n\n问题：{question}\n我的回答：{input}",
    isOfficial: true,
    tags: ["复盘", "改进"],
  },
  {
    id: "official-10",
    title: "薪资谈判话术",
    category: "求职信",
    prompt: "我即将进行薪资谈判，当前期望薪资是 {input}。请帮我准备谈判话术和策略。",
    isOfficial: true,
    tags: ["薪资", "谈判"],
  },
];

// GET /api/prompts — list all prompts (official + user saved)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let filtered = OFFICIAL_PROMPTS;
    if (category && category !== "全部") {
      filtered = OFFICIAL_PROMPTS.filter((p) => p.category === category);
    }

    const categories = ["全部", ...new Set(OFFICIAL_PROMPTS.map((p) => p.category))];

    return NextResponse.json({
      prompts: filtered,
      categories,
      total: OFFICIAL_PROMPTS.length,
    });
  } catch (error) {
    console.error("GET /api/prompts error:", error);
    return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }
}

// POST /api/prompts — execute a prompt with AI
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, promptSchema);
    if (!parsed.ok) return parsed.response;
    const {prompt, input, resumeContent, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!prompt || !input) {
      return NextResponse.json(
        { error: "Prompt and input are required" },
        { status: 400 }
      );
    }

    // Replace placeholders
    let finalPrompt = prompt.replace("{input}", input);
    if (resumeContent) {
      finalPrompt = finalPrompt.replace("{resume}", resumeContent);
    } else {
      // Fetch user's primary resume
      const resume = await db.resume.findFirst({
        where: { userId, isPrimary: true },
      });
      if (resume) {
        finalPrompt = finalPrompt.replace("{resume}", resume.content);
      }
    }

    const { callAI } = await import("@/lib/ai-provider");
    const result = await callAI({
      messages: [
        { role: "system", content: "你是 AI Job Copilot，专业的求职助手。请根据用户提供的 Prompt 执行任务。" },
        { role: "user", content: finalPrompt },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("POST /api/prompts error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Prompt execution failed: ${message}` },
      { status: 500 }
    );
  }
}
