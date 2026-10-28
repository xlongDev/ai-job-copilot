"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Phone,
  PhoneOff,
  Radio,
  Clock,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Brain,
  Gauge,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Phase = "idle" | "listening" | "thinking" | "speaking" | "done";

interface TranscriptEntry {
  role: "ai" | "user";
  text: string;
  time: string;
}

// Real speech analysis algorithm
interface SpeechMetrics {
  fluency: number;       // 流利度: based on words per minute vs ideal range
  pace: number;          // 语速: words per minute
  confidence: number;    // 自信度: based on filler words ratio & pauses
  clarity: number;       // 清晰度: based on avg word length & sentence structure
  fillerCount: number;   // 填充词数量
  silenceRatio: number;  // 沉默比例
  wordCount: number;
  duration: number;      // seconds
}

const FILLER_WORDS = [
  "嗯", "啊", "那个", "这个", "就是", "然后", "其实", " basically",
  "um", "uh", "like", "you know", "i mean", "sort of", "kind of",
  "あの", "えー", "その",
];

function analyzeSpeech(text: string, durationSec: number): SpeechMetrics {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const durationMin = durationSec / 60;
  const wpm = durationMin > 0 ? wordCount / durationMin : 0;

  // Count filler words
  const lowerText = text.toLowerCase();
  let fillerCount = 0;
  for (const filler of FILLER_WORDS) {
    const matches = lowerText.match(new RegExp(filler, "gi"));
    if (matches) fillerCount += matches.length;
  }

  // Fluency: ideal WPM is 120-180 for Chinese, 130-170 for English
  const idealWpm = 150;
  const wpmDiff = Math.abs(wpm - idealWpm);
  const fluency = Math.max(0, Math.min(100, 100 - (wpmDiff / idealWpm) * 80));

  // Pace score: how close to ideal
  const pace = Math.max(0, Math.min(100, 100 - (wpmDiff / 100) * 50));

  // Confidence: fewer fillers = higher confidence
  const fillerRatio = wordCount > 0 ? fillerCount / wordCount : 0;
  const confidence = Math.max(0, Math.min(100, 100 - fillerRatio * 300));

  // Clarity: based on average sentence length (ideal 10-20 words)
  const sentences = text.split(/[。.!?！？\n]/).filter((s) => s.trim().length > 0);
  const avgSentenceLen = sentences.length > 0 ? wordCount / sentences.length : wordCount;
  const clarityDiff = Math.abs(avgSentenceLen - 15);
  const clarity = Math.max(0, Math.min(100, 100 - clarityDiff * 3));

  // Silence ratio (estimated based on WPM vs expected)
  const expectedWords = durationSec * (150 / 60); // expected words at 150 WPM
  const silenceRatio = wordCount > 0 ? Math.max(0, Math.min(100, ((expectedWords - wordCount) / expectedWords) * 100)) : 0;

  return {
    fluency: Math.round(fluency),
    pace: Math.round(pace),
    confidence: Math.round(confidence),
    clarity: Math.round(clarity),
    fillerCount,
    silenceRatio: Math.round(silenceRatio),
    wordCount,
    duration: durationSec,
  };
}

const DEFAULT_QUESTIONS = [
  "请做一个简短的自我介绍，重点突出你的技术亮点。",
  "你遇到过最有挑战性的技术问题是什么？如何解决的？",
  "讲一个你和团队意见不一致的经历，你是怎么处理的？",
  "如果让你设计一个前端监控系统，你会怎么做？",
  "你对 React 18 的并发特性有什么理解？",
];

// Web Speech API 未包含在 TS DOM lib 中，这里补最小类型
interface SpeechRecognitionAlternative {
  transcript: string;
}
interface SpeechRecognitionResult {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
}
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResult };
}
interface SpeechRecognitionErrorEvent {
  error: string;
}
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function VoiceInterviewView() {
  const aiConfig = useAIConfig();
  const [phase, setPhase] = useState<Phase>("idle");
  const [muted, setMuted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [metrics, setMetrics] = useState<SpeechMetrics | null>(null);
  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [interimText, setInterimText] = useState("");

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const listenStartRef = useRef<number>(0);
  const fullTextRef = useRef<string>("");

  // Timer
  useEffect(() => {
    if (phase === "listening" || phase === "speaking" || phase === "thinking") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Audio level monitoring
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext };
      const AudioCtor = window.AudioContext ?? audioWindow.webkitAudioContext;
      if (!AudioCtor) {
        toast.error("浏览器不支持 Web Audio API");
        return;
      }
      const audioContext = new AudioCtor();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const update = () => {
        if (phase !== "listening") return;
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(1, avg / 128));
        requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.error("Audio monitoring failed:", err);
    }
  }, [phase]);

  const stopAudioMonitoring = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Speech recognition setup
  const startListening = useCallback(async () => {
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SpeechRecognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("浏览器不支持语音识别", { description: "请使用 Chrome 或 Edge 浏览器" });
      return;
    }

    await startAudioMonitoring();

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.continuous = true;
    recognition.interimResults = true;

    fullTextRef.current = "";
    listenStartRef.current = Date.now();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        fullTextRef.current += final;
      }
      setInterimText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("请允许麦克风权限");
      }
    };

    recognition.onend = () => {
      // If still in listening phase, restart
      if (phase === "listening") {
        try {
          recognition.start();
        } catch {
          // ignore
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setPhase("listening");
  }, [phase, startAudioMonitoring]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    stopAudioMonitoring();

    const duration = (Date.now() - listenStartRef.current) / 1000;
    const text = fullTextRef.current.trim();

    if (text) {
      const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setTranscript((t) => [...t, { role: "user", text, time }]);
      const m = analyzeSpeech(text, duration);
      setMetrics(m);
    }
    setInterimText("");
    setPhase("thinking");
  }, [stopAudioMonitoring]);

  // AI asks next question using TTS
  const askQuestion = useCallback(async (qIndex: number) => {
    const question = questions[qIndex] || DEFAULT_QUESTIONS[qIndex] || "面试结束，感谢你的参与！";
    const time = new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setTranscript((t) => [...t, { role: "ai", text: question, time }]);

    // Text-to-Speech
    setPhase("speaking");
    if ("speechSynthesis" in window && !muted) {
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = "zh-CN";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => {
        if (qIndex < questions.length - 1) {
          void startListening();
        } else {
          setPhase("done");
        }
      };
      window.speechSynthesis.speak(utterance);
    } else {
      // No TTS, wait 2s then start listening
      setTimeout(() => {
        if (qIndex < questions.length - 1) {
          void startListening();
        } else {
          setPhase("done");
        }
      }, 2000);
    }
  }, [questions, muted, startListening]);

  const startInterview = async () => {
    setTranscript([]);
    setMetrics(null);
    setCurrentQ(0);
    setElapsed(0);

    // Try to fetch AI-generated questions
    try {
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tech",
          role: "前端工程师",
          count: 5,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions.map((q: { question?: string } | string) => (typeof q === "string" ? q : q.question || "")));
      }
    } catch {
      // Use default questions
    }

    void askQuestion(0);
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      void askQuestion(next);
    } else {
      setPhase("done");
    }
  }, [currentQ, questions, askQuestion]);

  // When AI finishes "thinking", go to next question
  useEffect(() => {
    if (phase === "thinking") {
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, handleNextQuestion]);

  const reset = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    stopAudioMonitoring();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPhase("idle");
    setTranscript([]);
    setMetrics(null);
    setCurrentQ(0);
    setElapsed(0);
    setInterimText("");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="AI 语音面试官"
        subtitle="基于 Web Speech API 的实时语音对话与流利度分析"
        icon={<Mic className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Interview Area */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="relative overflow-hidden p-8">
            {/* Animated background when active */}
            {phase !== "idle" && phase !== "done" && (
              <motion.div
                className="absolute inset-0 opacity-30"
                animate={{
                  background: [
                    "radial-gradient(circle at 50% 50%, oklch(0.72 0.17 155 / 0.1), transparent)",
                    "radial-gradient(circle at 50% 50%, oklch(0.7 0.18 300 / 0.1), transparent)",
                    "radial-gradient(circle at 50% 50%, oklch(0.72 0.17 155 / 0.1), transparent)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            )}

            <div className="relative flex flex-col items-center justify-center py-8">
              {/* Mic visualization */}
              <div className="relative mb-6">
                {phase === "listening" && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-500/20"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-emerald-500/10"
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    />
                  </>
                )}
                <div
                  className={cn(
                    "relative flex h-32 w-32 items-center justify-center rounded-full border-2 transition-all",
                    phase === "idle" && "border-border bg-muted/30",
                    phase === "listening" && "border-emerald-500 bg-emerald-500/10",
                    phase === "thinking" && "border-violet-500 bg-violet-500/10",
                    phase === "speaking" && "border-primary bg-primary/10",
                    phase === "done" && "border-emerald-500 bg-emerald-500/10"
                  )}
                >
                  {phase === "idle" && <Mic className="h-12 w-12 text-muted-foreground" />}
                  {phase === "listening" && (
                    <motion.div animate={{ scale: [1, 1.1 + audioLevel * 0.3, 1] }} transition={{ duration: 0.3, repeat: Infinity }}>
                      <Radio className="h-12 w-12 text-emerald-500" />
                    </motion.div>
                  )}
                  {phase === "thinking" && <Loader2 className="h-12 w-12 text-violet-500 animate-spin" />}
                  {phase === "speaking" && <Volume2 className="h-12 w-12 text-primary" />}
                  {phase === "done" && <CheckCircle2 className="h-12 w-12 text-emerald-500" />}
                </div>
              </div>

              {/* Status text */}
              <div className="mb-2 text-center">
                {phase === "idle" && (
                  <>
                    <h3 className="text-lg font-semibold">准备开始语音面试</h3>
                    <p className="mt-1 text-sm text-muted-foreground">AI 将通过语音提问，请使用麦克风回答</p>
                  </>
                )}
                {phase === "listening" && (
                  <>
                    <h3 className="text-lg font-semibold text-emerald-500">正在聆听...</h3>
                    <p className="mt-1 text-sm text-muted-foreground">问题 {currentQ + 1}/{questions.length} · 请自然地回答</p>
                  </>
                )}
                {phase === "thinking" && (
                  <>
                    <h3 className="text-lg font-semibold text-violet-500">AI 正在分析你的回答...</h3>
                    <p className="mt-1 text-sm text-muted-foreground">评估流利度、语速、自信度</p>
                  </>
                )}
                {phase === "speaking" && (
                  <>
                    <h3 className="text-lg font-semibold text-primary">AI 正在提问...</h3>
                    <p className="mt-1 text-sm text-muted-foreground">问题 {currentQ + 1}/{questions.length}</p>
                  </>
                )}
                {phase === "done" && (
                  <>
                    <h3 className="text-lg font-semibold text-emerald-500">面试完成！</h3>
                    <p className="mt-1 text-sm text-muted-foreground">共回答 {transcript.filter(t => t.role === "user").length} 个问题</p>
                  </>
                )}
              </div>

              {/* Interim text while listening */}
              {phase === "listening" && interimText && (
                <div className="mt-4 max-w-md rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-muted-foreground">
                  <span className="text-emerald-500">实时识别：</span> {interimText}
                </div>
              )}

              {/* Timer */}
              {phase !== "idle" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatTime(elapsed)}
                </div>
              )}

              {/* Controls */}
              <div className="mt-6 flex items-center gap-3">
                {phase === "idle" && (
                  <Button size="lg" className="gap-2" onClick={startInterview}>
                    <Phone className="h-4 w-4" />
                    开始语音面试
                  </Button>
                )}
                {phase === "listening" && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setMuted(!muted)}
                      className={cn(muted && "text-rose-500")}
                    >
                      {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button variant="default" className="gap-2" onClick={stopListening}>
                      <CheckCircle2 className="h-4 w-4" />
                      完成回答
                    </Button>
                  </>
                )}
                {phase !== "idle" && phase !== "listening" && (
                  <Button variant="outline" size="sm" className="gap-2" onClick={reset}>
                    <PhoneOff className="h-4 w-4" />
                    结束面试
                  </Button>
                )}
                {phase === "done" && (
                  <Button variant="default" className="gap-2" onClick={reset}>
                    <RefreshCw className="h-4 w-4" />
                    重新面试
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Transcript */}
          {transcript.length > 0 && (
            <GlassCard className="p-6">
              <h3 className="mb-4 text-sm font-medium">对话记录</h3>
              <div className="max-h-64 space-y-3 overflow-y-auto scrollbar-thin">
                {transcript.map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      entry.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs",
                      entry.role === "ai" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {entry.role === "ai" ? <Brain className="h-4 w-4" /> : "你"}
                    </div>
                    <div className={cn(
                      "max-w-[80%] rounded-lg p-3 text-sm",
                      entry.role === "ai" ? "bg-muted/50" : "bg-emerald-500/10"
                    )}>
                      <p>{entry.text}</p>
                      <span className="mt-1 block text-[10px] text-muted-foreground">{entry.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* Sidebar: Real-time Metrics */}
        <div className="space-y-4">
          {metrics ? (
            <>
              <GlassCard className="p-6">
                <h3 className="mb-4 text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-primary" />
                  实时语音分析
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "流利度", value: metrics.fluency, color: "emerald" },
                    { label: "语速评分", value: metrics.pace, color: "violet" },
                    { label: "自信度", value: metrics.confidence, color: "amber" },
                    { label: "清晰度", value: metrics.clarity, color: "emerald" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-medium">{m.value}</span>
                      </div>
                      <Progress value={m.value} className="h-1.5" />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-border/50 pt-4">
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-lg font-bold">{metrics.wordCount}</p>
                    <p className="text-[10px] text-muted-foreground">总词数</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-lg font-bold">{metrics.fillerCount}</p>
                    <p className="text-[10px] text-muted-foreground">填充词</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-lg font-bold">{Math.round(metrics.duration)}s</p>
                    <p className="text-[10px] text-muted-foreground">时长</p>
                  </div>
                  <div className="rounded-lg bg-muted/30 p-2 text-center">
                    <p className="text-lg font-bold">{metrics.silenceRatio}%</p>
                    <p className="text-[10px] text-muted-foreground">沉默比</p>
                  </div>
                </div>
              </GlassCard>

              {phase === "done" && (
                <GlassCard className="flex flex-col items-center p-6">
                  <ScoreRing
                    value={Math.round((metrics.fluency + metrics.confidence + metrics.clarity) / 3)}
                    size={120}
                    label="综合评分"
                    color="emerald"
                  />
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    基于真实语音识别数据分析
                  </p>
                </GlassCard>
              )}
            </>
          ) : (
            <GlassCard className="p-6">
              <h3 className="mb-3 text-sm font-medium">分析维度</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• <span className="text-foreground">流利度</span>：基于语速与理想范围对比</p>
                <p>• <span className="text-foreground">自信度</span>：填充词比例分析</p>
                <p>• <span className="text-foreground">清晰度</span>：句子长度与结构</p>
                <p>• <span className="text-foreground">语速</span>：每分钟词数 (WPM)</p>
                <p>• <span className="text-foreground">沉默比</span>：停顿时间占比</p>
              </div>
              <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs">
                <p className="font-medium text-amber-500 mb-1">提示</p>
                <p className="text-muted-foreground">请使用 Chrome 或 Edge 浏览器，并允许麦克风权限。语音识别使用浏览器原生 Web Speech API。</p>
              </div>
            </GlassCard>
          )}

          {/* Audio Level */}
          {phase === "listening" && (
            <GlassCard className="p-4">
              <p className="mb-2 text-xs text-muted-foreground">音频电平</p>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-500 to-violet-500"
                  animate={{ width: `${audioLevel * 100}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
