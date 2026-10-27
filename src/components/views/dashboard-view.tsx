"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Mic,
  Trophy,
  Clock,
  Sparkles,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Bot,
  Activity,
  ScanLine,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Generate chart data from real stats
function generateATSTrend(currentScore: number) {
  const data: { date: string; score: number; optimize: number }[] = [];
  const labels = ["6月1日", "6月5日", "6月10日", "6月15日", "6月20日", "6月25日", "6月30日"];
  let score = Math.max(50, currentScore - 25);
  for (let i = 0; i < 7; i++) {
    data.push({ date: labels[i], score: Math.round(score), optimize: i * 2 });
    score += (currentScore - 50) / 6;
  }
  return data;
}

function generateAppTrend(apps: number, interviews: number, offers: number) {
  const weeks = 6;
  const data: { week: string; applied: number; interview: number; offer: number }[] = [];
  for (let i = 0; i < weeks; i++) {
    data.push({
      week: `W${i + 1}`,
      applied: Math.round(apps / weeks),
      interview: Math.round(interviews / weeks),
      offer: Math.round(offers / weeks),
    });
  }
  return data;
}

function generateSkillRadar() {
  return [
    { skill: "React", value: 92, fullMark: 100 },
    { skill: "TypeScript", value: 88, fullMark: 100 },
    { skill: "Node.js", value: 75, fullMark: 100 },
    { skill: "System Design", value: 65, fullMark: 100 },
    { skill: "Algorithm", value: 70, fullMark: 100 },
    { skill: "DevOps", value: 60, fullMark: 100 },
  ];
}

const aiInsights = [
  { type: "success", title: "ATS 分数提升显著", desc: "本月 ATS 分数从 62 提升至 87，超过 73% 的求职者" },
  { type: "warning", title: "建议补充系统设计经验", desc: "目标岗位 Tencent Staff 前端要求系统设计能力，当前简历缺少相关项目" },
  { type: "info", title: "面试转化率优秀", desc: "投递到面试的转化率为 25%，高于行业平均 15%" },
];

const todayTasks = [
  { title: "优化简历项目经历（STAR 法则）", priority: "high", done: false },
  { title: "完成 React 性能优化课程第 3 章", priority: "medium", done: false },
  { title: "投递字节跳动高级前端岗位", priority: "high", done: true },
  { title: "准备腾讯面试：复习浏览器渲染原理", priority: "high", done: false },
  { title: "更新 GitHub 个人 README", priority: "low", done: false },
];

interface RealStats {
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

const statCards = [
  { key: "atsScore", label: "ATS 分数", icon: Target, trend: 8, color: "emerald" as const },
  { key: "applications", label: "投递数量", icon: FileText, trend: 12, color: "violet" as const },
  { key: "interviews", label: "面试数量", icon: Mic, trend: 50, color: "amber" as const },
  { key: "offers", label: "Offer 数量", icon: Trophy, trend: 100, color: "emerald" as const },
];

export function DashboardView() {
  const { setView } = useAppStore();
  const [stats, setStats] = useState<RealStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentApps, setRecentApps] = useState<{
    id: string;
    company: string;
    position: string;
    status: string;
    createdAt: string;
  }[]>([]);
  const [activities, setActivities] = useState<{
    id: string;
    type: string;
    action: string;
    detail: string;
    timestamp: string;
  }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/stats").then((r) => r.json()),
      fetch("/api/applications").then((r) => r.json()),
      fetch("/api/activity").then((r) => r.json()),
    ])
      .then(([statsData, appsData, activityData]) => {
        if (statsData.stats) setStats(statsData.stats);
        if (appsData.applications) {
          setRecentApps(appsData.applications.slice(0, 5));
        }
        if (activityData.activities) {
          setActivities(activityData.activities.slice(0, 8));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatValue = (key: string): number => {
    if (!stats) return 0;
    const map: Record<string, number> = {
      atsScore: stats.atsScore,
      applications: stats.applications,
      interviews: stats.interviews,
      offers: stats.offers,
    };
    return map[key] || 0;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            欢迎回来，Alex 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            你距离 <span className="text-foreground font-medium">Staff Frontend Engineer @ Tencent</span> 还差 3 步
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setView("agent")} className="gap-2">
            <Bot className="h-4 w-4" />
            启动 AI Agent
          </Button>
          <Button size="sm" onClick={() => setView("resume")} className="gap-2">
            <Sparkles className="h-4 w-4" />
            优化简历
          </Button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          const value = loading ? 0 : getStatValue(stat.key);
          const trend = stat.trend;
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard hover className="p-5">
                <div className="flex items-start justify-between">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                    stat.color === "violet" && "bg-violet-500/10 text-violet-400",
                    stat.color === "amber" && "bg-amber-500/10 text-amber-500",
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend > 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {Math.abs(trend)}%
                  </div>
                </div>
                <div className="mt-4 text-3xl font-bold tabular-nums">
                  <AnimatedCounter value={value} />
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ATS Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="ATS 分数趋势"
              subtitle="过去 30 天的 ATS 分数变化"
              icon={<TrendingUp className="h-5 w-5" />}
              action={
                <Badge variant="secondary" className="gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  实时
                </Badge>
              }
            />
            <div className="mt-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generateATSTrend(stats?.atsScore || 87)}>
                  <defs>
                    <linearGradient id="atsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.72 0.17 155)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="date" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0 0)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.72 0.17 155)"
                    strokeWidth={2}
                    fill="url(#atsGradient)"
                    dot={{ fill: "oklch(0.72 0.17 155)", r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="AI 建议"
              subtitle="基于你的求职数据"
              icon={<Sparkles className="h-5 w-5" />}
            />
            <div className="mt-4 space-y-3">
              {aiInsights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex gap-3 rounded-lg border border-border/50 bg-card/30 p-3"
                >
                  <div className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    insight.type === "success" && "bg-emerald-500/10 text-emerald-500",
                    insight.type === "warning" && "bg-amber-500/10 text-amber-500",
                    insight.type === "info" && "bg-violet-500/10 text-violet-400",
                  )}>
                    {insight.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                    {insight.type === "warning" && <AlertCircle className="h-4 w-4" />}
                    {insight.type === "info" && <Zap className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">{insight.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{insight.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Today Tasks + Skill Radar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="今日任务"
              subtitle="AI 为你生成的每日计划"
              icon={<CheckCircle2 className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  查看全部 <ArrowUpRight className="h-3 w-3" />
                </Button>
              }
            />
            <div className="mt-4 space-y-2">
              {todayTasks.map((task, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-accent/50",
                    task.done ? "border-border/30 bg-card/20 opacity-60" : "border-border/50 bg-card/30"
                  )}
                >
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border",
                    task.done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
                  )}>
                    {task.done && <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-sm font-medium", task.done && "line-through")}>{task.title}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{task.priority}</Badge>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Skill Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="技能雷达"
              subtitle="当前 vs 目标岗位"
              icon={<Target className="h-5 w-5" />}
            />
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={generateSkillRadar()}>
                  <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "oklch(0.7 0 0)", fontSize: 10 }} />
                  <PolarRadiusAxis tick={{ fill: "oklch(0.5 0 0)", fontSize: 9 }} angle={90} domain={[0, 100]} />
                  <Radar name="当前" dataKey="value" stroke="oklch(0.72 0.17 155)" fill="oklch(0.72 0.17 155)" fillOpacity={0.3} />
                  <Radar name="目标" dataKey="target" stroke="oklch(0.7 0.18 300)" fill="oklch(0.7 0.18 300)" fillOpacity={0.15} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Application Trend + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="投递趋势"
              subtitle="每周投递、面试、Offer 数量"
              icon={<FileText className="h-5 w-5" />}
            />
            <div className="mt-6 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateAppTrend(stats?.applications || 0, stats?.interviews || 0, stats?.offers || 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" />
                  <XAxis dataKey="week" stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.7 0 0)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.18 0 0)",
                      border: "1px solid oklch(1 0 0 / 0.1)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="applied" fill="oklch(0.7 0.18 300)" radius={[4, 4, 0, 0]} name="投递" />
                  <Bar dataKey="interview" fill="oklch(0.75 0.15 80)" radius={[4, 4, 0, 0]} name="面试" />
                  <Bar dataKey="offer" fill="oklch(0.72 0.17 155)" radius={[4, 4, 0, 0]} name="Offer" />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="最近投递"
              icon={<ArrowUpRight className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setView("tracker")}>
                  全部
                </Button>
              }
            />
            <div className="mt-4 space-y-3">
              {recentApps.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">暂无投递记录</p>
              )}
              {recentApps.map((app, i) => (
                <motion.div
                  key={app.id || i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet/20 to-primary/20 text-xs font-semibold">
                    {app.company.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{app.position}</p>
                    <p className="truncate text-xs text-muted-foreground">{app.company}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      app.status === "offer" && "border-emerald-500/30 text-emerald-500",
                      (app.status === "tech1" || app.status === "tech2" || app.status === "hr") && "border-amber-500/30 text-amber-500",
                      app.status === "rejected" && "border-rose-500/30 text-rose-500",
                    )}
                  >
                    {app.status === "offer" ? "Offer" :
                     app.status === "rejected" ? "未通过" :
                     app.status === "applied" ? "已投递" :
                     app.status === "hr" ? "HR面" :
                     app.status === "tech1" ? "技术一面" :
                     app.status === "tech2" ? "技术二面" :
                     app.status === "hr-final" ? "HR终面" : app.status}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Activity Timeline */}
      {activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="最近活动"
              subtitle="你的求职动态时间线"
              icon={<Activity className="h-5 w-5" />}
            />
            <div className="mt-4 space-y-3">
              {activities.map((act, i) => {
                const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
                  resume: FileText,
                  application: Target,
                  interview: Mic,
                  learning: Trophy,
                  agent: Bot,
                  ats: ScanLine,
                };
                const typeColors: Record<string, string> = {
                  resume: "text-emerald-500 bg-emerald-500/10",
                  application: "text-violet-500 bg-violet-500/10",
                  interview: "text-amber-500 bg-amber-500/10",
                  learning: "text-emerald-500 bg-emerald-500/10",
                  agent: "text-violet-500 bg-violet-500/10",
                  ats: "text-blue-500 bg-blue-500/10",
                };
                const Icon = typeIcons[act.type] || Activity;
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + i * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", typeColors[act.type] || "text-muted-foreground bg-muted")}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{act.action}</p>
                      <p className="text-xs text-muted-foreground truncate">{act.detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 shrink-0">
                      {new Date(act.timestamp).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Learning Progress + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <SectionHeader
              title="学习进度"
              subtitle="当前进行中的学习路线"
              icon={<Clock className="h-5 w-5" />}
              action={
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setView("learning")}>
                  查看路线
                </Button>
              }
            />
            <div className="mt-4 space-y-4">
              {[
                { name: "React 进阶", progress: 78, total: 24, done: 19, color: "emerald" },
                { name: "系统设计基础", progress: 45, total: 18, done: 8, color: "violet" },
                { name: "算法与数据结构", progress: 62, total: 30, done: 19, color: "amber" },
              ].map((course) => (
                <div key={course.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-xs text-muted-foreground">{course.done}/{course.total} · {course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* ATS Score Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <GlassCard className="flex h-full flex-col items-center justify-center p-6">
            <ScoreRing value={stats?.atsScore || 0} size={140} label="ATS SCORE" sublabel="优秀" color="emerald" />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              你的简历超过了 <span className="font-medium text-foreground">73%</span> 的求职者
            </p>
            <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setView("ats")}>
              查看详情
            </Button>
          </GlassCard>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <GlassCard className="p-6">
          <SectionHeader
            title="快捷操作"
            subtitle="一键访问常用功能"
            icon={<Zap className="h-5 w-5" />}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {[
              { label: "优化简历", icon: Sparkles, view: "resume", color: "emerald" },
              { label: "ATS 扫描", icon: ScanLine, view: "ats", color: "violet" },
              { label: "JD 匹配", icon: Target, view: "jd-match", color: "amber" },
              { label: "模拟面试", icon: Mic, view: "interview", color: "emerald" },
              { label: "AI Agent", icon: Bot, view: "agent", color: "violet" },
              { label: "求职追踪", icon: FileText, view: "tracker", color: "amber" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => setView(action.view as never)}
                  className="group flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-card/30 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition group-hover:scale-110",
                    action.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                    action.color === "violet" && "bg-violet-500/10 text-violet-500",
                    action.color === "amber" && "bg-amber-500/10 text-amber-500",
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
