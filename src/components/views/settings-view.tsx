"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bot,
  Bell,
  Globe,
  Shield,
  CreditCard,
  Database,
  Palette,
  Check,
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Zap,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAppStore, type AIProviderId } from "@/lib/store";
import { AI_PROVIDERS } from "@/lib/ai-providers-config";
import { locales } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface UserInfo {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  plan: string;
  credits: number;
}

export function SettingsView() {
  const {
    activeProvider,
    setActiveProvider,
    providerKeys,
    setProviderKey,
    removeProviderKey,
    language,
    setLanguage,
  } = useAppStore();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingProvider, setEditingProvider] = useState<AIProviderId | null>(null);
  const [tempKey, setTempKey] = useState("");
  const [tempModel, setTempModel] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUserInfo(data.user);
      })
      .catch(() => {});
  }, []);

  const user = userInfo || { name: "User", email: "", avatar: "U", role: "", targetRole: "" };

  const handleTestProvider = async (providerId: AIProviderId) => {
    setTestingProvider(providerId);
    try {
      const config = providerKeys[providerId];
      const providerInfo = AI_PROVIDERS.find((p) => p.id === providerId);
      const res = await fetch("/api/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          apiKey: config?.apiKey || tempKey,
          model: config?.model || tempModel || providerInfo?.defaultModel,
          baseUrl: config?.baseUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${providerInfo?.name} 连接成功`, {
          description: `延迟: ${data.latency} · 模型: ${data.model}`,
        });
      } else {
        toast.error(`${providerInfo?.name} 连接失败`, {
          description: data.error,
        });
      }
    } catch {
      toast.error("测试失败，请检查网络");
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSaveKey = (providerId: AIProviderId) => {
    if (!tempKey.trim() && providerId !== "zai") {
      toast.error("请输入 API Key");
      return;
    }
    const providerInfo = AI_PROVIDERS.find((p) => p.id === providerId);
    setProviderKey(providerId, {
      name: providerInfo?.name || providerId,
      apiKey: tempKey,
      model: tempModel || providerInfo?.defaultModel || "",
      baseUrl: providerInfo?.baseUrl,
    });
    setEditingProvider(null);
    setTempKey("");
    setTempModel("");
    toast.success(`${providerInfo?.name} 配置已保存`);
  };

  const handleRemoveKey = (providerId: AIProviderId) => {
    removeProviderKey(providerId);
    if (activeProvider === providerId) {
      setActiveProvider("zai");
    }
    toast.success("已移除 API Key");
  };

  const startEdit = (providerId: AIProviderId) => {
    const existing = providerKeys[providerId];
    setTempKey(existing?.apiKey || "");
    setTempModel(existing?.model || "");
    setEditingProvider(providerId);
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="设置"
        subtitle="管理你的账户、AI 偏好和应用配置"
        icon={<SettingsIcon className="h-5 w-5" />}
      />

      <Tabs defaultValue="ai">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="ai" className="gap-1.5"><Bot className="h-3.5 w-3.5" />AI 配置</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" />个人</TabsTrigger>
          <TabsTrigger value="appearance" className="gap-1.5"><Palette className="h-3.5 w-3.5" />外观</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5"><Bell className="h-3.5 w-3.5" />通知</TabsTrigger>
          <TabsTrigger value="privacy" className="gap-1.5"><Shield className="h-3.5 w-3.5" />隐私</TabsTrigger>
        </TabsList>

        {/* AI Provider Configuration */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI 服务提供商
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                选择并配置你的 AI 服务。默认使用 ZAI（无需 API Key），也可自定义接入 OpenAI、Claude、Gemini 等。
              </p>
            </div>

            {/* Active Provider Selector */}
            <div className="mb-6">
              <Label className="text-xs text-muted-foreground mb-2 block">当前使用的 Provider</Label>
              <Select value={activeProvider} onValueChange={(v) => setActiveProvider(v as AIProviderId)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.id === "zai" && <Badge variant="secondary" className="text-[10px]">默认</Badge>}
                        {providerKeys[p.id as AIProviderId]?.apiKey && p.id !== "zai" && (
                          <Check className="h-3 w-3 text-emerald-500" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Provider List */}
            <div className="space-y-3">
              {AI_PROVIDERS.map((provider) => {
                const config = providerKeys[provider.id as AIProviderId];
                const isActive = activeProvider === provider.id;
                const isEditing = editingProvider === provider.id;
                const hasKey = !!config?.apiKey || provider.id === "zai";

                return (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-lg border p-4 transition",
                      isActive ? "border-primary/40 bg-primary/5" : "border-border/50 bg-card/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{provider.name}</span>
                          {isActive && <Badge variant="default" className="text-[10px]">使用中</Badge>}
                          {provider.id === "zai" && <Badge variant="secondary" className="text-[10px]">免配置</Badge>}
                          {hasKey && provider.id !== "zai" && (
                            <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">
                              <Check className="h-2.5 w-2.5 mr-0.5" />已配置
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {provider.models.slice(0, 3).map((m) => (
                            <Badge key={m} variant="outline" className="text-[10px] font-mono">{m}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setActiveProvider(provider.id as AIProviderId);
                              toast.success(`已切换到 ${provider.name}`);
                            }}
                          >
                            切换
                          </Button>
                        )}
                        {provider.id !== "zai" && !isEditing && (
                          <Button size="sm" variant="ghost" onClick={() => startEdit(provider.id as AIProviderId)}>
                            <Key className="h-3.5 w-3.5" />
                            {hasKey ? "编辑" : "配置"}
                          </Button>
                        )}
                        {provider.id !== "zai" && config?.apiKey && (
                          <Button size="sm" variant="ghost" onClick={() => handleRemoveKey(provider.id as AIProviderId)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Edit Form */}
                    {isEditing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 space-y-3 border-t border-border/50 pt-4"
                      >
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">API Key</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                type={showKeys[provider.id] ? "text" : "password"}
                                value={tempKey}
                                onChange={(e) => setTempKey(e.target.value)}
                                placeholder={`输入 ${provider.name} API Key`}
                                className="pr-10 font-mono text-xs"
                              />
                              <button
                                onClick={() => setShowKeys((s) => ({ ...s, [provider.id]: !s[provider.id] }))}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1.5 block">模型</Label>
                          <Select value={tempModel || provider.defaultModel} onValueChange={setTempModel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {provider.models.map((m) => (
                                <SelectItem key={m} value={m} className="font-mono text-xs">{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {provider.apiKeyUrl && (
                          <a
                            href={provider.apiKeyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            获取 API Key
                          </a>
                        )}
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleSaveKey(provider.id as AIProviderId)}>
                            <Check className="h-3.5 w-3.5" />
                            保存配置
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => handleTestProvider(provider.id as AIProviderId)}
                            disabled={testingProvider === provider.id}
                          >
                            {testingProvider === provider.id ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" />测试中...</>
                            ) : (
                              <><Zap className="h-3.5 w-3.5" />测试连接</>
                            )}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingProvider(null)}>
                            取消
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-muted-foreground">
                <Shield className="inline h-3 w-3 mr-1" />
                你的 API Key 加密存储在浏览器本地（localStorage），不会上传到服务器。所有 AI 请求直接从你的浏览器发送到对应 Provider。
              </p>
            </div>
          </GlassCard>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4">个人信息</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet text-2xl font-bold text-white">
                {user.avatar}
              </div>
              <div>
                <Button variant="outline" size="sm">更换头像</Button>
                <p className="mt-2 text-xs text-muted-foreground">支持 JPG, PNG, 最大 2MB</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs">姓名</Label>
                <Input defaultValue={user.name} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">邮箱</Label>
                <Input defaultValue={user.email} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">当前职位</Label>
                <Input defaultValue={user.role} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">目标岗位</Label>
                <Input defaultValue="Staff Frontend Engineer" className="mt-1" />
              </div>
            </div>
            <Button className="mt-4">保存更改</Button>
          </GlassCard>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              语言与地区
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {locales.map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLanguage(l.id);
                    toast.success(`语言已切换为 ${l.name}`);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition",
                    language === l.id
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <span className="text-2xl">{l.flag}</span>
                  <span className="text-sm font-medium">{l.name}</span>
                  {language === l.id && <Check className="h-4 w-4 text-primary ml-auto" />}
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4" />
              主题
            </h3>
            <div className="flex gap-3">
              {[
                { id: "dark", name: "深色", bg: "bg-zinc-900" },
                { id: "light", name: "浅色", bg: "bg-zinc-100" },
              ].map((t) => (
                <div key={t.id} className="flex flex-col items-center gap-2">
                  <div className={cn("h-16 w-24 rounded-lg border-2", t.bg, t.id === "dark" ? "border-primary" : "border-border")} />
                  <span className="text-xs">{t.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4">通知设置</h3>
            <div className="space-y-4">
              {[
                { label: "面试提醒", desc: "面试前 1 小时提醒", on: true },
                { label: "投递状态更新", desc: "HR 查看简历时通知", on: true },
                { label: "AI 优化完成", desc: "简历优化结果通知", on: false },
                { label: "学习提醒", desc: "每日学习计划提醒", on: true },
                { label: "周报推送", desc: "每周求职进度汇总", on: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              ))}
            </div>
          </GlassCard>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-4 mt-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Database className="h-4 w-4" />
              数据与隐私
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">RAG 知识库</Label>
                  <p className="text-xs text-muted-foreground">允许 AI 记忆你的简历和项目</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">数据加密</Label>
                  <p className="text-xs text-muted-foreground">端到端加密你的所有数据</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">匿名分析</Label>
                  <p className="text-xs text-muted-foreground">帮助改进产品（不包含个人信息）</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="mt-6 border-t border-border/50 pt-4">
              <Button variant="destructive" size="sm">删除所有数据</Button>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
