"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  Trophy,
  Activity,
  Zap,
  Flame,
  Award,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface CockpitStats {
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

export function CockpitView() {
  const { setView } = useAppStore();
  const [stats, setStats] = useState<CockpitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const successRate = stats.applications > 0 ? Math.round((stats.offers / stats.applications) * 100) : 0;
  const interviewRate = stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0;

  const radialData = [
    { name: "成功率", value: successRate, fill: "oklch(0.72 0.17 155)" },
    { name: "面试率", value: interviewRate, fill: "oklch(0.7 0.18 300)" },
  ];

  const pieData = [
    { name: "已投递", value: stats.applied, color: "oklch(0.72 0.17 155)" },
    { name: "面试中", value: stats.interviews, color: "oklch(0.7 0.18 300)" },
    { name: "Offer", value: stats.offers, color: "oklch(0.75 0.15 80)" },
    { name: "未通过", value: stats.rejected, color: "oklch(0.68 0.2 22)" },
  ].filter((d) => d.value > 0);

  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: `D${i + 1}`,
    applications: Math.round(stats.applications / 7),
    interviews: Math.round(stats.interviews / 7),
  }));

  const kpiCards = [
    { label: "ATS 分数", value: stats.atsScore, icon: Target, color: "text-emerald-500", trend: "+8", trendUp: true },
    { label: "投递总数", value: stats.applications, icon: TrendingUp, color: "text-violet-500", trend: "+12", trendUp: true },
    { label: "面试场次", value: stats.interviewSessions, icon: Activity, color: "text-amber-500", trend: "+50%", trendUp: true },
    { label: "Offer 数", value: stats.offers, icon: Trophy, color: "text-emerald-500", trend: "+2", trendUp: true },
    { label: "学习任务", value: stats.learningTasks, icon: Award, color: "text-violet-500", trend: `${stats.learningDone}/${stats.learningTasks}`, trendUp: true },
    { label: "学习时长", value: stats.learningHours, suffix: "h", icon: Zap, color: "text-amber-500", trend: "+5h", trendUp: true },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="求职驾驶舱"
        subtitle="全屏数据可视化 — 实时掌握你的求职全景"
        icon={<LayoutDashboard className="h-5 w-5" />}
      />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {kpiCards.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-muted/50", kpi.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={cn(
                    "flex items-center gap-0.5 text-[10px] font-medium",
                    kpi.trendUp ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold">
                  <AnimatedCounter value={kpi.value} suffix={kpi.suffix || ""} />
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">投递趋势</h3>
                <p className="text-xs text-muted-foreground">最近 7 天投递与面试数据</p>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">投递</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  <span className="text-muted-foreground">面试</span>
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="intGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.7 0.18 300)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.7 0.18 300)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="day" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(0.15 0 0)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="oklch(0.72 0.17 155)" strokeWidth={2} fill="url(#appGrad)" />
                  <Area type="monotone" dataKey="interviews" stroke="oklch(0.7 0.18 300)" strokeWidth={2} fill="url(#intGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Success Rate Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="flex h-full flex-col items-center justify-center p-6">
            <ScoreRing value={successRate} size={140} label="成功率" sublabel="整体" color="emerald" />
            <div className="mt-4 w-full space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">投递→面试</span>
                <span className="font-medium text-violet-500">{interviewRate}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">面试→Offer</span>
                <span className="font-medium text-emerald-500">
                  {stats.interviews > 0 ? Math.round((stats.offers / stats.interviews) * 100) : 0}%
                </span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4">投递状态分布</h3>
            {pieData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.15 0 0)",
                        border: "1px solid oklch(1 0 0 / 0.1)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px" }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                暂无投递数据
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Learning Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4">学习进度</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">完成率</span>
                  <span className="text-muted-foreground">
                    {stats.learningDone}/{stats.learningTasks} · {stats.learningTasks > 0 ? Math.round((stats.learningDone / stats.learningTasks) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.learningTasks > 0 ? (stats.learningDone / stats.learningTasks) * 100 : 0}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                  <p className="text-lg font-bold text-emerald-500">{stats.learningDone}</p>
                  <p className="text-[10px] text-muted-foreground">已完成</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                  <p className="text-lg font-bold text-amber-500">{stats.learningTasks - stats.learningDone}</p>
                  <p className="text-[10px] text-muted-foreground">进行中</p>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                  <p className="text-lg font-bold text-violet-500">{stats.learningHours}h</p>
                  <p className="text-[10px] text-muted-foreground">学习时长</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center justify-around gap-4">
            {[
              { label: "简历数量", value: stats.resumeCount, icon: Target, color: "text-emerald-500" },
              { label: "知识库文档", value: stats.knowledgeDocs, icon: Award, color: "text-violet-500" },
              { label: "面试记录", value: stats.interviewSessions, icon: Activity, color: "text-amber-500" },
              { label: "被拒次数", value: stats.rejected, icon: Flame, color: "text-rose-500" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-2">
                  <Icon className={cn("h-5 w-5", item.color)} />
                  <div>
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
