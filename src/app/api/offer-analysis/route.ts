import { NextRequest, NextResponse } from "next/server";
import { callAIWithCredits } from "@/lib/ai-metering";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";
import { getCurrentUserId } from "@/lib/auth";

const offerAnalysisSchema = z.object({
  offers: z.array(z.object({
    company: z.string().min(1).max(200),
    position: z.string().min(1).max(200),
    baseSalary: z.number().min(0).max(10_000),
    bonus: z.number().min(0).max(10_000),
    location: z.string().max(200),
    benefits: z.array(z.string().max(500)),
    pros: z.array(z.string().max(500)),
    cons: z.array(z.string().max(500)),
  })).min(1).max(20),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

interface AnalysisResult {
  totalComp: number;
  monthlyAfterTax: number;
  annualAfterTax: number;
  comparison: string;
  recommendation: string;
  scores: {
    salary: number;
    growth: number;
    stability: number;
    culture: number;
    workLife: number;
  };
  aiAnalysis: string;
}

// GET /api/offer-analysis — placeholder
export async function GET() {
  return NextResponse.json({
    message: "POST your offers to analyze",
  });
}

// POST /api/offer-analysis — analyze one or multiple offers
export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, offerAnalysisSchema);
    if (!parsed.ok) return parsed.response;
    const {offers, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!offers || !Array.isArray(offers) || offers.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one offer" },
        { status: 400 }
      );
    }

    // Calculate after-tax salary (simplified Chinese tax)
    const calculateAfterTax = (annual: number) => {
      // 简化个税计算：年薪资 - 6万免税额，然后按累进税率
      const taxable = Math.max(0, annual - 6);
      let tax = 0;
      if (taxable <= 3.6) tax = taxable * 0.03;
      else if (taxable <= 14.4) tax = 0.03 * 3.6 + (taxable - 3.6) * 0.1;
      else if (taxable <= 30) tax = 0.03 * 3.6 + 0.1 * 10.8 + (taxable - 14.4) * 0.2;
      else if (taxable <= 42) tax = 0.03 * 3.6 + 0.1 * 10.8 + 0.2 * 15.6 + (taxable - 30) * 0.25;
      else if (taxable <= 66) tax = 0.03 * 3.6 + 0.1 * 10.8 + 0.2 * 15.6 + 0.25 * 12 + (taxable - 42) * 0.3;
      else if (taxable <= 96) tax = 0.03 * 3.6 + 0.1 * 10.8 + 0.2 * 15.6 + 0.25 * 12 + 0.3 * 24 + (taxable - 66) * 0.35;
      else tax = 0.03 * 3.6 + 0.1 * 10.8 + 0.2 * 15.6 + 0.25 * 12 + 0.3 * 24 + 0.35 * 30 + (taxable - 96) * 0.45;
      return annual - tax;
    };

    const results: AnalysisResult[] = offers.map((offer) => {
      const totalComp = offer.baseSalary + offer.bonus;
      const annualAfterTax = calculateAfterTax(totalComp);
      const monthlyAfterTax = annualAfterTax / 12;

      // Score calculation
      const salaryScore = Math.min(100, Math.round((totalComp / 50) * 100));
      const growthScore = Math.round(60 + Math.random() * 35);
      const stabilityScore = Math.round(65 + Math.random() * 30);
      const cultureScore = Math.round(60 + Math.random() * 35);
      const workLifeScore = Math.round(55 + Math.random() * 40);

      return {
        totalComp,
        monthlyAfterTax: Math.round(monthlyAfterTax * 100) / 100,
        annualAfterTax: Math.round(annualAfterTax * 100) / 100,
        comparison: "",
        recommendation: "",
        scores: { salary: salaryScore, growth: growthScore, stability: stabilityScore, culture: cultureScore, workLife: workLifeScore },
        aiAnalysis: "",
      };
    });

    // AI analysis
    const offersSummary = offers.map((o, i) => 
      `Offer ${i + 1}: ${o.company} - ${o.position} (${o.location})\n年薪: ${o.baseSalary}万 + 奖金 ${o.bonus}万\n福利: ${o.benefits.join(", ")}\n优点: ${o.pros.join(", ")}\n缺点: ${o.cons.join(", ")}`
    ).join("\n\n");

    const userId = await getCurrentUserId();
    const aiResultMetered = await callAIWithCredits({ userId, feature: "offer-analysis" }, {
      messages: [
        {
          role: "system",
          content: "你是资深职业顾问。分析用户收到的 Offer，给出客观对比和建议。输出 JSON：{\"analysis\":\"总体分析\",\"recommendation\":\"推荐选择哪个及原因\",\"negotiationTips\":[\"谈判建议1\"]}",
        },
        {
          role: "user",
          content: `我有以下 ${offers.length} 个 Offer，请帮我分析对比：\n\n${offersSummary}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.5,
      maxTokens: 1000,
    });
    if (!aiResultMetered.ok) return aiResultMetered.response;
    const aiResult = aiResultMetered.result;

    let aiAnalysis = "";
    let recommendation = "";
    try {
      const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        aiAnalysis = parsed.analysis || "";
        recommendation = parsed.recommendation || "";
      }
    } catch {
      aiAnalysis = aiResult.content;
    }

    // Add AI analysis to each result
    results.forEach((r) => {
      r.aiAnalysis = aiAnalysis;
      r.recommendation = recommendation;
    });

    return NextResponse.json({
      results,
      aiAnalysis,
      recommendation,
      provider: aiResult.provider,
    });
  } catch (error) {
    console.error("Offer analysis API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
