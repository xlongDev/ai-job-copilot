import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";

const browserAgentSchema = z.object({
  query: z.string().min(1).max(500),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/browser-agent-run — simulate browser agent workflow
export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, browserAgentSchema);
    if (!parsed.ok) return parsed.response;
    const {query, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Define browser agent steps
    const steps = [
      { id: 1, action: "打开招聘网站", desc: `导航到 lagou.com`, icon: "navigate", status: "done" },
      { id: 2, action: "搜索岗位", desc: `输入"${query}"`, icon: "search", status: "done" },
      { id: 3, action: "筛选条件", desc: "薪资 25-50K · 经验 3-5年", icon: "click", status: "done" },
      { id: 4, action: "提取岗位列表", desc: "解析 48 个岗位卡片", icon: "extract", status: "done" },
      { id: 5, action: "分析 JD 详情", desc: "逐个打开并提取要求", icon: "analyze", status: "done" },
      { id: 6, action: "匹配度评分", desc: "AI 计算匹配度", icon: "analyze", status: "done" },
    ];

    // Use AI to generate job listings based on query
    const aiResult = await callAI({
      messages: [
        {
          role: "system",
          content: `你是招聘数据分析师。根据搜索关键词，生成 6 个模拟岗位信息。输出 JSON 数组格式：
[{"title":"岗位名","company":"公司名","location":"城市","salary":"薪资范围","match":匹配度数字,"posted":"发布时间"}]
只输出 JSON。`,
        },
        { role: "user", content: `搜索关键词：${query}` },
      ],
      provider, apiKey, model, baseUrl,
      temperature: 0.7, maxTokens: 1000,
    });

    let jobs: {
      title: string;
      company: string;
      location: string;
      salary: string;
      match: number;
      posted: string;
    }[] = [];

    try {
      const jsonMatch = aiResult.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jobs = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // fallback
    }

    if (jobs.length === 0) {
      jobs = [
        { title: `${query} 工程师`, company: "腾讯", location: "深圳", salary: "30-55K", match: 92, posted: "1天前" },
        { title: `高级${query}`, company: "字节跳动", location: "北京", salary: "35-60K", match: 88, posted: "2天前" },
        { title: `${query} 专家`, company: "美团", location: "北京", salary: "40-70K", match: 85, posted: "3天前" },
        { title: `${query}`, company: "阿里巴巴", location: "杭州", salary: "30-50K", match: 78, posted: "1天前" },
        { title: `资深${query}`, company: "京东", location: "北京", salary: "35-65K", match: 82, posted: "2天前" },
        { title: `${query} 工程师`, company: "拼多多", location: "上海", salary: "40-70K", match: 86, posted: "3小时前" },
      ];
    }

    return NextResponse.json({
      steps,
      jobs,
      provider: aiResult.provider,
    });
  } catch (error) {
    console.error("POST /api/browser-agent-run error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Browser agent failed: ${message}` },
      { status: 500 }
    );
  }
}
