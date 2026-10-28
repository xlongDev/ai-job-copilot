"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Plug,
  Github,
  BookOpen,
  FileText,
  MessageSquare,
  Calendar,
  Figma,
  Mail,
  CheckCircle2,
  Circle,
  Loader2,
  Settings2,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Github, BookOpen, FileText, MessageSquare, Calendar, Figma, Mail, Layers,
};

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
};

interface McpServer {
  id: string;
  name: string;
  icon: string;
  color: string;
  desc: string;
  tools: string[];
  connected: boolean;
  category: string;
}

export function McpView() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [loading, setLoading] = useState(true);


  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch("/api/mcp-servers");
      const data = await res.json();
      setServers(data.servers || []);
    } catch {
      toast.error("加载 MCP 服务器失败");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void fetchServers();
  }, [fetchServers]);

  const toggleConnection = async (id: string) => {
    try {
      const res = await fetch("/api/mcp-servers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "toggle" }),
      });
      const data = await res.json();
      setServers((prev) => prev.map((s) => s.id === id ? { ...s, connected: data.connected } : s));
      toast.success(data.message);
    } catch {
      toast.error("操作失败");
    }
  };

  const connectedCount = servers.filter((s) => s.connected).length;
  const totalTools = servers.filter((s) => s.connected).reduce((sum, s) => sum + s.tools.length, 0);

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="MCP 协议"
        subtitle="Model Context Protocol — 连接外部工具和数据源"
        icon={<Plug className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{connectedCount}</p>
              <p className="text-xs text-muted-foreground">已连接</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalTools}</p>
              <p className="text-xs text-muted-foreground">可用工具</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
              <Plug className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xl font-bold">{servers.length}</p>
              <p className="text-xs text-muted-foreground">总服务器</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Servers */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {servers.map((server, i) => {
            const Icon = iconMap[server.icon] || Plug;
            const c = colorClasses[server.color] || colorClasses.emerald;
            return (
              <motion.div key={server.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <GlassCard className={cn("p-4", server.connected && c.border)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.bg, c.text)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">{server.name}</h4>
                        <p className="text-[10px] text-muted-foreground">{server.category}</p>
                      </div>
                    </div>
                    <Switch checked={server.connected} onCheckedChange={() => toggleConnection(server.id)} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{server.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {server.tools.map((tool) => (
                      <Badge key={tool} variant="outline" className="text-[10px] font-mono">{tool}</Badge>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={cn("flex items-center gap-1 text-[10px]", server.connected ? "text-emerald-500" : "text-muted-foreground")}>
                      {server.connected ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {server.connected ? "已连接" : "未连接"}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Settings2 className="h-3 w-3 mr-1" />配置
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Protocol Info */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          MCP 协议说明
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: "统一接口", desc: "所有外部工具通过统一 JSON-RPC 协议通信，Agent 无需关心具体实现", icon: Plug },
            { title: "安全授权", desc: "基于 OAuth 2.0，用户可随时撤销权限，数据不出本地", icon: Shield },
            { title: "动态发现", desc: "Agent 运行时自动发现可用工具，按需调用，支持流式响应", icon: Zap },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-lg border border-border/50 bg-card/30 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-medium mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
