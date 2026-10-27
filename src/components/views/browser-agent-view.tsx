"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Globe,
  Search,
  Bot,
  CheckCircle2,
  Loader2,
  Circle,
  Play,
  RotateCcw,
  ExternalLink,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Zap,
  Eye,
  MousePointer2,
  Filter,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  navigate: Globe, search: Search, click: MousePointer2,
  extract: Filter, analyze: Eye, apply: Zap,
};

interface BrowserStep {
  id: number;
  action: string;
  desc: string;
  icon: string;
  status: string;
}

interface ScrapedJob {
  title: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  posted: string;
}

export function BrowserAgentView() {
  const aiConfig = useAIConfig();
  const [query, setQuery] = useState("前端工程师 北京");
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<BrowserStep[]>([]);
  const [jobs, setJobs] = useState<ScrapedJob[]>([]);

  const run = async () => {
    if (!query.trim()) {
      toast.error("请输入搜索关键词");
      return;
    }
    setRunning(true);
    setSteps([]);
    setJobs([]);

    const stepDefs: BrowserStep[] = [
      { id: 1, action: "打开招聘网站", desc: "导航到 lagou.com", icon: "navigate", status: "pending" },
      { id: 2, action: "搜索岗位", desc: `输入"${query}"`, icon: "search", status: "pending" },
      { id: 3, action: "筛选条件", desc: "薪资 25-50K · 经验 3-5年", icon: "click", status: "pending" },
      { id: 4, action: "提取岗位列表", desc: "解析岗位卡片", icon: "extract", status: "pending" },
      { id: 5, action: "分析 JD 详情", desc: "逐个打开并提取要求", icon: "analyze", status: "pending" },
      { id: 6, action: "匹配度评分", desc: "AI 计算匹配度", icon: "analyze", status: "pending" },
    ];

    try {
      const res = await fetch("/api/browser-agent-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();

      // Animate steps
      for (let i = 0; i < stepDefs.length; i++) {
        await new Promise((r) => setTimeout(r, 600));
        stepDefs[i].status = "done";
        setSteps([...stepDefs.slice(0, i + 1)]);
      }

      if (data.jobs) {
        setJobs(data.jobs);
      }
      toast.success("浏览器 Agent 完成", { description: `找到 ${data.jobs?.length || 0} 个匹配岗位` });
    } catch {
      toast.error("Agent 运行失败");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setSteps([]);
    setJobs([]);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="浏览器 Agent"
        subtitle="自动浏览招聘网站，分析岗位，辅助投递"
        icon={<Globe className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />重置
            </Button>
            <Button size="sm" onClick={run} disabled={running} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "运行中" : "启动 Agent"}
            </Button>
          </div>
        }
      />

      {/* Input */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-primary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索关键词，如：前端工程师 北京"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <Badge variant="outline" className="text-[10px]">模拟浏览器</Badge>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Steps */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4">执行步骤</h3>
            {steps.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">点击启动开始</p>
            ) : (
              <div className="space-y-3">
                {steps.map((step) => {
                  const Icon = iconMap[step.icon] || Circle;
                  const isDone = step.status === "done";
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3"
                    >
                      <div className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                        isDone ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                      )}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium">{step.action}</p>
                        <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-3">Agent 能力</h3>
            <div className="space-y-2 text-xs">
              {[
                { icon: Eye, text: "页面视觉理解（VLM）" },
                { icon: MousePointer2, text: "精准元素点击" },
                { icon: Search, text: "表单自动填写" },
                { icon: Bot, text: "JD 智能分析" },
                { icon: Zap, text: "批量自动投递" },
              ].map((cap) => {
                const Icon = cap.icon;
                return (
                  <div key={cap.text} className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    {cap.text}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">抓取结果</h3>
              {jobs.length > 0 && <Badge variant="secondary">{jobs.length} 个岗位</Badge>}
            </div>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Globe className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">启动 Agent 后将显示抓取的岗位</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {jobs.map((job, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-lg border border-border/50 bg-card/30 p-4 hover:border-primary/30 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium">{job.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{job.salary}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.posted}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        "text-[10px]",
                        job.match >= 80 ? "border-emerald-500/30 text-emerald-500" :
                        job.match >= 60 ? "border-amber-500/30 text-amber-500" :
                        "border-rose-500/30 text-rose-500"
                      )}>
                        匹配 {job.match}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full", job.match >= 80 ? "bg-emerald-500" : job.match >= 60 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${job.match}%` }} />
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                        <ExternalLink className="h-3 w-3" />查看
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
