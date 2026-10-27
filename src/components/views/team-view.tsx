"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Crown,
  Shield,
  User,
  MoreHorizontal,
  Mail,
  Copy,
  Check,
  TrendingUp,
  Coins,
  Activity,
  Settings2,
  Trash2,
  Loader2,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  email: string;
  name: string;
  avatar: string;
  role: string;
  status: string;
  creditsUsed: number;
  lastActive: string;
}

const roleConfig: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  owner: { label: "所有者", icon: Crown, color: "amber" },
  admin: { label: "管理员", icon: Shield, color: "violet" },
  member: { label: "成员", icon: User, color: "emerald" },
};

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      const data = await res.json();
      setMembers(data.members || []);
    } catch {
      toast.error("加载团队成员失败");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard?.writeText("https://aijobcopilot.com/invite/team-abc123");
    setInviteCopied(true);
    toast.success("邀请链接已复制");
    setTimeout(() => setInviteCopied(false), 2000);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) {
      toast.error("请输入姓名和邮箱");
      return;
    }
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: "member" }),
      });
      if (res.ok) {
        toast.success("邀请已发送", { description: inviteEmail });
        setInviteEmail("");
        setInviteName("");
        fetchMembers();
      }
    } catch {
      toast.error("邀请失败");
    }
  };

  const totalCredits = members.reduce((sum, m) => sum + m.creditsUsed, 0);
  const activeMembers = members.filter((m) => m.status === "active").length;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="团队管理"
        subtitle="多租户团队协作，共享知识库和额度"
        icon={<Users className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "团队成员", value: members.length, icon: Users, color: "emerald" },
          { label: "活跃成员", value: activeMembers, icon: Activity, color: "violet" },
          { label: "已用积分", value: totalCredits, icon: Coins, color: "amber" },
          { label: "套餐", value: "Team", icon: Crown, color: "blue" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg",
                    stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                    stat.color === "violet" && "bg-violet-500/10 text-violet-500",
                    stat.color === "amber" && "bg-amber-500/10 text-amber-500",
                    stat.color === "blue" && "bg-blue-500/10 text-blue-500",
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-bold">{stat.value}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Members List */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">成员列表</h3>
              <Button variant="outline" size="sm" className="gap-2" onClick={fetchMembers}>
                <TrendingUp className="h-3.5 w-3.5" />刷新
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const role = roleConfig[member.role] || roleConfig.member;
                  const RoleIcon = role.icon;
                  return (
                    <div key={member.id} className="flex items-center gap-4 rounded-lg border border-border/50 bg-card/30 p-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet to-primary text-xs font-semibold text-white">
                        {member.avatar || member.name.slice(0, 2)}
                        <span className={cn("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                          member.status === "active" ? "bg-emerald-500" : "bg-amber-500")} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                          <Badge variant="outline" className={cn("text-[10px] gap-1",
                            role.color === "amber" && "border-amber-500/30 text-amber-500",
                            role.color === "violet" && "border-violet-500/30 text-violet-500",
                            role.color === "emerald" && "border-emerald-500/30 text-emerald-500",
                          )}>
                            <RoleIcon className="h-2.5 w-2.5" />
                            {role.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium">{member.creditsUsed}</p>
                        <p className="text-[10px] text-muted-foreground">积分</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{member.lastActive}</p>
                        <p className="text-[10px] text-muted-foreground/70">最后活跃</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Invite */}
        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              邀请成员
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">姓名</label>
                <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="成员姓名" className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">邮箱</label>
                <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@example.com" className="h-8 text-sm" />
              </div>
              <Button size="sm" className="w-full gap-2" onClick={sendInvite}>
                <Mail className="h-3.5 w-3.5" />发送邀请
              </Button>
            </div>
            <div className="mt-4 border-t border-border/50 pt-4">
              <label className="text-xs text-muted-foreground mb-1 block">邀请链接</label>
              <div className="flex gap-2">
                <Input readOnly value="https://aijobcopilot.com/invite/team-abc123" className="h-8 text-xs" />
                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={copyInviteLink}>
                  {inviteCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-sm font-medium mb-3">团队设置</h3>
            <div className="space-y-3">
              {[
                { label: "共享知识库", desc: "团队成员可访问共享 RAG", on: true },
                { label: "共享看板", desc: "投递进度团队可见", on: true },
                { label: "管理员审批", desc: "投递需管理员审批", on: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium">{setting.label}</p>
                    <p className="text-[10px] text-muted-foreground">{setting.desc}</p>
                  </div>
                  <button className={cn("relative h-5 w-9 rounded-full transition", setting.on ? "bg-primary" : "bg-muted")}>
                    <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white transition", setting.on ? "left-4" : "left-0.5")} />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
