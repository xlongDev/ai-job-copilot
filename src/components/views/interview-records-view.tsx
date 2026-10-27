"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Mic,
  Video,
  Code2,
  Brain,
  User,
  MessageSquare,
  Star,
  Clock,
  TrendingUp,
  Loader2,
  ChevronRight,
  RotateCcw,
  Trophy,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/shared/score-ring";
import { EmptyState } from "@/components/shared/loading-skeleton";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface InterviewRecord {
  id: string;
  type: string;
  questions: { question: string; hint?: string }[];
  answers: { question: string; answer: string }[];
  scores: { expression: number; logic: number; professional: number; star: number; communication: number } | null;
  overallScore: number | null;
  duration: number | null;
  feedback: string | null;
  createdAt: string;
}

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  hr: { icon: User, label: "HR 面", color: "emerald" },
  tech: { icon: Code2, label: "技术面", color: "violet" },
  project: { icon: Brain, label: "项目面", color: "amber" },
  algo: { icon: Code2, label: "算法面", color: "emerald" },
  behavior: { icon: MessageSquare, label: "行为面", color: "violet" },
  system: { icon: Brain, label: "系统设计", color: "amber" },
  voice: { icon: Mic, label: "语音面试", color: "emerald" },
  video: { icon: Video, label: "视频面试", color: "violet" },
};

const colorClasses: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500",
  violet: "bg-violet-500/10 text-violet-500",
  amber: "bg-amber-500/10 text-amber-500",
};

export function InterviewRecordsView() {
  const { setView } = useAppStore();
  const [records, setRecords] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InterviewRecord | null>(null);

  useEffect(() => {
    void fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/interview-records");
      const data = await res.json();
      setRecords(data.interviews || []);
    } catch {
      toast.error("加载面试记录失败");
    } finally {
      setLoading(false);
    }
  };

  // Chart data: score trend over time
  const chartData = records
    .filter((r) => r.overallScore)
    .map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      score: r.overallScore,
    }))
    .reverse();

  const avgScore = records.filter((r) => r.overallScore).length > 0
    ? Math.round(records.filter((r) => r.overallScore).reduce((sum, r) => sum + (r.overallScore || 0), 0) / records.filter((r) => r.overallScore).length)
    : 0;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="面试记录"
        subtitle="历史面试复盘与评分趋势"
        icon={<Mic className="h-5 w-5" />}
        action={
          <Button size="sm" className="gap-2" onClick={() => setView("interview")}>
            <RotateCcw className="h-4 w-4" />
            开始新面试
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "总面试次数", value: records.length, icon: Mic, color: "text-primary" },
          { label: "平均分", value: avgScore, icon: Star, color: "text-amber-500" },
          { label: "最高分", value: records.length > 0 ? Math.max(...records.filter(r => r.overallScore).map(r => r.overallScore || 0)) : 0, icon: Trophy, color: "text-emerald-500" },
          { label: "总时长", value: `${Math.round(records.reduce((sum, r) => sum + (r.duration || 0), 0) / 60)}h`, icon: Clock, color: "text-violet-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                  </div>
                  <Icon className={cn("h-8 w-8 opacity-20", stat.color)} />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Score Trend Chart */}
      {chartData.length > 1 && (
        <GlassCard className="p-6">
          <SectionHeader title="评分趋势" subtitle="面试分数变化" icon={<TrendingUp className="h-5 w-5" />} />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.2 0 0)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="oklch(0.72 0.17 155)" strokeWidth={2} dot={{ fill: "oklch(0.72 0.17 155)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      )}

      {/* Records List */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-4">面试记录列表</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Mic className="h-12 w-12" />}
            title="暂无面试记录"
            description="完成模拟面试后，记录将自动保存到这里"
            action={<Button size="sm" className="gap-2" onClick={() => setView("interview")}><Mic className="h-4 w-4" />开始面试</Button>}
          />
        ) : (
          <div className="space-y-3">
            {records.map((record, i) => {
              const config = typeConfig[record.type] || typeConfig.tech;
              const Icon = config.icon;
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/30 p-4 cursor-pointer transition hover:border-primary/30"
                  onClick={() => setSelected(record)}
                >
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClasses[config.color])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{config.label}</span>
                      <Badge variant="outline" className="text-[10px]">{record.questions.length} 题</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(record.createdAt).toLocaleString("zh-CN")}
                      {record.duration && ` · ${record.duration}秒`}
                    </p>
                  </div>
                  {record.overallScore && (
                    <div className="flex items-center gap-2">
                      <ScoreRing value={record.overallScore} size={48} strokeWidth={4} color={record.overallScore >= 80 ? "emerald" : record.overallScore >= 60 ? "amber" : "rose"} />
                    </div>
                  )}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Detail Dialog */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-strong w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const config = typeConfig[selected.type] || typeConfig.tech;
                    const Icon = config.icon;
                    return (
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", colorClasses[config.color])}>
                        <Icon className="h-5 w-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 className="text-sm font-medium">{typeConfig[selected.type]?.label || "面试"}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(selected.createdAt).toLocaleString("zh-CN")}</p>
                  </div>
                </div>
                {selected.overallScore && (
                  <ScoreRing value={selected.overallScore} size={60} strokeWidth={5} color={selected.overallScore >= 80 ? "emerald" : selected.overallScore >= 60 ? "amber" : "rose"} />
                )}
              </div>

              {/* Scores */}
              {selected.scores && (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { label: "表达", value: selected.scores.expression },
                    { label: "逻辑", value: selected.scores.logic },
                    { label: "专业", value: selected.scores.professional },
                    { label: "STAR", value: selected.scores.star },
                    { label: "沟通", value: selected.scores.communication },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
                      <p className="text-lg font-bold text-primary">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {selected.feedback && (
                <div className="mb-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                  <p className="text-xs font-medium text-violet-500 mb-1">AI 反馈</p>
                  <p className="text-xs text-muted-foreground">{selected.feedback}</p>
                </div>
              )}

              {/* Q&A */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground">问答记录</p>
                {selected.questions.map((q, i) => {
                  const answer = selected.answers?.find((a) => a.question === q.question);
                  return (
                    <div key={i} className="rounded-lg border border-border/50 bg-card/30 p-3">
                      <p className="text-sm font-medium mb-1">Q{i + 1}: {q.question}</p>
                      {q.hint && <p className="text-[10px] text-muted-foreground mb-2">考察点: {q.hint}</p>}
                      {answer && (
                        <div className="mt-2 rounded border-l-2 border-primary/30 pl-3">
                          <p className="text-xs text-muted-foreground">{answer.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button className="w-full mt-4" variant="outline" onClick={() => setSelected(null)}>关闭</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
