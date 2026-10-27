"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Bot,
  Sparkles,
  Search,
  ScanLine,
  Shield,
  Edit3,
  Mail,
  Mic,
  BookOpen,
  Calendar,
  Code2,
  GraduationCap,
  CheckCircle2,
  Loader2,
  Circle,
  ArrowRight,
  Zap,
  Play,
  RotateCcw,
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
  search: Search, scan: ScanLine, shield: Shield, edit: Edit3,
  mail: Mail, mic: Mic, book: BookOpen, calendar: Calendar,
  code: Code2, graduation: GraduationCap,
};

interface AgentStep {
  id: number;
  title: string;
  desc: string;
  icon: string;
  status: string;
  results?: string[];
}

interface AgentSummary {
  matchScore: number;
  atsScore: number;
  questions: number;
  learningDays: number;
  coverLetter: string;
}

export function AgentView() {
  const aiConfig = useAIConfig();
  const [running, setRunning] = useState(false);
  const [target, setTarget] = useState("我想去腾讯做前端");
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [summary, setSummary] = useState<AgentSummary | null>(null);

  const handleRun = async () => {
    if (!target.trim()) {
      toast.error("请输入你的求职目标");
      return;
    }
    setRunning(true);
    setCurrentStep(0);
    setSteps([]);
    setSummary(null);
    toast.info("Agent 启动", { description: `目标：${target}` });

    try {
      const res = await fetch("/api/agent-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();

      if (data.steps) {
        // Animate steps appearing one by one
        for (let i = 0; i < data.steps.length; i++) {
          await new Promise((r) => setTimeout(r, 400));
          setCurrentStep(i);
          setSteps(data.steps.slice(0, i + 1));
        }
        await new Promise((r) => setTimeout(r, 500));
        setSummary(data.summary);
        toast.success("Agent 任务完成！", { description: "已生成完整求职方案" });
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch {
      toast.error("Agent 运行失败");
    } finally {
      setRunning(false);
    }
  };

  const handleReset = () => {
    setSteps([]);
    setCurrentStep(-1);
    setSummary(null);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="AI Job Agent"
        subtitle="V1 核心功能：输入目标，AI 自动完成整个求职流程"
        icon={<Bot className="h-5 w-5" />}
        action={<Badge variant="default" className="gap-1"><Sparkles className="h-3 w-3" />V1 核心</Badge>}
      />

      {/* Input */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">你的求职目标</label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="例如：我想去腾讯做前端"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <Button onClick={handleRun} disabled={running} size="lg" className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "运行中..." : "启动 Agent"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Agent 将自动执行 10 个步骤：JD 分析 → 简历分析 → ATS 优化 → STAR 优化 → 求职信 → 面试题 → 学习路线 → 每日计划 → 推荐项目 → 推荐课程
        </p>
      </GlassCard>

      {/* Progress */}
      {(running || steps.length > 0) && (
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Agent 执行进度</h3>
            <span className="text-xs text-muted-foreground">
              {steps.filter((s) => s.status === "done").length}/{steps.length || 10} 步骤
            </span>
          </div>
          <Progress value={(steps.filter((s) => s.status === "done").length / (steps.length || 10)) * 100} className="h-2" />
        </GlassCard>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {steps.map((step, i) => {
            const Icon = iconMap[step.icon] || Circle;
            const isDone = step.status === "done";
            const isRunning = i === currentStep && running;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard
                  className={cn(
                    "p-4 transition-all",
                    isDone && "border-emerald-500/20",
                    isRunning && "border-primary/40 shadow-lg shadow-primary/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      isDone && "bg-emerald-500/10 text-emerald-500",
                      isRunning && "bg-primary/10 text-primary",
                      !isDone && !isRunning && "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle2 className="h-5 w-5" /> :
                       isRunning ? <Loader2 className="h-5 w-5 animate-spin" /> :
                       <Icon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">STEP {String(step.id).padStart(2, "0")}</span>
                        {isDone && <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">已完成</Badge>}
                        {isRunning && <Badge variant="default" className="text-[10px]">运行中</Badge>}
                      </div>
                      <h4 className="text-sm font-medium mt-1">{step.title}</h4>
                      <p className="text-xs text-muted-foreground">{step.desc}</p>
                      {step.results && step.results.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {step.results.map((r, j) => (
                            <div key={j} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                              {r}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {summary && !running && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="p-6 border-primary/30">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <h3 className="text-sm font-medium">Agent 任务完成</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { label: "匹配度", value: `${summary.matchScore}%` },
                { label: "ATS 分数", value: summary.atsScore },
                { label: "面试题", value: summary.questions },
                { label: "学习计划", value: `${summary.learningDays} 天` },
                { label: "求职信", value: summary.coverLetter },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                  <p className="text-lg font-bold text-primary">{item.value}</p>
                  <p className="text-[11px] text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="gap-2"><Sparkles className="h-4 w-4" />查看完整方案</Button>
              <Button variant="outline" className="gap-2" onClick={handleReset}><RotateCcw className="h-4 w-4" />重新运行</Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {!running && steps.length === 0 && (
        <GlassCard className="p-12 text-center">
          <Bot className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">输入你的求职目标，AI Agent 将自动完成整个求职流程</p>
        </GlassCard>
      )}
    </div>
  );
}
