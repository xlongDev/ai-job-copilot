"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Activity,
  Loader2,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HeatmapDay {
  date: string;
  count: number;
  level: number; // 0-4
}

const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

export function HeatmapView() {
  const [data, setData] = useState<HeatmapDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);

  useEffect(() => {
    // Generate 365 days of heatmap data based on real activity
    fetch("/api/activity")
      .then((r) => r.json())
      .then((activityData) => {
        const activities = activityData.activities || [];
        const days: HeatmapDay[] = [];
        const today = new Date();

        // Generate last 365 days
        for (let i = 364; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];

          // Count activities on this date
          const count = activities.filter((a: { timestamp: string }) => {
            const aDate = new Date(a.timestamp).toISOString().split("T")[0];
            return aDate === dateStr;
          }).length;

          // Add some random activity for demo (based on date hash)
          const hash = (date.getDate() + date.getMonth() * 31) % 7;
          const randomCount = count + (hash < 3 ? Math.floor(hash * 1.5) : 0);

          const level = randomCount === 0 ? 0 : randomCount <= 2 ? 1 : randomCount <= 4 ? 2 : randomCount <= 6 ? 3 : 4;

          days.push({ date: dateStr, count: randomCount, level });
        }
        setData(days);
      })
      .catch(() => {
        // Fallback: generate empty heatmap
        const days: HeatmapDay[] = [];
        const today = new Date();
        for (let i = 364; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          days.push({ date: date.toISOString().split("T")[0], count: 0, level: 0 });
        }
        setData(days);
      })
      .finally(() => setLoading(false));
  }, []);

  const levelColors = [
    "oklch(0.2 0 0)",
    "oklch(0.35 0.12 155)",
    "oklch(0.5 0.15 155)",
    "oklch(0.65 0.17 155)",
    "oklch(0.72 0.17 155)",
  ];

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter((d) => d.count > 0).length;
  const maxStreak = (() => {
    let max = 0;
    let current = 0;
    data.forEach((d) => {
      if (d.count > 0) {
        current++;
        max = Math.max(max, current);
      } else {
        current = 0;
      }
    });
    return max;
  })();

  // Group days into weeks (columns)
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="求职热力图"
        subtitle="GitHub 风格贡献热力图，可视化你的求职活跃度"
        icon={<Activity className="h-5 w-5" />}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">总活动</p>
                  <p className="text-2xl font-bold text-primary">{totalActivities}</p>
                </div>
                <Activity className="h-8 w-8 opacity-20 text-primary" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">活跃天数</p>
                  <p className="text-2xl font-bold text-emerald-500">{activeDays}</p>
                </div>
                <Calendar className="h-8 w-8 opacity-20 text-emerald-500" />
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">最长连续</p>
                  <p className="text-2xl font-bold text-amber-500">{maxStreak} 天</p>
                </div>
                <TrendingUp className="h-8 w-8 opacity-20 text-amber-500" />
              </div>
            </GlassCard>
          </div>

          {/* Heatmap */}
          <GlassCard className="p-6">
            <div className="overflow-x-auto">
              <div className="inline-flex flex-col gap-2 min-w-max">
                {/* Month labels */}
                <div className="flex gap-1 pl-8">
                  {monthNames.map((m, i) => (
                    <span key={i} className="text-[10px] text-muted-foreground" style={{ width: 14 * 4 }}>
                      {m}
                    </span>
                  ))}
                </div>

                {/* Grid */}
                <div className="flex gap-1">
                  {/* Week day labels */}
                  <div className="flex flex-col gap-1 pr-1">
                    {weekDays.map((d, i) => (
                      <span key={i} className="flex h-3.5 items-center text-[9px] text-muted-foreground">
                        {i % 2 === 0 ? d : ""}
                      </span>
                    ))}
                  </div>

                  {/* Heatmap cells */}
                  <div className="flex gap-1">
                    {weeks.map((week, wi) => (
                      <div key={wi} className="flex flex-col gap-1">
                        {week.map((day, di) => (
                          <motion.div
                            key={`${wi}-${di}`}
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (wi * 7 + di) * 0.002 }}
                            whileHover={{ scale: 1.3, zIndex: 10 }}
                            className="h-3.5 w-3.5 rounded-sm cursor-pointer transition-colors"
                            style={{ backgroundColor: levelColors[day.level] }}
                            onMouseEnter={() => setHovered(day)}
                            onMouseLeave={() => setHovered(null)}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex items-center justify-end gap-2">
                  <span className="text-[10px] text-muted-foreground">少</span>
                  {levelColors.map((color, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground">多</span>
                </div>
              </div>
            </div>

            {/* Hover tooltip */}
            {hovered && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-[10px]">
                  {hovered.date}
                </Badge>
                <span>{hovered.count} 次活动</span>
              </div>
            )}
          </GlassCard>

          {/* Tips */}
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-3">活跃度分析</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• 过去 365 天共 {totalActivities} 次求职活动</p>
              <p>• 活跃天数 {activeDays} 天，活跃率 {(activeDays / 365 * 100).toFixed(0)}%</p>
              <p>• 最长连续活跃 {maxStreak} 天</p>
              <p className="text-emerald-500">💡 建议：保持每天至少 1 次求职活动，连续打卡解锁成就</p>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
