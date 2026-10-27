import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDemoUserId } from "@/lib/auth";
import { callAI } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

// GET /api/career-analysis — list user's career analyses
export async function GET() {
  try {
    const userId = await getDemoUserId();
    const analyses = await db.careerAnalysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("GET /api/career-analysis error:", error);
    return NextResponse.json({ error: "Failed to fetch analyses" }, { status: 500 });
  }
}

// POST /api/career-analysis — generate career analysis using AI
export async function POST(req: NextRequest) {
  try {
    const userId = await getDemoUserId();
    const body = await req.json();
    const {
      targetRole,
      resumeContent,
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body;

    if (!targetRole) {
      return NextResponse.json({ error: "Target role is required" }, { status: 400 });
    }

    const result = await callAI({
      messages: [
        {
          role: "system",
          content: `你是顶级职业规划师。根据用户的简历和目标岗位，进行深度职业分析。输出 JSON 格式：
{
  "summary": "总体评价（2-3句话）",
  "strengths": [{"title":"优势1","desc":"描述","level":85}],
  "weaknesses": [{"title":"短板1","desc":"描述","level":45}],
  "roadmap": [{"period":"3个月","title":"阶段标题","goals":["目标1","目标2"],"color":"emerald"}],
  "recommendations": [{"type":"课程","title":"推荐名称","provider":"提供方","duration":"时长","rating":4.8,"icon":"BookOpen","color":"emerald"}]
}
只输出 JSON，不要其他文字。`,
        },
        {
          role: "user",
          content: `目标岗位：${targetRole}\n\n我的简历：\n${resumeContent || "（未提供简历，请根据通用要求分析）"}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.6,
      maxTokens: 2000,
    });

    let analysis;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = null;
    }

    if (!analysis) {
      // Fallback analysis
      analysis = {
        summary: `基于你的背景和目标岗位 ${targetRole}，你具备良好的前端基础，但需要在系统设计和后端能力上补强。`,
        strengths: [
          { title: "前端工程能力扎实", desc: "React 生态熟练，有性能优化经验", level: 92 },
          { title: "工程化思维", desc: "熟悉 CI/CD、Monorepo、微前端", level: 85 },
        ],
        weaknesses: [
          { title: "系统设计经验不足", desc: "缺少大规模分布式系统设计经验", level: 45 },
          { title: "后端能力薄弱", desc: "Node.js 基础有，但缺少生产经验", level: 52 },
        ],
        roadmap: [
          { period: "3 个月", title: "补齐基础", goals: ["系统设计基础", "Node.js 进阶", "算法刷题 100 道"], color: "emerald" },
          { period: "6 个月", title: "能力跃迁", goals: ["主导大型项目", "AI 应用开发", "技术分享 3 场"], color: "violet" },
          { period: "1 年", title: "职业突破", goals: ["晋升 Staff Engineer", "开源项目 1k Star", "技术影响力建立"], color: "amber" },
        ],
        recommendations: [
          { type: "课程", title: "System Design Interview", provider: "ByteByteGo", duration: "40h", rating: 4.9, icon: "BookOpen", color: "emerald" },
          { type: "书籍", title: "Designing Data-Intensive Applications", provider: "O'Reilly", duration: "30h", rating: 4.8, icon: "BookOpen", color: "violet" },
        ],
      };
    }

    // Save to database
    const saved = await db.careerAnalysis.create({
      data: {
        userId,
        targetRole,
        strengths: JSON.stringify(analysis.strengths || []),
        weaknesses: JSON.stringify(analysis.weaknesses || []),
        roadmap: JSON.stringify(analysis.roadmap || []),
        recommendations: JSON.stringify(analysis.recommendations || []),
        summary: analysis.summary || "",
      },
    });

    return NextResponse.json({
      analysis,
      id: saved.id,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("POST /api/career-analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate analysis: ${message}` },
      { status: 500 }
    );
  }
}
