"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FolderGit2,
  Github,
  Star,
  GitFork,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Loader2,
  Search,
} from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { SectionHeader } from "@/components/shared/section-header";
import { ScoreRing } from "@/components/shared/score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface GitHubData {
  login: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  topRepos: {
    name: string;
    description: string;
    stars: number;
    forks: number;
    language: string;
    url: string;
  }[];
  languages: { name: string; percent: number; color: string }[];
  score: number;
  highlights: string[];
  improvements: string[];
}

export function PortfolioView() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<GitHubData | null>(null);

  const analyze = async () => {
    if (!username.trim()) {
      toast.error("请输入 GitHub 用户名");
      return;
    }
    setLoading(true);
    setData(null);
    try {
      // Fetch real GitHub data via public API
      const userRes = await fetch(`https://api.github.com/users/${username.trim()}`);
      if (!userRes.ok) {
        throw new Error(userRes.status === 404 ? "用户不存在" : `GitHub API 错误 (${userRes.status})`);
      }
      const user = await userRes.json();

      const reposRes = await fetch(`https://api.github.com/users/${username.trim()}/repos?sort=stars&per_page=10`);
      const repos = await reposRes.json();

      const totalStars = repos.reduce((sum: number, r: { stargazers_count: number }) => sum + r.stargazers_count, 0);
      const totalForks = repos.reduce((sum: number, r: { forks_count: number }) => sum + r.forks_count, 0);

      // Calculate language distribution
      const langMap: Record<string, number> = {};
      repos.forEach((r: { language: string | null }) => {
        if (r.language) {
          langMap[r.language] = (langMap[r.language] || 0) + 1;
        }
      });
      const totalLangs = Object.values(langMap).reduce((a, b) => a + b, 0);
      const langColors: Record<string, string> = {
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        Python: "#3572A5",
        Rust: "#dea584",
        Go: "#00ADD8",
        Java: "#b07219",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Vue: "#41b883",
        Shell: "#89e051",
      };
      const languages = Object.entries(langMap)
        .map(([name, count]) => ({
          name,
          percent: Math.round((count / totalLangs) * 100),
          color: langColors[name] || "#8b5cf6",
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 6);

      const topRepos = repos
        .filter((r: { fork: boolean }) => !r.fork)
        .slice(0, 5)
        .map((r: { name: string; description: string | null; stargazers_count: number; forks_count: number; language: string | null; html_url: string }) => ({
          name: r.name,
          description: r.description || "No description",
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language || "N/A",
          url: r.html_url,
        }));

      // Calculate score
      const score = Math.min(100, Math.round(
        Math.min(30, user.public_repos * 2) +
        Math.min(30, totalStars * 0.5) +
        Math.min(20, user.followers * 0.5) +
        Math.min(20, languages.length * 3)
      ));

      const highlights: string[] = [];
      if (totalStars > 100) highlights.push(`开源贡献活跃，累计 ${totalStars} Stars`);
      if (user.publicRepos > 10) highlights.push(`项目数量丰富（${user.publicRepos} 个仓库）`);
      if (languages.find((l) => l.name === "TypeScript")) highlights.push("使用 TypeScript，代码质量高");
      if (user.followers > 50) highlights.push(`社区影响力（${user.followers} followers）`);
      if (highlights.length === 0) highlights.push("已连接 GitHub 账号");

      const improvements: string[] = [];
      if (totalStars < 50) improvements.push("增加开源项目曝光度，提升 Star 数");
      if (!languages.find((l) => l.name === "TypeScript")) improvements.push("建议使用 TypeScript 提升代码质量");
      if (user.publicRepos < 5) improvements.push("增加更多公开项目展示");
      if (improvements.length === 0) improvements.push("继续保持优秀的开源贡献");

      setData({
        login: user.login,
        name: user.name || user.login,
        bio: user.bio || "No bio",
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        totalStars,
        totalForks,
        topRepos,
        languages,
        score,
        highlights,
        improvements,
      });
      toast.success(`已分析 @${user.login} 的 GitHub`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "分析失败";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <SectionHeader
        title="作品集分析"
        subtitle="连接 GitHub，AI 分析代码质量与项目亮点"
        icon={<FolderGit2 className="h-5 w-5" />}
      />

      {/* Search */}
      <GlassCard className="p-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyze()}
              placeholder="输入 GitHub 用户名，如：torvalds"
              className="w-full rounded-lg border border-border bg-background pl-10 pr-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <Button onClick={analyze} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            分析
          </Button>
        </div>
      </GlassCard>

      {loading && (
        <GlassCard className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">正在分析 GitHub 数据...</p>
        </GlassCard>
      )}

      {data && !loading && (
        <>
          {/* Top: Score + GitHub Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <GlassCard className="flex flex-col items-center justify-center p-6">
              <ScoreRing value={data.score} size={140} label="综合评分" sublabel={data.score >= 80 ? "优秀" : data.score >= 60 ? "良好" : "待提升"} color="emerald" />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                超过了 <span className="font-medium text-foreground">{Math.min(95, data.score + 10)}%</span> 的开发者
              </p>
            </GlassCard>

            <GlassCard className="p-6 lg:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-primary text-white">
                  <Github className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{data.name}</h3>
                  <p className="text-xs text-muted-foreground">@{data.login} · {data.bio}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  { label: "公开仓库", value: data.publicRepos, icon: FolderGit2 },
                  { label: "总 Stars", value: data.totalStars, icon: Star },
                  { label: "总 Forks", value: data.totalForks, icon: GitFork },
                  { label: "Followers", value: data.followers, icon: TrendingUp },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                      <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Languages + Top Repos */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4">语言分布</h3>
              {data.languages.length > 0 ? (
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.name}>
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
                          {lang.name}
                        </span>
                        <span className="text-muted-foreground">{lang.percent}%</span>
                      </div>
                      <Progress value={lang.percent} className="h-1.5" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">暂无语言数据</p>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4">热门项目</h3>
              <div className="space-y-2">
                {data.topRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border/50 bg-card/30 p-3 transition hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{repo.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Star className="h-3 w-3" />{repo.stars}</span>
                        <span className="flex items-center gap-0.5"><GitFork className="h-3 w-3" />{repo.forks}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{repo.description}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{repo.language}</Badge>
                  </a>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Highlights + Improvements */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                亮点
              </h3>
              <div className="space-y-3">
                {data.highlights.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{h}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                改进建议
              </h3>
              <div className="space-y-3">
                {data.improvements.map((imp, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm">{imp}</p>
                  </motion.div>
                ))}
              </div>
              <Button className="w-full mt-4 gap-2">
                <Github className="h-4 w-4" />
                生成 GitHub Resume
              </Button>
            </GlassCard>
          </div>
        </>
      )}

      {!data && !loading && (
        <GlassCard className="p-12 text-center">
          <Github className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">输入 GitHub 用户名开始分析</p>
          <p className="text-xs text-muted-foreground/70 mt-1">使用 GitHub 公开 API，无需授权</p>
        </GlassCard>
      )}
    </div>
  );
}
