import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";

// Plan definitions
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "永久免费",
    desc: "适合初次体验",
    features: ["每月 50 次 AI 对话", "1 份简历", "基础 ATS 扫描", "社区支持"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    period: "/月",
    desc: "适合认真求职者",
    features: ["无限 AI 对话", "10 份简历", "高级 ATS 扫描", "AI Job Agent", "语音/视频面试", "RAG 知识库", "优先支持"],
    popular: true,
  },
  {
    id: "team",
    name: "Team",
    price: 299,
    period: "/月/人",
    desc: "适合求职小组",
    features: ["Pro 全部功能", "5 个席位", "团队共享知识库", "协作看板", "管理后台", "SSO 登录"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: -1,
    period: "联系销售",
    desc: "适合企业批量",
    features: ["Team 全部功能", "不限席位", "私有化部署", "定制开发", "SLA 保障", "专属客户经理"],
  },
];

const CREDIT_PACKS = [
  { id: "1", credits: 500, price: 39, bonus: 0, popular: false },
  { id: "2", credits: 1500, price: 99, bonus: 150, popular: true },
  { id: "3", credits: 5000, price: 299, bonus: 750, popular: false },
  { id: "4", credits: 15000, price: 799, bonus: 3000, popular: false },
];

// GET /api/billing — get billing info
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      currentPlan: user.plan,
      credits: user.credits,
      plans: PLANS,
      creditPacks: CREDIT_PACKS,
      usage: {
        creditsUsed: 1450,
        creditsLimit: user.plan === "pro" ? 5000 : user.plan === "team" ? 20000 : 50,
      },
    });
  } catch (error) {
    console.error("GET /api/billing error:", error);
    return NextResponse.json({ error: "Failed to fetch billing info" }, { status: 500 });
  }
}

// POST /api/billing — upgrade plan or buy credits
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const { action, planId, packId } = body;

    if (action === "upgrade" && planId) {
      await db.user.update({
        where: { id: userId },
        data: { plan: planId },
      });
      return NextResponse.json({ success: true, plan: planId });
    }

    if (action === "buy-credits" && packId) {
      const pack = CREDIT_PACKS.find((p) => p.id === packId);
      if (!pack) {
        return NextResponse.json({ error: "Invalid pack" }, { status: 400 });
      }
      const totalCredits = pack.credits + pack.bonus;
      const user = await db.user.findUnique({ where: { id: userId } });
      if (user) {
        await db.user.update({
          where: { id: userId },
          data: { credits: user.credits + totalCredits },
        });
      }
      return NextResponse.json({ success: true, credits: totalCredits });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/billing error:", error);
    return NextResponse.json({ error: "Failed to process billing" }, { status: 500 });
  }
}
