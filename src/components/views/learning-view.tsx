"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  Flame,
  BookOpen,
  Code2,
  Server,
  Cloud,
  Brain,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LearningTask {
  id: string;
  title: string;
  category: string;
  status: string;
  duration: number;
}

const skillTree = [
  {
    category: "前端核心",
    icon: Code2,
    color: "emerald",
    skills: ["React 进阶", "Next.js 16", "TypeScript 高级", "性能优化"],
  },
  {
    category: "后端基础",
    icon: Server,
    color: "violet",
    skills: ["Node.js 进阶", "PostgreSQL", "Redis", "GraphQL"],
  },
  {
    category: "工程化",
    icon: Cloud,
    color: "amber",
    skills: ["Docker", "CI/CD", "Monorepo", "微前端"],
  },
  {
    category: "系统设计",
    icon: Brain,
    color: "emerald",
    skills: ["分布式系统", "高并发", "缓存策略", "消息队列"],
  },
];

const categoryColors: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500",
  violet: "bg-violet-500/10 text-violet-500",
  amber: "bg-amber-500/10 text-amber-500",
};

export function LearningView() {
  const [tasks, setTasks] = useState<LearningTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/learning");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
      toast.error("加载学习任务失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (task: LearningTask) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    try {
      await fetch(`/api/learning/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      void fetchTasks();
    }
  };

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const inProgressCount = tasks.filter((t) => t.status === "in-progress").length;
  const totalHours = Math.round(tasks.filter((t) => t.status === "done").reduce((sum, t) => sum + t.duration, 0) / 60);

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="学习路线"
        subtitle="AI 生成的个性化学习计划，支持打卡"
        icon={<GraduationCap className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "总任务", value: tasks.length, icon: BookOpen, color: "text-primary" },
          { label: "已完成", value: doneCount, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "进行中", value: inProgressCount, icon: Loader2, color: "text-amber-500" },
          { label: "学习时长", value: `${totalHours}h`, icon: Flame, color: "text-rose-500" },
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

      {/* Skill Tree */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {skillTree.map((tree, i) => {
          const Icon = tree.icon;
          const treeTasks = tasks.filter((t) => {
            const skillNames = tree.skills.map((s) => s.toLowerCase());
            return skillNames.some((s) => t.title.toLowerCase().includes(s.split(" ")[0].toLowerCase())) ||
                   t.category === (tree.category === "前端核心" ? "frontend" : tree.category === "后端基础" ? "backend" : tree.category === "工程化" ? "frontend" : "system");
          });
          return (
            <motion.div key={tree.category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", categoryColors[tree.color])}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">{tree.category}</h3>
                    <p className="text-xs text-muted-foreground">{treeTasks.filter((t) => t.status === "done").length}/{treeTasks.length || tree.skills.length} 完成</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {tree.skills.map((skill) => {
                    const task = treeTasks.find((t) => t.title.toLowerCase().includes(skill.toLowerCase().split(" ")[0]));
                    const isDone = task?.status === "done";
                    return (
                      <div
                        key={skill}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 transition cursor-pointer",
                          isDone ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/50 hover:border-primary/30"
                        )}
                        onClick={() => task && toggleTask(task)}
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={cn("text-sm flex-1", isDone && "line-through text-muted-foreground")}>
                          {skill}
                        </span>
                        {task && (
                          <Badge variant="outline" className="text-[10px]">
                            {task.duration}min
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* All Tasks List */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">所有学习任务</h3>
          <Badge variant="secondary">{tasks.length} 个任务</Badge>
        </div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition cursor-pointer",
                  task.status === "done" ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/50 hover:border-primary/30"
                )}
                onClick={() => toggleTask(task)}
              >
                {task.status === "done" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : task.status === "in-progress" ? (
                  <Loader2 className="h-4 w-4 text-amber-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className={cn("text-sm flex-1", task.status === "done" && "line-through text-muted-foreground")}>
                  {task.title}
                </span>
                <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
                <span className="text-xs text-muted-foreground">{task.duration}min</span>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
