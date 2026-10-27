"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Target,
  Upload,
  Link2,
  CheckCircle2,
  XCircle,
  Sparkles,
  TrendingUp,
  Building2,
  MapPin,
  DollarSign,
  Wand2,
  Loader2,
  FileText,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ParsedJD {
  position: string;
  company: string;
  location: string;
  salary: string;
  requirements: string[];
  skills: string[];
  keywords: string[];
  responsibilities: string[];
  matchScore: number;
}

export function JDMatchView() {
  const aiConfig = useAIConfig();
  const [jdText, setJdText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedJD | null>(null);
  const [resumeContent, setResumeContent] = useState("");

  useEffect(() => {
    // Fetch primary resume for matching
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((data) => {
        const primary = data.resumes?.find((r: { isPrimary: boolean }) => r.isPrimary) || data.resumes?.[0];
        if (primary) setResumeContent(primary.content);
      })
      .catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!jdText.trim() || jdText.trim().length < 20) {
      toast.error("请输入至少 20 个字符的 JD 内容");
      return;
    }
    setParsing(true);
    try {
      const res = await fetch("/api/jd-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText,
          resumeContent,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setParsed(data.parsed);
      toast.success("JD 解析完成", { description: `匹配度：${data.parsed.matchScore}%` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "解析失败";
      toast.error("JD 解析失败", { description: msg });
    } finally {
      setParsing(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!parsed) return;
    setParsing(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: parsed.company,
          position: parsed.position,
          resumeContent,
          jdContent: jdText,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.letter) {
        toast.success("求职信已生成", { description: `已保存到数据库` });
      }
    } catch {
      toast.error("生成求职信失败");
    } finally {
      setParsing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="JD 匹配"
        subtitle="AI 解析岗位描述，分析匹配度"
        icon={<Target className="h-5 w-5" />}
      />

      {/* JD Input */}
      <GlassCard className="p-6">
        <Tabs defaultValue="paste">
          <TabsList>
            <TabsTrigger value="paste" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              粘贴 JD
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-1.5">
              <Link2 className="h-3.5 w-3.5" />
              输入链接
            </TabsTrigger>
          </TabsList>
          <TabsContent value="paste" className="mt-4">
            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="粘贴岗位描述（JD）内容 here...&#10;&#10;支持任意招聘网站的 JD 文本，AI 会自动解析岗位、要求、技能等。"
              className="min-h-[200px]"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{jdText.length} 字符</span>
              <Button className="gap-2" onClick={handleAnalyze} disabled={parsing || jdText.trim().length < 20}>
                {parsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {parsing ? "AI 解析中..." : "AI 解析 JD"}
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="url" className="mt-4">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <Button variant="outline" className="gap-2">
                <Link2 className="h-4 w-4" />
                抓取
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">支持 Boss直聘、拉勾、智联等招聘网站链接</p>
          </TabsContent>
        </Tabs>
      </GlassCard>

      {/* Parsed Result */}
      {parsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Match Score + JD Info */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <GlassCard className="flex flex-col items-center justify-center p-6">
              <ScoreRing
                value={parsed.matchScore}
                size={140}
                label="匹配度"
                sublabel={
                  parsed.matchScore >= 80 ? "高度匹配" :
                  parsed.matchScore >= 60 ? "基本匹配" :
                  parsed.matchScore >= 40 ? "部分匹配" : "匹配度低"
                }
                color={
                  parsed.matchScore >= 80 ? "emerald" :
                  parsed.matchScore >= 60 ? "amber" : "rose"
                }
              />
              <Button variant="outline" size="sm" className="mt-4 w-full gap-2" onClick={handleGenerateCoverLetter} disabled={parsing}>
                {parsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                生成求职信
              </Button>
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-2">
              <h3 className="text-sm font-medium mb-4">岗位信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">岗位名称</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    {parsed.position}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">公司</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {parsed.company || "未知"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">工作地点</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {parsed.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">薪资范围</p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-primary" />
                    {parsed.salary}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Skills match */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                已匹配技能 ({parsed.skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {parsed.skills.length > 0 ? (
                  parsed.skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="border-emerald-500/30 text-emerald-500 gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">未检测到匹配技能</p>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500" />
                关键要求 ({parsed.requirements.length})
              </h3>
              <div className="space-y-2">
                {parsed.requirements.length > 0 ? (
                  parsed.requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                      <span className="text-muted-foreground">{req}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">AI 未提取到结构化要求</p>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Keywords */}
          {parsed.keywords.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4">JD 关键词</h3>
              <div className="flex flex-wrap items-center gap-3">
                {parsed.keywords.map((kw, i) => {
                  const size = 14 + (i % 3) * 2;
                  return (
                    <motion.span
                      key={kw}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      style={{ fontSize: size }}
                      className={cn(
                        "font-medium cursor-pointer transition hover:text-primary",
                        i % 3 === 0 ? "text-primary" : i % 3 === 1 ? "text-violet-500" : "text-amber-500"
                      )}
                    >
                      {kw}
                    </motion.span>
                  );
                })}
              </div>
            </GlassCard>
          )}

          {/* Responsibilities */}
          {parsed.responsibilities.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4">岗位职责</h3>
              <div className="space-y-2">
                {parsed.responsibilities.map((resp, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{resp}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </motion.div>
      )}
    </div>
  );
}
