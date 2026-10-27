"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Mic,
  BookOpen,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  type: "application" | "interview" | "learning";
  title: string;
  detail: string;
  date: string;
  color: string;
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  application: Briefcase,
  interview: Mic,
  learning: BookOpen,
};

const colorClasses: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  violet: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  rose: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const dotColors: Record<string, string> = {
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
};

const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;

  const fetchCalendar = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar?month=${monthStr}`);
      const data = await res.json();
      if (data.byDate) {
        setEvents(data.byDate);
      }
    } catch {
      toast.error("加载日历失败");
    } finally {
      setLoading(false);
    }
  }, [monthStr]);

  useEffect(() => {
    void fetchCalendar();
  }, [fetchCalendar]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  // Generate calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 0; i < remaining; i++) days.push(null);

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const getDateKey = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const selectedEvents = selectedDate ? events[selectedDate] || [] : [];
  const totalEvents = Object.values(events).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="求职日历"
        subtitle="日历视图展示面试、投递、学习计划"
        icon={<CalendarIcon className="h-5 w-5" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToday}>今天</Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[100px] text-center">
                {year}年{monthNames[month]}
              </span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "本月活动", value: totalEvents, icon: TrendingUp, color: "text-primary" },
          { label: "投递", value: Object.values(events).flat().filter((e: CalendarEvent) => e.type === "application").length, icon: Briefcase, color: "text-violet-500" },
          { label: "面试", value: Object.values(events).flat().filter((e: CalendarEvent) => e.type === "interview").length, icon: Mic, color: "text-amber-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassCard key={stat.label} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={cn("text-2xl font-bold mt-1", stat.color)}>{stat.value}</p>
                </div>
                <Icon className={cn("h-8 w-8 opacity-20", stat.color)} />
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <GlassCard className="p-6 lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  if (day === null) return <div key={i} className="aspect-square" />;
                  const dateKey = getDateKey(day);
                  const dayEvents = events[dateKey] || [];
                  return (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(dateKey)}
                      className={cn(
                        "aspect-square rounded-lg border p-1.5 text-left transition flex flex-col",
                        isToday(day)
                          ? "border-primary bg-primary/5"
                          : selectedDate === dateKey
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/30 hover:border-primary/30 hover:bg-accent/50"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isToday(day) ? "text-primary" : "text-muted-foreground"
                      )}>
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <div className="mt-auto flex flex-wrap gap-0.5">
                          {dayEvents.slice(0, 3).map((e) => (
                            <span key={e.id} className={cn("h-1.5 w-1.5 rounded-full", dotColors[e.color])} />
                          ))}
                          {dayEvents.length > 3 && (
                            <span className="text-[8px] text-muted-foreground">+{dayEvents.length - 3}</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </>
          )}
        </GlassCard>

        {/* Selected Date Events */}
        <GlassCard className="p-6">
          <h3 className="text-sm font-medium mb-4">
            {selectedDate ? `${selectedDate} 的活动` : "点击日期查看详情"}
          </h3>
          <AnimatePresence mode="wait">
            {selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((event, i) => {
                  const Icon = typeIcons[event.type];
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn("rounded-lg border p-3", colorClasses[event.color])}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {selectedDate ? "该日期暂无活动" : "选择一个日期查看当天活动"}
              </div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>

      {/* Legend */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-6 text-xs">
          <span className="text-muted-foreground">图例:</span>
          {[
            { label: "投递", color: "violet" },
            { label: "面试", color: "amber" },
            { label: "学习", color: "emerald" },
            { label: "Offer", color: "emerald" },
            { label: "未通过", color: "rose" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={cn("h-2 w-2 rounded-full", dotColors[item.color])} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
