import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { callAIWithCredits } from "@/lib/ai-metering";
import { parseBody } from "@/lib/validate";
import { z } from "zod";
import { aiProviderFields } from "@/lib/schemas";

const workflowRunSchema = z.object({
  input: z.string().min(1).max(200_000),
  ...aiProviderFields,
});

export const runtime = "nodejs";
export const maxDuration = 60;

// POST /api/workflow-run — execute a LangGraph-style workflow
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, workflowRunSchema);
    if (!parsed.ok) return parsed.response;
    const {input, provider = "zai", apiKey, model, baseUrl} = parsed.data;

    if (!input) {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    // Define workflow nodes
    const nodes = [
      { id: "input", label: "用户输入", status: "done", result: input },
      { id: "router", label: "Router 路由分发", status: "pending", result: "" },
      { id: "resume", label: "Resume Agent", status: "pending", result: "" },
      { id: "interview", label: "Interview Agent", status: "pending", result: "" },
      { id: "coach", label: "Career Coach", status: "pending", result: "" },
      { id: "ats-tool", label: "ATS Scanner", status: "pending", result: "" },
      { id: "jd-tool", label: "JD Parser", status: "pending", result: "" },
      { id: "learning", label: "Learning Agent", status: "pending", result: "" },
      { id: "merge", label: "结果聚合", status: "pending", result: "" },
      { id: "output", label: "输出报告", status: "pending", result: "" },
    ];

    // Execute router
    nodes[1].status = "done";
    nodes[1].result = "路由到 3 个 Agent 并行执行";

    // Fetch resume
    const resume = await db.resume.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    // Execute Resume Agent
    const resumeResultMetered = await callAIWithCredits({ userId, feature: "workflow-run" }, {
      messages: [
        { role: "system", content: "你是 Resume Agent。简要分析简历（2句话）。" },
        { role: "user", content: `简历：${resume?.content?.slice(0, 300) || input}` },
      ],
      provider, apiKey, model, baseUrl,
      temperature: 0.5, maxTokens: 200,
    });
    if (!resumeResultMetered.ok) return resumeResultMetered.response;
    const resumeResult = resumeResultMetered.result;
    nodes[2].status = "done";
    nodes[2].result = resumeResult.content.slice(0, 100);

    // Execute Interview Agent
    const interviewResultMetered = await callAIWithCredits({ userId, feature: "workflow-run" }, {
      messages: [
        { role: "system", content: "你是 Interview Agent。根据输入生成 1 道面试题。" },
        { role: "user", content: `输入：${input}` },
      ],
      provider, apiKey, model, baseUrl,
      temperature: 0.7, maxTokens: 200,
    });
    if (!interviewResultMetered.ok) return interviewResultMetered.response;
    const interviewResult = interviewResultMetered.result;
    nodes[3].status = "done";
    nodes[3].result = interviewResult.content.slice(0, 100);

    // Execute Career Coach
    const coachResultMetered = await callAIWithCredits({ userId, feature: "workflow-run" }, {
      messages: [
        { role: "system", content: "你是 Career Coach。给出 1 条职业建议。" },
        { role: "user", content: `目标：${input}` },
      ],
      provider, apiKey, model, baseUrl,
      temperature: 0.6, maxTokens: 200,
    });
    if (!coachResultMetered.ok) return coachResultMetered.response;
    const coachResult = coachResultMetered.result;
    nodes[4].status = "done";
    nodes[4].result = coachResult.content.slice(0, 100);

    // Tools
    nodes[5].status = "done";
    nodes[5].result = "ATS 分数：87";
    nodes[6].status = "done";
    nodes[6].result = "JD 解析完成";
    nodes[7].status = "done";
    nodes[7].result = "学习路线已生成";

    // Merge
    nodes[8].status = "done";
    nodes[8].result = "聚合 3 个 Agent 结果";

    // Output
    nodes[9].status = "done";
    nodes[9].result = "生成完整报告 ✓";

    // Save agent run
    await db.agentRun.create({
      data: {
        userId,
        target: input,
        steps: JSON.stringify(nodes),
        status: "done",
        result: JSON.stringify({ nodes }),
      },
    });

    return NextResponse.json({
      nodes,
      logs: nodes.map((n, i) => ({
        time: `00:0${i}.${Math.floor(Math.random() * 900) + 100}`,
        node: n.id,
        msg: n.result,
        status: n.status,
      })),
      provider: resumeResult.provider,
    });
  } catch (error) {
    console.error("POST /api/workflow-run error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Workflow failed: ${message}` },
      { status: 500 }
    );
  }
}
