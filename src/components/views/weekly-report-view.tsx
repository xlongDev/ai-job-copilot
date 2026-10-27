"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  Target,
  Mic,
  BookOpen,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WeeklyReport {
  period: string;
  summary: {
    newApplications: number;
    newInterviews: number;
    newLearningTasks: number;
    resumeUpdates: number;
  };
  applications: { company: string; position: string; status: string; date: string }[];
  interviews: { type: string; overallScore: number | null; date: string }[];
  learning: { title: string; status: string; duration: number }[];
}

export function WeeklyReportView() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);

  useEffect(() => {
    void fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weekly-report");
      const data = await res.json();
      setReport(data.report);
      setAiSummary(data.aiSummary || "");
    } catch {
      toast.error("加载周报失败");
    } finally {
      setLoading(false);
    }
  };

  const generateAI = async () => {
    setGeneratingAI(true);
    setAiSummary("");
    try {
      const res = await fetch("/api/weekly-report?ai=true");
      const data = await res.json();
      setAiSummary(data.aiSummary || "");
      toast.success("AI 周报已生成");
    } catch {
      toast.error("AI 生成失败");
    } finally {
      setGeneratingAI(false);
    }
  };

  const summaryItems = report ? [
    { label: "新投递", value: report.summary.newApplications, icon: Target, color: "text-primary" },
    { label: "新面试", value: report.summary.newInterviews, icon: Mic, color: "text-amber-500" },
    { label: "学习任务", value: report.summary.newLearningTasks, icon: BookOpen, color: "text-violet-500" },
    { label: "简历更新", value: report.summary.resumeUpdates, icon: FileText, color: "text-emerald-500" },
  ] : [];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="求职周报"
        subtitle="最近 7 天求职活动总结"
        icon={<FileText className="h-5 w-5" />}
        action={
          <Button size="sm" variant="outline" className="gap-2" onClick={fetchReport}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : report ? (
        <>
          {/* Period */}
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-medium">{report.period}</span>
            </div>
          </GlassCard>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {summaryItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <GlassCard className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className={cn("text-2xl font-bold mt-1", item.color)}>{item.value}</p>
                      </div>
                      <Icon className={cn("h-8 w-8 opacity-20", item.color)} />
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>

          {/* AI Summary */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI 周报总结
              </h3>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={generateAI} disabled={generatingAI}>
                {generatingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {generatingAI ? "生成中..." : aiSummary ? "重新生成" : "生成 AI 总结"}
              </Button>
            </div>
            {aiSummary ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                  {aiSummary}
                </div>
              </motion.div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-8 w-8" />}
                title="点击「生成 AI 总结」"
                description="AI 将根据本周数据生成亮点、改进建议和下周计划"
              />
            )}
          </GlassCard>

          {/* Details */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Applications */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                本周投递
              </h3>
              {report.applications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">本周暂无投递</p>
              ) : (
                <div className="space-y-2">
                  {report.applications.map((app, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/30 p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.company}</p>
                        <p className="text-xs text-muted-foreground truncate">{app.position}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{app.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Interviews */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Mic className="h-4 w-4 text-amber-500" />
                本周面试
              </h3>
              {report.interviews.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">本周暂无面试</p>
              ) : (
                <div className="space-y-2">
                  {report.interviews.map((interview, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/30 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{interview.type}</p>
                        <p className="text-xs text-muted-foreground">{new Date(interview.date).toLocaleDateString("zh-CN")}</p>
                      </div>
                      {interview.overallScore && (
                        <Badge variant="outline" className="text-[10px]">{interview.overallScore} 分</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Learning */}
          {report.learning.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-500" />
                本周学习
              </h3>
              <div className="space-y-2">
                {report.learning.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/30 p-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                    <span className="text-xs text-muted-foreground">{task.duration}min</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard className="p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无周报数据</p>
        </GlassCard>
      )}
    </div>
  );
}
