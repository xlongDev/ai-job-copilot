"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Network,
  FileText,
  Mic,
  Compass,
  GraduationCap,
  Bot,
  Activity,
  CheckCircle2,
  Loader2,
  Zap,
  ArrowRight,
  Cpu,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Mic, Compass, GraduationCap, Bot,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
};

const agentDefs = [
  { id: "resume-agent", name: "简历优化 Agent", nameEn: "Resume Agent", role: "简历优化专家", icon: "FileText", color: "emerald", description: "负责简历的全流程优化：STAR 重构、量化数据增强、关键词优化、ATS 兼容性调整。", capabilities: ["STAR 法则重构", "量化数据增强", "关键词优化", "ATS 兼容性"], tools: ["resume_parser", "ats_scanner", "keyword_extractor"], model: "GPT-4o", tasksCompleted: 142, successRate: 96, avgLatency: "2.3s" },
  { id: "interview-agent", name: "面试官 Agent", nameEn: "Interview Agent", role: "模拟面试官", icon: "Mic", color: "violet", description: "生成针对性面试问题，模拟 HR/技术/项目/算法/行为面试，实时评分。", capabilities: ["5 类面试题生成", "实时评分", "STAR 评估", "语音面试"], tools: ["question_bank", "speech_to_text", "scoring_engine"], model: "GPT-4o", tasksCompleted: 89, successRate: 94, avgLatency: "1.8s" },
  { id: "career-coach-agent", name: "职业教练 Agent", nameEn: "Career Coach", role: "职业规划师", icon: "Compass", color: "amber", description: "分析技能缺口，制定 3/6/12 月成长路线，推荐课程和项目。", capabilities: ["技能缺口分析", "成长路线规划", "课程推荐", "职业方向建议"], tools: ["skill_analyzer", "roadmap_generator", "course_recommender"], model: "Claude 3.5", tasksCompleted: 67, successRate: 98, avgLatency: "3.1s" },
  { id: "learning-agent", name: "学习规划 Agent", nameEn: "Learning Agent", role: "学习规划师", icon: "GraduationCap", color: "rose", description: "生成每日学习计划，跟踪进度，智能调整难度。", capabilities: ["每日计划生成", "进度跟踪", "难度调整", "打卡提醒"], tools: ["scheduler", "progress_tracker", "spaced_repetition"], model: "GPT-4o", tasksCompleted: 203, successRate: 99, avgLatency: "1.2s" },
  { id: "job-hunter-agent", name: "求职猎手 Agent", nameEn: "Job Hunter", role: "自动投递", icon: "Bot", color: "blue", description: "自动浏览招聘网站，筛选匹配岗位，辅助投递。", capabilities: ["岗位搜索", "JD 分析", "匹配评分", "自动投递"], tools: ["browser_automation", "jd_parser", "match_scorer"], model: "GPT-4o", tasksCompleted: 34, successRate: 91, avgLatency: "5.4s" },
];

interface AgentMessage {
  agentId: string;
  message: string;
  time: string;
  status: "done" | "running" | "pending";
}

export function AgentsView() {
  const aiConfig = useAIConfig();
  const [selectedAgent, setSelectedAgent] = useState(agentDefs[0]);
  const [collabRunning, setCollabRunning] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  const runCollaboration = async () => {
    setCollabRunning(true);
    setMessages([]);
    try {
      // Simulate multi-agent collaboration by calling career-analysis API
      const res = await fetch("/api/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: "Staff Frontend Engineer",
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();

      const msgs: AgentMessage[] = [
        { agentId: "resume-agent", message: "检测到简历，开始解析...", time: "00:01", status: "done" },
        { agentId: "resume-agent", message: "识别 4 段工作经历，3 个项目", time: "00:03", status: "done" },
        { agentId: "interview-agent", message: "基于简历生成 15 道面试题", time: "00:05", status: "done" },
        { agentId: "career-coach-agent", message: data.analysis ? "分析技能缺口，生成成长计划" : "职业分析完成", time: "00:08", status: "done" },
        { agentId: "learning-agent", message: "制定每日学习计划", time: "00:10", status: "done" },
        { agentId: "job-hunter-agent", message: "扫描匹配岗位中...", time: "00:12", status: "done" },
      ];

      for (let i = 0; i < msgs.length; i++) {
        await new Promise((r) => setTimeout(r, 800));
        setMessages(msgs.slice(0, i + 1));
      }
      toast.success("多 Agent 协作完成");
    } catch {
      toast.error("协作失败");
    } finally {
      setCollabRunning(false);
    }
  };

  const stats = [
    { label: "活跃 Agent", value: agentDefs.length, icon: Bot, color: "emerald" },
    { label: "今日任务", value: 28, icon: Activity, color: "violet" },
    { label: "总成功率", value: "96%", icon: TrendingUp, color: "amber" },
    { label: "平均延迟", value: "2.8s", icon: Clock, color: "blue" },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Agent 中心"
        subtitle="多 Agent 协作架构，每个 Agent 专注一个领域"
        icon={<Network className="h-5 w-5" />}
        action={
          <Button onClick={runCollaboration} disabled={collabRunning} size="sm" className="gap-2">
            {collabRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {collabRunning ? "协作中..." : "启动协作"}
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const c = colorClasses[stat.color];
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", c.bg, c.text)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agentDefs.map((agent, i) => {
          const Icon = iconMap[agent.icon] || Bot;
          const c = colorClasses[agent.color];
          return (
            <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard
                hover
                className={cn("cursor-pointer p-4", selectedAgent.id === agent.id && cn("border-2", c.border))}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.bg, c.text)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px]">{agent.model}</Badge>
                </div>
                <h3 className="text-sm font-semibold">{agent.name}</h3>
                <p className="text-[10px] text-muted-foreground">{agent.nameEn}</p>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{agent.description}</p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{agent.tasksCompleted} 任务</span>
                  <span className="text-emerald-500">{agent.successRate}%</span>
                  <span>{agent.avgLatency}</span>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Agent Detail + Collaboration */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClasses[selectedAgent.color].bg, colorClasses[selectedAgent.color].text)}>
              {(() => { const Icon = iconMap[selectedAgent.icon] || Bot; return <Icon className="h-5 w-5" />; })()}
            </div>
            <div>
              <h3 className="text-sm font-semibold">{selectedAgent.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedAgent.role}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">{selectedAgent.description}</p>
          <div className="mb-4">
            <p className="text-xs font-medium mb-2">能力</p>
            <div className="flex flex-wrap gap-2">
              {selectedAgent.capabilities.map((cap) => (
                <Badge key={cap} variant="secondary" className="text-[10px]">{cap}</Badge>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium mb-2">工具</p>
            <div className="flex flex-wrap gap-2">
              {selectedAgent.tools.map((tool) => (
                <Badge key={tool} variant="outline" className="text-[10px] font-mono">{tool}</Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
              <p className="text-sm font-bold">{selectedAgent.tasksCompleted}</p>
              <p className="text-[10px] text-muted-foreground">完成任务</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
              <p className="text-sm font-bold text-emerald-500">{selectedAgent.successRate}%</p>
              <p className="text-[10px] text-muted-foreground">成功率</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
              <p className="text-sm font-bold">{selectedAgent.avgLatency}</p>
              <p className="text-[10px] text-muted-foreground">平均延迟</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Agent 协作日志
          </h3>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Network className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">点击「启动协作」查看多 Agent 协作</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((msg, i) => {
                const agent = agentDefs.find((a) => a.id === msg.agentId);
                const c = agent ? colorClasses[agent.color] : colorClasses.emerald;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 text-sm">
                    <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs", c.bg, c.text)}>
                      {agent?.name[0] || "A"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agent?.name || "Agent"}</span>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{msg.message}</p>
                    </div>
                    {msg.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                  </motion.div>
                );
              })}
              {collabRunning && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" /> 等待下一个 Agent...
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
