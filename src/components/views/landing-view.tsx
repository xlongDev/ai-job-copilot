"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  Zap,
  Brain,
  Target,
  FileText,
  ScanLine,
  Bot,
  Mic,
  BarChart3,
  Check,
  Star,
  TrendingUp,
  Shield,
  Globe,
  Command,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { AuroraBackground } from "@/components/shared/aurora-background";
import { AnimatedCounter } from "@/components/shared/animated-counter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Bot,
    title: "AI Job Agent",
    desc: "输入目标，AI 自动完成 JD 分析、简历优化、求职信生成、面试准备、学习计划——整个求职闭环。",
    accent: "from-emerald-500/20 to-emerald-500/0",
    badge: "V1 核心",
  },
  {
    icon: ScanLine,
    title: "ATS 智能扫描",
    desc: "实时检测简历的 ATS 兼容性，10 项维度评分，雷达图可视化，编辑时自动刷新。",
    accent: "from-violet-500/20 to-violet-500/0",
  },
  {
    icon: FileText,
    title: "Cursor 风格优化",
    desc: "左侧原文、右侧优化、中间 Diff。Accept / Reject / Regenerate，像代码审查一样优化简历。",
    accent: "from-amber-500/20 to-amber-500/0",
  },
  {
    icon: Target,
    title: "JD 精准匹配",
    desc: "上传 JD，AI 自动解析岗位要求，输出匹配率、缺失技能、缺失关键词，一键优化。",
    accent: "from-emerald-500/20 to-emerald-500/0",
  },
  {
    icon: Mic,
    title: "AI 模拟面试",
    desc: "生成 HR、技术、项目、算法、行为 5 类问题，AI 实时评分，支持语音和视频面试。",
    accent: "from-violet-500/20 to-violet-500/0",
  },
  {
    icon: BarChart3,
    title: "全链路数据分析",
    desc: "ATS 趋势、投递漏斗、面试转化、技能成长、学习热力图——用数据驱动求职决策。",
    accent: "from-amber-500/20 to-amber-500/0",
  },
];

const stats = [
  { value: 50000, suffix: "+", label: "活跃用户" },
  { value: 1200000, suffix: "+", label: "AI 优化次数" },
  { value: 87, suffix: "%", label: "平均 ATS 提升" },
  { value: 3.2, suffix: "x", label: "面试通过率", decimals: 1 },
];

const workflow = [
  { step: "01", title: "职业规划", desc: "AI 分析你的现状与目标" },
  { step: "02", title: "简历优化", desc: "STAR 法则 + 量化成果" },
  { step: "03", title: "ATS 扫描", desc: "确保通过筛选系统" },
  { step: "04", title: "JD 匹配", desc: "精准定位缺失技能" },
  { step: "05", title: "模拟面试", desc: "AI 实战演练" },
  { step: "06", title: "投递追踪", desc: "看板式管理" },
  { step: "07", title: "Offer 分析", desc: "数据驱动决策" },
];

const testimonials = [
  {
    name: "Sarah Liu",
    role: "前端工程师 → Meta",
    content: "用了一周，ATS 从 62 提升到 91，拿到 3 个大厂面试。AI Job Agent 简直是求职作弊器。",
    avatar: "SL",
  },
  {
    name: "David Wang",
    role: "应届生 → 字节跳动",
    content: "模拟面试功能太强了，AI 问的问题和真实面试几乎一样。最终拿到字节 SP Offer。",
    avatar: "DW",
  },
  {
    name: "Emma Zhang",
    role: "产品经理 → 美团",
    content: "JD 匹配功能帮我精准定位短板，学习路线让我 2 个月补齐了所有缺失技能。",
    avatar: "EZ",
  },
];

const pricing = [
  {
    name: "Free",
    price: "¥0",
    period: "永久免费",
    desc: "适合初次体验",
    features: ["3 次 AI 优化/天", "基础 ATS 扫描", "1 份简历", "社区支持"],
    cta: "开始使用",
    highlight: false,
  },
  {
    name: "Pro",
    price: "¥99",
    period: "/月",
    desc: "求职冲刺必备",
    features: [
      "无限 AI 优化",
      "AI Job Agent 自动化",
      "无限简历 & 版本管理",
      "模拟面试（含语音）",
      "全链路数据分析",
      "优先支持",
    ],
    cta: "升级 Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "¥299",
    period: "/人/月",
    desc: "团队协作版",
    features: ["Pro 全部功能", "团队共享知识库", "批量简历管理", "API 接入", "专属客户成功"],
    cta: "联系销售",
    highlight: false,
  },
];

export function LandingView() {
  const { enterApp } = useAppStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-background">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex w-full items-center justify-between px-6 py-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold">AI Job Copilot</span>
          <Badge variant="secondary" className="ml-2 text-[10px]">V1</Badge>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">功能</a>
          <a href="#workflow" className="text-sm text-muted-foreground hover:text-foreground">工作流</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">价格</a>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => enterApp("dashboard")}>
            登录
          </Button>
          <Button size="sm" onClick={() => enterApp("dashboard")} className="gap-2">
            免费开始
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-20">
        <AuroraBackground variant="intense" />
        <div className="absolute inset-0 grid-pattern opacity-30" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-5xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary pulse-dot" />
            <span className="text-muted-foreground">全新 V1 Enterprise Edition 已发布</span>
            <Badge variant="secondary" className="text-[10px]">NEW</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight md:text-7xl"
          >
            让 AI 成为你的
            <br />
            <span className="text-gradient">职业教练</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
          >
            覆盖整个求职流程的 AI 智能工作台。从职业规划到 Offer 分析，
            <span className="text-foreground"> AI Job Agent </span>
            自动完成整个求职闭环。
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={() => enterApp("dashboard")}
              className="group h-12 gap-2 px-8 text-base glow-emerald"
            >
              <Zap className="h-4 w-4" />
              立即体验
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => enterApp("agent")}
              className="h-12 gap-2 px-8 text-base"
            >
              <Bot className="h-4 w-4" />
              查看 AI Agent
            </Button>
          </motion.div>

          {/* Command hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <kbd className="flex items-center gap-1 rounded border border-border bg-muted px-2 py-1">
              <Command className="h-3 w-3" />K
            </kbd>
            <span>打开命令面板，快速访问所有功能</span>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight md:text-4xl">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    decimals={stat.decimals || 0}
                  />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <Badge variant="secondary" className="mb-4">功能矩阵</Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              一个平台，覆盖
              <span className="text-gradient"> 整个求职闭环</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              不是简单的简历优化器，而是你的 AI 职业教练
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/30"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    {feature.badge && (
                      <Badge className="mb-2 absolute right-0 top-0" variant="secondary">
                        {feature.badge}
                      </Badge>
                    )}
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative px-6 py-32">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <Badge variant="secondary" className="mb-4">求职工作流</Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              从规划到 Offer，
              <span className="text-gradient"> 7 步搞定</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
            {workflow.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm"
              >
                <div className="mb-2 text-xs font-bold text-primary">{item.step}</div>
                <div className="text-sm font-semibold">{item.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.desc}</div>
                {i < workflow.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/40 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <Badge variant="secondary" className="mb-4">用户评价</Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              他们都拿到了
              <span className="text-gradient"> Dream Offer</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-foreground/90">"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet to-primary text-xs font-semibold text-white">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative px-6 py-32">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <Badge variant="secondary" className="mb-4">价格方案</Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              选择适合你的
              <span className="text-gradient"> 套餐</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">先免费体验，满意再升级</p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pricing.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl border p-6 backdrop-blur-sm ${
                  plan.highlight
                    ? "border-primary/50 bg-primary/5 glow-emerald"
                    : "border-border/50 bg-card/50"
                }`}
              >
                {plan.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    最受欢迎
                  </Badge>
                )}
                <div className="mb-1 text-sm font-medium text-muted-foreground">{plan.name}</div>
                <div className="mb-1 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
                <div className="mb-6 text-sm text-muted-foreground">{plan.desc}</div>
                <Button
                  className="mb-6 w-full"
                  variant={plan.highlight ? "default" : "outline"}
                  onClick={() => enterApp("dashboard")}
                >
                  {plan.cta}
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="secondary" className="mb-4 gap-1">
              <Sparkles className="h-3 w-3" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              常见问题
            </h2>
            <p className="mt-2 text-muted-foreground">关于 AI Job Copilot 的一切</p>
          </motion.div>

          <div className="space-y-3">
            {[
              { q: "AI Job Copilot 和其他简历优化工具有什么区别？", a: "我们不仅优化简历，而是覆盖整个求职闭环：职业规划→技能分析→学习路线→简历制作→ATS优化→JD匹配→模拟面试→投递管理→Offer分析。AI Job Agent 可以自动完成整个流程。" },
              { q: "支持哪些 AI 模型？", a: "支持 7 个 AI Provider：ZAI（默认免Key）、OpenAI、Claude、Gemini、DeepSeek、Qwen、OpenRouter。你可以在设置中自由切换，也可以使用自己的 API Key。" },
              { q: "我的数据安全吗？", a: "所有数据存储在本地 SQLite 数据库，API Key 加密存储在浏览器 localStorage，不上传服务器。我们不会访问你的任何数据。" },
              { q: "ATS 扫描的准确度如何？", a: "我们的 ATS 算法基于 10 个维度真实分析：标题结构、关键词覆盖、内容长度、量化数据、行动动词、技能多样性、项目经验、格式兼容性、联系方式、教育经历。" },
              { q: "可以免费使用吗？", a: "Free 套餐永久免费，包含每月 50 次 AI 对话和 1 份简历。Pro 套餐 ¥99/月，提供无限 AI 对话和全部功能。" },
              { q: "支持多语言吗？", a: "支持 6 种语言：中文、English、日本語、한국어、Deutsch、Français。专业本地化，非机器翻译。" },
            ].map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-xl border border-border/50 bg-card/30 p-4 transition hover:border-primary/30"
              >
                <summary className="flex cursor-pointer items-center justify-between text-sm font-medium">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="relative px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="secondary" className="mb-4 gap-1">
              <TrendingUp className="h-3 w-3" />
              对比
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              为什么选择 AI Job Copilot？
            </h2>
            <p className="mt-2 text-muted-foreground">与同类产品的详细对比</p>
          </motion.div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-3 text-left font-medium text-muted-foreground">功能</th>
                  <th className="py-3 text-center font-bold text-primary">AI Job Copilot</th>
                  <th className="py-3 text-center text-muted-foreground">普通简历优化器</th>
                  <th className="py-3 text-center text-muted-foreground">求职平台</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "AI Job Agent 自动化", us: true, others: false, platform: false },
                  { feature: "多 Agent 协作架构", us: true, others: false, platform: false },
                  { feature: "LangGraph 工作流编排", us: true, others: false, platform: false },
                  { feature: "ATS 10 维度真实算法", us: true, others: false, platform: false },
                  { feature: "Cursor 风格 Diff 优化", us: true, others: false, platform: false },
                  { feature: "AI 语音/视频面试", us: true, others: false, platform: false },
                  { feature: "RAG 私人知识库", us: true, others: false, platform: false },
                  { feature: "MCP 协议集成", us: true, others: false, platform: false },
                  { feature: "浏览器 Agent", us: true, others: false, platform: false },
                  { feature: "多 AI Provider 切换", us: true, others: false, platform: false },
                  { feature: "插件系统", us: true, others: false, platform: false },
                  { feature: "团队协作", us: true, others: false, platform: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="py-3 text-left">{row.feature}</td>
                    <td className="py-3 text-center">
                      {row.us ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 text-center">
                      {row.others ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 text-center">
                      {row.platform ? <Check className="mx-auto h-4 w-4 text-emerald-500" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-6 py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-violet/10 p-12 text-center backdrop-blur-xl"
          >
            <AuroraBackground variant="intense" />
            <div className="relative">
              <Brain className="mx-auto mb-6 h-12 w-12 text-primary" />
              <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                准备好让 AI
                <br />
                <span className="text-gradient">重塑你的求职了吗？</span>
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
                加入 50,000+ 求职者，用 AI 拿到 Dream Offer
              </p>
              <Button
                size="lg"
                onClick={() => enterApp("dashboard")}
                className="group h-12 gap-2 px-8 text-base glow-emerald"
              >
                <Sparkles className="h-4 w-4" />
                免费开始
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-medium">AI Job Copilot</span>
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> SOC2 合规</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> 全球可用</span>
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> 99.9% SLA</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
