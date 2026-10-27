"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  KanbanSquare,
  Plus,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  Trophy,
  Clock,
  Target,
  Trash2,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Application {
  id: string;
  company: string;
  position: string;
  location: string | null;
  salary: string | null;
  status: string;
  priority: string;
  matchScore: number | null;
  createdAt: string;
}

const columns = [
  { id: "wishlist", title: "准备投递", color: "muted" },
  { id: "applied", title: "已投递", color: "blue" },
  { id: "hr", title: "HR 面", color: "violet" },
  { id: "tech1", title: "技术一面", color: "amber" },
  { id: "tech2", title: "技术二面", color: "amber" },
  { id: "hr-final", title: "HR 终面", color: "emerald" },
  { id: "offer", title: "Offer", color: "emerald" },
  { id: "rejected", title: "Rejected", color: "rose" },
];

const colorMap: Record<string, string> = {
  muted: "border-t-muted-foreground/50",
  blue: "border-t-blue-500/50",
  violet: "border-t-violet-500/50",
  amber: "border-t-amber-500/50",
  emerald: "border-t-emerald-500/50",
  rose: "border-t-rose-500/50",
};

export function TrackerView() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newApp, setNewApp] = useState({ company: "", position: "", location: "", salary: "", priority: "medium" });
  const [stats, setStats] = useState<{
    total: number;
    rates: { appliedToInterview: number; interviewToOffer: number; overallSuccess: number };
    avgMatch: number;
    interviewCount: number;
    offerCount: number;
    rejectedCount: number;
  } | null>(null);
  const [detailApp, setDetailApp] = useState<Application | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editApp, setEditApp] = useState<Partial<Application>>({});

  useEffect(() => {
    void fetchApps();
    void fetchStats();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      setApps(data.applications || []);
    } catch {
      toast.error("加载投递记录失败");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/tracker-stats");
      const data = await res.json();
      if (data.total !== undefined) {
        setStats({
          total: data.total,
          rates: data.rates,
          avgMatch: data.avgMatch,
          interviewCount: data.interviewCount,
          offerCount: data.offerCount,
          rejectedCount: data.rejectedCount,
        });
      }
    } catch {
      // silent fail
    }
  };

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = async (status: string) => {
    if (!draggedId) return;
    const app = apps.find((a) => a.id === draggedId);
    if (app && app.status !== status) {
      // Optimistic update
      setApps((prev) => prev.map((a) => (a.id === draggedId ? { ...a, status } : a)));
      try {
        await fetch(`/api/applications/${draggedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        toast.success(`已移动到「${columns.find((c) => c.id === status)?.title}」`);
      } catch {
        toast.error("更新失败");
        void fetchApps(); // Revert
      }
    }
    setDraggedId(null);
  };

  const handleAdd = async () => {
    if (!newApp.company || !newApp.position) {
      toast.error("请填写公司名称和岗位");
      return;
    }
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newApp, status: "wishlist" }),
      });
      const data = await res.json();
      if (data.application) {
        setApps((prev) => [data.application, ...prev]);
        setShowAdd(false);
        setNewApp({ company: "", position: "", location: "", salary: "", priority: "medium" });
        toast.success("已添加投递记录");
      }
    } catch {
      toast.error("添加失败");
    }
  };

  const handleDelete = async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/applications/${id}`, { method: "DELETE" });
      toast.success("已删除");
    } catch {
      void fetchApps();
    }
  };

  const handleUpdate = async () => {
    if (!detailApp) return;
    try {
      const res = await fetch(`/api/applications/${detailApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editApp),
      });
      if (res.ok) {
        toast.success("已更新");
        setEditMode(false);
        setDetailApp(null);
        void fetchApps();
        void fetchStats();
      }
    } catch {
      toast.error("更新失败");
    }
  };

  const openDetail = (app: Application) => {
    setDetailApp(app);
    setEditApp(app);
    setEditMode(false);
  };

  const localStats = {
    total: apps.length,
    interviewing: apps.filter((a) => ["hr", "tech1", "tech2", "hr-final"].includes(a.status)).length,
    offers: apps.filter((a) => a.status === "offer").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="求职追踪"
        subtitle="看板式管理你的投递进度"
        icon={<KanbanSquare className="h-5 w-5" />}
        action={
          <Button size="sm" className="gap-2" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" />
            添加投递
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "总投递", value: localStats.total, icon: Target, color: "text-primary" },
          { label: "面试中", value: localStats.interviewing, icon: Clock, color: "text-amber-500" },
          { label: "Offer", value: localStats.offers, icon: Trophy, color: "text-emerald-500" },
          { label: "未通过", value: localStats.rejected, icon: TrendingUp, color: "text-rose-500" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                  </div>
                  <Icon className={cn("h-8 w-8 opacity-20", stat.color)} />
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {/* Conversion Rates */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "投递→面试", value: stats.rates.appliedToInterview, color: "text-violet-500" },
            { label: "面试→Offer", value: stats.rates.interviewToOffer, color: "text-emerald-500" },
            { label: "整体成功率", value: stats.rates.overallSuccess, color: "text-primary" },
          ].map((rate) => (
            <GlassCard key={rate.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{rate.label}</p>
                  <p className={cn("text-xl font-bold mt-1", rate.color)}>{rate.value}%</p>
                </div>
                <TrendingUp className={cn("h-6 w-6 opacity-20", rate.color)} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">添加投递记录</h3>
              <div className="space-y-3">
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="公司名称 *"
                  value={newApp.company}
                  onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                />
                <input
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="岗位名称 *"
                  value={newApp.position}
                  onChange={(e) => setNewApp({ ...newApp, position: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="工作地点"
                    value={newApp.location}
                    onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                  />
                  <input
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    placeholder="薪资范围"
                    value={newApp.salary}
                    onChange={(e) => setNewApp({ ...newApp, salary: e.target.value })}
                  />
                </div>
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  value={newApp.priority}
                  onChange={(e) => setNewApp({ ...newApp, priority: e.target.value })}
                >
                  <option value="high">高优先级</option>
                  <option value="medium">中优先级</option>
                  <option value="low">低优先级</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAdd(false)}>取消</Button>
                <Button size="sm" onClick={handleAdd}>添加</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {columns.map((col) => {
            const colApps = apps.filter((a) => a.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col gap-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
              >
                <div className={cn("rounded-lg border-t-2 bg-card/30 p-2", colorMap[col.color])}>
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-xs font-medium">{col.title}</span>
                    <Badge variant="secondary" className="text-[10px]">{colApps.length}</Badge>
                  </div>
                  <div className="space-y-2 min-h-[60px]">
                    <AnimatePresence>
                      {colApps.map((app) => (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          draggable
                          onDragStart={() => handleDragStart(app.id)}
                          onClick={() => openDetail(app)}
                          className="group cursor-grab rounded-lg border border-border/50 bg-background p-3 transition hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-medium text-primary">
                              {app.company.slice(0, 2)}
                            </div>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-rose-500"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="mt-2 text-sm font-medium leading-tight">{app.position}</p>
                          <p className="text-xs text-muted-foreground">{app.company}</p>
                          <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                            {app.location && (
                              <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {app.location}
                              </span>
                            )}
                            {app.salary && (
                              <span className="flex items-center gap-0.5">
                                <DollarSign className="h-3 w-3" />
                                {app.salary}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(app.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                            </span>
                            {app.matchScore && app.matchScore > 0 && (
                              <Badge variant="outline" className={cn(
                                "text-[10px]",
                                app.matchScore >= 80 ? "border-emerald-500/30 text-emerald-500" :
                                app.matchScore >= 60 ? "border-amber-500/30 text-amber-500" :
                                "border-rose-500/30 text-rose-500"
                              )}>
                                匹配 {app.matchScore}%
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {colApps.length === 0 && (
                      <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border/50 text-xs text-muted-foreground">
                        拖拽卡片到此处
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <AnimatePresence>
        {detailApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setDetailApp(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-border bg-background p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{editMode ? "编辑投递" : "投递详情"}</h3>
                <div className="flex gap-1">
                  {!editMode && (
                    <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>编辑</Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setDetailApp(null)}>关闭</Button>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">公司</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={editApp.company || ""}
                      onChange={(e) => setEditApp({ ...editApp, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">岗位</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={editApp.position || ""}
                      onChange={(e) => setEditApp({ ...editApp, position: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">地点</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={editApp.location || ""}
                      onChange={(e) => setEditApp({ ...editApp, location: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">薪资</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={editApp.salary || ""}
                      onChange={(e) => setEditApp({ ...editApp, salary: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">状态</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={editApp.status || ""}
                      onChange={(e) => setEditApp({ ...editApp, status: e.target.value })}
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">优先级</label>
                    <select
                      className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      value={editApp.priority || ""}
                      onChange={(e) => setEditApp({ ...editApp, priority: e.target.value })}
                    >
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>取消</Button>
                    <Button size="sm" onClick={handleUpdate}>保存</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                      {detailApp.company.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{detailApp.company}</p>
                      <p className="text-sm text-muted-foreground">{detailApp.position}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">地点</p>
                      <p>{detailApp.location || "未填写"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">薪资</p>
                      <p>{detailApp.salary || "面议"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">状态</p>
                      <Badge variant="outline">{columns.find(c => c.id === detailApp.status)?.title || detailApp.status}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">优先级</p>
                      <Badge variant="outline">{detailApp.priority === "high" ? "高" : detailApp.priority === "medium" ? "中" : "低"}</Badge>
                    </div>
                    {detailApp.matchScore && detailApp.matchScore > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground">匹配度</p>
                        <p className={cn(
                          detailApp.matchScore >= 80 ? "text-emerald-500" :
                          detailApp.matchScore >= 60 ? "text-amber-500" : "text-rose-500"
                        )}>{detailApp.matchScore}%</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">投递日期</p>
                      <p>{new Date(detailApp.createdAt).toLocaleDateString("zh-CN")}</p>
                    </div>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-rose-500 hover:bg-rose-500/10"
                      onClick={() => {
                        void handleDelete(detailApp.id);
                        setDetailApp(null);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      删除
                    </Button>
                    <Button size="sm" onClick={() => setEditMode(true)}>编辑</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
