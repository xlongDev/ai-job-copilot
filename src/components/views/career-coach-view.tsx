"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Compass,
  TrendingUp,
  BookOpen,
  Award,
  Briefcase,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Rocket,
  Loader2,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CareerAnalysis {
  summary: string;
  strengths: { title: string; desc: string; level: number }[];
  weaknesses: { title: string; desc: string; level: number }[];
  roadmap: { period: string; title: string; goals: string[]; color: string }[];
  recommendations: { type: string; title: string; provider: string; duration: string; rating: number; icon: string; color: string }[];
}

export function CareerCoachView() {
  const aiConfig = useAIConfig();
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [targetRole, setTargetRole] = useState("Staff Frontend Engineer");
  const [resumeContent, setResumeContent] = useState("");

  const analyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      let resume = resumeContent;
      if (!resume) {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        const primary = data.resumes?.find((r: { isPrimary: boolean }) => r.isPrimary) || data.resumes?.[0];
        if (primary) {
          resume = primary.content;
          setResumeContent(resume);
        }
      }
      const res = await fetch("/api/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          resumeContent: resume,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAnalysis(data.analysis);
        toast.success("职业分析完成");
      } else if (data.error) {
        toast.error(data.error);
      }
    } catch {
      toast.error("分析失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const recIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    BookOpen, Award, Briefcase, Rocket,
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="职业教练" subtitle="AI 驱动的职业成长规划" icon={<Compass className="h-5 w-5" />} />
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">目标岗位</label>
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="例如：Staff Frontend Engineer" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none" />
          </div>
          <Button onClick={analyze} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "分析中..." : "开始分析"}
          </Button>
        </div>
      </GlassCard>
      {loading && (
        <GlassCard className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">AI 正在分析你的职业发展路径...</p>
        </GlassCard>
      )}
      {analysis && !loading && (
        <>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" />AI 职业分析总结</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.summary}</p>
          </GlassCard>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />核心优势</h3>
              <div className="space-y-4">
                {analysis.strengths?.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="mb-1.5 flex items-center justify-between"><span className="text-sm font-medium">{s.title}</span><span className="text-xs text-emerald-500">{s.level}</span></div>
                    <p className="text-xs text-muted-foreground mb-2">{s.desc}</p>
                    <Progress value={s.level} className="h-1.5" />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />待提升领域</h3>
              <div className="space-y-4">
                {analysis.weaknesses?.map((w, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                    <div className="mb-1.5 flex items-center justify-between"><span className="text-sm font-medium">{w.title}</span><span className="text-xs text-amber-500">{w.level}</span></div>
                    <p className="text-xs text-muted-foreground mb-2">{w.desc}</p>
                    <Progress value={w.level} className="h-1.5" />
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </div>
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" />成长路线图</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {analysis.roadmap?.map((phase, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} className="rounded-lg border border-border/50 bg-card/30 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={cn("text-[10px]", phase.color === "emerald" && "border-emerald-500/30 text-emerald-500", phase.color === "violet" && "border-violet-500/30 text-violet-500", phase.color === "amber" && "border-amber-500/30 text-amber-500")}>{phase.period}</Badge>
                  </div>
                  <h4 className="text-sm font-semibold mb-3">{phase.title}</h4>
                  <ul className="space-y-1.5">
                    {phase.goals?.map((goal, j) => (<li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />{goal}</li>))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </GlassCard>
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" />AI 推荐资源</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analysis.recommendations?.map((rec, i) => {
                const Icon = recIcons[rec.icon] || BookOpen;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <GlassCard hover className="h-full p-4 cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", rec.color === "emerald" && "bg-emerald-500/10 text-emerald-500", rec.color === "violet" && "bg-violet-500/10 text-violet-500", rec.color === "amber" && "bg-amber-500/10 text-amber-500")}><Icon className="h-5 w-5" /></div>
                        <Badge variant="secondary" className="text-[10px]">{rec.type}</Badge>
                      </div>
                      <h4 className="text-sm font-medium mb-1 line-clamp-2">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{rec.provider}</p>
                      <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">{rec.duration}</span><span className="flex items-center gap-1 text-amber-500">★ {rec.rating}</span></div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
      {!analysis && !loading && (
        <GlassCard className="p-12 text-center">
          <Compass className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">输入目标岗位，AI 将为你生成完整的职业分析</p>
          <p className="text-xs text-muted-foreground/70 mt-1">包括优势分析、短板识别、成长路线图、推荐资源</p>
        </GlassCard>
      )}
    </div>
  );
}
