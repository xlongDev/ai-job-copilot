"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Code2,
  Loader2,
  Sparkles,
  TrendingUp,
  Target,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SkillGapResult {
  currentSkills: { name: string; level: number }[];
  targetSkills: { name: string; required: number; current: number; gap: number }[];
  missingSkills: string[];
  learningPath: { skill: string; priority: "high" | "medium" | "low"; estimatedHours: number; resources: string[] }[];
  salaryProjection: string;
  overallMatch: number;
}

export function SkillGapView() {
  const aiConfig = useAIConfig();
  const [targetRole, setTargetRole] = useState("Staff Frontend Engineer");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SkillGapResult | null>(null);

  const analyze = async () => {
    if (!targetRole.trim()) {
      toast.error("请输入目标岗位");
      return;
    }
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        toast.success("分析完成");
      } else {
        toast.error(data.error || "分析失败");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const radarData = analysis?.targetSkills.map((s) => ({
    skill: s.name,
    current: s.current,
    required: s.required,
  })) || [];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="技能差距分析"
        subtitle="当前技能 vs 目标岗位，可视化 Skill Tree + 学习路线"
        icon={<Code2 className="h-5 w-5" />}
      />

      {/* Input */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1.5 block">目标岗位</label>
            <Input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="如：Staff Frontend Engineer"
            />
          </div>
          <Button className="gap-2" onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "分析中..." : "开始分析"}
          </Button>
        </div>
      </GlassCard>

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Overall Match */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <GlassCard className="flex flex-col items-center justify-center p-6">
                <ScoreRing value={analysis.overallMatch} size={120} label="匹配度" color={analysis.overallMatch >= 75 ? "emerald" : analysis.overallMatch >= 50 ? "amber" : "rose"} />
                <p className="mt-3 text-xs text-muted-foreground">与目标岗位的整体匹配度</p>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-medium">缺失技能</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.length > 0 ? (
                    analysis.missingSkills.map((s) => (
                      <Badge key={s} variant="outline" className="text-[10px] border-rose-500/30 text-rose-500">{s}</Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">无缺失技能</p>
                  )}
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-medium">薪资预期</h3>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.salaryProjection || "掌握缺失技能后薪资预期提升"}</p>
              </GlassCard>
            </div>

            {/* Radar Chart */}
            {radarData.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  技能对比雷达图
                </h3>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: "oklch(0.7 0 0)", fontSize: 11 }} />
                      <PolarRadiusAxis tick={{ fill: "oklch(0.5 0 0)", fontSize: 9 }} angle={90} domain={[0, 100]} />
                      <Radar name="当前水平" dataKey="current" stroke="oklch(0.72 0.17 155)" fill="oklch(0.72 0.17 155)" fillOpacity={0.3} />
                      <Radar name="岗位要求" dataKey="required" stroke="oklch(0.7 0.18 300)" fill="oklch(0.7 0.18 300)" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            )}

            {/* Skill Gap Details */}
            {analysis.targetSkills.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-sm font-medium mb-4">技能差距详情</h3>
                <div className="space-y-3">
                  {analysis.targetSkills.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-xs font-medium w-32 shrink-0">{s.name}</span>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-10">当前</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${s.current}%` }} />
                          </div>
                          <span className="text-[10px] w-6 text-right">{s.current}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-10">要求</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-violet-500" style={{ width: `${s.required}%` }} />
                          </div>
                          <span className="text-[10px] w-6 text-right">{s.required}</span>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] shrink-0",
                          s.gap > 30 ? "border-rose-500/30 text-rose-500" : s.gap > 15 ? "border-amber-500/30 text-amber-500" : "border-emerald-500/30 text-emerald-500"
                        )}
                      >
                        差距 {s.gap}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Learning Path */}
            {analysis.learningPath.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI 推荐学习路线
                </h3>
                <div className="space-y-3">
                  {analysis.learningPath.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="rounded-lg border border-border/50 bg-card/30 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                          <span className="text-sm font-medium">{item.skill}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px]",
                              item.priority === "high" && "border-rose-500/30 text-rose-500",
                              item.priority === "medium" && "border-amber-500/30 text-amber-500",
                              item.priority === "low" && "border-emerald-500/30 text-emerald-500"
                            )}
                          >
                            {item.priority === "high" ? "高优先" : item.priority === "medium" ? "中优先" : "低优先"}
                          </Badge>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {item.estimatedHours}h
                          </span>
                        </div>
                      </div>
                      {item.resources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {item.resources.map((r, j) => (
                            <Badge key={j} variant="secondary" className="text-[9px]">{r}</Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!analysis && !loading && (
        <GlassCard className="p-12 text-center">
          <Code2 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">输入目标岗位，AI 将分析你的技能差距</p>
          <p className="text-xs text-muted-foreground/70 mt-1">包括：当前技能评估、目标要求对比、缺失技能识别、学习路线推荐</p>
        </GlassCard>
      )}
    </div>
  );
}
