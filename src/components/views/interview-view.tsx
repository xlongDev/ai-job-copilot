"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {  MessageSquare,
  Code2,
  Brain,
  User,
  Play,
  Loader2,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
  Send,
  Clock,
  TrendingUp,
  AlertCircle,
  Keyboard,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Phase = "select" | "answering" | "evaluating" | "result";

interface Question {
  id: string;
  question: string;
  hint: string;
  difficulty: string;
  category: string;
}

interface Evaluation {
  scores: {
    expression: number;
    logic: number;
    professional: number;
    star: number;
    communication: number;
  };
  feedback: string;
  strengths: string[];
  improvements: string[];
}

const interviewTypes = [
  { id: "hr", label: "HR 面", icon: User, desc: "行为面试、自我介绍、薪资谈判", color: "emerald" },
  { id: "tech", label: "技术面", icon: Code2, desc: "前端原理、框架、工程化", color: "violet" },
  { id: "project", label: "项目面", icon: Brain, desc: "项目深挖、技术决策", color: "amber" },
  { id: "algo", label: "算法面", icon: Code2, desc: "数据结构、算法题", color: "emerald" },
  { id: "behavior", label: "行为面", icon: MessageSquare, desc: "STAR 法则、领导力", color: "violet" },
  { id: "system", label: "系统设计", icon: Brain, desc: "架构设计、技术选型", color: "amber" },
];

const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
};

export function InterviewView() {
  const aiConfig = useAIConfig();
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number; byType: Record<string, number> } | null>(null);
  const [allEvaluations, setAllEvaluations] = useState<{ question: string; answer: string; evaluation: Evaluation }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch question bank stats on mount
  useEffect(() => {
    fetch("/api/interview-questions-bank")
      .then((r) => r.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  // Timer
  useEffect(() => {
    if (phase === "answering") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const startInterview = async (type: string) => {
    setSelectedType(type);
    setLoading(true);
    try {
      const res = await fetch(`/api/interview-questions-bank?type=${type}&limit=5`);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setPhase("answering");
        setAllEvaluations([]);
        toast.success(`已加载 ${data.questions.length} 道面试题`);
      } else {
        toast.error("该类型暂无面试题");
      }
    } catch {
      toast.error("加载面试题失败");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim() || answer.trim().length < 10) {
      toast.error("请输入至少 10 个字的回答");
      return;
    }

    setPhase("evaluating");
    try {
      const res = await fetch("/api/interview-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questions[currentIdx].question,
          answer,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setAllEvaluations((prev) => [
          ...prev,
          { question: questions[currentIdx].question, answer, evaluation: data.evaluation },
        ]);
        setPhase("result");
      } else {
        throw new Error("Evaluation failed");
      }
    } catch {
      toast.error("AI 评分失败，请重试");
      setPhase("answering");
    }
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setAnswer("");
      setEvaluation(null);
      setPhase("answering");
    } else {
      // Save interview record to database
      void saveInterviewRecord();
      toast.success("面试完成！", { description: `共完成 ${questions.length} 道题` });
      setPhase("select");
    }
  };

  const saveInterviewRecord = async () => {
    try {
      const overallScore = allEvaluations.length > 0
        ? Math.round(allEvaluations.reduce((sum, e) => {
            const scores = Object.values(e.evaluation.scores);
            return sum + scores.reduce((a, b) => a + b, 0) / scores.length;
          }, 0) / allEvaluations.length)
        : 0;

      await fetch("/api/interview-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          questions: questions.map((q) => ({ question: q.question, hint: q.hint })),
          answers: allEvaluations.map((e) => ({ question: e.question, answer: e.answer })),
          scores: allEvaluations[0]?.evaluation.scores || null,
          overallScore,
          duration: elapsed,
          feedback: allEvaluations[0]?.evaluation.feedback || null,
        }),
      });
    } catch {
      // silent fail
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const avgScore = allEvaluations.length > 0
    ? Math.round(
        allEvaluations.reduce((sum, e) => {
          const scores = Object.values(e.evaluation.scores);
          return sum + scores.reduce((s, v) => s + v, 0) / scores.length;
        }, 0) / allEvaluations.length
      )
    : 0;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="模拟面试"
        subtitle="打字回答真实面试题，AI 实时评分"
        icon={<MessageSquare className="h-5 w-5" />}
      />

      <AnimatePresence mode="wait">
        {/* Phase 1: Select interview type */}
        {phase === "select" && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Stats */}
            {stats && (
              <GlassCard className="p-4">
                <div className="flex items-center gap-6 overflow-x-auto">
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">真实面试题</p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="shrink-0 text-center">
                      <p className="text-lg font-semibold">{count}</p>
                      <p className="text-xs text-muted-foreground">
                        {interviewTypes.find((t) => t.id === type)?.label || type}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Type selection */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {interviewTypes.map((type, i) => {
                const Icon = type.icon;
                const c = colorClasses[type.color];
                const count = stats?.byType[type.id] || 0;
                return (
                  <motion.div
                    key={type.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard
                      hover
                      className="cursor-pointer p-5"
                      onClick={() => !loading && startInterview(type.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", c.bg, c.text)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{count} 题</Badge>
                      </div>
                      <h3 className="text-sm font-medium mb-1">{type.label}</h3>
                      <p className="text-xs text-muted-foreground">{type.desc}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full gap-1"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                        开始面试
                      </Button>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Phase 2: Answering */}
        {phase === "answering" && questions[currentIdx] && (
          <motion.div
            key="answering"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Progress bar */}
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="default">
                    第 {currentIdx + 1} / {questions.length} 题
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {interviewTypes.find((t) => t.id === selectedType)?.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px]",
                      questions[currentIdx].difficulty === "hard" && "border-rose-500/30 text-rose-500",
                      questions[currentIdx].difficulty === "medium" && "border-amber-500/30 text-amber-500",
                      questions[currentIdx].difficulty === "easy" && "border-emerald-500/30 text-emerald-500"
                    )}
                  >
                    {questions[currentIdx].difficulty === "hard" ? "困难" : questions[currentIdx].difficulty === "medium" ? "中等" : "简单"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(elapsed)}
                </div>
              </div>
              <Progress value={((currentIdx + 1) / questions.length) * 100} className="h-1.5" />
            </GlassCard>

            {/* Question */}
            <GlassCard className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">面试问题</p>
                  <p className="text-base font-medium leading-relaxed">{questions[currentIdx].question}</p>
                  {questions[currentIdx].hint && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <span className="text-amber-500 font-medium">考察点：</span>
                        {questions[currentIdx].hint}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Answer input */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">输入你的回答</span>
                </div>
                <span className="text-xs text-muted-foreground">{answer.length} 字</span>
              </div>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="在这里输入你的回答...建议使用 STAR 法则（情境、任务、行动、结果）结构化表达，包含具体量化数据。"
                className="min-h-[200px] resize-y"
                autoFocus
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  💡 提示：回答越具体、越量化，评分越高
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPhase("select")}>
                    退出
                  </Button>
                  <Button size="sm" className="gap-2" onClick={submitAnswer} disabled={answer.trim().length < 10}>
                    <Send className="h-3.5 w-3.5" />
                    提交回答
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Phase 3: Evaluating */}
        {phase === "evaluating" && (
          <motion.div
            key="evaluating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-sm font-medium">AI 正在评估你的回答...</p>
            <p className="text-xs text-muted-foreground mt-1">分析表达能力、逻辑思维、专业能力等 5 个维度</p>
          </motion.div>
        )}

        {/* Phase 4: Result */}
        {phase === "result" && evaluation && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score overview */}
            <GlassCard className="p-6">
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <ScoreRing
                  value={Math.round(
                    Object.values(evaluation.scores).reduce((a, b) => a + b, 0) /
                      Object.values(evaluation.scores).length
                  )}
                  size={120}
                  label="综合评分"
                  color="emerald"
                />
                <div className="flex-1 w-full">
                  <h3 className="text-sm font-medium mb-3">维度评分</h3>
                  <div className="space-y-2">
                    {Object.entries(evaluation.scores).map(([key, score]) => (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {key === "expression" ? "表达能力" :
                             key === "logic" ? "逻辑思维" :
                             key === "professional" ? "专业能力" :
                             key === "star" ? "STAR 结构" :
                             key === "communication" ? "沟通能力" : key}
                          </span>
                          <span className="font-medium">{score}</span>
                        </div>
                        <Progress value={score} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Feedback */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                AI 反馈
              </h3>
              <p className="text-sm text-muted-foreground mb-4">{evaluation.feedback}</p>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <p className="text-xs font-medium text-emerald-500 mb-2">✓ 优点</p>
                  <ul className="space-y-1">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs font-medium text-amber-500 mb-2">↑ 改进建议</p>
                  <ul className="space-y-1">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <TrendingUp className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>

            {/* Your answer */}
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-2">你的回答</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{answer}</p>
            </GlassCard>

            {/* Actions */}
            <div className="flex justify-center gap-3">
              <Button variant="outline" className="gap-2" onClick={() => setPhase("select")}>
                <RotateCcw className="h-4 w-4" />
                重新选择
              </Button>
              <Button className="gap-2" onClick={nextQuestion}>
                {currentIdx < questions.length - 1 ? (
                  <>下一题 <ChevronRight className="h-4 w-4" /></>
                ) : (
                  <><CheckCircle2 className="h-4 w-4" /> 完成面试</>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History */}
      {phase === "select" && allEvaluations.length > 0 && (
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">本次面试记录</h3>
            <Badge variant="secondary">{allEvaluations.length} 题</Badge>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <ScoreRing value={avgScore} size={80} label="平均分" color="violet" />
            <div className="flex-1 space-y-1">
              {allEvaluations.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground shrink-0">Q{i + 1}</span>
                  <span className="truncate flex-1">{e.question}</span>
                  <Badge variant="outline" className="text-[10px]">
                    {Math.round(Object.values(e.evaluation.scores).reduce((a, b) => a + b, 0) / 5)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
