"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Target,
  Trophy,
  Zap,
  Activity,
  Loader2,
} from "lucide-react";
import {  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import {} from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Stats {
  atsScore: number;
  resumeCount: number;
  applications: number;
  applied: number;
  interviews: number;
  offers: number;
  rejected: number;
  interviewSessions: number;
  learningTasks: number;
  learningDone: number;
  learningHours: number;
  knowledgeDocs: number;
}

export function AnalyticsView() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        暂无数据
      </div>
    );
  }

  const COLORS = ["oklch(0.72 0.17 155)", "oklch(0.7 0.18 300)", "oklch(0.75 0.15 80)", "oklch(0.68 0.2 22)"];

  const pieData = [
    { name: "已投递", value: stats.applied, color: COLORS[0] },
    { name: "面试中", value: stats.interviews, color: COLORS[1] },
    { name: "Offer", value: stats.offers, color: COLORS[2] },
    { name: "未通过", value: stats.rejected, color: COLORS[3] },
  ].filter((d) => d.value > 0);

  const funnelData = [
    { stage: "投递", count: stats.applications, percent: 100 },
    { stage: "面试", count: stats.interviews, percent: stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0 },
    { stage: "Offer", count: stats.offers, percent: stats.applications > 0 ? Math.round((stats.offers / stats.applications) * 100) : 0 },
  ];

  

  const kpiCards = [
    { label: "ATS 分数", value: stats.atsScore, icon: Target, color: "text-emerald-500" },
    { label: "投递总数", value: stats.applications, icon: TrendingUp, color: "text-violet-500" },
    { label: "面试场次", value: stats.interviewSessions, icon: Activity, color: "text-amber-500" },
    { label: "Offer 数", value: stats.offers, icon: Trophy, color: "text-emerald-500" },
    { label: "学习任务", value: stats.learningTasks, icon: Clock, color: "text-violet-500" },
    { label: "学习时长", value: `${stats.learningHours}h`, icon: Zap, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="数据分析"
        subtitle="深度分析你的求职数据，洞察成长趋势"
        icon={<BarChart3 className="h-5 w-5" />}
        action={
          <div className="flex gap-1 rounded-lg border border-border/50 bg-card/30 p-1">
            {[
              { id: "7d" as const, label: "7天" },
              { id: "30d" as const, label: "30天" },
              { id: "all" as const, label: "全部" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition",
                  timeRange === r.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <Icon className={cn("h-5 w-5 mb-2", kpi.color)} />
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Application Funnel */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">投递漏斗</h3>
          <div className="space-y-3">
            {funnelData.map((stage, i) => (
              <div key={stage.stage}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count} ({stage.percent}%)</span>
                </div>
                <div className="h-8 overflow-hidden rounded-lg bg-muted">
                  <motion.div
                    className="h-full rounded-lg flex items-center justify-end px-3 text-xs font-medium text-white"
                    style={{ backgroundColor: COLORS[i] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percent}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  >
                    {stage.count}
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Application Status Pie */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">投递状态分布</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-sm text-muted-foreground">
              暂无投递数据
            </div>
          )}
        </GlassCard>

        {/* Learning Progress */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">学习进度</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">总进度</span>
              <span className="text-sm font-medium">
                {stats.learningDone}/{stats.learningTasks} ({stats.learningTasks > 0 ? Math.round((stats.learningDone / stats.learningTasks) * 100) : 0}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.learningTasks > 0 ? (stats.learningDone / stats.learningTasks) * 100 : 0}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-500">{stats.learningDone}</p>
                <p className="text-xs text-muted-foreground">已完成</p>
              </div>
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <p className="text-2xl font-bold text-amber-500">{stats.learningTasks - stats.learningDone}</p>
                <p className="text-xs text-muted-foreground">待完成</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Summary */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">数据概览</h3>
          <div className="space-y-3">
            {[
              { label: "简历数量", value: stats.resumeCount },
              { label: "知识库文档", value: stats.knowledgeDocs },
              { label: "投递转化率", value: `${stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0}%` },
              { label: "面试通过率", value: `${stats.interviews > 0 ? Math.round((stats.offers / stats.interviews) * 100) : 0}%` },
              { label: "整体成功率", value: `${stats.applications > 0 ? Math.round((stats.offers / stats.applications) * 100) : 0}%` },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-border/30 pb-2">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
