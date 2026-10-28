import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const resumeTemplateSchema = z.object({
  templateId: z.string().max(60).optional(),
  content: z.string().max(500_000).optional(),
});

export const runtime = "nodejs";

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  layout: "single-column" | "two-column" | "sidebar" | "minimal";
  sections: string[];
  preview: string;
}

const TEMPLATES: ResumeTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    description: "现代简约风格，单栏布局，适合技术岗位",
    color: "emerald",
    layout: "single-column",
    sections: ["header", "summary", "experience", "skills", "education"],
    preview: "现代简约",
  },
  {
    id: "professional",
    name: "Professional",
    description: "专业商务风格，双栏布局，适合管理岗位",
    color: "blue",
    layout: "two-column",
    sections: ["header", "summary", "experience", "education", "skills"],
    preview: "专业商务",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "侧边栏布局，突出技能和联系方式",
    color: "violet",
    layout: "sidebar",
    sections: ["sidebar", "header", "experience", "projects", "education"],
    preview: "侧边栏",
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "极简风格，纯文字，ATS 100% 兼容",
    color: "slate",
    layout: "minimal",
    sections: ["header", "experience", "education", "skills"],
    preview: "极简",
  },
  {
    id: "creative",
    name: "Creative",
    description: "创意设计风格，适合设计/产品岗位",
    color: "amber",
    layout: "two-column",
    sections: ["header", "portfolio", "experience", "skills", "education"],
    preview: "创意设计",
  },
  {
    id: "academic",
    name: "Academic",
    description: "学术风格，突出论文和研究",
    color: "rose",
    layout: "single-column",
    sections: ["header", "research", "education", "publications", "experience"],
    preview: "学术",
  },
];

// GET /api/resume-templates — list all templates
export async function GET() {
  return NextResponse.json({ templates: TEMPLATES });
}

// POST /api/resume-templates — render resume with template
export async function POST(req: NextRequest) {
  try {
    const parsed = await parseBody(req, resumeTemplateSchema);
    if (!parsed.ok) return parsed.response;
    const {templateId, content} = parsed.data;

    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Return template metadata + content
    return NextResponse.json({
      template,
      content,
      rendered: true,
    });
  } catch (error) {
    console.error("POST /api/resume-templates error:", error);
    return NextResponse.json({ error: "Failed to render template" }, { status: 500 });
  }
}
