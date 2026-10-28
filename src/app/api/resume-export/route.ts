import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const resumeExportSchema = z.object({
  resumeId: z.string().min(1).max(100),
  format: z.enum(["markdown","json","txt","html"]),
});

export const runtime = "nodejs";
export const maxDuration = 30;

// POST /api/resume-export — export resume in different formats
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, resumeExportSchema);
    if (!parsed.ok) return parsed.response;
    const {resumeId, format} = parsed.data;

    if (!resumeId || !format) {
      return NextResponse.json({ error: "Resume ID and format are required" }, { status: 400 });
    }

    const resume = await db.resume.findFirst({ where: { id: resumeId, userId } });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let content = "";
    let mimeType = "";
    let filename = "";

    switch (format) {
      case "markdown":
        content = resume.content;
        mimeType = "text/markdown";
        filename = `${resume.title.replace(/\s+/g, "_")}.md`;
        break;

      case "json":
        content = JSON.stringify({
          title: resume.title,
          content: resume.content,
          format: resume.format,
          atsScore: resume.atsScore,
          version: resume.version,
          updatedAt: resume.updatedAt,
        }, null, 2);
        mimeType = "application/json";
        filename = `${resume.title.replace(/\s+/g, "_")}.json`;
        break;

      case "txt":
        // Strip markdown formatting
        content = resume.content
          .replace(/^#+\s+/gm, "")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/^[-*]\s+/gm, "• ");
        mimeType = "text/plain";
        filename = `${resume.title.replace(/\s+/g, "_")}.txt`;
        break;

      case "html":
        // Convert markdown to simple HTML
        content = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${resume.title}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; color: #333; line-height: 1.6; }
  h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
  h2 { color: #1a1a1a; margin-top: 30px; }
  h3 { color: #4a4a4a; }
  ul { padding-left: 20px; }
  li { margin-bottom: 4px; }
  code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
${resume.content
  .replace(/^# (.+)$/gm, '<h1>$1</h1>')
  .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  .replace(/\*([^*]+)\*/g, "<em>$1</em>")
  .replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
  .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
  .replace(/\n\n/g, "</p><p>")
  .replace(/^(?!<[hul])(.+)$/gm, "<p>$1</p>")
}
</body>
</html>`;
        mimeType = "text/html";
        filename = `${resume.title.replace(/\s+/g, "_")}.html`;
        break;

      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

    return NextResponse.json({
      content,
      mimeType,
      filename,
      format,
    });
  } catch (error) {
    console.error("Resume export API error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
