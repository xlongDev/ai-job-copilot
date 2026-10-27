"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Target,
  Building2,
  DollarSign,
  TrendingUp,
  Loader2,
  Save,
  Award,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Goals {
  targetRole: string;
  targetCompany: string;
  weeklyApplyGoal: number;
  monthlyInterviewGoal: number;
  targetSalary: string;
  deadline: string;
}

interface Progress {
  weeklyApplyCount: number;
  monthlyInterviewCount: number;
  applications: number;
  interviews: number;
  offers: number;
  streak: number;
}

export function GoalsView() {
  const [goals, setGoals] = useState<Goals | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editGoals, setEditGoals] = useState<Goals | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/stats").then((r) => r.json()),
    ])
      .then(([goalsData, statsData]) => {
        if (goalsData.goals) setGoals(goalsData.goals);
        if (statsData.stats) {
          setProgress({
            weeklyApplyCount: Math.min(statsData.stats.applications, goalsData?.goals?.weeklyApplyGoal || 10),
            monthlyInterviewCount: Math.min(statsData.stats.interviews, goalsData?.goals?.monthlyInterviewGoal || 5),
            applications: statsData.stats.applications,
            interviews: statsData.stats.interviews,
            offers: statsData.stats.offers,
            streak: 7,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!editGoals) return;
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editGoals),
      });
      const data = await res.json();
      if (data.goals) {
        setGoals(data.goals);
        setEditMode(false);
        toast.success("目标已更新");
      }
    } catch {
      toast.error("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goals) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        暂无目标数据
      </div>
    );
  }

  const daysLeft = Math.ceil((new Date(goals.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const weeklyProgress = progress ? Math.min(100, (progress.weeklyApplyCount / goals.weeklyApplyGoal) * 100) : 0;
  const monthlyProgress = progress ? Math.min(100, (progress.monthlyInterviewCount / goals.monthlyInterviewGoal) * 100) : 0;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="求职目标"
        subtitle="设定目标，追踪进度，拿到 Dream Offer"
        icon={<Target className="h-5 w-5" />}
        action={
          !editMode ? (
            <Button size="sm" onClick={() => { setEditGoals(goals); setEditMode(true); }}>
              编辑目标
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>取消</Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                保存
              </Button>
            </div>
          )
        }
      />

      {/* Target Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">目标岗位</p>
                <h3 className="text-xl font-bold">{goals.targetRole}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{goals.targetCompany}</span>
                  <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{goals.targetSalary}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                <p className="text-xs text-muted-foreground">剩余天数</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-500">{progress?.streak || 0}</p>
                <p className="text-xs text-muted-foreground">连续打卡</p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Edit Form */}
      <AnimatePresence>
        {editMode && editGoals && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4">编辑求职目标</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs">目标岗位</Label>
                  <Input
                    className="mt-1"
                    value={editGoals.targetRole}
                    onChange={(e) => setEditGoals({ ...editGoals, targetRole: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">目标公司</Label>
                  <Input
                    className="mt-1"
                    value={editGoals.targetCompany}
                    onChange={(e) => setEditGoals({ ...editGoals, targetCompany: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">期望薪资</Label>
                  <Input
                    className="mt-1"
                    value={editGoals.targetSalary}
                    onChange={(e) => setEditGoals({ ...editGoals, targetSalary: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">截止日期</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={editGoals.deadline.split("T")[0]}
                    onChange={(e) => setEditGoals({ ...editGoals, deadline: new Date(e.target.value).toISOString() })}
                  />
                </div>
                <div>
                  <Label className="text-xs">每周投递目标</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={editGoals.weeklyApplyGoal}
                    onChange={(e) => setEditGoals({ ...editGoals, weeklyApplyGoal: parseInt(e.target.value) || 10 })}
                  />
                </div>
                <div>
                  <Label className="text-xs">每月面试目标</Label>
                  <Input
                    type="number"
                    className="mt-1"
                    value={editGoals.monthlyInterviewGoal}
                    onChange={(e) => setEditGoals({ ...editGoals, monthlyInterviewGoal: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Weekly Apply Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">本周投递目标</p>
                <p className="text-2xl font-bold mt-1">
                  {progress?.weeklyApplyCount || 0}
                  <span className="text-base text-muted-foreground">/{goals.weeklyApplyGoal}</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
                <TrendingUp className="h-6 w-6 text-violet-500" />
              </div>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{Math.round(weeklyProgress)}% 完成</p>
          </GlassCard>
        </motion.div>

        {/* Monthly Interview Progress */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground">本月面试目标</p>
                <p className="text-2xl font-bold mt-1">
                  {progress?.monthlyInterviewCount || 0}
                  <span className="text-base text-muted-foreground">/{goals.monthlyInterviewGoal}</span>
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10">
                <Award className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <Progress value={monthlyProgress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{Math.round(monthlyProgress)}% 完成</p>
          </GlassCard>
        </motion.div>
      </div>

      {/* Overall Stats */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">求职总览</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "总投递", value: progress?.applications || 0, icon: Target, color: "text-violet-500" },
              { label: "面试场次", value: progress?.interviews || 0, icon: Award, color: "text-amber-500" },
              { label: "Offer 数", value: progress?.offers || 0, icon: CheckCircle2, color: "text-emerald-500" },
              { label: "连续打卡", value: progress?.streak || 0, icon: Flame, color: "text-rose-500" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-lg border border-border/50 bg-card/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
