"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  Mic,
  Send,
  Loader2,
  User,
  Bot,
  Code2,
  Brain,
  MessageSquare,
  Trophy,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const interviewTypes = [
  { id: "tech", label: "技术面", icon: Code2, desc: "前端原理、框架、工程化" },
  { id: "hr", label: "HR 面", icon: User, desc: "行为面试、自我介绍" },
  { id: "project", label: "项目面", icon: Brain, desc: "项目深挖、技术决策" },
  { id: "system", label: "系统设计", icon: MessageSquare, desc: "架构设计、技术选型" },
];

export function InterviewChatView() {
  const aiConfig = useAIConfig();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("tech");
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startInterview = async () => {
    setStarted(true);
    setMessages([]);
    setRound(0);
    setLoading(true);
    try {
      const res = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "你好，我准备好了，请开始面试" }],
          interviewType: selectedType,
          role: "前端工程师",
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      setMessages([{ id: Date.now().toString(), role: "assistant", content: data.content }]);
    } catch {
      toast.error("面试官启动失败");
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setRound((r) => r + 1);

    try {
      const res = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          interviewType: selectedType,
          role: "前端工程师",
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: data.content }]);
    } catch {
      toast.error("请求失败");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStarted(false);
    setMessages([]);
    setRound(0);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <SectionHeader
        title="AI 面试官对话"
        subtitle="多轮对话面试，AI 实时追问与评分"
        icon={<Mic className="h-5 w-5" />}
        action={
          started && (
            <Button variant="outline" size="sm" className="gap-2" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              重新开始
            </Button>
          )
        }
      />

      {!started ? (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    selectedType === type.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 bg-card/30 hover:border-primary/30"
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-2", selectedType === type.id ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-sm font-medium">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{type.desc}</p>
                </motion.button>
              );
            })}
          </div>
          <div className="flex justify-center">
            <Button size="lg" className="gap-2" onClick={startInterview}>
              <Sparkles className="h-4 w-4" />
              开始面试
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col overflow-hidden">
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="secondary" className="gap-1">
              <Bot className="h-3 w-3" />
              {interviewTypes.find((t) => t.id === selectedType)?.label} 面试官
            </Badge>
            <Badge variant="outline" className="text-xs">第 {round} 轮</Badge>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    msg.role === "user" ? "bg-accent" : "bg-gradient-to-br from-primary to-violet"
                  )}>
                    {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                  </div>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap",
                    msg.role === "user" ? "bg-primary text-primary-foreground" : "glass"
                  )}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="glass rounded-2xl px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="输入你的回答... (Enter 发送, Shift+Enter 换行)"
              className="min-h-[60px] max-h-[120px] resize-none"
              disabled={loading}
            />
            <Button size="icon" className="h-[60px] w-[60px] shrink-0" onClick={send} disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
