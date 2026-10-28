"use client";

import { Search, Bell, Command, Sun, Moon, Globe, Plus, Settings, Check, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/lib/i18n/locales";
import { NotificationDrawer } from "@/components/shared/notification-drawer";

const viewTitles: Record<string, { title: string; desc: string }> = {
  dashboard: { title: "仪表盘", desc: "你的求职全景概览" },
  cockpit: { title: "驾驶舱", desc: "全屏数据可视化驾驶舱" },
  resume: { title: "简历管理", desc: "创建、优化、管理你的简历" },
  "resume-templates": { title: "简历模板", desc: "选择适合你的简历模板" },
  "resume-compare": { title: "简历对比", desc: "多版本简历并排对比" },
  "resume-score": { title: "简历评分", desc: "AI 8 维度简历评分" },
  ats: { title: "ATS 扫描", desc: "检测简历的 ATS 兼容性" },
  "jd-match": { title: "JD 匹配", desc: "分析岗位匹配度" },
  "star-generator": { title: "STAR 生成器", desc: "AI 将项目描述重构为 STAR 结构" },
  "offer-analysis": { title: "Offer 分析", desc: "多 Offer 对比与决策建议" },
  "weekly-report-view": { title: "求职周报", desc: "AI 生成求职周报总结" },
  "calendar": { title: "求职日历", desc: "日历展示面试/投递/学习计划" },
  chat: { title: "AI 对话", desc: "与你的 AI 职业教练对话" },
  "career-coach": { title: "职业教练", desc: "AI 驱动的职业成长规划" },
  "skill-gap": { title: "技能差距分析", desc: "当前技能 vs 目标岗位" },
  "prompt-library": { title: "Prompt 库", desc: "官方 Prompt + 自定义 Prompt" },
  interview: { title: "模拟面试", desc: "AI 模拟真实面试场景" },
  "interview-chat": { title: "AI 面试官", desc: "多轮对话面试 + 实时追问" },
  "interview-records": { title: "面试记录", desc: "历史面试记录与复盘" },
  "voice-interview": { title: "语音面试", desc: "AI 实时语音对话与评分" },
  "video-interview": { title: "视频面试", desc: "摄像头分析眼神、语速、表情" },
  portfolio: { title: "作品集分析", desc: "分析 GitHub 和作品集" },
  learning: { title: "学习路线", desc: "AI 生成的个性化学习计划" },
  tracker: { title: "求职追踪", desc: "管理你的投递进度" },
  analytics: { title: "数据分析", desc: "深度分析你的求职数据" },
  heatmap: { title: "活跃热力图", desc: "GitHub 风格求职活跃度热力图" },
  achievements: { title: "成就系统", desc: "解锁徽章，追踪成长" },
  goals: { title: "求职目标", desc: "设置和跟踪你的求职目标" },
  agent: { title: "AI Job Agent", desc: "自动化你的整个求职流程" },
  agents: { title: "Agent 中心", desc: "多 Agent 协作架构" },
  workflow: { title: "工作流编排", desc: "LangGraph 可视化 Agent 编排" },
  rag: { title: "RAG 知识库", desc: "私人向量知识库" },
  mcp: { title: "MCP 协议", desc: "Model Context Protocol 集成" },
  "browser-agent": { title: "浏览器 Agent", desc: "自动浏览招聘网站" },
  plugins: { title: "插件市场", desc: "扩展平台能力" },
  billing: { title: "订阅与账单", desc: "管理你的套餐和积分" },
  team: { title: "团队管理", desc: "多租户团队协作" },
  settings: { title: "设置", desc: "管理你的账户和偏好" },
};

export function Topbar() {
  const { currentView, setCommandOpen, activeProvider, setActiveProvider, providerKeys, language, notifications } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const viewInfo = viewTitles[currentView] || viewTitles.dashboard;

  const providerNames: Record<string, string> = {
    zai: "ZAI",
    openai: "OpenAI",
    claude: "Claude",
    gemini: "Gemini",
    deepseek: "DeepSeek",
    qwen: "Qwen",
    openrouter: "OpenRouter",
    mistral: "Mistral",
    llama: "Llama",
    groq: "Groq",
    xai: "Grok",
    perplexity: "Perplexity",
    moonshot: "Kimi",
    yi: "Yi",
    baichuan: "Baichuan",
    minimax: "MiniMax",
    zhipu: "智谱",
    ollama: "Ollama",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      {/* Title */}
      <div className="flex flex-col">
        <motion.h1
          key={currentView}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold tracking-tight"
        >
          {viewInfo.title}
        </motion.h1>
        <p className="text-xs text-muted-foreground">{viewInfo.desc}</p>
      </div>

      {/* Search */}
      <button
        onClick={() => setCommandOpen(true)}
        className="group ml-auto flex h-9 w-64 items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/50"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">搜索或执行命令...</span>
        <kbd className="flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* AI Provider Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
            <span>{providerNames[activeProvider] || activeProvider}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">AI Provider</p>
          <DropdownMenuSeparator />
          {(["zai", "openai", "claude", "gemini", "deepseek", "qwen", "openrouter", "mistral", "llama", "groq", "xai", "perplexity", "moonshot", "yi", "baichuan", "minimax", "zhipu", "ollama"] as const).map((p) => (
            <DropdownMenuItem
              key={p}
              onClick={() => setActiveProvider(p)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{providerNames[p]}</span>
                {p !== "zai" && !providerKeys[p]?.apiKey && (
                  <span className="text-[10px] text-amber-500">未配置</span>
                )}
              </div>
              {activeProvider === p && <span className="h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => useAppStore.getState().setView("settings")}>
            <Settings className="h-3.5 w-3.5 mr-2" />
            配置 API Key
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((l) => (
            <DropdownMenuItem
              key={l.id}
              onClick={() => useAppStore.getState().setLanguage(l.id)}
              className="flex items-center justify-between"
            >
              <span>{l.flag} {l.name}</span>
              {language === l.id && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setNotifOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {notifications > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {notifications}
          </span>
        )}
      </Button>

      {/* New */}
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        新建
      </Button>

      {/* Logout */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        title="退出登录"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
      >
        <LogOut className="h-4 w-4" />
      </Button>

      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </header>
  );
}
