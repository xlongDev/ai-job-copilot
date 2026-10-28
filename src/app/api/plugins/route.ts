import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const pluginSchema = z.object({
  pluginId: z.string().min(1).max(100),
  name: z.string().max(200).optional(),
  action: z.enum(["install","uninstall"]).optional(),
});

export const runtime = "nodejs";

// Plugin catalog (static definition, but install state is dynamic)
const PLUGIN_CATALOG = [
  { id: "linkedin-auto-apply", name: "LinkedIn Auto Apply", desc: "自动投递 LinkedIn 上的匹配岗位", author: "Official", category: "求职", rating: 4.8, installs: "12.4k", icon: "💼", color: "emerald", verified: true },
  { id: "github-resume", name: "GitHub Resume Generator", desc: "从 GitHub 活动自动生成技术简历", author: "devtools", category: "简历", rating: 4.9, installs: "8.2k", icon: "🐙", color: "violet", verified: true },
  { id: "leetcode-tracker", name: "LeetCode Tracker", desc: "同步刷题记录，生成算法能力报告", author: "algo_pro", category: "学习", rating: 4.7, installs: "15.6k", icon: "⚡", color: "amber", verified: true },
  { id: "salary-insights", name: "Salary Insights", desc: "实时薪资数据，了解市场行情", author: "data_team", category: "求职", rating: 4.6, installs: "9.8k", icon: "💰", color: "emerald", verified: false },
  { id: "interview-replay", name: "Interview Replay", desc: "录制面试视频，AI 回放分析", author: "interview_co", category: "面试", rating: 4.5, installs: "5.3k", icon: "🎥", color: "violet", verified: true },
  { id: "cover-letter-ai", name: "Cover Letter AI", desc: "一键生成多语言求职信", author: "writer_ai", category: "简历", rating: 4.8, installs: "11.2k", icon: "✉️", color: "amber", verified: true },
  { id: "jd-monitor", name: "JD Monitor", desc: "监控目标公司 JD 变化，第一时间通知", author: "monitor_pro", category: "求职", rating: 4.4, installs: "3.7k", icon: "🔔", color: "emerald", verified: false },
  { id: "skill-tree", name: "Skill Tree Visualizer", desc: "可视化技能树，追踪成长", author: "viz_team", category: "学习", rating: 4.6, installs: "6.9k", icon: "🌳", color: "violet", verified: true },
  { id: "offer-compare", name: "Offer Compare", desc: "多 Offer 对比分析，帮你做决策", author: "decision_ai", category: "求职", rating: 4.7, installs: "4.5k", icon: "⚖️", color: "amber", verified: true },
  { id: "notion-sync", name: "Notion Sync", desc: "同步求职数据到 Notion 数据库", author: "integration", category: "集成", rating: 4.5, installs: "7.1k", icon: "📝", color: "emerald", verified: true },
  { id: "slack-notify", name: "Slack Notify", desc: "面试提醒和投递状态推送到 Slack", author: "integration", category: "集成", rating: 4.3, installs: "2.8k", icon: "💬", color: "violet", verified: false },
  { id: "calendar-sync", name: "Calendar Sync", desc: "面试日程同步到 Google Calendar", author: "integration", category: "集成", rating: 4.6, installs: "5.4k", icon: "📅", color: "amber", verified: true },
];

// GET /api/plugins — list all plugins with install status
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const installs = await db.pluginInstall.findMany({
      where: { userId, installed: true },
    });
    const installedIds = new Set(installs.map((i) => i.pluginId));

    const plugins = PLUGIN_CATALOG.map((p) => ({
      ...p,
      installed: installedIds.has(p.id),
    }));

    return NextResponse.json({ plugins, categories: ["全部", "求职", "简历", "面试", "学习", "集成"] });
  } catch (error) {
    console.error("GET /api/plugins error:", error);
    return NextResponse.json({ error: "Failed to fetch plugins" }, { status: 500 });
  }
}

// POST /api/plugins — install/uninstall a plugin
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, pluginSchema);
    if (!parsed.ok) return parsed.response;
    const {pluginId, name, action} = parsed.data;

    if (!pluginId) {
      return NextResponse.json({ error: "Plugin ID is required" }, { status: 400 });
    }

    if (action === "uninstall") {
      await db.pluginInstall.deleteMany({
        where: { userId, pluginId },
      });
      return NextResponse.json({ success: true, installed: false });
    }

    // Install
    await db.pluginInstall.upsert({
      where: { userId_pluginId: { userId, pluginId } },
      create: { userId, pluginId, name: name || pluginId, installed: true },
      update: { installed: true },
    });

    return NextResponse.json({ success: true, installed: true });
  } catch (error) {
    console.error("POST /api/plugins error:", error);
    return NextResponse.json({ error: "Failed to toggle plugin" }, { status: 500 });
  }
}
