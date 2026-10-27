"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  ScanLine,
  Target,
  MessageSquare,
  Compass,
  Mic,
  Video,
  FolderGit2,
  GraduationCap,
  KanbanSquare,
  BarChart3,
  Bot,
  Settings,
  ChevronLeft,
  Sparkles,
  Zap,
  Network,
  Database,
  Plug,
  CreditCard,
  Users,
  Globe,
  Layers,
  Trophy,
  Calendar,
  Activity,
} from "lucide-react";
import { useAppStore, type ViewId } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface UserInfo {
  name: string;
  avatar: string;
  role: string;
}

interface NavItem {
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  group: "main" | "ai" | "agents" | "platform" | "tools";
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "仪表盘", icon: LayoutDashboard, group: "main" },
  { id: "cockpit", label: "驾驶舱", icon: LayoutDashboard, badge: "NEW", group: "main" },
  { id: "resume", label: "简历管理", icon: FileText, group: "main" },
  { id: "resume-templates", label: "简历模板", icon: FileText, group: "main" },
  { id: "resume-compare", label: "简历对比", icon: FileText, badge: "NEW", group: "main" },
  { id: "resume-score", label: "简历评分", icon: FileText, badge: "NEW", group: "main" },
  { id: "ats", label: "ATS 扫描", icon: ScanLine, group: "main" },
  { id: "jd-match", label: "JD 匹配", icon: Target, group: "main" },
  { id: "star-generator", label: "STAR 生成器", icon: Sparkles, badge: "NEW", group: "main" },
  { id: "offer-analysis", label: "Offer 分析", icon: Trophy, badge: "NEW", group: "main" },
  { id: "tracker", label: "求职追踪", icon: KanbanSquare, badge: "24", group: "main" },
  { id: "calendar", label: "求职日历", icon: Calendar, badge: "NEW", group: "main" },
  { id: "weekly-report-view", label: "求职周报", icon: FileText, badge: "NEW", group: "main" },
  { id: "chat", label: "AI 对话", icon: MessageSquare, group: "ai" },
  { id: "career-coach", label: "职业教练", icon: Compass, group: "ai" },
  { id: "skill-gap", label: "技能差距分析", icon: Target, badge: "NEW", group: "ai" },
  { id: "prompt-library", label: "Prompt 库", icon: Sparkles, badge: "NEW", group: "ai" },
  { id: "interview", label: "模拟面试", icon: Mic, group: "ai" },
  { id: "interview-chat", label: "AI 面试官", icon: Mic, badge: "NEW", group: "ai" },
  { id: "interview-records", label: "面试记录", icon: Mic, badge: "NEW", group: "ai" },
  { id: "voice-interview", label: "语音面试", icon: Mic, badge: "AI", group: "ai" },
  { id: "video-interview", label: "视频面试", icon: Video, badge: "AI", group: "ai" },
  { id: "agent", label: "AI Job Agent", icon: Bot, badge: "NEW", group: "agents" },
  { id: "agents", label: "Agent 中心", icon: Layers, group: "agents" },
  { id: "workflow", label: "工作流编排", icon: Network, badge: "NEW", group: "agents" },
  { id: "rag", label: "RAG 知识库", icon: Database, group: "platform" },
  { id: "mcp", label: "MCP 协议", icon: Plug, group: "platform" },
  { id: "browser-agent", label: "浏览器 Agent", icon: Globe, group: "platform" },
  { id: "plugins", label: "插件市场", icon: Zap, group: "platform" },
  { id: "portfolio", label: "作品集分析", icon: FolderGit2, group: "tools" },
  { id: "learning", label: "学习路线", icon: GraduationCap, group: "tools" },
  { id: "analytics", label: "数据分析", icon: BarChart3, group: "tools" },
  { id: "heatmap", label: "活跃热力图", icon: Activity, badge: "NEW", group: "tools" },
  { id: "achievements", label: "成就系统", icon: Trophy, badge: "NEW", group: "tools" },
  { id: "goals", label: "求职目标", icon: Target, badge: "NEW", group: "tools" },
  { id: "billing", label: "订阅与账单", icon: CreditCard, group: "tools" },
  { id: "team", label: "团队管理", icon: Users, group: "tools" },
  { id: "settings", label: "设置", icon: Settings, group: "tools" },
];

const groupLabels: Record<string, string> = {
  main: "核心功能",
  ai: "AI 助手",
  agents: "Agent 系统",
  platform: "平台能力",
  tools: "工具箱",
};

export function Sidebar() {
  const { currentView, setView, sidebarCollapsed, toggleSidebar, plan, credits } = useAppStore();
  const [user, setUser] = useState<UserInfo>({ name: "User", avatar: "U", role: "user" });

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser({
            name: data.user.name,
            avatar: data.user.avatar,
            role: data.user.role,
          });
        }
      })
      .catch(() => {});
  }, []);

  const groups = ["main", "ai", "agents", "platform", "tools"] as const;

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 248 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative z-30 flex h-screen flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-semibold leading-tight">AI Job Copilot</span>
            <span className="text-[10px] text-muted-foreground">V1 Enterprise</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {groups.map((group) => (
          <div key={group} className="mb-3">
            {!sidebarCollapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                {groupLabels[group]}
              </p>
            )}
            <div className="space-y-0.5">
              {navItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const active = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setView(item.id)}
                      className={cn(
                        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                        active
                          ? "bg-primary/10 text-primary shadow-sm shadow-primary/10"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5",
                        sidebarCollapsed && "justify-center hover:translate-x-0"
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded-md px-1.5 py-0.5 text-[9px] font-semibold transition-transform group-hover:scale-105",
                                item.badge === "NEW"
                                  ? "bg-primary/20 text-primary"
                                  : item.badge === "AI"
                                  ? "bg-violet-500/20 text-violet-400"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Credits Card */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-3">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">{plan === "free" ? "Free" : plan === "pro" ? "Pro" : plan === "team" ? "Team" : "Enterprise"}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{credits} 积分</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (credits / 2000) * 100)}%` }} />
              </div>
              <button
                onClick={() => setView("billing")}
                className="mt-2 w-full rounded-md bg-primary py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                升级套餐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User */}
      <div className="border-t border-border/50 p-3">
        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-primary text-xs font-semibold text-white">
            {user.avatar}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-emerald-500" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:bg-accent"
      >
        <ChevronLeft
          className={cn("h-3.5 w-3.5 transition-transform", sidebarCollapsed && "rotate-180")}
        />
      </button>
    </motion.aside>
  );
}
