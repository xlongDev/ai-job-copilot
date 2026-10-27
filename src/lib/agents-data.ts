// ============================================================
// Multi-Agent Architecture — Agent Registry & Definitions
// ============================================================

export interface AgentDef {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  icon: string;
  color: "emerald" | "violet" | "amber" | "rose" | "blue" | "cyan";
  description: string;
  capabilities: string[];
  tools: string[];
  model: string;
  status: "idle" | "thinking" | "working" | "done" | "error";
  tasksCompleted: number;
  successRate: number;
  avgLatency: string;
}

export const agents: AgentDef[] = [
  {
    id: "resume-agent",
    name: "简历优化 Agent",
    nameEn: "Resume Agent",
    role: "简历优化专家",
    icon: "FileText",
    color: "emerald",
    description: "负责简历的全流程优化：STAR 重构、量化数据增强、关键词优化、ATS 兼容性调整、版本管理。",
    capabilities: ["STAR 法则重构", "量化数据增强", "关键词优化", "ATS 兼容性", "多版本管理", "Diff 审查"],
    tools: ["resume_parser", "ats_scanner", "keyword_extractor", "star_generator", "diff_engine"],
    model: "GPT-4o",
    status: "idle",
    tasksCompleted: 142,
    successRate: 96,
    avgLatency: "2.3s",
  },
  {
    id: "interview-agent",
    name: "面试官 Agent",
    nameEn: "Interview Agent",
    role: "模拟面试官",
    icon: "Mic",
    color: "violet",
    description: "生成针对性面试问题，模拟 HR/技术/项目/算法/行为面试，实时评分并给出改进建议。",
    capabilities: ["5 类面试题生成", "实时评分", "STAR 评估", "语音面试", "视频分析", "反馈报告"],
    tools: ["question_bank", "speech_to_text", "text_to_speech", "emotion_analyzer", "scoring_engine"],
    model: "Claude 3.5",
    status: "idle",
    tasksCompleted: 89,
    successRate: 94,
    avgLatency: "1.8s",
  },
  {
    id: "career-coach-agent",
    name: "职业教练 Agent",
    nameEn: "Career Coach Agent",
    role: "职业规划师",
    icon: "Compass",
    color: "amber",
    description: "分析用户优势短板，制定 3/6/12 个月成长路线，推荐课程、书籍、项目和证书。",
    capabilities: ["优势分析", "短板识别", "路线图生成", "资源推荐", "薪资预测", "行业洞察"],
    tools: ["skill_analyzer", "market_data", "roadmap_generator", "resource_db", "salary_predictor"],
    model: "GPT-4o",
    status: "idle",
    tasksCompleted: 67,
    successRate: 98,
    avgLatency: "3.1s",
  },
  {
    id: "learning-agent",
    name: "学习规划 Agent",
    nameEn: "Learning Agent",
    role: "学习路径规划师",
    icon: "GraduationCap",
    color: "blue",
    description: "基于目标岗位生成个性化学习路线，每日/每周/每月计划，自动打卡与进度追踪。",
    capabilities: ["Skill Tree 生成", "每日计划", "进度追踪", "智能复习", "打卡提醒", "学习分析"],
    tools: ["skill_tree_builder", "scheduler", "progress_tracker", "spaced_repetition", "reminder"],
    model: "DeepSeek V3",
    status: "idle",
    tasksCompleted: 203,
    successRate: 97,
    avgLatency: "1.5s",
  },
  {
    id: "job-hunter-agent",
    name: "求职猎手 Agent",
    nameEn: "Job Hunter Agent",
    role: "自动投递助手",
    icon: "Target",
    color: "rose",
    description: "自动浏览招聘网站，分析 JD 匹配度，辅助投递，追踪进度，管理面试日程。",
    capabilities: ["JD 抓取", "匹配分析", "自动投递", "进度追踪", "面试提醒", "薪资谈判"],
    tools: ["browser_automation", "jd_parser", "match_engine", "tracker", "calendar_sync"],
    model: "GPT-4o",
    status: "idle",
    tasksCompleted: 34,
    successRate: 91,
    avgLatency: "5.2s",
  },
  {
    id: "ats-agent",
    name: "ATS 分析 Agent",
    nameEn: "ATS Agent",
    role: "ATS 兼容性专家",
    icon: "ScanLine",
    color: "cyan",
    description: "深度扫描简历 ATS 兼容性，10 维度评分，实时检测，一键修复建议。",
    capabilities: ["10 维度扫描", "实时检测", "修复建议", "格式优化", "关键词密度", "解析测试"],
    tools: ["ats_scanner", "format_checker", "keyword_density", "parser_test", "fix_suggester"],
    model: "Claude 3.5",
    status: "idle",
    tasksCompleted: 178,
    successRate: 99,
    avgLatency: "0.9s",
  },
];

// ============================================================
// LangGraph Workflow Definition
// ============================================================

export interface WorkflowNode {
  id: string;
  label: string;
  type: "input" | "agent" | "tool" | "decision" | "output";
  agentId?: string;
  x: number;
  y: number;
  status: "idle" | "running" | "done" | "error";
}

export interface WorkflowEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

export const workflowNodes: WorkflowNode[] = [
  { id: "input", label: "用户目标", type: "input", x: 50, y: 250, status: "done" },
  { id: "jd-parse", label: "JD 解析", type: "tool", x: 220, y: 250, status: "done" },
  { id: "resume-agent", label: "简历优化 Agent", type: "agent", agentId: "resume-agent", x: 400, y: 120, status: "done" },
  { id: "ats-agent", label: "ATS 分析 Agent", type: "agent", agentId: "ats-agent", x: 400, y: 250, status: "done" },
  { id: "career-agent", label: "职业教练 Agent", type: "agent", agentId: "career-coach-agent", x: 400, y: 380, status: "running" },
  { id: "decision", label: "匹配度 ≥ 80%?", type: "decision", x: 600, y: 250, status: "idle" },
  { id: "interview-agent", label: "面试官 Agent", type: "agent", agentId: "interview-agent", x: 780, y: 120, status: "idle" },
  { id: "learning-agent", label: "学习规划 Agent", type: "agent", agentId: "learning-agent", x: 780, y: 380, status: "idle" },
  { id: "job-hunter", label: "求职猎手 Agent", type: "agent", agentId: "job-hunter-agent", x: 960, y: 250, status: "idle" },
  { id: "output", label: "完整方案", type: "output", x: 1140, y: 250, status: "idle" },
];

export const workflowEdges: WorkflowEdge[] = [
  { from: "input", to: "jd-parse" },
  { from: "jd-parse", to: "resume-agent" },
  { from: "jd-parse", to: "ats-agent" },
  { from: "jd-parse", to: "career-agent" },
  { from: "resume-agent", to: "decision" },
  { from: "ats-agent", to: "decision" },
  { from: "career-agent", to: "decision" },
  { from: "decision", to: "interview-agent", label: "是", condition: "match >= 80" },
  { from: "decision", to: "learning-agent", label: "否", condition: "match < 80" },
  { from: "interview-agent", to: "job-hunter" },
  { from: "learning-agent", to: "job-hunter" },
  { from: "job-hunter", to: "output" },
];

// ============================================================
// RAG Knowledge Base
// ============================================================

export interface KnowledgeDoc {
  id: string;
  name: string;
  type: "resume" | "project" | "offer" | "notes" | "certificate" | "jd";
  size: string;
  chunks: number;
  uploadedAt: string;
  status: "indexed" | "processing" | "error";
  embeddings: number;
}

export const mockKnowledgeBase: KnowledgeDoc[] = [
  { id: "1", name: "Alex_Chen_Resume_v3.pdf", type: "resume", size: "284 KB", chunks: 12, uploadedAt: "2小时前", status: "indexed", embeddings: 12 },
  { id: "2", name: "前端监控系统设计文档.md", type: "project", size: "45 KB", chunks: 8, uploadedAt: "昨天", status: "indexed", embeddings: 8 },
  { id: "3", name: "腾讯_Offer_2024.pdf", type: "offer", size: "120 KB", chunks: 3, uploadedAt: "3天前", status: "indexed", embeddings: 3 },
  { id: "4", name: "React学习笔记.md", type: "notes", size: "89 KB", chunks: 24, uploadedAt: "1周前", status: "indexed", embeddings: 24 },
  { id: "5", name: "AWS_Certified_Developer.pdf", type: "certificate", size: "156 KB", chunks: 2, uploadedAt: "2周前", status: "indexed", embeddings: 2 },
  { id: "6", name: "字节跳动_JD_前端.txt", type: "jd", size: "12 KB", chunks: 5, uploadedAt: "正在处理", status: "processing", embeddings: 0 },
];

// ============================================================
// MCP Servers
// ============================================================

export interface MCPServer {
  id: string;
  name: string;
  icon: string;
  status: "connected" | "disconnected" | "error";
  tools: number;
  description: string;
  category: string;
}

export const mockMCPServers: MCPServer[] = [
  { id: "github", name: "GitHub", icon: "Github", status: "connected", tools: 12, description: "仓库管理、PR、Issue、代码搜索", category: "开发" },
  { id: "notion", name: "Notion", icon: "FileText", status: "connected", tools: 8, description: "文档读写、数据库操作", category: "文档" },
  { id: "gmail", name: "Gmail", icon: "Mail", status: "connected", tools: 6, description: "邮件发送、搜索、分类", category: "通讯" },
  { id: "calendar", name: "Google Calendar", icon: "Calendar", status: "connected", tools: 5, description: "日程管理、面试安排", category: "日程" },
  { id: "drive", name: "Google Drive", icon: "HardDrive", status: "disconnected", tools: 7, description: "文件存储与共享", category: "存储" },
  { id: "slack", name: "Slack", icon: "MessageSquare", status: "disconnected", tools: 9, description: "团队消息与通知", category: "通讯" },
  { id: "jira", name: "Jira", icon: "Square", status: "disconnected", tools: 11, description: "项目管理与任务追踪", category: "项目" },
  { id: "figma", name: "Figma", icon: "Figma", status: "disconnected", tools: 6, description: "设计文件读取", category: "设计" },
  { id: "linear", name: "Linear", icon: "Layers", status: "disconnected", tools: 8, description: "Issue 管理与追踪", category: "项目" },
];

// ============================================================
// Browser Agent — Job Sites
// ============================================================

export interface JobSite {
  id: string;
  name: string;
  url: string;
  icon: string;
  jobsFound: number;
  autoApplied: number;
  status: "scanning" | "active" | "paused";
}

export const mockJobSites: JobSite[] = [
  { id: "linkedin", name: "LinkedIn", url: "linkedin.com/jobs", icon: "Linkedin", jobsFound: 142, autoApplied: 12, status: "active" },
  { id: "boss", name: "BOSS直聘", url: "zhipin.com", icon: "Briefcase", jobsFound: 89, autoApplied: 8, status: "scanning" },
  { id: "lagou", name: "拉勾网", url: "lagou.com", icon: "Briefcase", jobsFound: 56, autoApplied: 5, status: "active" },
  { id: "indeed", name: "Indeed", url: "indeed.com", icon: "Search", jobsFound: 203, autoApplied: 0, status: "paused" },
  { id: "glassdoor", name: "Glassdoor", url: "glassdoor.com", icon: "Building", jobsFound: 78, autoApplied: 3, status: "active" },
];

export const mockBrowserActivity = [
  { time: "14:32", site: "LinkedIn", action: "发现 3 个匹配岗位", type: "found" },
  { time: "14:28", site: "BOSS直聘", action: "自动投递：字节跳动-前端工程师", type: "applied" },
  { time: "14:15", site: "LinkedIn", action: "分析 JD：腾讯-Staff前端", type: "analyzed" },
  { time: "14:02", site: "拉勾网", action: "发现 5 个匹配岗位", type: "found" },
  { time: "13:45", site: "BOSS直聘", action: "自动投递：美团-高级前端", type: "applied" },
  { time: "13:30", site: "LinkedIn", action: "HR 回复：邀请面试", type: "reply" },
];

// ============================================================
// Plugins
// ============================================================

export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  category: string;
  installs: string;
  rating: number;
  enabled: boolean;
  icon: string;
  color: string;
  verified: boolean;
}

export const mockPlugins: Plugin[] = [
  { id: "1", name: "简历模板库", description: "50+ 精选简历模板，一键应用", author: "AI Job Copilot", category: "简历", installs: "12.4k", rating: 4.9, enabled: true, icon: "FileText", color: "emerald", verified: true },
  { id: "2", name: "面试录音转写", description: "自动录音并转写面试内容", author: "VoiceAI", category: "面试", installs: "8.7k", rating: 4.7, enabled: true, icon: "Mic", color: "violet", verified: true },
  { id: "3", name: "薪资计算器", description: "根据城市/级别计算合理薪资范围", author: "SalaryPro", category: "工具", installs: "15.2k", rating: 4.8, enabled: false, icon: "DollarSign", color: "amber", verified: true },
  { id: "4", name: "GitHub 仓库分析", description: "深度分析 GitHub 代码质量", author: "CodeInsight", category: "作品集", installs: "6.3k", rating: 4.6, enabled: true, icon: "Github", color: "blue", verified: true },
  { id: "5", name: "LeetCode 刷题助手", description: "根据目标岗位推荐算法题", author: "AlgoMaster", category: "学习", installs: "22.1k", rating: 4.9, enabled: false, icon: "Code2", color: "rose", verified: true },
  { id: "6", name: "Offer 谈判教练", description: "AI 辅助薪资谈判话术", author: "NegotiateAI", category: "工具", installs: "4.5k", rating: 4.5, enabled: false, icon: "Handshake", color: "cyan", verified: false },
  { id: "7", name: "公司背景调查", description: "自动收集公司文化、薪资、评价", author: "CompanyInsight", category: "工具", installs: "9.8k", rating: 4.7, enabled: true, icon: "Building", color: "violet", verified: true },
  { id: "8", name: "多语言简历", description: "一键翻译简历为 6 种语言", author: "TranslatePro", category: "简历", installs: "7.2k", rating: 4.6, enabled: false, icon: "Globe", color: "emerald", verified: true },
];

// ============================================================
// SaaS Billing Plans
// ============================================================

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  credits: number;
  features: string[];
  highlighted: boolean;
  cta: string;
  color: string;
}

export const mockPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "永久免费",
    credits: 100,
    features: ["每月 100 AI 积分", "1 份简历", "基础 ATS 扫描", "AI 对话（每日 10 次）", "社区支持"],
    highlighted: false,
    cta: "开始使用",
    color: "muted",
  },
  {
    id: "pro",
    name: "Pro",
    price: 39,
    period: "/月",
    credits: 2000,
    features: ["每月 2000 AI 积分", "无限简历", "高级 ATS 扫描", "无限 AI 对话", "AI Job Agent", "模拟面试", "RAG 知识库", "优先支持"],
    highlighted: true,
    cta: "升级到 Pro",
    color: "emerald",
  },
  {
    id: "team",
    name: "Team",
    price: 99,
    period: "/月/人",
    credits: 5000,
    features: ["Pro 全部功能", "每月 5000 AI 积分", "团队协作（5 席位）", "共享知识库", "团队分析看板", "MCP 集成", "API 访问", "专属客服"],
    highlighted: false,
    cta: "开始团队试用",
    color: "violet",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: -1,
    period: "联系销售",
    credits: -1,
    features: ["Team 全部功能", "无限 AI 积分", "无限席位", "私有化部署", "SSO 单点登录", "SLA 99.9%", "定制 Agent", "专属解决方案"],
    highlighted: false,
    cta: "联系销售",
    color: "amber",
  },
];

export const mockCreditUsage = [
  { date: "7月1日", used: 145, remaining: 1855 },
  { date: "7月2日", used: 89, remaining: 1766 },
  { date: "7月3日", used: 234, remaining: 1532 },
  { date: "7月4日", used: 67, remaining: 1465 },
  { date: "7月5日", used: 178, remaining: 1287 },
  { date: "7月6日", used: 215, remaining: 1072 },
  { date: "7月7日", used: 156, remaining: 916 },
];

// ============================================================
// Team Members
// ============================================================

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  avatar: string;
  status: "active" | "invited";
  creditsUsed: number;
  lastActive: string;
}

export const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen", email: "alex@company.com", role: "owner", avatar: "AC", status: "active", creditsUsed: 1450, lastActive: "在线" },
  { id: "2", name: "Sarah Wang", email: "sarah@company.com", role: "admin", avatar: "SW", status: "active", creditsUsed: 890, lastActive: "5分钟前" },
  { id: "3", name: "Mike Liu", email: "mike@company.com", role: "member", avatar: "ML", status: "active", creditsUsed: 620, lastActive: "1小时前" },
  { id: "4", name: "Emma Zhang", email: "emma@company.com", role: "member", avatar: "EZ", status: "invited", creditsUsed: 0, lastActive: "待接受" },
];

// ============================================================
// Voice/Video Interview Analysis
// ============================================================

export const mockVoiceMetrics = {
  fluency: 82,
  pace: 75,
  confidence: 78,
  clarity: 88,
  fillerWords: 12,
  silenceRatio: 18,
  totalDuration: "8:42",
  wordCount: 1240,
};

export const mockVideoMetrics = {
  eyeContact: 76,
  facialExpression: 82,
  posture: 85,
  gesture: 71,
  engagement: 79,
  nervousness: 34,
};

export const mockInterviewTimeline = [
  { time: "00:30", event: "自我介绍", score: 85, note: "表达流畅，结构清晰" },
  { time: "02:15", event: "项目深挖", score: 78, note: "技术细节回答到位" },
  { time: "05:40", event: "系统设计", score: 72, note: "可以更结构化" },
  { time: "07:20", event: "反问环节", score: 90, note: "问题有深度" },
];

// ============================================================
// Agent Collaboration Messages
// ============================================================

export interface AgentMessage {
  agentId: string;
  message: string;
  time: string;
  status: "done" | "running" | "pending";
}

export const mockAgentMessages: AgentMessage[] = [
  { agentId: "resume-agent", message: "检测到新简历上传，开始解析...", time: "00:01", status: "done" },
  { agentId: "resume-agent", message: "识别 4 段工作经历，3 个项目，开始 STAR 优化", time: "00:03", status: "done" },
  { agentId: "ats-agent", message: "ATS 扫描完成，当前分数 79，发现 5 项可优化", time: "00:05", status: "done" },
  { agentId: "resume-agent", message: "已应用 ATS 建议，分数提升至 92", time: "00:08", status: "done" },
  { agentId: "interview-agent", message: "基于简历生成 15 道针对性面试题", time: "00:10", status: "done" },
  { agentId: "career-coach-agent", message: "分析技能缺口，生成 3 个月成长计划", time: "00:12", status: "done" },
  { agentId: "learning-agent", message: "制定每日学习计划，已安排 30 天任务", time: "00:14", status: "done" },
  { agentId: "job-hunter-agent", message: "扫描 48 个匹配岗位，已筛选 Top 10", time: "00:16", status: "running" },
];
