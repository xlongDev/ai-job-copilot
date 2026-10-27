// ============================================================
// Mock Data Layer — 让应用看起来像真实运行的产品
// ============================================================

export const mockUser = {
  name: "Alex Chen",
  email: "alex.chen@email.com",
  avatar: "AC",
  role: "Senior Frontend Engineer",
  targetRole: "Staff Frontend Engineer @ Tencent",
  plan: "Pro",
  joinDate: "2024-03-15",
};

export const mockDashboardStats = {
  atsScore: 87,
  atsTrend: 8,
  applications: 24,
  applicationsTrend: 12,
  interviews: 6,
  interviewsTrend: 50,
  offers: 2,
  offersTrend: 100,
  aiOptimizations: 47,
  learningHours: 128,
  skillGrowth: 23,
};

export const mockATSTrend = [
  { date: "6月1日", score: 62, optimize: 2 },
  { date: "6月5日", score: 68, optimize: 4 },
  { date: "6月10日", score: 71, optimize: 5 },
  { date: "6月15日", score: 75, optimize: 7 },
  { date: "6月20日", score: 79, optimize: 9 },
  { date: "6月25日", score: 83, optimize: 11 },
  { date: "6月30日", score: 87, optimize: 14 },
];

export const mockApplicationTrend = [
  { week: "W1", applied: 8, interview: 1, offer: 0 },
  { week: "W2", applied: 12, interview: 2, offer: 0 },
  { week: "W3", applied: 6, interview: 3, offer: 1 },
  { week: "W4", applied: 15, interview: 4, offer: 1 },
  { week: "W5", applied: 9, interview: 2, offer: 0 },
  { week: "W6", applied: 11, interview: 3, offer: 1 },
];

export const mockSkillRadar = [
  { skill: "React", value: 92, target: 95, fullMark: 100 },
  { skill: "TypeScript", value: 88, target: 90, fullMark: 100 },
  { skill: "系统设计", value: 65, target: 85, fullMark: 100 },
  { skill: "算法", value: 72, target: 80, fullMark: 100 },
  { skill: "工程化", value: 80, target: 88, fullMark: 100 },
  { skill: "AI/LLM", value: 55, target: 75, fullMark: 100 },
];

export const mockTodayTasks = [
  { title: "优化简历项目经历", desc: "使用 STAR 法则重写 2 个项目", priority: "高", done: true },
  { title: "完成 React 进阶第 20 课", desc: "学习 Concurrent Mode", priority: "中", done: true },
  { title: "投递字节跳动前端岗", desc: "JD 匹配度 92%", priority: "高", done: false },
  { title: "模拟面试 - 系统设计", desc: "AI 生成 5 道题", priority: "中", done: false },
  { title: "复习算法 - 动态规划", desc: "LeetCode 3 题", priority: "低", done: false },
];

export const mockAIInsights = [
  {
    type: "success" as const,
    title: "ATS 分数提升显著",
    desc: "过去 7 天提升 25%，超过 73% 用户",
  },
  {
    type: "warning" as const,
    title: "系统设计技能待加强",
    desc: "距离目标岗位还差 20%",
  },
  {
    type: "info" as const,
    title: "发现 3 个高匹配岗位",
    desc: "字节、美团、阿里，匹配度 > 90%",
  },
];

export const mockRecentResumes = [
  { id: "1", name: "前端工程师简历 v3", updatedAt: "2 小时前", atsScore: 87, version: "v3" },
  { id: "2", name: "全栈工程师简历", updatedAt: "昨天", atsScore: 82, version: "v2" },
  { id: "3", name: "应届生简历", updatedAt: "3 天前", atsScore: 75, version: "v1" },
];

export const mockRecentApplications = [
  { company: "字节跳动", role: "高级前端工程师", status: "Interview", date: "2 天前" },
  { company: "腾讯", role: "Staff 前端", status: "Applied", date: "3 天前" },
  { company: "美团", role: "前端架构师", status: "Offer", date: "5 天前" },
  { company: "阿里巴巴", role: "高级前端", status: "Rejected", date: "1 周前" },
];

// ============================================================
// Resume Builder
// ============================================================

export const mockResumeContent = `# Alex Chen
高级前端工程师 | 5 年经验

## 联系方式
- 邮箱: alex.chen@email.com
- 电话: 138-0000-0000
- GitHub: github.com/alexchen
- 所在地: 深圳

## 个人简介
5 年前端开发经验，专注于 React 生态和性能优化。曾主导多个大型 ToB 项目的前端架构设计，带领团队将首屏加载时间从 4.2s 优化到 1.1s。对前端工程化、微前端架构有深入实践。

## 工作经历

### 某互联网公司 | 高级前端工程师 | 2022.03 - 至今
- 负责公司核心 SaaS 产品的前端开发
- 主导微前端架构改造，将 3 个独立应用整合
- 优化首屏加载性能，LCP 从 4.2s 降到 1.1s
- 带领 4 人前端团队，建立代码规范和 CI/CD 流程

### 某创业公司 | 前端工程师 | 2020.07 - 2022.02
- 开发公司官网和管理后台
- 使用 React + TypeScript 重构旧项目
- 实现组件库，提升开发效率 40%

## 项目经历

### 企业级 SaaS 平台
- 技术栈: React 18, TypeScript, Next.js, TailwindCSS
- 主导前端架构设计，支持 10w+ 日活用户
- 实现细粒度权限系统和动态表单引擎
- 性能优化使页面加载提升 70%

### 微前端架构改造
- 技术栈: qiankun, Module Federation
- 将 3 个独立应用整合为统一平台
- 实现公共依赖共享，包体积减少 45%
- 建立完整的监控和告警体系

## 技能
- 前端: React, Vue, TypeScript, Next.js, TailwindCSS
- 工程化: Webpack, Vite, Turborepo, CI/CD
- 后端: Node.js, Express, PostgreSQL
- 其他: Docker, Redis, 系统设计

## 教育
- 某大学 | 计算机科学与技术 | 本科 | 2016-2020`;

export const mockResumeOptimization = {
  original: `负责公司核心 SaaS 产品的前端开发，主导微前端架构改造，将 3 个独立应用整合。优化首屏加载性能，LCP 从 4.2s 降到 1.1s。`,
  optimized: `主导核心 SaaS 产品（10w+ DAU）前端架构演进，推动微前端改造整合 3 个独立应用，降低维护成本 60%。通过代码分割、资源预加载、SSR 等手段将 LCP 从 4.2s 优化至 1.1s（提升 74%），用户留存率提升 12%。`,
  changes: [
    { type: "add", text: "主导" },
    { type: "keep", text: "核心 SaaS 产品" },
    { type: "add", text: "（10w+ DAU）" },
    { type: "keep", text: "前端架构演进" },
    { type: "add", text: "，降低维护成本 60%" },
    { type: "add", text: "（提升 74%），用户留存率提升 12%" },
  ],
};

// ============================================================
// ATS Scanner
// ============================================================

export const mockATSData = {
  score: 87,
  grade: "A",
  dimensions: [
    { name: "标题结构", score: 95, status: "good", suggestion: "标题层次清晰" },
    { name: "关键词密度", score: 88, status: "good", suggestion: "关键词覆盖良好" },
    { name: "技能匹配", score: 92, status: "good", suggestion: "技能列表完整" },
    { name: "排版格式", score: 78, status: "warning", suggestion: "建议增加项目量化数据" },
    { name: "内容长度", score: 85, status: "good", suggestion: "篇幅适中" },
    { name: "联系方式", score: 100, status: "good", suggestion: "联系方式完整" },
    { name: "日期格式", score: 90, status: "good", suggestion: "日期格式统一" },
    { name: "行动动词", score: 72, status: "warning", suggestion: "增加强动词使用" },
  ],
  keywords: {
    matched: ["React", "TypeScript", "Next.js", "微前端", "性能优化", "CI/CD", "Node.js"],
    missing: ["GraphQL", "WebGL", "PWA", "Accessibility", "Web Vitals"],
  },
  suggestions: [
    { priority: "high", text: "增加量化数据：补充项目用户规模、性能提升百分比" },
    { priority: "high", text: "补充缺失关键词：GraphQL、Web Vitals" },
    { priority: "medium", text: "使用强动词：将'负责'改为'主导'、'推动'" },
    { priority: "low", text: "添加专业证书或开源贡献" },
  ],
};

// ============================================================
// JD Match
// ============================================================

export const mockJDData = {
  company: "腾讯",
  role: "Staff Frontend Engineer",
  salary: "40-70K · 16薪",
  location: "深圳",
  matchRate: 87,
  parsed: {
    requirements: ["5年以上前端经验", "精通 React 生态", "大型项目架构经验", "团队管理经验"],
    skills: ["React", "TypeScript", "Next.js", "Node.js", "微前端", "性能优化", "CI/CD", "GraphQL"],
    keywords: ["架构设计", "性能优化", "团队协作", "工程化", "可视化"],
    responsibilities: ["主导前端架构设计", "性能优化", "团队技术建设", "跨部门协作"],
  },
  analysis: {
    matched: ["React", "TypeScript", "Next.js", "Node.js", "微前端", "性能优化", "CI/CD"],
    missing: ["GraphQL", "可视化（D3/ECharts）", "团队管理（5人+）"],
    matchRate: 87,
    skillGap: 13,
  },
};

// ============================================================
// Career Coach
// ============================================================

export const mockCareerAnalysis = {
  strengths: [
    "5 年前端经验，技术栈完整",
    "有大型项目架构经验",
    "性能优化能力突出",
    "有团队带领经验",
  ],
  weaknesses: [
    "系统设计能力待加强",
    "缺少 GraphQL 经验",
    "AI/LLM 领域经验不足",
    "缺少开源贡献",
  ],
  roadmap: [
    {
      period: "未来 3 个月",
      goal: "补齐技术短板",
      items: ["学习 GraphQL + Apollo", "系统设计基础课程", "完成 2 个开源项目"],
    },
    {
      period: "未来 6 个月",
      goal: "建立技术影响力",
      items: ["技术博客 10 篇", "大会分享 1 次", "GitHub Star 500+"],
    },
    {
      period: "未来 1 年",
      goal: "冲击 Staff 级别",
      items: ["主导跨团队项目", "建立前端规范体系", "指导 3+ 初级工程师"],
    },
  ],
  recommendations: {
    courses: [
      { name: "系统设计入门", platform: "ByteByteGo", duration: "20h", rating: 4.8 },
      { name: "GraphQL 实战", platform: "Frontend Masters", duration: "12h", rating: 4.6 },
      { name: "前端架构设计", platform: "极客时间", duration: "15h", rating: 4.7 },
    ],
    books: [
      { name: "前端架构：从入门到微前端", author: "侯策" },
      { name: "高性能JavaScript", author: "Nicholas C. Zakas" },
      { name: "设计数据密集型应用", author: "Martin Kleppmann" },
    ],
    projects: [
      { name: "实现一个微前端框架", difficulty: "高", skills: ["架构", "工程化"] },
      { name: "可视化编辑器", difficulty: "中", skills: ["React", "可视化"] },
      { name: "AI 代码助手", difficulty: "高", skills: ["AI", "LLM"] },
    ],
  },
};

// ============================================================
// Interview
// ============================================================

export const mockInterviewQuestions = {
  hr: [
    "请做一个自我介绍",
    "为什么从上一家公司离职？",
    "你的职业规划是什么？",
    "期望薪资是多少？",
  ],
  technical: [
    "React 18 的 Concurrent Mode 有什么改进？",
    "虚拟 DOM 的 diff 算法原理？",
    "Next.js 的 SSG 和 SSR 区别？",
    "如何优化大型应用的性能？",
  ],
  project: [
    "介绍一个你最有挑战的项目",
    "微前端改造中遇到的最大问题？",
    "如何衡量性能优化的效果？",
    "团队协作中如何处理分歧？",
  ],
  algorithm: [
    "实现一个防抖函数",
    "数组扁平化（递归 + 迭代）",
    "最长递增子序列",
    "LRU 缓存实现",
  ],
  behavioral: [
    "描述一次你解决技术难题的经历",
    "你如何处理与同事的意见冲突？",
    "分享一次失败的经历和教训",
    "你最近学了什么新技术？",
  ],
};

// ============================================================
// Job Tracker
// ============================================================

export const mockJobApplications = [
  { id: "1", company: "腾讯", position: "Staff 前端", location: "深圳", salary: "40-70K", status: "applied", date: "3 天前", priority: "high", match: 92 },
  { id: "2", company: "字节跳动", position: "高级前端", location: "北京", salary: "35-60K", status: "interview", date: "2 天前", priority: "high", match: 88 },
  { id: "3", company: "美团", position: "前端架构师", location: "北京", salary: "45-80K", status: "offer", date: "5 天前", priority: "high", match: 95 },
  { id: "4", company: "阿里巴巴", position: "高级前端", location: "杭州", salary: "30-55K", status: "rejected", date: "1 周前", priority: "medium", match: 72 },
  { id: "5", company: "京东", position: "前端专家", location: "北京", salary: "35-65K", status: "applied", date: "4 天前", priority: "medium", match: 81 },
  { id: "6", company: "拼多多", position: "高级前端", location: "上海", salary: "40-70K", status: "interview", date: "1 天前", priority: "high", match: 86 },
  { id: "7", company: "小红书", position: "前端工程师", location: "上海", salary: "30-50K", status: "applied", date: "6 天前", priority: "low", match: 68 },
  { id: "8", company: "B站", position: "资深前端", location: "上海", salary: "35-60K", status: "offer", date: "1 周前", priority: "high", match: 90 },
];

export const trackerColumns = [
  { id: "applied", title: "已投递", color: "violet" },
  { id: "interview", title: "面试中", color: "amber" },
  { id: "offer", title: "Offer", color: "emerald" },
  { id: "rejected", title: "未通过", color: "rose" },
];

// ============================================================
// Learning Roadmap
// ============================================================

export const mockLearningPath = [
  {
    id: "1",
    title: "React 进阶",
    progress: 78,
    duration: "4 周",
    difficulty: "中级",
    lessons: [
      { title: "Concurrent Mode", done: true },
      { title: "Suspense & Streaming", done: true },
      { title: "Server Components", done: true },
      { title: "状态管理进阶", done: false },
      { title: "性能优化实战", done: false },
    ],
  },
  {
    id: "2",
    title: "系统设计基础",
    progress: 45,
    duration: "6 周",
    difficulty: "高级",
    lessons: [
      { title: "负载均衡", done: true },
      { title: "缓存策略", done: true },
      { title: "数据库设计", done: false },
      { title: "微服务架构", done: false },
    ],
  },
  {
    id: "3",
    title: "算法与数据结构",
    progress: 62,
    duration: "8 周",
    difficulty: "中级",
    lessons: [
      { title: "动态规划", done: true },
      { title: "图论基础", done: true },
      { title: "贪心算法", done: false },
    ],
  },
];

// ============================================================
// Portfolio / GitHub
// ============================================================

export const mockPortfolioData = {
  github: {
    username: "alexchen",
    repos: 47,
    stars: 1247,
    followers: 328,
    contributions: 1842,
    languages: [
      { name: "TypeScript", percent: 52, color: "#3178c6" },
      { name: "JavaScript", percent: 28, color: "#f1e05a" },
      { name: "Python", percent: 12, color: "#3572A5" },
      { name: "Rust", percent: 8, color: "#dea584" },
    ],
    topRepos: [
      { name: "react-performance-toolkit", stars: 542, desc: "React 性能优化工具集" },
      { name: "micro-frontend-framework", stars: 387, desc: "轻量级微前端框架" },
      { name: "ai-prompt-library", stars: 218, desc: "AI Prompt 收藏与分享" },
    ],
  },
  score: 78,
  highlights: [
    "开源贡献活跃，有 3 个 100+ Star 项目",
    "代码质量高，TypeScript 使用率 80%+",
    "README 完整度 90%，文档规范",
  ],
  improvements: [
    "缺少 Rust/Go 等系统语言项目",
    "测试覆盖率偏低，建议补充单元测试",
    "可以增加更多 AI 相关项目展示",
  ],
};

// ============================================================
// Analytics
// ============================================================

export const mockAnalytics = {
  weeklyActivity: [
    { day: "周一", hours: 3.5, optimizations: 4 },
    { day: "周二", hours: 2.8, optimizations: 3 },
    { day: "周三", hours: 4.2, optimizations: 6 },
    { day: "周四", hours: 3.1, optimizations: 5 },
    { day: "周五", hours: 5.0, optimizations: 8 },
    { day: "周六", hours: 6.5, optimizations: 9 },
    { day: "周日", hours: 4.8, optimizations: 7 },
  ],
  funnelData: [
    { stage: "投递", count: 24, percent: 100 },
    { stage: "简历筛选", count: 18, percent: 75 },
    { stage: "HR 面", count: 12, percent: 50 },
    { stage: "技术面", count: 8, percent: 33 },
    { stage: "终面", count: 4, percent: 17 },
    { stage: "Offer", count: 2, percent: 8 },
  ],
  heatmap: Array.from({ length: 7 * 24 }, (_, i) => ({
    day: Math.floor(i / 24),
    hour: i % 24,
    value: Math.floor(Math.random() * 5),
  })),
};

// ============================================================
// AI Job Agent
// ============================================================

export const mockAgentSteps = [
  { id: 1, title: "分析目标 JD", desc: "解析腾讯 Staff 前端岗位要求", icon: "search", status: "done" },
  { id: 2, title: "分析当前简历", desc: "评估简历与岗位匹配度", icon: "scan", status: "done" },
  { id: 3, title: "ATS 优化", desc: "提升 ATS 兼容性分数", icon: "shield", status: "done" },
  { id: 4, title: "STAR 优化", desc: "重构项目经历描述", icon: "edit", status: "done" },
  { id: 5, title: "生成求职信", desc: "针对性生成 Cover Letter", icon: "mail", status: "running" },
  { id: 6, title: "生成面试题", desc: "预测面试问题", icon: "mic", status: "pending" },
  { id: 7, title: "制定学习路线", desc: "补齐缺失技能", icon: "book", status: "pending" },
  { id: 8, title: "生成每日计划", desc: "AI 定制每日任务", icon: "calendar", status: "pending" },
  { id: 9, title: "推荐项目", desc: "匹配目标岗位的项目", icon: "code", status: "pending" },
  { id: 10, title: "推荐课程", desc: "精准学习资源", icon: "graduation", status: "pending" },
];
