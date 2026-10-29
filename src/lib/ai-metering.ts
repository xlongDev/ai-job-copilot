import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { callAI, type AIChatParams, type AIChatResult } from "@/lib/ai-provider";

/**
 * 平台侧 AI 调用的积分计量。
 *
 * 之前 credits 只存在于 localStorage 的 zustand store：前端改个数字就能显示 99999，
 * 服务端从不扣减也不校验，等于没有任何配额控制。
 *
 * 现在：DB 里的 users.credits 是唯一真源，每次平台侧 LLM 调用前原子扣减，
 * 调用失败原额退还。用户自带 API Key 时不消耗平台额度。
 */

/** 计费单位：1 credit / 次 LLM 调用（按功能区分层次，非 token 精确计量） */
export const AI_FEATURE_COST = {
  chat: 1,
  "interview-chat": 1,
  prompts: 2,
  "ai-suggestions": 2,
  "interview-questions": 2,
  "interview-score": 2,
  optimize: 3,
  "cover-letter": 3,
  "resume-score": 3,
  "jd-parse": 3,
  "star-generator": 3,
  "skill-gap": 4,
  "offer-analysis": 4,
  "career-analysis": 5,
  "weekly-report": 5,
  "agent-run": 5,
  "browser-agent-run": 5,
  "workflow-run": 4,
} as const;

export type AIFeature = keyof typeof AI_FEATURE_COST;

export class InsufficientCreditsError extends Error {
  constructor(public readonly cost: number) {
    super(`积分不足：本次需要 ${cost} 积分`);
    this.name = "InsufficientCreditsError";
  }
}

/** 原子扣减并返回剩余额度；余额不足时抛 InsufficientCreditsError */
async function debit(userId: string, cost: number): Promise<number> {
  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    if (!user || user.credits < cost) throw new InsufficientCreditsError(cost);
    const updated = await tx.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
      select: { credits: true },
    });
    return updated.credits;
  });
}

async function refund(userId: string, cost: number): Promise<void> {
  try {
    await db.user.update({
      where: { id: userId },
      data: { credits: { increment: cost } },
    });
  } catch (error) {
    // 退费失败不能掩盖原始错误，但要留下痕迹便于对账
    console.error(`[credits] refund failed for user ${userId}, cost ${cost}:`, error);
  }
}

export interface MeteredAISuccess {
  ok: true;
  result: AIChatResult;
  /** 本次实际扣除的积分（自带 Key 时为 0） */
  cost: number;
  creditsRemaining: number;
}

export interface MeteredAIFailure {
  ok: false;
  response: NextResponse;
}

/**
 * 带计量的 callAI 包装。
 *
 * @param meta.userId  当前登录用户
 * @param meta.feature 计费项，见 AI_FEATURE_COST
 * @param params       原样透传给 callAI；其中 apiKey 非空表示用户自带 Key，不计费
 */
export async function callAIWithCredits(
  meta: { userId: string; feature: AIFeature },
  params: AIChatParams
): Promise<MeteredAISuccess | MeteredAIFailure> {
  const cost = params.apiKey ? 0 : AI_FEATURE_COST[meta.feature];

  if (cost > 0) {
    let remaining: number;
    try {
      remaining = await debit(meta.userId, cost);
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return {
          ok: false,
          response: NextResponse.json(
            {
              error: error.message,
              code: "INSUFFICIENT_CREDITS",
              cost,
            },
            { status: 402 }
          ),
        };
      }
      throw error;
    }

    try {
      const result = await callAI(params);
      return { ok: true, result, cost, creditsRemaining: remaining };
    } catch (error) {
      await refund(meta.userId, cost);
      throw error;
    }
  }

  const result = await callAI(params);
  return { ok: true, result, cost: 0, creditsRemaining: -1 };
}
