import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const reportExportSchema = z.object({
  format: z.enum(["markdown","json","txt","html"]).optional(),
});

export const runtime = "nodejs";

// POST /api/report-export — export job search progress report
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, reportExportSchema);
    if (!parsed.ok) return parsed.response;
    const {format = "markdown"} = parsed.data;

    // Gather all data
    const [user, resumes, applications, interviews, learningTasks, knowledgeDocs, agentRuns] = await Promise.all([
      db.user.findUnique({ where: { id: userId } }),
      db.resume.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
      db.application.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.interview.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.learningTask.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.knowledgeDoc.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
      db.agentRun.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

    const stats = {
      resumeCount: resumes.length,
      atsScore: resumes.length > 0 ? Math.max(...resumes.map((r) => r.atsScore)) : 0,
      applications: applications.length,
      interviews: applications.filter((a) => ["hr", "tech1", "tech2", "hr-final"].includes(a.status)).length,
      offers: applications.filter((a) => a.status === "offer").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      interviewSessions: interviews.length,
      learningTasks: learningTasks.length,
      learningDone: learningTasks.filter((l) => l.status === "done").length,
      knowledgeDocs: knowledgeDocs.length,
      agentRuns: agentRuns.length,
    };

    const date = new Date().toLocaleDateString("zh-CN");

    if (format === "html") {
      const html = generateHTMLReport(user, stats, applications, resumes, learningTasks, date);
      return NextResponse.json({
        content: html,
        mimeType: "text/html",
        filename: `求职进度报告_${date}.html`,
      });
    }

    // Default: markdown
    const markdown = generateMarkdownReport(user, stats, applications, resumes, learningTasks, date);
    return NextResponse.json({
      content: markdown,
      mimeType: "text/markdown",
      filename: `求职进度报告_${date}.md`,
    });
  } catch (error) {
    console.error("Report export API error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateMarkdownReport(
  user: { name: string | null; email: string } | null,
  stats: Record<string, number>,
  applications: { company: string; position: string; status: string; createdAt: Date }[],
  resumes: { title: string; atsScore: number }[],
  learningTasks: { title: string; status: string; duration: number }[],
  date: string
): string {
  return `# 求职进度报告

**生成日期**: ${date}
**用户**: ${user?.name || "Anonymous"} (${user?.email || ""})

---

## 📊 总览统计

| 指标 | 数值 |
|------|------|
| 简历数量 | ${stats.resumeCount} |
| 最高 ATS 分数 | ${stats.atsScore} |
| 投递总数 | ${stats.applications} |
| 面试中 | ${stats.interviews} |
| Offer 数 | ${stats.offers} |
| 未通过 | ${stats.rejected} |
| 面试记录 | ${stats.interviewSessions} |
| 学习任务 | ${stats.learningTasks} (已完成 ${stats.learningDone}) |
| 知识库文档 | ${stats.knowledgeDocs} |
| Agent 运行 | ${stats.agentRuns} |

---

## 📝 简历列表

${resumes.map((r, i) => `${i + 1}. **${r.title}** - ATS: ${r.atsScore}`).join("\n")}

---

## 📋 投递记录

${applications.length > 0 ? applications.map((a, i) => `${i + 1}. **${a.company}** - ${a.position} [${a.status}] - ${new Date(a.createdAt).toLocaleDateString("zh-CN")}`).join("\n") : "暂无投递记录"}

---

## 📚 学习任务

${learningTasks.length > 0 ? learningTasks.map((l, i) => `${i + 1}. ${l.title} [${l.status}] - ${l.duration}min`).join("\n") : "暂无学习任务"}

---

## 📈 转化率分析

- 投递 → 面试转化率: ${stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0}%
- 面试 → Offer 转化率: ${stats.interviews > 0 ? Math.round((stats.offers / stats.interviews) * 100) : 0}%
- 整体成功率: ${stats.applications > 0 ? Math.round((stats.offers / stats.applications) * 100) : 0}%

---

*报告由 AI Job Copilot 自动生成*
`;
}

function generateHTMLReport(
  user: { name: string | null; email: string } | null,
  stats: Record<string, number>,
  applications: { company: string; position: string; status: string; createdAt: Date }[],
  resumes: { title: string; atsScore: number }[],
  learningTasks: { title: string; status: string; duration: number }[],
  date: string
): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>求职进度报告 - ${date}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #1a1a1a; line-height: 1.6; }
  h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
  h2 { color: #1a1a1a; margin-top: 30px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #f4f4f4; font-weight: 600; }
  .stat { display: inline-block; margin: 5px; padding: 10px 15px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0; }
  .stat strong { color: #10b981; font-size: 1.2em; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
<h1>求职进度报告</h1>
<p><strong>生成日期</strong>: ${date}<br><strong>用户</strong>: ${user?.name || "Anonymous"} (${user?.email || ""})</p>

<h2>📊 总览统计</h2>
<div>
  <span class="stat">简历: <strong>${stats.resumeCount}</strong></span>
  <span class="stat">ATS: <strong>${stats.atsScore}</strong></span>
  <span class="stat">投递: <strong>${stats.applications}</strong></span>
  <span class="stat">面试: <strong>${stats.interviews}</strong></span>
  <span class="stat">Offer: <strong>${stats.offers}</strong></span>
</div>

<h2>📝 简历列表</h2>
<table>
  <tr><th>#</th><th>标题</th><th>ATS 分数</th></tr>
  ${resumes.map((r, i) => `<tr><td>${i + 1}</td><td>${r.title}</td><td>${r.atsScore}</td></tr>`).join("")}
</table>

<h2>📋 投递记录</h2>
<table>
  <tr><th>#</th><th>公司</th><th>岗位</th><th>状态</th><th>日期</th></tr>
  ${applications.length > 0 ? applications.map((a, i) => `<tr><td>${i + 1}</td><td>${a.company}</td><td>${a.position}</td><td>${a.status}</td><td>${new Date(a.createdAt).toLocaleDateString("zh-CN")}</td></tr>`).join("") : '<tr><td colspan="5">暂无投递记录</td></tr>'}
</table>

<h2>📈 转化率分析</h2>
<ul>
  <li>投递 → 面试转化率: <strong>${stats.applications > 0 ? Math.round((stats.interviews / stats.applications) * 100) : 0}%</strong></li>
  <li>面试 → Offer 转化率: <strong>${stats.interviews > 0 ? Math.round((stats.offers / stats.interviews) * 100) : 0}%</strong></li>
  <li>整体成功率: <strong>${stats.applications > 0 ? Math.round((stats.offers / stats.applications) * 100) : 0}%</strong></li>
</ul>

<p style="margin-top:40px;color:#999;font-size:12px;">报告由 AI Job Copilot 自动生成</p>
</body>
</html>`;
}
