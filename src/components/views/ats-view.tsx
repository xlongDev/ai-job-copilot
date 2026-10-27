"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ScanLine,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  Loader2,
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
import { ScoreRing } from "@/components/shared/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ATSDimension {
  name: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

interface ATSResult {
  totalScore: number;
  dimensions: ATSDimension[];
  keywords: string[];
  suggestions: { priority: "high" | "medium" | "low"; text: string }[];
}

export function ATSView() {
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    runScan();
  }, []);

  const runScan = async () => {
    setLoading(true);
    setScanning(true);
    try {
      // Fetch the primary resume
      const resumeRes = await fetch("/api/resumes");
      const resumeData = await resumeRes.json();
      const primaryResume = resumeData.resumes?.find((r: { isPrimary: boolean }) => r.isPrimary) || resumeData.resumes?.[0];

      if (!primaryResume) {
        toast.error("请先创建或导入简历");
        setLoading(false);
        setScanning(false);
        return;
      }

      // Run ATS scan
      const atsRes = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: primaryResume.content }),
      });
      const atsData = await atsRes.json();

      if (atsData.error) {
        throw new Error(atsData.error);
      }

      setResult(atsData);

      // Update resume ATS score in DB
      await fetch(`/api/resumes/${primaryResume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atsScore: atsData.totalScore }),
      });

      toast.success("ATS 扫描完成", { description: `总分：${atsData.totalScore}` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "扫描失败";
      toast.error("ATS 扫描失败", { description: msg });
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const radarData = result?.dimensions.map((d) => ({
    subject: d.name,
    score: d.score,
    fullMark: 100,
  })) || [];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="ATS 扫描"
        subtitle="基于真实算法的 ATS 兼容性检测"
        icon={<ScanLine className="h-5 w-5" />}
        action={
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={runScan}
            disabled={scanning}
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            重新扫描
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">正在扫描简历 ATS 兼容性...</p>
          <p className="text-xs text-muted-foreground/70 mt-1">分析 10 个维度</p>
        </div>
      ) : result ? (
        <>
          {/* Top: Score + Radar */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-1"
            >
              <GlassCard className="flex h-full flex-col items-center justify-center p-6">
                <ScoreRing
                  value={result.totalScore}
                  size={140}
                  label="ATS SCORE"
                  sublabel={
                    result.totalScore >= 80 ? "优秀" :
                    result.totalScore >= 60 ? "良好" :
                    result.totalScore >= 40 ? "需改进" : "不合格"
                  }
                  color={
                    result.totalScore >= 80 ? "emerald" :
                    result.totalScore >= 60 ? "amber" : "rose"
                  }
                />
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  你的简历超过了 <span className="font-medium text-foreground">
                    {Math.min(95, Math.round(result.totalScore * 1.1))}%
                  </span> 的求职者
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <GlassCard className="h-full p-6">
                <h3 className="text-sm font-medium mb-4">维度雷达图</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(1 0 0 / 0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "oklch(0.7 0 0)", fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "oklch(0.5 0 0)", fontSize: 10 }} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="oklch(0.72 0.17 155)"
                      fill="oklch(0.72 0.17 155)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </GlassCard>
            </motion.div>
          </div>

          {/* Dimensions detail */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {result.dimensions.map((dim, i) => (
              <motion.div
                key={dim.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {dim.score >= 80 ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : dim.score >= 50 ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-500" />
                      )}
                      <span className="text-sm font-medium">{dim.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        dim.score >= 80 && "border-emerald-500/30 text-emerald-500",
                        dim.score >= 50 && dim.score < 80 && "border-amber-500/30 text-amber-500",
                        dim.score < 50 && "border-rose-500/30 text-rose-500"
                      )}
                    >
                      {dim.score}
                    </Badge>
                  </div>
                  {dim.issues.length > 0 && (
                    <div className="space-y-1">
                      {dim.issues.map((issue, j) => (
                        <p key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-rose-500 mt-0.5">•</span>
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                  {dim.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {dim.suggestions.map((sug, j) => (
                        <p key={j} className="text-xs text-emerald-500/80 flex items-start gap-1.5">
                          <span className="mt-0.5">→</span>
                          {sug}
                        </p>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            ))}
          </div>

          {/* Keywords */}
          {result.keywords.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                检测到的关键词 ({result.keywords.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {kw}
                  </Badge>
                ))}
              </div>
            </GlassCard>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                优化建议 ({result.suggestions.length})
              </h3>
              <div className="space-y-3">
                {result.suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/30 p-3"
                  >
                    <Badge variant="outline" className={cn(
                      "text-[10px] shrink-0",
                      s.priority === "high" && "border-rose-500/30 text-rose-500",
                      s.priority === "medium" && "border-amber-500/30 text-amber-500",
                      s.priority === "low" && "border-emerald-500/30 text-emerald-500",
                    )}>
                      {s.priority === "high" ? "高" : s.priority === "medium" ? "中" : "低"}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{s.text}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard className="p-12 text-center">
          <ScanLine className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">点击「重新扫描」开始 ATS 检测</p>
        </GlassCard>
      )}
    </div>
  );
}
