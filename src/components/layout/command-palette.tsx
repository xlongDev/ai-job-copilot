"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAppStore, type ViewId } from "@/lib/store";
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
  Upload,
  Sparkles,
  Moon,
  Sun,
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
import { useTheme } from "next-themes";
import { toast } from "sonner";

const commands: {
  id: ViewId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  group: string;
}[] = [
  { id: "dashboard", label: "打开仪表盘", icon: LayoutDashboard, shortcut: "G D", group: "核心功能" },
  { id: "cockpit", label: "驾驶舱", icon: LayoutDashboard, group: "核心功能" },
  { id: "resume", label: "简历管理", icon: FileText, shortcut: "G R", group: "核心功能" },
  { id: "resume-templates", label: "简历模板", icon: FileText, group: "核心功能" },
  { id: "resume-compare", label: "简历对比", icon: FileText, group: "核心功能" },
  { id: "resume-score", label: "简历评分", icon: FileText, group: "核心功能" },
  { id: "ats", label: "ATS 扫描", icon: ScanLine, shortcut: "G A", group: "核心功能" },
  { id: "jd-match", label: "JD 匹配", icon: Target, shortcut: "G J", group: "核心功能" },
  { id: "star-generator", label: "STAR 生成器", icon: Sparkles, group: "核心功能" },
  { id: "offer-analysis", label: "Offer 分析", icon: Trophy, group: "核心功能" },
  { id: "tracker", label: "求职追踪", icon: KanbanSquare, shortcut: "G T", group: "核心功能" },
  { id: "calendar", label: "求职日历", icon: Calendar, group: "核心功能" },
  { id: "weekly-report-view", label: "求职周报", icon: FileText, group: "核心功能" },
  { id: "chat", label: "AI 对话", icon: MessageSquare, shortcut: "G C", group: "AI 能力" },
  { id: "career-coach", label: "职业教练", icon: Compass, group: "AI 能力" },
  { id: "skill-gap", label: "技能差距分析", icon: Target, group: "AI 能力" },
  { id: "prompt-library", label: "Prompt 库", icon: Sparkles, group: "AI 能力" },
  { id: "interview", label: "模拟面试", icon: Mic, group: "AI 能力" },
  { id: "interview-chat", label: "AI 面试官", icon: Mic, group: "AI 能力" },
  { id: "interview-records", label: "面试记录", icon: Mic, group: "AI 能力" },
  { id: "voice-interview", label: "语音面试", icon: Mic, group: "AI 能力" },
  { id: "video-interview", label: "视频面试", icon: Video, group: "AI 能力" },
  { id: "agent", label: "AI Job Agent", icon: Bot, group: "AI 能力" },
  { id: "agents", label: "Agent 中心", icon: Network, group: "AI 能力" },
  { id: "workflow", label: "工作流编排", icon: Layers, group: "AI 能力" },
  { id: "rag", label: "RAG 知识库", icon: Database, group: "平台" },
  { id: "mcp", label: "MCP 协议", icon: Plug, group: "平台" },
  { id: "browser-agent", label: "浏览器 Agent", icon: Globe, group: "平台" },
  { id: "plugins", label: "插件市场", icon: Plug, group: "平台" },
  { id: "portfolio", label: "作品集分析", icon: FolderGit2, group: "工具" },
  { id: "learning", label: "学习路线", icon: GraduationCap, group: "工具" },
  { id: "analytics", label: "数据分析", icon: BarChart3, group: "工具" },
  { id: "heatmap", label: "活跃热力图", icon: Activity, group: "工具" },
  { id: "achievements", label: "成就系统", icon: Trophy, group: "工具" },
  { id: "goals", label: "求职目标", icon: Target, group: "工具" },
  { id: "billing", label: "订阅与账单", icon: CreditCard, group: "账户" },
  { id: "team", label: "团队管理", icon: Users, group: "账户" },
  { id: "settings", label: "设置", icon: Settings, group: "账户" },
];

const actions = [
  { id: "upload", label: "上传简历", icon: Upload, desc: "拖拽上传 PDF / DOCX / MD" },
  { id: "optimize", label: "AI 一键优化简历", icon: Sparkles, desc: "使用 AI 优化当前简历" },
  { id: "agent-run", label: "启动 AI Job Agent", icon: Zap, desc: "自动化整个求职流程" },
];

export function CommandPalette() {
  const { commandOpen, setCommandOpen, setView } = useAppStore();
  const { setTheme } = useTheme();

  const handleSelect = (id: ViewId) => {
    setView(id);
    setCommandOpen(false);
  };

  const handleAction = (id: string) => {
    setCommandOpen(false);
    if (id === "upload") toast.success("请拖拽文件到简历管理页面");
    if (id === "optimize") {
      setView("resume");
      toast.success("正在优化简历...");
    }
    if (id === "agent-run") setView("agent");
  };

  return (
    <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
      <CommandInput placeholder="输入命令、搜索页面、或执行 AI 操作..." />
      <CommandList>
        <CommandEmpty>没有找到结果</CommandEmpty>

        <CommandGroup heading="快速操作">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem
                key={action.id}
                onSelect={() => handleAction(action.id)}
                className="flex items-center gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span>{action.label}</span>
                  <span className="text-xs text-muted-foreground">{action.desc}</span>
                </div>
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="导航">
          {commands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <CommandItem
                key={cmd.id}
                onSelect={() => handleSelect(cmd.id)}
                className="flex items-center gap-3"
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{cmd.label}</span>
                {cmd.shortcut && (
                  <CommandShortcut>{cmd.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="主题">
          <CommandItem onSelect={() => { setTheme("dark"); setCommandOpen(false); }}>
            <Moon className="h-4 w-4" />
            <span>切换到深色模式</span>
          </CommandItem>
          <CommandItem onSelect={() => { setTheme("light"); setCommandOpen(false); }}>
            <Sun className="h-4 w-4" />
            <span>切换到浅色模式</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
