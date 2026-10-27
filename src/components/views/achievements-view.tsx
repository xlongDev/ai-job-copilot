"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Trophy,
  FileText,
  Shield,
  Target,
  Mic,
  BookOpen,
  MessageSquare,
  Bot,
  Flame,
  Loader2,
  Lock,
  Check,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/shared/score-ring";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number;
}

interface Stats {
  resumeCount: number;
  atsScore: number;
  applications: number;
  interviews: number;
  offers: number;
  learningDone: number;
  agentRuns: number;
  aiChats: number;
  streak: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  Shield,
  Target,
  Mic,
  BookOpen,
  MessageSquare,
  Bot,
  Flame,
  Trophy,
};

const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20", glow: "shadow-violet-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", glow: "shadow-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20", glow: "shadow-rose-500/20" },
};

export function AchievementsView() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/achievements");
      const data = await res.json();
      if (data.achievements) {
        setAchievements(data.achievements);
        setStats(data.stats);
        setUnlockedCount(data.unlockedCount);
        setTotalCount(data.totalCount);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const unlockRate = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="成就系统"
        subtitle="解锁徽章，记录你的求职成长"
        icon={<Trophy className="h-5 w-5" />}
      />

      {/* Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Unlock Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1"
        >
          <GlassCard className="flex h-full flex-col items-center justify-center p-6">
            <ScoreRing value={unlockRate} size={140} label="解锁率" sublabel={`${unlockedCount}/${totalCount}`} color="emerald" />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              已解锁 <span className="font-bold text-foreground">{unlockedCount}</span> 个成就
            </p>
          </GlassCard>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              求职数据
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {stats && [
                { label: "简历", value: stats.resumeCount, icon: FileText, color: "emerald" },
                { label: "ATS 分数", value: stats.atsScore, icon: Shield, color: "violet" },
                { label: "投递", value: stats.applications, icon: Target, color: "amber" },
                { label: "面试", value: stats.interviews, icon: Mic, color: "emerald" },
                { label: "Offer", value: stats.offers, icon: Trophy, color: "violet" },
                { label: "学习", value: stats.learningDone, icon: BookOpen, color: "amber" },
                { label: "AI 对话", value: stats.aiChats, icon: MessageSquare, color: "emerald" },
                { label: "Agent 运行", value: stats.agentRuns, icon: Bot, color: "violet" },
                { label: "连续天数", value: stats.streak, icon: Flame, color: "rose" },
              ].map((stat, i) => {
                const Icon = stat.icon;
                const c = colorClasses[stat.color];
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="rounded-lg border border-border/50 bg-card/30 p-3 text-center"
                  >
                    <div className={cn("mx-auto mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg", c.bg)}>
                      <Icon className={cn("h-4 w-4", c.text)} />
                    </div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((ach, i) => {
          const Icon = iconMap[ach.icon] || Trophy;
          const c = colorClasses[ach.color] || colorClasses.emerald;
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <GlassCard
                className={cn(
                  "relative p-4 transition-all",
                  ach.unlocked
                    ? cn(c.border, c.glow, "shadow-lg")
                    : "opacity-60"
                )}
              >
                {ach.unlocked && (
                  <div className="absolute right-3 top-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                      <Check className="h-3 w-3 text-emerald-500" />
                    </div>
                  </div>
                )}
                <div className={cn(
                  "mb-3 flex h-12 w-12 items-center justify-center rounded-xl",
                  ach.unlocked ? c.bg : "bg-muted"
                )}>
                  {ach.unlocked ? (
                    <Icon className={cn("h-6 w-6", c.text)} />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <h4 className="text-sm font-medium mb-1">{ach.name}</h4>
                <p className="text-xs text-muted-foreground mb-3">{ach.desc}</p>
                {!ach.unlocked && (
                  <div>
                    <Progress value={ach.progress} className="h-1.5" />
                    <p className="mt-1 text-[10px] text-muted-foreground">{ach.progress}%</p>
                  </div>
                )}
                {ach.unlocked && (
                  <Badge variant="outline" className={cn("text-[10px]", c.border, c.text)}>
                    已解锁
                  </Badge>
                )}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
