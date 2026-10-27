"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  DollarSign,
  MapPin,
  Building2,
  Sparkles,
  Check,
  X,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OfferData {
  company: string;
  position: string;
  baseSalary: number;
  bonus: number;
  location: string;
  benefits: string[];
  pros: string[];
  cons: string[];
}

interface AnalysisResult {
  totalComp: number;
  monthlyAfterTax: number;
  annualAfterTax: number;
  comparison: string;
  recommendation: string;
  scores: {
    salary: number;
    growth: number;
    stability: number;
    culture: number;
    workLife: number;
  };
  aiAnalysis: string;
}

const defaultOffers: OfferData[] = [
  {
    company: "腾讯",
    position: "Staff 前端工程师",
    baseSalary: 60,
    bonus: 20,
    location: "深圳",
    benefits: ["股票期权", "免费三餐", "弹性工作", "补充医疗"],
    pros: ["技术氛围好", "成长空间大", "品牌背书"],
    cons: ["加班较多", "竞争激烈"],
  },
  {
    company: "字节跳动",
    position: "高级前端工程师",
    baseSalary: 55,
    bonus: 25,
    location: "北京",
    benefits: ["股票期权", "免费三餐", "租房补贴", "健身房"],
    pros: ["薪资高", "业务增长快", "技术栈新"],
    cons: ["工作强度大", "稳定性一般"],
  },
];

export function OfferAnalysisView() {
  const aiConfig = useAIConfig();
  const [offers, setOffers] = useState<OfferData[]>(defaultOffers);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [recommendation, setRecommendation] = useState("");

  const updateOffer = (idx: number, field: keyof OfferData, value: unknown) => {
    setOffers((prev) => prev.map((o, i) => (i === idx ? { ...o, [field]: value } : o)));
  };

  const addOffer = () => {
    setOffers([...offers, {
      company: "",
      position: "",
      baseSalary: 0,
      bonus: 0,
      location: "",
      benefits: [],
      pros: [],
      cons: [],
    }]);
  };

  const removeOffer = (idx: number) => {
    if (offers.length > 1) {
      setOffers(offers.filter((_, i) => i !== idx));
    }
  };

  const analyze = async () => {
    if (offers.some((o) => !o.company || !o.position)) {
      toast.error("请填写所有 Offer 的公司和岗位");
      return;
    }
    setLoading(true);
    setResults(null);
    try {
      const res = await fetch("/api/offer-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offers,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setRecommendation(data.recommendation || "");
        toast.success("分析完成");
      } else {
        toast.error(data.error || "分析失败");
      }
    } catch {
      toast.error("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const scoreLabels: { key: keyof AnalysisResult["scores"]; label: string }[] = [
    { key: "salary", label: "薪资" },
    { key: "growth", label: "成长" },
    { key: "stability", label: "稳定" },
    { key: "culture", label: "文化" },
    { key: "workLife", label: "WLB" },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="Offer 分析器"
        subtitle="多 Offer 对比、薪资计算器、AI 决策建议"
        icon={<Trophy className="h-5 w-5" />}
        action={
          <Button size="sm" className="gap-2" onClick={analyze} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "分析中..." : "AI 分析"}
          </Button>
        }
      />

      {/* Offer Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {offers.map((offer, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">Offer {idx + 1}</span>
                {offers.length > 1 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeOffer(idx)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">公司</label>
                  <Input
                    value={offer.company}
                    onChange={(e) => updateOffer(idx, "company", e.target.value)}
                    placeholder="公司名"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">岗位</label>
                  <Input
                    value={offer.position}
                    onChange={(e) => updateOffer(idx, "position", e.target.value)}
                    placeholder="岗位名"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">基本薪资（万/年）</label>
                    <Input
                      type="number"
                      value={offer.baseSalary}
                      onChange={(e) => updateOffer(idx, "baseSalary", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">奖金/股票（万/年）</label>
                    <Input
                      type="number"
                      value={offer.bonus}
                      onChange={(e) => updateOffer(idx, "bonus", Number(e.target.value))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">地点</label>
                  <Input
                    value={offer.location}
                    onChange={(e) => updateOffer(idx, "location", e.target.value)}
                    placeholder="城市"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="rounded-lg border border-border/50 bg-card/30 p-2">
                  <p className="text-[10px] text-muted-foreground mb-1">总包：{(offer.baseSalary + offer.bonus).toFixed(0)} 万/年</p>
                  <p className="text-[10px] text-emerald-500">税后月薪：≈ {Math.round((offer.baseSalary + offer.bonus) * 0.75 / 12 * 10) / 10} 万</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* Add Offer Button */}
        {offers.length < 4 && (
          <button
            onClick={addOffer}
            className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/50 text-muted-foreground transition hover:border-primary/30 hover:text-primary"
          >
            <div className="flex flex-col items-center gap-2">
              <Plus className="h-6 w-6" />
              <span className="text-xs">添加 Offer</span>
            </div>
          </button>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Recommendation */}
            {recommendation && (
              <GlassCard className="p-6 border-primary/30 bg-primary/5">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1">AI 推荐建议</h3>
                    <p className="text-sm text-muted-foreground">{recommendation}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((r, idx) => {
                const offer = offers[idx];
                const avgScore = Math.round(Object.values(r.scores).reduce((a, b) => a + b, 0) / 5);
                return (
                  <GlassCard key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-medium">{offer.company}</h4>
                        <p className="text-xs text-muted-foreground">{offer.position}</p>
                      </div>
                      <ScoreRing value={avgScore} size={50} strokeWidth={4} color={avgScore >= 75 ? "emerald" : avgScore >= 60 ? "amber" : "rose"} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">总包</p>
                        <p className="text-sm font-bold">{r.totalComp.toFixed(0)}万</p>
                      </div>
                      <div className="rounded-lg border border-border/50 bg-card/30 p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">税后/月</p>
                        <p className="text-sm font-bold">{r.monthlyAfterTax.toFixed(1)}万</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      {scoreLabels.map((s) => (
                        <div key={s.key} className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground w-10">{s.label}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "h-full",
                                r.scores[s.key] >= 75 ? "bg-emerald-500" : r.scores[s.key] >= 50 ? "bg-amber-500" : "bg-rose-500"
                              )}
                              style={{ width: `${r.scores[s.key]}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-medium w-6 text-right">{r.scores[s.key]}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {/* AI Analysis */}
            {results[0]?.aiAnalysis && (
              <GlassCard className="p-6">
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  AI 深度分析
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{results[0].aiAnalysis}</p>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Salary Calculator Info */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-emerald-500" />
          薪资计算说明
        </h3>
        <div className="grid grid-cols-1 gap-3 text-xs text-muted-foreground md:grid-cols-3">
          <div>
            <p className="font-medium text-foreground mb-1">总包计算</p>
            <p>基本薪资 + 奖金/股票年化价值</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">税后估算</p>
            <p>简化个税计算（五险一金 + 累进税率），仅供参考</p>
          </div>
          <div>
            <p className="font-medium text-foreground mb-1">评分维度</p>
            <p>薪资、成长、稳定、文化、工作生活平衡 5 维度</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
