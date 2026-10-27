import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ParsedJD {
  position: string;
  company: string;
  location: string;
  salary: string;
  requirements: string[];
  skills: string[];
  keywords: string[];
  responsibilities: string[];
  matchScore: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jdText,
      resumeContent,
      provider = "zai",
      apiKey,
      model,
      baseUrl,
    } = body;

    if (!jdText || jdText.trim().length < 20) {
      return NextResponse.json(
        { error: "JD text is too short" },
        { status: 400 }
      );
    }

    const result = await callAI({
      messages: [
        {
          role: "system",
          content: `你是 JD 分析专家。解析给定的岗位描述（JD），提取结构化信息。输出 JSON 格式：
{
  "position": "岗位名称",
  "company": "公司名称（如果JD中未提及则为空）",
  "location": "工作地点",
  "salary": "薪资范围",
  "requirements": ["要求1", "要求2"],
  "skills": ["技能1", "技能2"],
  "keywords": ["关键词1", "关键词2"],
  "responsibilities": ["职责1", "职责2"]
}
只输出 JSON，不要其他文字。`,
        },
        {
          role: "user",
          content: `请解析以下 JD：\n\n${jdText}`,
        },
      ],
      provider,
      apiKey,
      model,
      baseUrl,
      temperature: 0.3,
      maxTokens: 1500,
    });

    let parsed: ParsedJD | null;
    try {
      const jsonMatch = result.content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      parsed = null;
    }

    if (!parsed) {
      // Fallback: simple regex-based parsing
      parsed = simpleParseJD(jdText);
    }

    // Calculate match score if resume content provided
    let matchScore = 0;
    let missingSkills: string[] = [];
    if (resumeContent && parsed.skills) {
      const resumeLower = resumeContent.toLowerCase();
      const matched = parsed.skills.filter((s) =>
        resumeLower.includes(s.toLowerCase())
      );
      matchScore = Math.round((matched.length / parsed.skills.length) * 100);
      missingSkills = parsed.skills.filter(
        (s) => !resumeLower.includes(s.toLowerCase())
      );
    }

    return NextResponse.json({
      parsed,
      matchScore,
      missingSkills,
      provider: result.provider,
      model: result.model,
    });
  } catch (error) {
    console.error("JD parse API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `JD parsing failed: ${message}` },
      { status: 500 }
    );
  }
}

function simpleParseJD(jdText: string): ParsedJD {
  const lines = jdText.split("\n").filter((l) => l.trim());
  const text = jdText.toLowerCase();

  // Extract position
  let position = "";
  const positionMatch = jdText.match(/(?:岗位|职位|position|role)[:\s]*([^\n]+)/i);
  if (positionMatch) position = positionMatch[1].trim();
  else if (lines[0]) position = lines[0].slice(0, 50);

  // Extract company
  let company = "";
  const companyMatch = jdText.match(/(?:公司|company|企业)[:\s]*([^\n]+)/i);
  if (companyMatch) company = companyMatch[1].trim();

  // Extract location
  let location = "";
  const locationMatch = jdText.match(/(?:地点|location|工作地点|城市)[:\s]*([^\n]+)/i);
  if (locationMatch) location = locationMatch[1].trim();
  else {
    const cities = ["北京", "上海", "深圳", "广州", "杭州", "成都", "南京", "武汉", "西安"];
    for (const city of cities) {
      if (jdText.includes(city)) {
        location = city;
        break;
      }
    }
  }

  // Extract salary
  let salary = "";
  const salaryMatch = jdText.match(/(?:薪资|salary|薪酬|待遇)[:\s]*([^\n]+)/i);
  if (salaryMatch) salary = salaryMatch[1].trim();
  else {
    const salaryPattern = jdText.match(/\d+[-~]\d+[kK万]/);
    if (salaryPattern) salary = salaryPattern[0];
  }

  // Extract skills
  const techKeywords = [
    "javascript", "typescript", "react", "vue", "angular", "next.js", "node.js",
    "python", "java", "go", "rust", "html", "css", "webpack", "vite",
    "docker", "kubernetes", "git", "mysql", "postgresql", "redis", "mongodb",
    "graphql", "微前端", "性能优化", "ssr", "ci/cd",
  ];
  const skills = techKeywords.filter((kw) => text.includes(kw.toLowerCase()));

  return {
    position: position || "未知岗位",
    company: company || "未知公司",
    location: location || "未知",
    salary: salary || "面议",
    requirements: [],
    skills,
    keywords: skills,
    responsibilities: [],
    matchScore: 0,
  };
}
