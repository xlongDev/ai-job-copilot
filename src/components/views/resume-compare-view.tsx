"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  GitCompare,
  Loader2,
  Check,
  FileText,
  TrendingUp,
  Award,
  Type,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/loading-skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ResumeListItem {
  id: string;
  title: string;
  atsScore: number;
  version: number;
  updatedAt: string;
}

interface ComparisonItem {
  id: string;
  title: string;
  atsScore: number;
  version: number;
  content: string;
  wordCount: number;
  charCount: number;
  sections: string[];
}

export function ResumeCompareView() {
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<{
    comparison: ComparisonItem[];
    commonSections: string[];
    bestATS: number;
    longestContent: ComparisonItem;
  } | null>(null);

  useEffect(() => {
    void fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume-compare");
      const data = await res.json();
      setResumes(data.resumes || []);
    } catch {
      toast.error("加载简历失败");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const compare = async () => {
    if (selected.length !== 2) {
      toast.error("请选择 2 份简历进行对比");
      return;
    }
    setComparing(true);
    setComparison(null);
    try {
      const res = await fetch(`/api/resume-compare?ids=${selected.join(",")}`);
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        setComparison(data);
      }
    } catch {
      toast.error("对比失败");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="简历对比"
        subtitle="选择 2 份简历进行并排对比"
        icon={<GitCompare className="h-5 w-5" />}
        action={
          <Button
            size="sm"
            className="gap-2"
            onClick={compare}
            disabled={selected.length !== 2 || comparing}
          >
            {comparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitCompare className="h-4 w-4" />}
            {comparing ? "对比中..." : "开始对比"}
          </Button>
        }
      />

      {/* Resume Selection */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-4">选择简历（已选 {selected.length}/2）</h3>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-12 w-12" />}
            title="暂无简历"
            description="请先创建或导入简历"
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume, i) => {
              const isSelected = selected.includes(resume.id);
              const selectedIndex = selected.indexOf(resume.id);
              return (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => toggleSelect(resume.id)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    {isSelected && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {selectedIndex + 1}
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium truncate">{resume.title}</h4>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">v{resume.version}</Badge>
                    <span>ATS: {resume.atsScore}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </GlassCard>

      {/* Comparison Results */}
      <AnimatePresence>
        {comparison && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">最佳 ATS</span>
                </div>
                <p className="text-2xl font-bold text-emerald-500">{comparison.bestATS}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Type className="h-4 w-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">最长内容</span>
                </div>
                <p className="text-2xl font-bold text-violet-500">{comparison.longestContent.charCount}</p>
                <p className="text-[10px] text-muted-foreground">{comparison.longestContent.title}</p>
              </GlassCard>
              <GlassCard className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">共同章节</span>
                </div>
                <p className="text-2xl font-bold text-amber-500">{comparison.commonSections.length}</p>
              </GlassCard>
            </div>

            {/* Side by Side */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {comparison.comparison.map((resume, i) => (
                <GlassCard key={resume.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </div>
                      <h3 className="text-sm font-medium">{resume.title}</h3>
                    </div>
                    <Badge variant="outline" className="text-[10px]">ATS: {resume.atsScore}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
                      <p className="text-lg font-bold">{resume.wordCount}</p>
                      <p className="text-[10px] text-muted-foreground">词数</p>
                    </div>
                    <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
                      <p className="text-lg font-bold">{resume.charCount}</p>
                      <p className="text-[10px] text-muted-foreground">字符数</p>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs font-medium text-muted-foreground mb-2">章节</p>
                    <div className="flex flex-wrap gap-1.5">
                      {resume.sections.map((s) => {
                        const isCommon = comparison.commonSections.includes(s);
                        return (
                          <Badge
                            key={s}
                            variant="outline"
                            className={cn(
                              "text-[10px] gap-1",
                              isCommon && "border-emerald-500/30 text-emerald-500"
                            )}
                          >
                            {isCommon && <Check className="h-2.5 w-2.5" />}
                            {s}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">内容预览</p>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 bg-card/20 p-3 text-xs text-muted-foreground whitespace-pre-wrap">
                      {resume.content.slice(0, 500)}{resume.content.length > 500 && "..."}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Common Sections */}
            {comparison.commonSections.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  共同章节
                </h3>
                <div className="flex flex-wrap gap-2">
                  {comparison.commonSections.map((s) => (
                    <Badge key={s} variant="outline" className="border-emerald-500/30 text-emerald-500">
                      {s}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!comparison && !comparing && (
        <GlassCard className="p-12 text-center">
          <GitCompare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">选择 2 份简历，点击「开始对比」</p>
          <p className="text-xs text-muted-foreground/70 mt-1">对比 ATS 分数、字数、章节差异</p>
        </GlassCard>
      )}
    </div>
  );
}
