"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Zap } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  GROUP_LABELS,
  NAV_GROUPS,
  VIEW_LIST,
  viewHref,
  type NavGroup,
} from "@/lib/views";
import { viewIcons } from "@/lib/view-icons";

interface UserInfo {
  name: string;
  avatar: string;
  role: string;
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, plan, credits } = useAppStore();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo>({ name: "User", avatar: "U", role: "user" });

  useEffect(() => {
    fetch("/api/user")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser({
            name: data.user.name,
            avatar: data.user.avatar,
            role: data.user.role,
          });
        }
      })
      .catch(() => {});
  }, []);

  const itemsByGroup = (group: NavGroup) => VIEW_LIST.filter((v) => v.group === group);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 248 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="relative z-30 flex h-screen flex-col border-r border-border/50 bg-sidebar/80 backdrop-blur-xl"
    >
      {/* Logo */}
      <Link href={viewHref("dashboard")} className="flex h-16 items-center gap-3 border-b border-border/50 px-4">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
          <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10" />
        </div>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-sm font-semibold leading-tight">AI Job Copilot</span>
            <span className="text-[10px] text-muted-foreground">V1 Enterprise</span>
          </motion.div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="mb-3">
            {!sidebarCollapsed && (
              <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
                {GROUP_LABELS[group]}
              </p>
            )}
            <div className="space-y-0.5">
              {itemsByGroup(group).map((item) => {
                const Icon = viewIcons[item.id];
                const href = viewHref(item.id);
                const active = pathname === href;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    prefetch={false}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary shadow-sm shadow-primary/10"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-0.5",
                      sidebarCollapsed && "justify-center hover:translate-x-0"
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", active && "text-primary")} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-md px-1.5 py-0.5 text-[9px] font-semibold transition-transform group-hover:scale-105",
                              item.badge === "NEW"
                                ? "bg-primary/20 text-primary"
                                : item.badge === "AI"
                                ? "bg-violet-500/20 text-violet-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Credits Card */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-3">
            <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-primary/20 blur-2xl" />
            <div className="relative">
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold">{plan === "free" ? "Free" : plan === "pro" ? "Pro" : plan === "team" ? "Team" : "Enterprise"}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{credits} 积分</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (credits / 2000) * 100)}%` }} />
              </div>
              <Link
                href={viewHref("billing")}
                className="mt-2 block w-full rounded-md bg-primary py-1.5 text-center text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                升级套餐
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* User */}
      <div className="border-t border-border/50 p-3">
        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-primary text-xs font-semibold text-white">
            {user.avatar}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-emerald-500" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user.role}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-md transition hover:bg-accent"
      >
        <ChevronLeft
          className={cn("h-3.5 w-3.5 transition-transform", sidebarCollapsed && "rotate-180")}
        />
      </button>
    </motion.aside>
  );
}
