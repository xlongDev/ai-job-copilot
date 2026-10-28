"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Sparkles,
  Check,
  X,
  RefreshCw,
  Plus,
  History,
  Wand2,
  GitCompare,
  Loader2,
  Star,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Resume {
  id: string;
  title: string;
  content: string;
  format: string;
  atsScore: number;
  version: number;
  isPrimary: boolean;
  updatedAt: string;
}

export function ResumeView() {
  const aiConfig = useAIConfig();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [optimized, setOptimized] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("editor");
  const [newTitle, setNewTitle] = useState("");
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save content (debounced)
  useEffect(() => {
    if (!selectedResume || content === selectedResume.content) return;
    setSaving(true);
    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/resumes/${selectedResume.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        setSelectedResume({ ...selectedResume, content });
      } catch {
        // silent fail
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, selectedResume]);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json();
      if (data.resumes) {
        setResumes(data.resumes);
        if (data.resumes.length > 0) {
          setSelectedResume((prev) => prev ?? data.resumes[0]);
          setContent((prev) => prev || data.resumes[0].content);
        }
      }
    } catch {
      toast.error("加载简历失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch resumes from API
  useEffect(() => {
    void fetchResumes();
  }, [fetchResumes]);

  const selectResume = (resume: Resume) => {
    setSelectedResume(resume);
    setContent(resume.content);
    setShowDiff(false);
    setOptimized(null);
  };

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Select the newly uploaded resume
      setSelectedResume(data.resume);
      setContent(data.resume.content);
      setResumes((prev) => [data.resume, ...prev.filter((r) => r.id !== data.resume.id)]);

      toast.success("简历导入成功", {
        description: `${data.resume.title} · ${data.format.toUpperCase()} · ${data.resume.content.length} 字符`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "导入失败";
      toast.error("简历导入失败", { description: msg });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Create new resume
  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("请输入简历标题");
      return;
    }
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, content: "# " + newTitle + "\n\n开始编辑你的简历...", format: "markdown" }),
      });
      const data = await res.json();
      if (data.resume) {
        setResumes((prev) => [data.resume, ...prev]);
        selectResume(data.resume);
        setShowNewDialog(false);
        setNewTitle("");
        toast.success("简历创建成功");
      }
    } catch {
      toast.error("创建失败");
    }
  };

  // Save content
  const handleSave = async () => {
    if (!selectedResume) return;
    try {
      const res = await fetch(`/api/resumes/${selectedResume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (data.resume) {
        setSelectedResume(data.resume);
        setResumes((prev) => prev.map((r) => (r.id === data.resume.id ? data.resume : r)));
        toast.success("已保存", { description: `版本 v${data.resume.version}` });
      }
    } catch {
      toast.error("保存失败");
    }
  };

  // AI Optimize
  const handleOptimize = async (type: string) => {
    if (!content.trim()) {
      toast.error("请先输入简历内容");
      return;
    }
    setOptimizing(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          type,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      setOptimized(data.optimized);
      setShowDiff(true);
      toast.success("AI 优化完成", { description: `Provider: ${data.provider || "zai"}` });
    } catch {
      toast.error("优化失败，请重试");
    } finally {
      setOptimizing(false);
    }
  };

  const acceptOptimization = async () => {
    if (optimized) {
      setContent(optimized);
      setShowDiff(false);
      setOptimized(null);
      toast.success("已应用优化");
      // Auto-save
      if (selectedResume) {
        try {
          await fetch(`/api/resumes/${selectedResume.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: optimized }),
          });
        } catch {}
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      setResumes((prev) => prev.filter((r) => r.id !== id));
      if (selectedResume?.id === id) {
        setSelectedResume(null);
        setContent("");
      }
      toast.success("已删除");
    } catch {
      toast.error("删除失败");
    }
  };

  const handleExport = async (format: string) => {
    if (!selectedResume) return;

    const formatMap: Record<string, "markdown" | "json" | "txt" | "html"> = {
      MD: "markdown",
      JSON: "json",
      TXT: "txt",
      PDF: "html",
      DOCX: "html",
      HTML: "html",
    };

    const apiFormat = formatMap[format] || "markdown";

    try {
      const res = await fetch("/api/resume-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selectedResume.id, format: apiFormat }),
      });
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      const blob = new Blob([data.content], { type: data.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`已导出 ${format}`);
    } catch {
      toast.error("导出失败");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="简历管理"
        subtitle="导入、创建、优化、管理你的简历"
        icon={<FileText className="h-5 w-5" />}
        action={
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.md,.txt,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "导入中..." : "导入简历"}
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4" />
              新建简历
            </Button>
          </div>
        }
      />

      {/* Resume List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-muted/30" />
          ))
        ) : resumes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">还没有简历</p>
            <p className="text-xs text-muted-foreground/70 mt-1">点击「导入简历」或「新建简历」开始</p>
          </div>
        ) : (
          resumes.map((resume, i) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard
                hover
                className={cn(
                  "cursor-pointer p-4 h-full",
                  selectedResume?.id === resume.id && "border-primary/40 ring-1 ring-primary/20"
                )}
                onClick={() => selectResume(resume)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    {resume.isPrimary && (
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    )}
                    <Badge variant="secondary" className="text-[10px]">v{resume.version}</Badge>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-medium truncate">{resume.title}</h3>
                <div className="mt-2 flex items-center justify-between">
                  {resume.atsScore > 0 ? (
                    <Badge variant="outline" className={cn(
                      "text-[10px]",
                      resume.atsScore >= 80 ? "border-emerald-500/30 text-emerald-500" :
                      resume.atsScore >= 60 ? "border-amber-500/30 text-amber-500" :
                      "border-rose-500/30 text-rose-500"
                    )}>
                      ATS {resume.atsScore}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">未评分</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(resume.updatedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                  </span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); void handleDelete(resume.id); }}
                  className="mt-2 text-[10px] text-muted-foreground hover:text-rose-500"
                >
                  删除
                </button>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>

      {/* New Resume Dialog */}
      <AnimatePresence>
        {showNewDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">新建简历</h3>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="简历标题，如：前端工程师简历"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                autoFocus
              />
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowNewDialog(false)}>取消</Button>
                <Button size="sm" onClick={handleCreate}>创建</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      {selectedResume && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="editor" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                编辑器
              </TabsTrigger>
              <TabsTrigger value="optimize" className="gap-1.5">
                <Wand2 className="h-3.5 w-3.5" />
                AI 优化
              </TabsTrigger>
              <TabsTrigger value="versions" className="gap-1.5">
                <History className="h-3.5 w-3.5" />
                版本
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSave}>
                <Check className="h-4 w-4" />
                保存
              </Button>
              <div className="flex items-center gap-1">
                {["MD", "TXT", "JSON", "PDF"].map((fmt) => (
                  <Button
                    key={fmt}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleExport(fmt)}
                  >
                    {fmt}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="editor" className="mt-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Editor */}
              <GlassCard className="p-0 overflow-hidden">
                <div className="border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", saving ? "bg-amber-500 animate-pulse" : "bg-emerald-500")} />
                      {saving ? "保存中..." : "已保存"}
                    </span>
                    <span>·</span>
                    <span>{content.length} 字符</span>
                    <span>·</span>
                    <span>{content.split(/\s+/).filter(Boolean).length} 词</span>
                  </div>
                  <span className="text-xs text-muted-foreground">编辑器</span>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[500px] rounded-none border-0 font-mono text-sm resize-y focus-visible:ring-0"
                  placeholder="在这里编辑你的简历..."
                />
              </GlassCard>

              {/* Preview */}
              <GlassCard className="p-0 overflow-hidden">
                <div className="border-b border-border/50 px-4 py-2.5 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">实时预览</span>
                  <span className="text-xs text-muted-foreground">{selectedResume.title}</span>
                </div>
                <div className="min-h-[500px] overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none">
                  {content ? (
                    <div className="whitespace-pre-wrap text-sm">
                      {content.split("\n").map((line, i) => {
                        if (line.startsWith("# ")) {
                          return <h1 key={i} className="text-xl font-bold text-primary mb-2">{line.slice(2)}</h1>;
                        }
                        if (line.startsWith("## ")) {
                          return <h2 key={i} className="text-lg font-semibold mt-4 mb-2 border-b border-border/30 pb-1">{line.slice(3)}</h2>;
                        }
                        if (line.startsWith("### ")) {
                          return <h3 key={i} className="text-base font-medium mt-3 mb-1">{line.slice(4)}</h3>;
                        }
                        if (line.startsWith("- ") || line.startsWith("* ")) {
                          return <div key={i} className="flex gap-2 ml-2"><span className="text-primary">•</span><span>{line.slice(2)}</span></div>;
                        }
                        if (line.startsWith("- ")) {
                          return <div key={i} className="flex gap-2 ml-2"><span className="text-primary">•</span><span>{line.slice(2)}</span></div>;
                        }
                        if (line === "") {
                          return <div key={i} className="h-2" />;
                        }
                        return <p key={i} className="mb-1">{line}</p>;
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-20">开始编辑以查看预览</p>
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="optimize" className="mt-4 space-y-4">
            {/* Optimize buttons */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { type: "summary", label: "总结优化", icon: Sparkles },
                { type: "experience", label: "经历优化", icon: Wand2 },
                { type: "skill", label: "技能优化", icon: Star },
                { type: "full", label: "全面优化", icon: GitCompare },
              ].map((opt) => {
                const Icon = opt.icon;
                return (
                  <Button
                    key={opt.type}
                    variant="outline"
                    className="gap-2"
                    disabled={optimizing}
                    onClick={() => handleOptimize(opt.type)}
                  >
                    {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                    {opt.label}
                  </Button>
                );
              })}
            </div>

            {/* Diff view */}
            {showDiff && optimized && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <GlassCard className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <X className="h-4 w-4 text-rose-500" />
                    <span className="text-sm font-medium">原文</span>
                  </div>
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto">{content}</pre>
                </GlassCard>
                <GlassCard className="p-4 border-emerald-500/20">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium">AI 优化</span>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleOptimize("full")}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        重新生成
                      </Button>
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={acceptOptimization}>
                        <Check className="h-3 w-3" />
                        采纳
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs text-foreground whitespace-pre-wrap max-h-[400px] overflow-y-auto">{optimized}</pre>
                </GlassCard>
              </div>
            )}

            {!showDiff && (
              <GlassCard className="p-8 text-center">
                <Wand2 className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">选择优化类型，AI 将帮你优化简历</p>
                <p className="text-xs text-muted-foreground/70 mt-1">支持 STAR 法则、量化数据、关键词增强</p>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4">版本历史</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <History className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">v{selectedResume.version}</span>
                      <Badge variant="default" className="text-[10px]">当前</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      最后更新：{new Date(selectedResume.updatedAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                </div>
                {selectedResume.version > 1 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    历史版本可通过版本回退功能恢复（开发中）
                  </p>
                )}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
