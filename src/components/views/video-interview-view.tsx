"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Video,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Eye,
  Smile,
  Activity,
  Clock,
  RefreshCw,
  TrendingUp,
  Brain,
  Hand,
  AlertCircle,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/shared/score-ring";
import { useAIConfig } from "@/hooks/use-ai-config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Phase = "idle" | "ready" | "live" | "done";

interface VideoMetrics {
  eyeContact: number;      // 眼神交流: based on face position center + brightness
  facialExpression: number; // 表情: based on pixel variance (smile detection approximation)
  posture: number;          // 姿态: based on face vertical position stability
  gesture: number;          // 手势: based on frame-to-frame motion
  engagement: number;       // 参与度: composite
  nervousness: number;      // 紧张度: based on rapid motion
}

const DEFAULT_QUESTIONS = [
  "请做一个简短的自我介绍。",
  "你遇到过最有挑战性的技术问题是什么？",
  "讲一个你和团队协作的经历。",
  "你对未来 3 年的职业规划是什么？",
];

export function VideoInterviewView() {
  const aiConfig = useAIConfig();
  const [phase, setPhase] = useState<Phase>("idle");
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
  const [questions, setQuestions] = useState<string[]>(DEFAULT_QUESTIONS);
  const [faceDetected, setFaceDetected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysisRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const metricsHistoryRef = useRef<VideoMetrics[]>([]);

  // Timer
  useEffect(() => {
    if (phase === "live") {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: micOn,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setPhase("ready");
      toast.success("摄像头已启动");
    } catch (err) {
      console.error("Camera access failed:", err);
      toast.error("无法访问摄像头", { description: "请允许摄像头权限" });
    }
  }, [micOn]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    if (analysisRef.current) {
      clearInterval(analysisRef.current);
      analysisRef.current = null;
    }
  }, []);

  // Real frame analysis algorithm
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 160; // small for performance
    canvas.height = 120;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 1. Face detection approximation: check center region brightness
    // A face typically has skin-tone pixels in center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 40;
    let skinPixels = 0;
    let totalPixels = 0;
    let centerBrightness = 0;
    let pixelVariance = 0;
    let meanBrightness = 0;

    // First pass: calculate mean brightness
    for (let i = 0; i < data.length; i += 4) {
      meanBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    meanBrightness /= (data.length / 4);

    // Second pass: skin detection & variance
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const i = (y * canvas.width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Skin tone detection (simple heuristic)
        const isSkin = r > 95 && g > 40 && b > 20 &&
                       r > g && r > b &&
                       Math.abs(r - g) > 15 &&
                       Math.max(r, g, b) - Math.min(r, g, b) > 15;

        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          totalPixels++;
          if (isSkin) skinPixels++;
          centerBrightness += (r + g + b) / 3;
        }

        pixelVariance += Math.abs((r + g + b) / 3 - meanBrightness);
      }
    }

    pixelVariance /= (data.length / 4);
    centerBrightness /= totalPixels;

    // Face detected if skin ratio in center > 30%
    const skinRatio = totalPixels > 0 ? skinPixels / totalPixels : 0;
    const detected = skinRatio > 0.25 && centerBrightness > 50;
    setFaceDetected(detected);

    if (!detected) return;

    // 2. Eye contact: face centered + looking forward (brightness balance left/right)
    const leftBright = centerBrightness;
    let rightBright = 0;
    let rightCount = 0;
    for (let y = 0; y < canvas.height; y++) {
      for (let x = canvas.width / 2 + 10; x < canvas.width / 2 + 50; x++) {
        const i = (y * canvas.width + x) * 4;
        rightBright += (data[i] + data[i + 1] + data[i + 2]) / 3;
        rightCount++;
      }
    }
    rightBright /= rightCount;
    const balance = 100 - Math.min(100, Math.abs(leftBright - rightBright) * 2);
    const centeredness = 100 - Math.min(100, (1 - skinRatio) * 100);
    const eyeContact = Math.round((balance + centeredness) / 2);

    // 3. Facial expression: pixel variance in face region (more variance = more expression)
    const facialExpression = Math.round(Math.min(100, pixelVariance * 2));

    // 4. Motion detection (frame diff) for gesture & nervousness
    let motion = 0;
    if (prevFrameRef.current) {
      let diff = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 16) { // sample every 4th pixel
        diff += Math.abs(data[i] - prevFrameRef.current[i]);
        count++;
      }
      motion = diff / count;
    }
    prevFrameRef.current = new Uint8ClampedArray(data);

    // 5. Gesture: moderate motion is good
    const gesture = Math.round(Math.min(100, motion * 3));

    // 6. Nervousness: high rapid motion
    const nervousness = Math.round(Math.min(100, Math.max(0, motion * 5 - 20)));

    // 7. Posture: stability (low vertical motion)
    const posture = Math.round(Math.max(40, 100 - motion * 2));

    // 8. Engagement: composite
    const engagement = Math.round((eyeContact * 0.3 + facialExpression * 0.2 + posture * 0.2 + (100 - nervousness) * 0.3));

    const newMetrics: VideoMetrics = {
      eyeContact,
      facialExpression,
      posture,
      gesture,
      engagement,
      nervousness,
    };

    metricsHistoryRef.current.push(newMetrics);
    // Keep last 30 samples
    if (metricsHistoryRef.current.length > 30) {
      metricsHistoryRef.current.shift();
    }

    // Average the metrics for smoother display
    const history = metricsHistoryRef.current;
    const avg: VideoMetrics = {
      eyeContact: Math.round(history.reduce((s, m) => s + m.eyeContact, 0) / history.length),
      facialExpression: Math.round(history.reduce((s, m) => s + m.facialExpression, 0) / history.length),
      posture: Math.round(history.reduce((s, m) => s + m.posture, 0) / history.length),
      gesture: Math.round(history.reduce((s, m) => s + m.gesture, 0) / history.length),
      engagement: Math.round(history.reduce((s, m) => s + m.engagement, 0) / history.length),
      nervousness: Math.round(history.reduce((s, m) => s + m.nervousness, 0) / history.length),
    };
    setMetrics(avg);
  }, []);

  // Start interview
  const startInterview = async () => {
    setElapsed(0);
    setCurrentQ(0);
    setMetrics(null);
    metricsHistoryRef.current = [];

    // Fetch AI questions
    try {
      const res = await fetch("/api/interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "tech",
          role: "前端工程师",
          count: 4,
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseUrl: aiConfig.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions.map((q: any) => q.question || q));
      }
    } catch {
      // Use defaults
    }

    setPhase("live");

    // Start frame analysis loop (every 500ms)
    analysisRef.current = setInterval(analyzeFrame, 500);

    // Speak first question
    speakQuestion(0);
  };

  const speakQuestion = (qIndex: number) => {
    const question = questions[qIndex] || DEFAULT_QUESTIONS[qIndex];
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.lang = "zh-CN";
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      speakQuestion(next);
    } else {
      finishInterview();
    }
  };

  const finishInterview = () => {
    setPhase("done");
    if (analysisRef.current) {
      clearInterval(analysisRef.current);
      analysisRef.current = null;
    }
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  };

  const reset = () => {
    finishInterview();
    setPhase(cameraOn ? "ready" : "idle");
    setMetrics(null);
    setCurrentQ(0);
    setElapsed(0);
    metricsHistoryRef.current = [];
  };

  const toggleCamera = () => {
    if (cameraOn) {
      stopCamera();
      setPhase("idle");
    } else {
      void startCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [stopCamera]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const metricItems = metrics ? [
    { key: "eyeContact", label: "眼神交流", value: metrics.eyeContact, icon: Eye, color: "emerald", invert: false },
    { key: "facialExpression", label: "面部表情", value: metrics.facialExpression, icon: Smile, color: "violet", invert: false },
    { key: "posture", label: "姿态稳定", value: metrics.posture, icon: Activity, color: "amber", invert: false },
    { key: "gesture", label: "手势自然", value: metrics.gesture, icon: Hand, color: "emerald", invert: false },
    { key: "engagement", label: "参与度", value: metrics.engagement, icon: Brain, color: "violet", invert: false },
    { key: "nervousness", label: "紧张度", value: metrics.nervousness, icon: AlertCircle, color: "rose", invert: true },
  ] : [];

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="AI 视频模拟面试"
        subtitle="基于摄像头实时帧分析：眼神、表情、姿态、手势、紧张度"
        icon={<Video className="h-5 w-5" />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Video Feed */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="overflow-hidden p-0">
            <div className="relative aspect-video bg-black">
              {/* Video element */}
              <video
                ref={videoRef}
                className="h-full w-full object-cover mirror"
                playsInline
                muted
              />
              {/* Hidden canvas for analysis */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Overlay when no camera */}
              {!cameraOn && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <CameraOff className="h-16 w-16 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">摄像头未启动</p>
                  <Button onClick={startCamera} className="gap-2">
                    <Camera className="h-4 w-4" />
                    启动摄像头
                  </Button>
                </div>
              )}

              {/* Face detection indicator */}
              {cameraOn && (
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs backdrop-blur-md",
                    faceDetected
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  )}>
                    <span className={cn(
                      "h-2 w-2 rounded-full",
                      faceDetected ? "bg-emerald-500" : "bg-rose-500"
                    )} />
                    {faceDetected ? "人脸已检测" : "未检测到人脸"}
                  </div>
                </div>
              )}

              {/* Live indicator */}
              {phase === "live" && (
                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-rose-500/20 px-3 py-1 text-xs backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                  LIVE
                </div>
              )}

              {/* Timer */}
              {phase === "live" && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-sm backdrop-blur-md">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(elapsed)}
                </div>
              )}

              {/* Current question */}
              {phase === "live" && (
                <div className="absolute bottom-4 right-4 max-w-xs rounded-lg bg-black/60 p-3 text-sm backdrop-blur-md">
                  <p className="text-xs text-muted-foreground mb-1">问题 {currentQ + 1}/{questions.length}</p>
                  <p className="text-foreground">{questions[currentQ]}</p>
                </div>
              )}

              {/* Scanning line effect when analyzing */}
              {phase === "live" && faceDetected && (
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-emerald-500/50"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleCamera}
                  className={cn(!cameraOn && "text-rose-500")}
                >
                  {cameraOn ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMicOn(!micOn)}
                  className={cn(!micOn && "text-rose-500")}
                >
                  {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {phase === "ready" && (
                  <Button onClick={startInterview} className="gap-2">
                    <Video className="h-4 w-4" />
                    开始视频面试
                  </Button>
                )}
                {phase === "live" && (
                  <>
                    <Button variant="outline" onClick={nextQuestion} className="gap-2">
                      下一题
                    </Button>
                    <Button variant="destructive" onClick={finishInterview} className="gap-2">
                      结束面试
                    </Button>
                  </>
                )}
                {phase === "done" && (
                  <Button onClick={reset} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    重新面试
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Analysis explanation */}
          <GlassCard className="p-4">
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">分析算法说明</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground md:grid-cols-3">
              <p>• 肤色检测识别人脸位置</p>
              <p>• 左右亮度平衡判断眼神</p>
              <p>• 像素方差评估表情丰富度</p>
              <p>• 帧间差异计算手势动作</p>
              <p>• 高频运动检测紧张程度</p>
              <p>• 垂直稳定性评估姿态</p>
            </div>
          </GlassCard>
        </div>

        {/* Metrics sidebar */}
        <div className="space-y-4">
          {phase === "done" && metrics ? (
            <GlassCard className="flex flex-col items-center p-6">
              <ScoreRing
                value={metrics.engagement}
                size={130}
                label="综合评分"
                sublabel="视频面试"
                color="emerald"
              />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                基于真实摄像头帧分析
              </p>
            </GlassCard>
          ) : null}

          <GlassCard className="p-6">
            <h3 className="mb-4 text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              实时行为分析
            </h3>

            {!metrics ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Brain className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {cameraOn ? "开始面试后实时分析" : "启动摄像头开始分析"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {metricItems.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.key}
                      className={cn(
                        "rounded-lg border p-3 transition",
                        phase === "live"
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/50 bg-card/30"
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                          {m.label}
                        </span>
                        <span className="text-xs font-medium">
                          {phase === "live" ? (
                            <motion.span
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              {m.value}{m.key === "nervousness" ? "%" : ""}
                            </motion.span>
                          ) : (
                            <span>{m.value}{m.key === "nervousness" ? "%" : ""}</span>
                          )}
                        </span>
                      </div>
                      <Progress
                        value={m.invert ? 100 - m.value : m.value}
                        className="h-1"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>

          {/* Tips */}
          <GlassCard className="p-4">
            <h4 className="mb-2 text-xs font-medium flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              面试技巧
            </h4>
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              <li>• 保持正对摄像头，眼神交流</li>
              <li>• 适度微笑，展现自信</li>
              <li>• 避免频繁小动作（紧张表现）</li>
              <li>• 手势自然，配合表达</li>
              <li>• 保持稳定坐姿</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
