"use client";

import Link from "next/link";
import { Search, Bell, Command, Sun, Moon, Globe, Plus, Settings, Check, LogOut } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { VIEW_META, viewHref, type ViewId } from "@/lib/views";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { locales } from "@/lib/i18n/locales";
import { NotificationDrawer } from "@/components/shared/notification-drawer";

export function Topbar({ view }: { view: ViewId }) {
  const { setCommandOpen, activeProvider, setActiveProvider, providerKeys, language, notifications } = useAppStore();
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const viewInfo = VIEW_META[view];

  const providerNames: Record<string, string> = {
    zai: "ZAI",
    openai: "OpenAI",
    claude: "Claude",
    gemini: "Gemini",
    deepseek: "DeepSeek",
    qwen: "Qwen",
    openrouter: "OpenRouter",
    mistral: "Mistral",
    llama: "Llama",
    groq: "Groq",
    xai: "Grok",
    perplexity: "Perplexity",
    moonshot: "Kimi",
    yi: "Yi",
    baichuan: "Baichuan",
    minimax: "MiniMax",
    zhipu: "智谱",
    ollama: "Ollama",
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 px-6 backdrop-blur-xl">
      {/* Title */}
      <div className="flex flex-col">
        <motion.h1
          key={view}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold tracking-tight"
        >
          {viewInfo.title}
        </motion.h1>
        <p className="text-xs text-muted-foreground">{viewInfo.desc}</p>
      </div>

      {/* Search */}
      <button
        onClick={() => setCommandOpen(true)}
        className="group ml-auto flex h-9 w-64 items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/50"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">搜索或执行命令...</span>
        <kbd className="flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </button>

      {/* AI Provider Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 pulse-dot" />
            <span>{providerNames[activeProvider] || activeProvider}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">AI Provider</p>
          <DropdownMenuSeparator />
          {(["zai", "openai", "claude", "gemini", "deepseek", "qwen", "openrouter", "mistral", "llama", "groq", "xai", "perplexity", "moonshot", "yi", "baichuan", "minimax", "zhipu", "ollama"] as const).map((p) => (
            <DropdownMenuItem
              key={p}
              onClick={() => setActiveProvider(p)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span>{providerNames[p]}</span>
                {p !== "zai" && !providerKeys[p]?.apiKey && (
                  <span className="text-[10px] text-amber-500">未配置</span>
                )}
              </div>
              {activeProvider === p && <span className="h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={viewHref("settings")}>
              <Settings className="h-3.5 w-3.5 mr-2" />
              配置 API Key
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {locales.map((l) => (
            <DropdownMenuItem
              key={l.id}
              onClick={() => useAppStore.getState().setLanguage(l.id)}
              className="flex items-center justify-between"
            >
              <span>{l.flag} {l.name}</span>
              {language === l.id && <Check className="h-3 w-3" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Notifications */}
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => setNotifOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {notifications > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {notifications}
          </span>
        )}
      </Button>

      {/* New */}
      <Button size="sm" className="gap-2">
        <Plus className="h-4 w-4" />
        新建
      </Button>

      {/* Logout */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        title="退出登录"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
      >
        <LogOut className="h-4 w-4" />
      </Button>

      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </header>
  );
}
