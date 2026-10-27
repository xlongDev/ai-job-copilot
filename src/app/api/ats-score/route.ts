import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface ATSDimension {
  name: string;
  score: number;
  issues: string[];
  suggestions: string[];
}

interface ATSResult {
  totalScore: number;
  dimensions: ATSDimension[];
  keywords: string[];
  suggestions: { priority: "high" | "medium" | "low"; text: string }[];
}

// Real ATS scoring algorithm — analyzes resume text for compatibility
export async function POST(req: NextRequest) {
  try {
    const { content } = (await req.json()) as { content: string };

    if (!content || content.trim().length < 50) {
      return NextResponse.json({
        error: "Resume content too short for analysis",
      }, { status: 400 });
    }

    const result = analyzeATS(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ATS score API error:", error);
    return NextResponse.json({ error: "ATS analysis failed" }, { status: 500 });
  }
}

function analyzeATS(content: string): ATSResult {
  const text = content.toLowerCase();
  const lines = content.split("\n").filter((l) => l.trim());
  const words = content.split(/\s+/).filter(Boolean);
  const charCount = content.length;
  const wordCount = words.length;

  const dimensions: ATSDimension[] = [];
  const allSuggestions: { priority: "high" | "medium" | "low"; text: string }[] = [];

  // 1. 标题与结构
  const hasName = /^[#]?\s*[a-z\u4e00-\u9fa5]/i.test(content);
  const hasEmail = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(content);
  const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3,4}[-.\s]?\d{4}/.test(content);
  const hasSectionHeaders = /(^|\n)\s*[#\-*]?\s*(工作经历|教育经历|技能|项目经验|work experience|education|skills|projects|experience)/i.test(content);

  const structureIssues: string[] = [];
  if (!hasEmail) structureIssues.push("缺少邮箱地址");
  if (!hasPhone) structureIssues.push("缺少联系电话");
  if (!hasSectionHeaders) structureIssues.push("缺少明确的章节标题（工作经历、技能等）");

  const structureScore = Math.max(0, 100 - structureIssues.length * 20);
  dimensions.push({
    name: "标题与结构",
    score: structureScore,
    issues: structureIssues,
    suggestions: structureIssues.length > 0 ? ["添加邮箱、电话等联系方式", "使用明确的章节标题"] : [],
  });

  // 2. 关键词覆盖
  const techKeywords = [
    "javascript", "typescript", "react", "vue", "angular", "next.js", "nextjs", "node.js", "nodejs",
    "python", "java", "go", "rust", "c++", "html", "css", "sass", "tailwind",
    "webpack", "vite", "babel", "eslint", "jest", "cypress",
    "docker", "kubernetes", "k8s", "ci/cd", "git", "linux",
    "mysql", "postgresql", "redis", "mongodb", "graphql", "rest api",
    "aws", "azure", "gcp", "vercel",
    "微前端", "性能优化", "工程化", "架构", "ssr", "ssg",
  ];
  const foundKeywords = techKeywords.filter((kw) => text.includes(kw));
  const keywordScore = Math.min(100, Math.round((foundKeywords.length / 15) * 100));

  dimensions.push({
    name: "关键词覆盖",
    score: keywordScore,
    issues: foundKeywords.length < 10 ? [`仅检测到 ${foundKeywords.length} 个技术关键词，建议至少 15 个`] : [],
    suggestions: foundKeywords.length < 10 ? ["补充与目标岗位相关的技术关键词", "在技能和项目经历中增加更多技术栈"] : [],
  });

  // 3. 内容长度
  let lengthScore: number;
  if (wordCount < 100) lengthScore = 30;
  else if (wordCount < 300) lengthScore = 60;
  else if (wordCount < 800) lengthScore = 90;
  else if (wordCount < 1500) lengthScore = 100;
  else lengthScore = 80; // too long

  dimensions.push({
    name: "内容长度",
    score: lengthScore,
    issues: wordCount < 100 ? ["简历内容过短"] : wordCount > 1500 ? ["简历内容过长，建议精简"] : [],
    suggestions: wordCount < 300 ? ["扩充项目经历和工作经历的描述"] : wordCount > 1500 ? ["精简内容，突出重点"] : [],
  });

  // 4. 量化数据
  const hasNumbers = /\d+%|\d+次|\d+个|\d+万|\d+百万|\d+billion|\d+million|\d+k\b|\d+用户|\d+人/i.test(content);
  const numberCount = (content.match(/\d+/g) || []).length;
  const quantScore = numberCount < 3 ? 40 : numberCount < 6 ? 70 : numberCount < 10 ? 90 : 100;

  dimensions.push({
    name: "量化数据",
    score: quantScore,
    issues: numberCount < 3 ? ["缺少量化数据"] : [],
    suggestions: numberCount < 6 ? ["增加更多量化成果（如性能提升百分比、用户规模等）"] : [],
  });

  // 5. 行动动词
  const actionVerbs = [
    "主导", "负责", "开发", "设计", "实现", "优化", "重构", "搭建", "推动", "带领",
    "led", "developed", "designed", "implemented", "optimized", "built", "created", "managed", "launched",
  ];
  const foundVerbs = actionVerbs.filter((v) => text.includes(v));
  const verbScore = Math.min(100, foundVerbs.length * 15);

  dimensions.push({
    name: "行动动词",
    score: verbScore,
    issues: foundVerbs.length < 3 ? ["缺少强行动动词"] : [],
    suggestions: foundVerbs.length < 5 ? ["使用更多强行动动词（如主导、重构、优化）"] : [],
  });

  // 6. 技能展示
  const hasSkillsSection = /(技能|skills|技术栈|tech stack)/i.test(content);
  const skillScore = hasSkillsSection ? 90 : 50;

  dimensions.push({
    name: "技能展示",
    score: skillScore,
    issues: !hasSkillsSection ? ["缺少明确的技能模块"] : [],
    suggestions: !hasSkillsSection ? ["添加专门的技能模块，列出技术栈"] : [],
  });

  // 7. 项目经验
  const hasProjects = /(项目经验|projects|项目经历)/i.test(content);
  const projectScore = hasProjects ? 85 : 45;

  dimensions.push({
    name: "项目经验",
    score: projectScore,
    issues: !hasProjects ? ["缺少项目经验模块"] : [],
    suggestions: !hasProjects ? ["添加项目经验，使用 STAR 法则描述"] : [],
  });

  // 8. 格式兼容性
  const hasSpecialChars = /[\u{1F600}-\u{1F64F}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(content);
  const hasTables = /\|.*\|.*\|/.test(content);
  const formatIssues: string[] = [];
  if (hasSpecialChars) formatIssues.push("包含特殊字符/emoji，ATS 可能无法识别");
  if (hasTables) formatIssues.push("包含表格，部分 ATS 系统无法解析");
  const formatScore = Math.max(0, 100 - formatIssues.length * 25);

  dimensions.push({
    name: "格式兼容性",
    score: formatScore,
    issues: formatIssues,
    suggestions: formatIssues,
  });

  // 9. 联系方式
  const hasLocation = /(北京|上海|深圳|广州|杭州|成都|beijing|shanghai|shenzhen|location|所在地)/i.test(content);
  const hasLinkedIn = /linkedin/i.test(content);
  const hasGithub = /github/i.test(content);
  const contactScore = (hasEmail ? 30 : 0) + (hasPhone ? 30 : 0) + (hasLocation ? 20 : 0) + (hasLinkedIn || hasGithub ? 20 : 0);

  dimensions.push({
    name: "联系方式",
    score: contactScore,
    issues: !hasLocation ? ["缺少所在地信息"] : [],
    suggestions: !hasGithub ? ["添加 GitHub 链接展示代码能力"] : [],
  });

  // 10. 教育经历
  const hasEducation = /(教育经历|education|大学|university|本科|硕士|bachelor|master)/i.test(content);
  const eduScore = hasEducation ? 90 : 40;

  dimensions.push({
    name: "教育经历",
    score: eduScore,
    issues: !hasEducation ? ["缺少教育经历"] : [],
    suggestions: !hasEducation ? ["添加教育经历模块"] : [],
  });

  // Calculate total
  const totalScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );

  // Collect suggestions
  dimensions.forEach((d) => {
    d.suggestions.forEach((s) => {
      const priority = d.score < 50 ? "high" : d.score < 75 ? "medium" : "low";
      allSuggestions.push({ priority, text: s });
    });
  });

  return {
    totalScore,
    dimensions,
    keywords: foundKeywords,
    suggestions: allSuggestions,
  };
}
