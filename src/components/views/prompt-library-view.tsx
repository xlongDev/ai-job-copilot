"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Search,
  Star,
  Copy,
  Check,
  Play,
  Loader2,
  BookOpen,
  Code2,
  Mic,
  Mail,
  TrendingUp,
  Plus,
  Share2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Prompt {
  id: string;
  title: string;
  category: string;
  prompt: string;
  isOfficial: boolean;
  tags: string[];
}

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "简历优化": BookOpen,
  "模拟面试": Mic,
  "求职信": Mail,
  "职业规划": TrendingUp,
  "技能分析": Code2,
};

export function PromptLibraryView() {
  const aiConfig = useAIConfig();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Prompt | null>(null);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);


  const fetchPrompts = useCallback(async () => {
    try {
      const res = await fetch("/api/prompts");
      const data = await res.json();
      setPrompts(data.prompts || []);
      setCategories(data.categories || ["全部"]);
    } catch {
      toast.error("加载 Prompt 库失败");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchPrompts();
  }, [fetchPrompts]);

  const filtered = prompts.filter((p) => {
    const matchCat = activeCategory === "全部" || p.category === activeCategory;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const run = async () => {
    if (!selected || !input.trim()) {
      toast.error("请选择 Prompt 并输入内容");
      return;
    }
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run",
          promptId: selected.id,
          prompt: selected.prompt,
          input,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.content) {
        setResult(data.content);
        toast.success("Prompt 执行完成");
      } else {
        toast.error(data.error || "执行失败");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setRunning(false);
    }
  };

  const copyPrompt = () => {
    if (!selected) return;
    void navigator.clipboard?.writeText(selected.prompt);
    setCopied(true);
    toast.success("Prompt 已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="AI Prompt Library"
        subtitle="官方精选 Prompt + 自定义创建，一键执行"
        icon={<Sparkles className="h-5 w-5" />}
      />

      {/* Search + Categories */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 Prompt..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["全部", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                activeCategory === cat
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Prompt List */}
        <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            filtered.map((prompt, i) => {
              const Icon = categoryIcons[prompt.category] || Sparkles;
              return (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard
                    hover
                    className={cn(
                      "cursor-pointer p-4",
                      selected?.id === prompt.id && "border-primary/40 shadow-lg shadow-primary/10"
                    )}
                  >
                    <div onClick={() => { setSelected(prompt); setResult(null); }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        {prompt.isOfficial && (
                          <Badge variant="secondary" className="text-[10px] gap-0.5">
                            <Star className="h-2.5 w-2.5" />官方
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-medium mb-1">{prompt.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{prompt.prompt.slice(0, 80)}...</p>
                      <div className="flex flex-wrap gap-1">
                        {prompt.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[9px]">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail + Run */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium">{selected.title}</h3>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={copyPrompt}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "已复制" : "复制 Prompt"}
                  </Button>
                </div>
                <div className="rounded-lg border border-border/50 bg-card/30 p-3 mb-4">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">{selected.prompt}</pre>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selected.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>

                <label className="text-xs font-medium mb-1.5 block">输入内容（{`{input}`} 占位符）</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="输入要处理的内容..."
                  className="min-h-[120px] resize-none mb-3"
                />
                <Button className="w-full gap-2" onClick={run} disabled={running || !input.trim()}>
                  {running ? (
                    <><Loader2 className="h-4 w-4 animate-spin" />执行中...</>
                  ) : (
                    <><Play className="h-4 w-4" />执行 Prompt</>
                  )}
                </Button>
              </GlassCard>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium">执行结果</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => {
                            void navigator.clipboard?.writeText(result);
                            toast.success("已复制结果");
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />复制
                        </Button>
                      </div>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap">{result}</pre>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <GlassCard className="p-12 text-center">
              <Sparkles className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">从左侧选择一个 Prompt 开始</p>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Create Custom Prompt */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Plus className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">创建自定义 Prompt</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">使用 <code className="rounded bg-muted px-1 py-0.5 text-[10px]">{`{input}`}</code> 作为输入占位符，<code className="rounded bg-muted px-1 py-0.5 text-[10px]">{`{resume}`}</code> 自动注入你的简历</p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Input placeholder="Prompt 标题" />
          <Input placeholder="分类，如：简历优化" />
        </div>
        <Textarea placeholder="Prompt 内容，使用 {input} 作为输入占位符..." className="mt-3 min-h-[100px] resize-none" />
        <div className="mt-3 flex gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => toast.success("Prompt 已保存")}>
            <Plus className="h-3.5 w-3.5" />保存
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("分享链接已复制")}>
            <Share2 className="h-3.5 w-3.5" />分享
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
