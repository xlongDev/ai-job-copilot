"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  Bot,
  FileText,
  Mic,
  Compass,
  Target,
  CheckCircle2,
  Loader2,
  Circle,
  Zap,
  GitBranch,
  Settings2,
  Save,
  Plus,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/30" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/30" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/30" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/30" },
};

interface WorkflowNode {
  id: string;
  label: string;
  status: string;
  result: string;
  x: number;
  y: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const nodeDefs: WorkflowNode[] = [
  { id: "input", label: "用户输入", status: "pending", result: "", x: 50, y: 250, color: "emerald", icon: Target },
  { id: "router", label: "Router 路由", status: "pending", result: "", x: 250, y: 250, color: "amber", icon: GitBranch },
  { id: "resume", label: "Resume Agent", status: "pending", result: "", x: 480, y: 80, color: "emerald", icon: FileText },
  { id: "interview", label: "Interview Agent", status: "pending", result: "", x: 480, y: 250, color: "violet", icon: Mic },
  { id: "coach", label: "Career Coach", status: "pending", result: "", x: 480, y: 420, color: "amber", icon: Compass },
  { id: "ats", label: "ATS Scanner", status: "pending", result: "", x: 700, y: 80, color: "rose", icon: CheckCircle2 },
  { id: "jd", label: "JD Parser", status: "pending", result: "", x: 700, y: 250, color: "blue", icon: Target },
  { id: "learning", label: "Learning Agent", status: "pending", result: "", x: 700, y: 420, color: "violet", icon: Bot },
  { id: "merge", label: "结果聚合", status: "pending", result: "", x: 920, y: 250, color: "amber", icon: Layers },
  { id: "output", label: "输出报告", status: "pending", result: "", x: 1120, y: 250, color: "emerald", icon: CheckCircle2 },
];

const edges = [
  { from: "input", to: "router" },
  { from: "router", to: "resume" },
  { from: "router", to: "interview" },
  { from: "router", to: "coach" },
  { from: "resume", to: "ats" },
  { from: "interview", to: "jd" },
  { from: "coach", to: "learning" },
  { from: "ats", to: "merge" },
  { from: "jd", to: "merge" },
  { from: "learning", to: "merge" },
  { from: "merge", to: "output" },
];

export function WorkflowView() {
  const aiConfig = useAIConfig();
  const [running, setRunning] = useState(false);
  const [nodes, setNodes] = useState<WorkflowNode[]>(nodeDefs);
  const [logs, setLogs] = useState<{ time: string; node: string; msg: string; status: string }[]>([]);
  const [input, setInput] = useState("我想去腾讯做前端");

  const run = async () => {
    if (!input.trim()) {
      toast.error("请输入工作流输入");
      return;
    }
    setRunning(true);
    setNodes(nodeDefs.map((n) => ({ ...n, status: "pending", result: "" })));
    setLogs([]);

    try {
      const res = await fetch("/api/workflow-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();

      if (data.nodes) {
        // Animate nodes one by one
        for (let i = 0; i < data.nodes.length; i++) {
          await new Promise((r) => setTimeout(r, 500));
          setNodes((prev) => prev.map((n, idx) => {
            if (idx === i) return { ...n, ...data.nodes[i], status: data.nodes[i].status, result: data.nodes[i].result };
            return n;
          }));
          if (data.logs) {
            setLogs(data.logs.slice(0, i + 1));
          }
        }
        toast.success("工作流执行完成");
      }
    } catch {
      toast.error("工作流执行失败");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setNodes(nodeDefs.map((n) => ({ ...n, status: "pending", result: "" })));
    setLogs([]);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="工作流编排"
        subtitle="LangGraph 风格的可视化 Agent 编排"
        icon={<Layers className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reset} className="gap-2">
              <RotateCcw className="h-4 w-4" />重置
            </Button>
            <Button size="sm" onClick={run} disabled={running} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "运行中" : "运行"}
            </Button>
          </div>
        }
      />

      {/* Input */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <Target className="h-4 w-4 text-primary" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入工作流参数..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <Badge variant="outline" className="text-[10px]">10 节点 · 11 边</Badge>
        </div>
      </GlassCard>

      {/* Canvas */}
      <GlassCard className="p-6 overflow-x-auto">
        <div className="relative" style={{ width: 1250, height: 520 }}>
          {/* Edges */}
          <svg className="absolute inset-0 pointer-events-none" width="1250" height="520">
            {edges.map((edge, i) => {
              const from = nodes.find((n) => n.id === edge.from)!;
              const to = nodes.find((n) => n.id === edge.to)!;
              const fromDone = from.status === "done";
              const toDone = to.status === "done" || to.status === "running";
              const active = fromDone && toDone;
              return (
                <motion.line
                  key={i}
                  x1={from.x + 80}
                  y1={from.y + 25}
                  x2={to.x}
                  y2={to.y + 25}
                  stroke={active ? "oklch(0.72 0.17 155)" : "oklch(1 0 0 / 0.1)"}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray={active ? "0" : "4 4"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const c = colorClasses[node.color] || colorClasses.emerald;
            const Icon = node.icon;
            const isDone = node.status === "done";
            const isRunning = node.status === "running";
            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "absolute flex flex-col items-center justify-center rounded-xl border-2 px-3 py-2 transition-all",
                  isDone ? cn(c.border, c.bg) : "border-border/50 bg-card/50",
                  isRunning && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                )}
                style={{ left: node.x, top: node.y, width: 80, height: 50 }}
              >
                <Icon className={cn("h-4 w-4", isDone ? c.text : "text-muted-foreground")} />
                <span className="mt-1 text-[10px] font-medium">{node.label}</span>
                {isDone && <CheckCircle2 className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-emerald-500 bg-background rounded-full" />}
                {isRunning && <Loader2 className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 text-primary animate-spin bg-background rounded-full" />}
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Execution Log */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          执行日志
        </h3>
        {logs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">点击「运行」开始执行工作流</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/30 px-3 py-2"
              >
                <span className="text-muted-foreground text-xs font-mono">{log.time}</span>
                <Badge variant="outline" className="text-[10px]">{log.node}</Badge>
                <span className="flex-1 text-muted-foreground text-xs">{log.msg}</span>
                {log.status === "done" && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
              </motion.div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
