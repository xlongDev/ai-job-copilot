"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  Mic,
  Plus,
  Trash2,
  Bot,
  User,
  Loader2,
  Code2,
  FileText,
  Copy,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAIConfig } from "@/hooks/use-ai-config";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

const suggestedPrompts = [
  { icon: FileText, text: "帮我优化简历的项目经历", color: "emerald" },
  { icon: Code2, text: "前端面试常考的 React 原理题", color: "violet" },
  { icon: Sparkles, text: "分析我适合什么技术方向", color: "amber" },
  { icon: Bot, text: "制定 3 个月求职计划", color: "emerald" },
];

export function ChatView() {
  const aiConfig = useAIConfig();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是你的 AI 职业教练。我可以帮你优化简历、准备面试、分析岗位匹配度、制定职业规划。\n\n你可以直接提问，或选择下方的建议开始对话。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<{ id: string; title: string; updatedAt: string }[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chat sessions on mount
  useEffect(() => {
    fetch("/api/chat-sessions")
      .then((r) => r.json())
      .then((data) => {
        if (data.sessions) {
          setSessions(data.sessions.map((s: { id: string; title: string; updatedAt: string }) => ({
            id: s.id,
            title: s.title,
            updatedAt: s.updatedAt,
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-save session when messages change (debounced)
  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setTimeout(() => {
      const title = messages.find((m) => m.role === "user")?.content.slice(0, 30) || "新对话";
      fetch("/api/chat-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentSessionId,
          title,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          provider: aiConfig.provider,
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.session && !currentSessionId) {
            setCurrentSessionId(data.session.id);
          }
        })
        .catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [messages, currentSessionId, aiConfig.provider]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadSession = async (sessionId: string) => {
    try {
      const allRes = await fetch("/api/chat-sessions");
      const data = await allRes.json();
      const session = data.sessions?.find((s: { id: string; messages?: unknown }) => s.id === sessionId);
      if (session && session.messages) {
        const msgs = typeof session.messages === "string" ? JSON.parse(session.messages) : session.messages;
        setMessages(msgs.map((m: { role: string; content: string }, i: number) => ({
          id: `${sessionId}-${i}`,
          role: m.role as "user" | "assistant",
          content: m.content,
        })));
        setCurrentSessionId(sessionId);
      }
    } catch {
      toast.error("加载对话失败");
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/chat-sessions?id=${sessionId}`, { method: "DELETE" });
      setSessions((s) => s.filter((x) => x.id !== sessionId));
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: "你好！我是你的 AI 职业教练。我可以帮你优化简历、准备面试、分析岗位匹配度、制定职业规划。\n\n你可以直接提问，或选择下方的建议开始对话。",
        }]);
      }
      toast.success("对话已删除");
    } catch {
      toast.error("删除失败");
    }
  };

  const send = async (text?: string) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();

      // Simulate streaming
      const fullText = data.content;
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: fullText.slice(0, i), streaming: i < fullText.length }
              : msg
          )
        );
        if (i >= fullText.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 20);
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: "抱歉，AI 服务暂时不可用。请稍后重试。",
                streaming: false,
              }
            : msg
        )
      );
      setLoading(false);
      toast.error("请求失败");
    }
  };

  const regenerateMessage = async (messageId: string) => {
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex < 0) return;

    // Get messages up to the assistant message (exclude it)
    const contextMessages = messages.slice(0, msgIndex);
    if (contextMessages.length === 0) return;

    // Remove the old assistant message
    setMessages((m) => m.filter((msg) => msg.id !== messageId));
    setLoading(true);

    const assistantId = Date.now().toString();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: contextMessages.map((m) => ({ role: m.role, content: m.content })),
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();

      const fullText = data.content;
      let i = 0;
      const interval = setInterval(() => {
        i += 3;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: fullText.slice(0, i), streaming: i < fullText.length }
              : msg
          )
        );
        if (i >= fullText.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 20);
    } catch {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: "重新生成失败，请重试。", streaming: false }
            : msg
        )
      );
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar - History */}
      <div className="hidden w-64 shrink-0 border-r border-border/50 p-3 lg:block">
        <Button
          className="w-full gap-2 mb-3"
          variant="outline"
          onClick={() => {
            setMessages([messages[0]]);
            setCurrentSessionId(null);
          }}
        >
          <Plus className="h-4 w-4" />
          新对话
        </Button>
        <div className="space-y-1">
          <p className="px-2 text-xs text-muted-foreground mb-2">历史对话</p>
          {sessions.length === 0 && (
            <p className="px-2 py-4 text-xs text-muted-foreground/50 text-center">暂无历史对话</p>
          )}
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={cn(
                "group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-accent",
                currentSessionId === s.id && "bg-accent"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate">{s.title}</span>
              <Trash2
                className="h-3 w-3 opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-rose-500"
                onClick={(e) => {
                  e.stopPropagation();
                  void deleteSession(s.id);
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="border-b border-border/50 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">AI 职业教练</p>
              <p className="text-[10px] text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                在线 · 已加载你的简历上下文
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            GPT-4o
          </Badge>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-6 py-6">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3", msg.role === "user" && "flex-row-reverse")}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  msg.role === "user"
                    ? "bg-accent"
                    : "bg-gradient-to-br from-primary to-violet"
                )}>
                  {msg.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 group relative",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass"
                )}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={msg.content} streaming={msg.streaming} />
                  </div>
                  {/* Message Actions */}
                  {msg.role === "assistant" && !msg.streaming && msg.content && (
                    <div className="mt-2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => {
                          void navigator.clipboard?.writeText(msg.content);
                          toast.success("已复制到剪贴板");
                        }}
                        className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                        复制
                      </button>
                      <button
                        onClick={() => regenerateMessage(msg.id)}
                        className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-muted-foreground transition hover:bg-accent hover:text-foreground"
                      >
                        <RefreshCw className="h-3 w-3" />
                        重新生成
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-3 pt-4">
                {suggestedPrompts.map((p, i) => {
                  const Icon = p.icon;
                  return (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      onClick={() => send(p.text)}
                      className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 text-left transition hover:border-primary/30 hover:bg-accent/50"
                    >
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        p.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                        p.color === "violet" && "bg-violet-500/10 text-violet-500",
                        p.color === "amber" && "bg-amber-500/10 text-amber-500",
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm">{p.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-end gap-2 rounded-2xl border border-border/50 bg-card/50 p-2 focus-within:border-primary/30">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
                className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0"
                rows={1}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <Mic className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => send()}
                disabled={loading || !input.trim()}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              AI 可能会出错，请核实重要信息。上下文：简历 + JD + 学习记录
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarkdownRenderer({ content, streaming }: { content: string; streaming?: boolean }) {
  // Parse content into blocks (code blocks, tables, and regular lines)
  const blocks: { type: "code" | "table" | "text"; content: string; lang?: string }[] = [];
  const lines = content.split("\n");
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push({ type: "code", content: codeLines.join("\n"), lang });
    }
    // Table (line starts with | and next line is separator)
    else if (line.startsWith("|") && i + 1 < lines.length && lines[i + 1].startsWith("|") && lines[i + 1].includes("-")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "table", content: tableLines.join("\n") });
    }
    // Regular text
    else {
      blocks.push({ type: "text", content: line });
      i++;
    }
  }

  return (
    <div className="text-sm leading-relaxed">
      {blocks.map((block, idx) => {
        if (block.type === "code") {
          return (
            <div key={idx} className="my-2 overflow-hidden rounded-lg border border-border/50 bg-[oklch(0.15_0_0)]">
              {block.lang && (
                <div className="flex items-center justify-between border-b border-border/30 px-3 py-1.5">
                  <span className="text-[10px] font-medium text-muted-foreground">{block.lang}</span>
                  <button
                    onClick={() => {
                      void navigator.clipboard?.writeText(block.content);
                      toast.success("代码已复制");
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition"
                  >
                    复制
                  </button>
                </div>
              )}
              <pre className="overflow-x-auto p-3 text-xs">
                <code className="font-mono text-[oklch(0.85_0_0)]">{block.content}</code>
              </pre>
            </div>
          );
        }
        if (block.type === "table") {
          const tableLines = block.content.split("\n");
          const headers = tableLines[0].split("|").filter((c) => c.trim());
          const rows = tableLines.slice(2).map((r) => r.split("|").filter((c) => c.trim()));
          return (
            <div key={idx} className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/50">
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-1.5 text-left font-medium text-foreground">{h.trim()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, ri) => (
                    <tr key={ri} className="border-b border-border/30">
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-1.5 text-muted-foreground">{cell.trim()}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        // Text block
        const line = block.content;
        if (line.startsWith("### ")) {
          return <h3 key={idx} className="mt-3 mb-1 text-base font-semibold">{line.slice(4)}</h3>;
        }
        if (line.startsWith("## ")) {
          return <h2 key={idx} className="mt-3 mb-1 text-lg font-semibold">{line.slice(3)}</h2>;
        }
        if (line.startsWith("# ")) {
          return <h1 key={idx} className="mt-3 mb-1 text-xl font-bold">{line.slice(2)}</h1>;
        }
        if (line.startsWith("> ")) {
          return <blockquote key={idx} className="my-1 border-l-2 border-primary/40 pl-3 text-muted-foreground italic">{line.slice(2)}</blockquote>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return <div key={idx} className="flex gap-2 ml-2"><span className="text-primary">•</span><span>{renderInline(line.slice(2))}</span></div>;
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)?.[1];
          return <div key={idx} className="flex gap-2 ml-2"><span className="text-primary font-medium">{num}.</span><span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span></div>;
        }
        if (line === "") {
          return <div key={idx} className="h-2" />;
        }
        return <p key={idx} className="mb-1">{renderInline(line)}{streaming && idx === blocks.length - 1 && <span className="typing-cursor" />}</p>;
      })}
    </div>
  );
}

function renderInline(text: string) {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="rounded bg-accent px-1 py-0.5 text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
