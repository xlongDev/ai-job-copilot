"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
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
import { Textarea } from "@/components/ui/textarea";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAIConfig } from "@/hooks/use-ai-config";
import { toast } from "sonner";

interface Evaluation {
  scores: {
    content_quality: number;
    structure: number;
    keywords: number;
    quantification: number;
    action_verbs: number;
    ats_compatibility: number;
    relevance: number;
    overall: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  summary: string;
}

const dimensionLabels: Record<string, string> = {
  content_quality: "内容质量",
  structure: "结构清晰",
  keywords: "关键词",
  quantification: "量化数据",
  action_verbs: "行动动词",
  ats_compatibility: "ATS 兼容",
  relevance: "岗位匹配",
};

export function ResumeScoreView() {
  const aiConfig = useAIConfig();
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("Staff Frontend Engineer");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((data) => {
        if (data.resumes?.[0]) {
          setContent(data.resumes[0].content);
        }
      })
      .catch(() => {});
  }, []);

  const analyze = async () => {
    if (!content.trim() || content.trim().length < 50) {
      toast.error("简历内容太短（至少 50 字符）");
      return;
    }
    setLoading(true);
    setEvaluation(null);
    try {
      const res = await fetch("/api/resume-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          targetRole,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        toast.success("评分完成");
      } else {
        throw new Error(data.error || "评分失败");
      }
    } catch {
      toast.error("AI 评分失败");
    } finally {
      setLoading(false);
    }
  };

  const radarData = evaluation
    ? Object.entries(evaluation.scores)
        .filter(([key]) => key !== "overall")
        .map(([key, value]) => ({
          dimension: dimensionLabels[key] || key,
          score: value,
          fullMark: 100,
        }))
    : [];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="AI 简历评分"
        subtitle="8 维度 AI 评分 + 优缺点分析 + 改进建议"
        icon={<FileText className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">简历内容</h3>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="目标岗位"
            className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="粘贴你的简历内容..."
            className="min-h-[300px] resize-y font-mono text-sm"
          />
          <Button className="mt-3 w-full gap-2" onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "AI 评分中..." : "开始评分"}
          </Button>
        </GlassCard>

        {/* Results */}
        <AnimatePresence mode="wait">
          {evaluation ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">评分结果</h3>
                  <ScoreRing value={evaluation.scores.overall} size={60} label="综合" color="emerald" />
                </div>

                {/* Radar Chart */}
                <div className="h-[250px] mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                      <PolarAngleAxis dataKey="dimension" tick={{ fill: "oklch(0.7 0 0)", fontSize: 10 }} />
                      <PolarRadiusAxis tick={{ fill: "oklch(0.5 0 0)", fontSize: 9 }} angle={90} domain={[0, 100]} />
                      <Radar name="评分" dataKey="score" stroke="oklch(0.72 0.17 155)" fill="oklch(0.72 0.17 155)" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary */}
                <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary mb-1">总体评价</p>
                  <p className="text-xs text-muted-foreground">{evaluation.summary}</p>
                </div>

                {/* Strengths */}
                {evaluation.strengths.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-emerald-500 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> 优点
                    </p>
                    <div className="space-y-1">
                      {evaluation.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4">• {s}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {evaluation.weaknesses.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-amber-500 mb-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> 不足
                    </p>
                    <div className="space-y-1">
                      {evaluation.weaknesses.map((w, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4">• {w}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {evaluation.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-violet-500 mb-2 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" /> 改进建议
                    </p>
                    <div className="space-y-1">
                      {evaluation.suggestions.map((s, i) => (
                        <p key={i} className="text-xs text-muted-foreground pl-4">• {s}</p>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <GlassCard className="flex flex-col items-center justify-center p-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">点击「开始评分」获取 AI 分析</p>
              <p className="text-xs text-muted-foreground/70 mt-1">8 维度评分 + 雷达图 + 改进建议</p>
            </GlassCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
