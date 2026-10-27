"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Crown,
  Building2,
  Sparkles,
  TrendingUp,
  Receipt,
  Download,
  Coins,
  Infinity as InfinityIcon,
  Users,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BillingData {
  plans: { id: string; name: string; price: number; period: string; desc: string; features: string[]; popular?: boolean }[];
  creditPacks: { id: string; credits: number; price: number; bonus: number; popular?: boolean }[];
  currentPlan: string;
  credits: number;
  creditLimit: number;
}

export function BillingView() {
  const { plan, setPlan, credits, consumeCredits } = useAppStore();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  useEffect(() => {
    fetchBilling();
  }, []);

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing");
      const d = await res.json();
      setData(d);
    } catch {
      toast.error("加载账单信息失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId: string) => {
    try {
      await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "upgrade", planId }),
      });
      setPlan(planId as never);
      toast.success(`已切换到 ${data?.plans.find((p) => p.id === planId)?.name} 套餐`);
      fetchBilling();
    } catch {
      toast.error("升级失败");
    }
  };

  const handleBuyCredits = async (packId: string) => {
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "buy-credits", packId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`已购买 ${data.credits} 积分`);
        fetchBilling();
      }
    } catch {
      toast.error("购买失败");
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const planIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    free: Sparkles, pro: Zap, team: Users, enterprise: Building2,
  };

  const invoices = [
    { id: "INV-2026-003", date: "2026-07-01", amount: "¥99.00", plan: "Pro 月度" },
    { id: "INV-2026-002", date: "2026-06-01", amount: "¥99.00", plan: "Pro 月度" },
    { id: "INV-2026-001", date: "2026-05-01", amount: "¥39.00", plan: "积分包 500" },
  ];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="订阅与账单"
        subtitle="管理你的套餐和积分"
        icon={<CreditCard className="h-5 w-5" />}
      />

      {/* Current Plan */}
      <GlassCard className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20">
              <Crown className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">当前套餐</p>
              <p className="text-xl font-bold capitalize">{data.plans.find((p) => p.id === data.currentPlan)?.name || "Free"}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">剩余积分</p>
              <p className="text-xl font-bold text-primary">{data.credits}</p>
            </div>
            <div className="w-32">
              <Progress value={(data.credits / data.creditLimit) * 100} className="h-2" />
              <p className="mt-1 text-[10px] text-muted-foreground">{data.credits}/{data.creditLimit}</p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Plans */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium">选择套餐</h3>
          <div className="flex gap-1 rounded-lg border border-border/50 p-0.5">
            <button onClick={() => setBillingCycle("monthly")} className={cn("rounded-md px-3 py-1 text-xs", billingCycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>月付</button>
            <button onClick={() => setBillingCycle("yearly")} className={cn("rounded-md px-3 py-1 text-xs", billingCycle === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>年付 -20%</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {data.plans.map((p, i) => {
            const Icon = planIcons[p.id] || Sparkles;
            const isCurrent = p.id === data.currentPlan;
            const price = billingCycle === "yearly" && p.price > 0 ? Math.round(p.price * 0.8) : p.price;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassCard className={cn("relative h-full p-5", p.popular && "border-primary/40 shadow-lg shadow-primary/10")}>
                  {p.popular && <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">推荐</Badge>}
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                  <div className="mb-1">
                    {p.price === 0 ? <span className="text-2xl font-bold">免费</span> : p.price < 0 ? <span className="text-2xl font-bold">定制</span> : <><span className="text-2xl font-bold">¥{price}</span><span className="text-sm text-muted-foreground">{p.period}</span></>}
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">{p.desc}</p>
                  <ul className="mb-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant={isCurrent ? "outline" : p.popular ? "default" : "secondary"} size="sm" className="w-full" disabled={isCurrent} onClick={() => handleUpgrade(p.id)}>
                    {isCurrent ? "当前套餐" : p.price < 0 ? "联系销售" : "升级"}
                  </Button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <h3 className="mb-4 text-sm font-medium flex items-center gap-2">
          <Coins className="h-4 w-4" />
          积分包
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.creditPacks.map((pack, i) => (
            <motion.div key={pack.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className={cn("p-4 text-center", pack.popular && "border-primary/40")}>
                {pack.popular && <Badge className="mb-2 text-[10px]">最划算</Badge>}
                <p className="text-2xl font-bold">{pack.credits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-1">积分</p>
                {pack.bonus > 0 && <p className="text-[10px] text-emerald-500 mb-2">+{pack.bonus} 赠送</p>}
                <p className="text-lg font-bold mb-3">¥{pack.price}</p>
                <Button size="sm" className="w-full" onClick={() => handleBuyCredits(pack.id)}>购买</Button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <GlassCard className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            账单记录
          </h3>
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <Download className="h-3 w-3" />导出全部
          </Button>
        </div>
        <div className="space-y-2">
          {invoices.map((inv) => (
            <div key={inv.id} className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/30 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Receipt className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{inv.plan}</p>
                <p className="text-xs text-muted-foreground">{inv.id} · {inv.date}</p>
              </div>
              <span className="text-sm font-medium">{inv.amount}</span>
              <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">已支付</Badge>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
