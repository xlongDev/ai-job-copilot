/**
 * 视图路由的单一数据源。
 *
 * 之前 ViewId 类型、视图→组件的映射写在 app-shell、导航标签写在 sidebar、
 * 标题写在 topbar、命令列表又抄了一份在 command-palette，四处各存一份。
 * 现在收敛到这里：新增视图只需在本文件的 VIEW_LIST 加一条 + app-shell 的 viewMap 加一项。
 */

export type ViewId =
  | "dashboard"
  | "cockpit"
  | "resume"
  | "resume-templates"
  | "resume-compare"
  | "resume-score"
  | "ats"
  | "jd-match"
  | "star-generator"
  | "offer-analysis"
  | "tracker"
  | "calendar"
  | "weekly-report"
  | "chat"
  | "career-coach"
  | "skill-gap"
  | "prompt-library"
  | "interview"
  | "interview-chat"
  | "interview-records"
  | "voice-interview"
  | "video-interview"
  | "agent"
  | "agents"
  | "workflow"
  | "rag"
  | "mcp"
  | "browser-agent"
  | "plugins"
  | "portfolio"
  | "learning"
  | "analytics"
  | "heatmap"
  | "achievements"
  | "goals"
  | "billing"
  | "team"
  | "settings";

export type NavGroup = "main" | "ai" | "agents" | "platform" | "tools";

export interface ViewMeta {
  id: ViewId;
  /** 侧栏显示名 */
  label: string;
  /** 顶栏标题 */
  title: string;
  /** 顶栏副标题 */
  desc: string;
  group: NavGroup;
  /** 角标：NEW / AI / 数字 */
  badge?: string;
  /** 命令面板快捷键提示，如 "G D" */
  shortcut?: string;
}

export const VIEW_LIST: ViewMeta[] = [
  // ── 核心功能 ──
  { id: "dashboard", label: "仪表盘", title: "仪表盘", desc: "你的求职全景概览", group: "main", shortcut: "G D" },
  { id: "cockpit", label: "驾驶舱", title: "驾驶舱", desc: "全屏数据可视化驾驶舱", group: "main", badge: "NEW" },
  { id: "resume", label: "简历管理", title: "简历管理", desc: "创建、优化、管理你的简历", group: "main", shortcut: "G R" },
  { id: "resume-templates", label: "简历模板", title: "简历模板", desc: "选择适合你的简历模板", group: "main" },
  { id: "resume-compare", label: "简历对比", title: "简历对比", desc: "多版本简历并排对比", group: "main", badge: "NEW" },
  { id: "resume-score", label: "简历评分", title: "简历评分", desc: "AI 8 维度简历评分", group: "main", badge: "NEW" },
  { id: "ats", label: "ATS 扫描", title: "ATS 扫描", desc: "检测简历的 ATS 兼容性", group: "main", shortcut: "G A" },
  { id: "jd-match", label: "JD 匹配", title: "JD 匹配", desc: "分析岗位匹配度", group: "main", shortcut: "G J" },
  { id: "star-generator", label: "STAR 生成器", title: "STAR 生成器", desc: "AI 将项目描述重构为 STAR 结构", group: "main", badge: "NEW" },
  { id: "offer-analysis", label: "Offer 分析", title: "Offer 分析", desc: "多 Offer 对比与决策建议", group: "main", badge: "NEW" },
  { id: "tracker", label: "求职追踪", title: "求职追踪", desc: "管理你的投递进度", group: "main", badge: "24", shortcut: "G T" },
  { id: "calendar", label: "求职日历", title: "求职日历", desc: "日历展示面试/投递/学习计划", group: "main", badge: "NEW" },
  { id: "weekly-report", label: "求职周报", title: "求职周报", desc: "AI 生成求职周报总结", group: "main", badge: "NEW" },

  // ── AI 助手 ──
  { id: "chat", label: "AI 对话", title: "AI 对话", desc: "与你的 AI 职业教练对话", group: "ai", shortcut: "G C" },
  { id: "career-coach", label: "职业教练", title: "职业教练", desc: "AI 驱动的职业成长规划", group: "ai" },
  { id: "skill-gap", label: "技能差距分析", title: "技能差距分析", desc: "当前技能 vs 目标岗位", group: "ai", badge: "NEW" },
  { id: "prompt-library", label: "Prompt 库", title: "Prompt 库", desc: "官方 Prompt + 自定义 Prompt", group: "ai", badge: "NEW" },
  { id: "interview", label: "模拟面试", title: "模拟面试", desc: "AI 模拟真实面试场景", group: "ai" },
  { id: "interview-chat", label: "AI 面试官", title: "AI 面试官", desc: "多轮对话面试 + 实时追问", group: "ai", badge: "NEW" },
  { id: "interview-records", label: "面试记录", title: "面试记录", desc: "历史面试记录与复盘", group: "ai", badge: "NEW" },
  { id: "voice-interview", label: "语音面试", title: "语音面试", desc: "AI 实时语音对话与评分", group: "ai", badge: "AI" },
  { id: "video-interview", label: "视频面试", title: "视频面试", desc: "摄像头分析眼神、语速、表情", group: "ai", badge: "AI" },

  // ── Agent 系统 ──
  { id: "agent", label: "AI Job Agent", title: "AI Job Agent", desc: "自动化你的整个求职流程", group: "agents", badge: "NEW" },
  { id: "agents", label: "Agent 中心", title: "Agent 中心", desc: "多 Agent 协作架构", group: "agents" },
  { id: "workflow", label: "工作流编排", title: "工作流编排", desc: "LangGraph 可视化 Agent 编排", group: "agents", badge: "NEW" },

  // ── 平台能力 ──
  { id: "rag", label: "RAG 知识库", title: "RAG 知识库", desc: "私人向量知识库", group: "platform" },
  { id: "mcp", label: "MCP 协议", title: "MCP 协议", desc: "Model Context Protocol 集成", group: "platform" },
  { id: "browser-agent", label: "浏览器 Agent", title: "浏览器 Agent", desc: "自动浏览招聘网站", group: "platform" },
  { id: "plugins", label: "插件市场", title: "插件市场", desc: "扩展平台能力", group: "platform" },

  // ── 工具箱 ──
  { id: "portfolio", label: "作品集分析", title: "作品集分析", desc: "分析 GitHub 和作品集", group: "tools" },
  { id: "learning", label: "学习路线", title: "学习路线", desc: "AI 生成的个性化学习计划", group: "tools" },
  { id: "analytics", label: "数据分析", title: "数据分析", desc: "深度分析你的求职数据", group: "tools" },
  { id: "heatmap", label: "活跃热力图", title: "活跃热力图", desc: "GitHub 风格求职活跃度热力图", group: "tools", badge: "NEW" },
  { id: "achievements", label: "成就系统", title: "成就系统", desc: "解锁徽章，追踪成长", group: "tools", badge: "NEW" },
  { id: "goals", label: "求职目标", title: "求职目标", desc: "设置和跟踪你的求职目标", group: "tools", badge: "NEW" },
  { id: "billing", label: "订阅与账单", title: "订阅与账单", desc: "管理你的套餐和积分", group: "tools" },
  { id: "team", label: "团队管理", title: "团队管理", desc: "多租户团队协作", group: "tools" },
  { id: "settings", label: "设置", title: "设置", desc: "管理你的账户和偏好", group: "tools" },
];

export const VIEW_IDS: ViewId[] = VIEW_LIST.map((v) => v.id);

export const VIEW_META: Record<ViewId, ViewMeta> = Object.fromEntries(
  VIEW_LIST.map((v) => [v.id, v])
) as Record<ViewId, ViewMeta>;

export const NAV_GROUPS: NavGroup[] = ["main", "ai", "agents", "platform", "tools"];

export const GROUP_LABELS: Record<NavGroup, string> = {
  main: "核心功能",
  ai: "AI 助手",
  agents: "Agent 系统",
  platform: "平台能力",
  tools: "工具箱",
};

/** 应用内视图统一挂在 /app 下，避免与根路由（/login、未来可能的静态页）抢路径 */
export const APP_ROUTE_PREFIX = "/app";

export const DEFAULT_VIEW: ViewId = "dashboard";

export function viewHref(id: ViewId): string {
  return `${APP_ROUTE_PREFIX}/${id}`;
}

const VIEW_ID_SET = new Set<string>(VIEW_IDS);

export function isViewId(value: string): value is ViewId {
  return VIEW_ID_SET.has(value);
}

/** 命令面板的 G + 键快捷跳转映射 */
export const GO_TO_KEYS: Record<string, ViewId> = {
  d: "dashboard",
  r: "resume",
  a: "ats",
  j: "jd-match",
  t: "tracker",
  c: "chat",
};
