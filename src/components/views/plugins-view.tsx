"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Plug,
  Search,
  Star,
  Download,
  Check,
  Code2,
  Zap,
  Shield,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Plugin {
  id: string;
  name: string;
  desc: string;
  author: string;
  category: string;
  rating: number;
  installs: string;
  installed: boolean;
  icon: string;
  color: string;
  verified: boolean;
}

export function PluginsView() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [categories, setCategories] = useState<string[]>(["全部"]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);


  const fetchPlugins = useCallback(async () => {
    try {
      const res = await fetch("/api/plugins");
      const data = await res.json();
      setPlugins(data.plugins || []);
      setCategories(data.categories || ["全部"]);
    } catch {
      toast.error("加载插件失败");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchPlugins();
  }, [fetchPlugins]);

  const toggleInstall = async (plugin: Plugin) => {
    try {
      await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pluginId: plugin.id,
          name: plugin.name,
          action: plugin.installed ? "uninstall" : "install",
        }),
      });
      setPlugins((prev) => prev.map((p) => p.id === plugin.id ? { ...p, installed: !p.installed } : p));
      toast.success(plugin.installed ? `已卸载 ${plugin.name}` : `已安装 ${plugin.name}`);
    } catch {
      toast.error("操作失败");
    }
  };

  const filtered = plugins.filter((p) => {
    const matchCat = activeCategory === "全部" || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="插件市场"
        subtitle="扩展平台能力，安装社区插件"
        icon={<Plug className="h-5 w-5" />}
      />

      {/* Search & Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索插件..." className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                activeCategory === cat ? "border-primary bg-primary/10 text-primary" : "border-border/50 text-muted-foreground hover:border-border"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plugins Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plugin, i) => (
            <motion.div key={plugin.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard hover className="h-full p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-xl">{plugin.icon}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-medium">{plugin.name}</h4>
                        {plugin.verified && <Shield className="h-3 w-3 text-emerald-500" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground">by {plugin.author}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{plugin.desc}</p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className="text-[10px]">{plugin.category}</Badge>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" />{plugin.rating}</span>
                    <span>{plugin.installs}</span>
                  </div>
                </div>
                <Button
                  variant={plugin.installed ? "outline" : "default"}
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => toggleInstall(plugin)}
                >
                  {plugin.installed ? (
                    <><Check className="h-3.5 w-3.5" />已安装</>
                  ) : (
                    <><Download className="h-3.5 w-3.5" />安装</>
                  )}
                </Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Developer Section */}
      <GlassCard className="p-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">开发者计划</h3>
              <p className="text-xs text-muted-foreground">使用 Plugin SDK 开发你自己的插件，发布到市场赚取收益</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />查看文档
            </Button>
            <Button size="sm" className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />申请开发者
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
