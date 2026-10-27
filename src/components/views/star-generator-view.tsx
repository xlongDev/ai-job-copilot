"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Sparkles,
  Loader2,
  Copy,
  Check,
  Target,
  ListChecks,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface STARResult {
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  businessValue: string;
}

const examples = [
  "做了一个 React 性能优化项目",
  "主导微前端架构改造",
  "开发了一个在线协作白板",
  "重构了公司的前端监控系统",
];

export function StarGeneratorView() {
  const aiConfig = useAIConfig();
  const [input, setInput] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<STARResult | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!input.trim()) {
      toast.error("请输入项目描述");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/star-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectDescription: input,
          role,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.star) {
        setResult(data.star);
        toast.success("STAR 生成完成");
      } else {
        toast.error(data.error || "生成失败");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!result) return;
    const text = `【Situation】${result.situation}\n\n【Task】${result.task}\n\n【Action】${result.action}\n\n【Result】${result.result}\n\n【量化指标】${result.metrics.join("、")}\n\n【商业价值】${result.businessValue}`;
    void navigator.clipboard?.writeText(text);
    setCopied(true);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { key: "situation", label: "Situation（背景）", icon: Target, color: "emerald" },
    { key: "task", label: "Task（任务）", icon: ListChecks, color: "violet" },
    { key: "action", label: "Action（行动）", icon: Sparkles, color: "amber" },
    { key: "result", label: "Result（成果）", icon: TrendingUp, color: "emerald" },
  ] as const;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="STAR 生成器"
        subtitle="输入项目描述，AI 自动生成 STAR 结构化叙述"
        icon={<Sparkles className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">项目描述</h3>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="描述你的项目，例如：做了一个 React 性能优化项目，首屏加载时间从 5 秒优化到 2 秒..."
            className="min-h-[200px] resize-none"
          />
          <div className="mt-3">
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="你的角色（可选），如：前端负责人"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">示例：</p>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="rounded-full border border-border/50 bg-card/30 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="mt-4 w-full gap-2"
            onClick={generate}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" />AI 生成中...</>
            ) : (
              <><Sparkles className="h-4 w-4" />生成 STAR</>
            )}
          </Button>
        </GlassCard>

        {/* Result */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">STAR 结果</h3>
            {result && (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={copyResult}>
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "已复制" : "复制"}
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                <p className="text-sm text-muted-foreground">AI 正在分析项目...</p>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {sections.map((section) => {
                  const Icon = section.icon;
                  const value = result[section.key as keyof STARResult] as string;
                  return (
                    <div key={section.key} className="rounded-lg border border-border/50 bg-card/30 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={cn(
                          "flex h-6 w-6 items-center justify-center rounded-md text-xs",
                          section.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                          section.color === "violet" && "bg-violet-500/10 text-violet-500",
                          section.color === "amber" && "bg-amber-500/10 text-amber-500",
                        )}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-medium">{section.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  );
                })}

                {result.metrics.length > 0 && (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-xs font-medium text-emerald-500 mb-2">量化指标</p>
                    <div className="flex flex-wrap gap-2">
                      {result.metrics.map((m, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-500">
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {result.businessValue && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <p className="text-xs font-medium text-amber-500 mb-1 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" />商业价值
                    </p>
                    <p className="text-sm text-muted-foreground">{result.businessValue}</p>
                  </div>
                )}
              </motion.div>
            )}

            {!result && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <Sparkles className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">输入项目描述，生成 STAR 结构</p>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Tips */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-3">STAR 法则说明</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { letter: "S", name: "Situation", desc: "项目背景与业务场景", color: "emerald" },
            { letter: "T", name: "Task", desc: "你的具体职责和目标", color: "violet" },
            { letter: "A", name: "Action", desc: "你采取的技术行动", color: "amber" },
            { letter: "R", name: "Result", desc: "量化成果与商业价值", color: "emerald" },
          ].map((item) => (
            <div key={item.letter} className="rounded-lg border border-border/50 bg-card/30 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold",
                  item.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                  item.color === "violet" && "bg-violet-500/10 text-violet-500",
                  item.color === "amber" && "bg-amber-500/10 text-amber-500",
                )}>{item.letter}</span>
                <span className="text-xs font-medium">{item.name}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
