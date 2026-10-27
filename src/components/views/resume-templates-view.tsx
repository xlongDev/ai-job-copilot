"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  Loader2,
  Check,
  Eye,
  Layout,
  Palette,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  color: string;
  layout: string;
  sections: string[];
  preview: string;
}

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-500", border: "border-blue-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  slate: { bg: "bg-slate-500/10", text: "text-slate-500", border: "border-slate-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  rose: { bg: "bg-rose-500/10", text: "text-rose-500", border: "border-rose-500/20" },
};

export function ResumeTemplatesView() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch {
      toast.error("加载模板失败");
    } finally {
      setLoading(false);
    }
  };

  const apply = (template: Template) => {
    setSelected(template.id);
    toast.success(`已切换到 ${template.name} 模板`);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="简历模板"
        subtitle="多模板切换 + 实时预览，ATS 兼容性标注"
        icon={<Layout className="h-5 w-5" />}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => {
            const c = colorClasses[template.color] || colorClasses.emerald;
            const isSelected = selected === template.id;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard
                  hover
                  className={cn(
                    "cursor-pointer p-5",
                    isSelected && "border-primary/40 shadow-lg shadow-primary/10"
                  )}
                >
                  <div onClick={() => apply(template)}>
                    {/* Preview */}
                    <div className={cn("mb-4 rounded-lg border p-3", c.border, c.bg)}>
                      <div className="space-y-2">
                        <div className={cn("h-2 w-3/4 rounded", c.text, "bg-opacity-20")} style={{ backgroundColor: "currentColor", opacity: 0.3 }} />
                        <div className="h-1.5 w-full rounded bg-muted" />
                        <div className="h-1.5 w-5/6 rounded bg-muted" />
                        {template.layout === "two-column" || template.layout === "sidebar" ? (
                          <div className="flex gap-2">
                            <div className="w-1/3 space-y-1">
                              <div className="h-1.5 w-full rounded bg-muted" />
                              <div className="h-1.5 w-full rounded bg-muted" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="h-1.5 w-full rounded bg-muted" />
                              <div className="h-1.5 w-full rounded bg-muted" />
                              <div className="h-1.5 w-3/4 rounded bg-muted" />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="h-1.5 w-full rounded bg-muted" />
                            <div className="h-1.5 w-full rounded bg-muted" />
                            <div className="h-1.5 w-3/4 rounded bg-muted" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">{template.name}</h4>
                      {isSelected && (
                        <Badge variant="default" className="text-[10px] gap-0.5">
                          <Check className="h-2.5 w-2.5" />已选
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{template.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-[9px] gap-0.5">
                        <Layout className="h-2.5 w-2.5" />{template.layout}
                      </Badge>
                      {template.id === "minimal" && (
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-500">
                          ATS 100%
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                      <Eye className="h-3.5 w-3.5" />预览
                    </Button>
                    <Button size="sm" className="flex-1 gap-1.5" onClick={() => apply(template)}>
                      <Check className="h-3.5 w-3.5" />应用
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Template Info */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          模板说明
        </h3>
        <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground md:grid-cols-2">
          <div>
            <p className="font-medium text-foreground mb-1">ATS 兼容性</p>
            <p>Minimal 模板 100% ATS 兼容，推荐用于在线投递。其他模板适合 PDF 导出后直接发送。</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">布局选择</p>
            <p>单栏适合经历丰富者；双栏适合技能突出者；侧边栏适合联系方式丰富者。</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
