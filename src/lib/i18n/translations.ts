// ============================================================
// i18n Translation Dictionary
// Supports: zh, en, ja, ko, de, fr
// ============================================================

export type Locale = "zh" | "en" | "ja" | "ko" | "de" | "fr";

export const locales: { id: Locale; name: string; flag: string }[] = [
  { id: "zh", name: "中文", flag: "🇨🇳" },
  { id: "en", name: "English", flag: "🇺🇸" },
  { id: "ja", name: "日本語", flag: "🇯🇵" },
  { id: "ko", name: "한국어", flag: "🇰🇷" },
  { id: "de", name: "Deutsch", flag: "🇩🇪" },
  { id: "fr", name: "Français", flag: "🇫🇷" },
];

// Translation key structure
export interface TranslationDict {
  // Common
  "common.save": string;
  "common.cancel": string;
  "common.delete": string;
  "common.edit": string;
  "common.create": string;
  "common.search": string;
  "common.loading": string;
  "common.empty": string;
  "common.error": string;
  "common.success": string;
  "common.retry": string;
  "common.new": string;
  "common.export": string;
  "common.import": string;
  "common.settings": string;
  "common.back": string;
  "common.next": string;
  "common.confirm": string;

  // Nav groups
  "nav.groupMain": string;
  "nav.groupAi": string;
  "nav.groupAgents": string;
  "nav.groupPlatform": string;
  "nav.groupTools": string;
  "nav.groupAccount": string;

  // Nav items
  "nav.dashboard": string;
  "nav.resume": string;
  "nav.ats": string;
  "nav.jdMatch": string;
  "nav.tracker": string;
  "nav.chat": string;
  "nav.careerCoach": string;
  "nav.interview": string;
  "nav.voiceInterview": string;
  "nav.videoInterview": string;
  "nav.agent": string;
  "nav.agents": string;
  "nav.workflow": string;
  "nav.rag": string;
  "nav.mcp": string;
  "nav.browserAgent": string;
  "nav.plugins": string;
  "nav.portfolio": string;
  "nav.learning": string;
  "nav.analytics": string;
  "nav.billing": string;
  "nav.team": string;
  "nav.settings": string;

  // Landing
  "landing.badge": string;
  "landing.heroTitle1": string;
  "landing.heroTitle2": string;
  "landing.heroSubtitle": string;
  "landing.ctaStart": string;
  "landing.ctaDemo": string;
  "landing.ctaAgent": string;
  "landing.featuresTitle": string;
  "landing.featuresSubtitle": string;
  "landing.workflowTitle": string;
  "landing.testimonialsTitle": string;
  "landing.pricingTitle": string;
  "landing.ctaTitle": string;
  "landing.ctaButton": string;

  // Dashboard
  "dashboard.welcome": string;
  "dashboard.title": string;
  "dashboard.subtitle": string;
  "dashboard.atsScore": string;
  "dashboard.applications": string;
  "dashboard.interviews": string;
  "dashboard.offers": string;
  "dashboard.todayTasks": string;
  "dashboard.aiInsights": string;
  "dashboard.atsTrend": string;
  "dashboard.skillRadar": string;
  "dashboard.applicationTrend": string;
  "dashboard.recentApplications": string;
  "dashboard.learningProgress": string;
  "dashboard.quickActions": string;
  "dashboard.startAgent": string;
  "dashboard.optimizeResume": string;

  // Resume
  "resume.title": string;
  "resume.subtitle": string;
  "resume.upload": string;
  "resume.optimize": string;
  "resume.versions": string;
  "resume.export": string;

  // ATS
  "ats.title": string;
  "ats.subtitle": string;
  "ats.rescan": string;
  "ats.score": string;
  "ats.dimensions": string;
  "ats.suggestions": string;

  // Chat
  "chat.title": string;
  "chat.subtitle": string;
  "chat.placeholder": string;
  "chat.newChat": string;
  "chat.history": string;

  // Interview
  "interview.title": string;
  "interview.subtitle": string;
  "interview.start": string;
  "interview.score": string;
  "interview.feedback": string;

  // Voice Interview
  "voice.title": string;
  "voice.subtitle": string;
  "voice.start": string;
  "voice.listening": string;
  "voice.thinking": string;
  "voice.speaking": string;
  "voice.end": string;
  "voice.mute": string;
  "voice.unmute": string;

  // Video Interview
  "video.title": string;
  "video.subtitle": string;
  "video.startCamera": string;
  "video.startInterview": string;
  "video.eyeContact": string;
  "video.expression": string;
  "video.posture": string;
  "video.gesture": string;
  "video.engagement": string;
  "video.nervousness": string;

  // Billing
  "billing.title": string;
  "billing.subtitle": string;
  "billing.currentPlan": string;
  "billing.credits": string;
  "billing.upgrade": string;
  "billing.invoices": string;

  // Settings
  "settings.title": string;
  "settings.subtitle": string;
  "settings.profile": string;
  "settings.aiProvider": string;
  "settings.apiKey": string;
  "settings.language": string;
  "settings.notifications": string;
  "settings.privacy": string;
}

// Chinese (default)
const zh: TranslationDict = {
  "common.save": "保存",
  "common.cancel": "取消",
  "common.delete": "删除",
  "common.edit": "编辑",
  "common.create": "创建",
  "common.search": "搜索",
  "common.loading": "加载中...",
  "common.empty": "暂无数据",
  "common.error": "出错了",
  "common.success": "成功",
  "common.retry": "重试",
  "common.new": "新建",
  "common.export": "导出",
  "common.import": "导入",
  "common.settings": "设置",
  "common.back": "返回",
  "common.next": "下一步",
  "common.confirm": "确认",

  "nav.groupMain": "核心功能",
  "nav.groupAi": "AI 能力",
  "nav.groupAgents": "Agent 架构",
  "nav.groupPlatform": "平台",
  "nav.groupTools": "工具",
  "nav.groupAccount": "账户",

  "nav.dashboard": "仪表盘",
  "nav.resume": "简历管理",
  "nav.ats": "ATS 扫描",
  "nav.jdMatch": "JD 匹配",
  "nav.tracker": "求职追踪",
  "nav.chat": "AI 对话",
  "nav.careerCoach": "职业教练",
  "nav.interview": "模拟面试",
  "nav.voiceInterview": "语音面试",
  "nav.videoInterview": "视频面试",
  "nav.agent": "AI Job Agent",
  "nav.agents": "Agent 中心",
  "nav.workflow": "工作流编排",
  "nav.rag": "RAG 知识库",
  "nav.mcp": "MCP 协议",
  "nav.browserAgent": "浏览器 Agent",
  "nav.plugins": "插件市场",
  "nav.portfolio": "作品集分析",
  "nav.learning": "学习路线",
  "nav.analytics": "数据分析",
  "nav.billing": "订阅与账单",
  "nav.team": "团队管理",
  "nav.settings": "设置",

  "landing.badge": "全新 V1 Enterprise Edition 已发布",
  "landing.heroTitle1": "让 AI 成为你的",
  "landing.heroTitle2": "职业教练",
  "landing.heroSubtitle": "覆盖整个求职流程的 AI 智能工作台，从职业规划到 Offer 分析，让 AI 帮你完成求职闭环。",
  "landing.ctaStart": "免费开始",
  "landing.ctaDemo": "立即体验",
  "landing.ctaAgent": "查看 AI Agent",
  "landing.featuresTitle": "一个平台，覆盖",
  "landing.featuresSubtitle": "整个求职闭环",
  "landing.workflowTitle": "从规划到 Offer，7 步搞定",
  "landing.testimonialsTitle": "他们都拿到了 Dream Offer",
  "landing.pricingTitle": "选择适合你的",
  "landing.ctaTitle": "准备好让 AI 重塑你的求职了吗？",
  "landing.ctaButton": "免费开始",

  "dashboard.welcome": "欢迎回来",
  "dashboard.title": "仪表盘",
  "dashboard.subtitle": "你的求职全景概览",
  "dashboard.atsScore": "ATS 分数",
  "dashboard.applications": "投递数量",
  "dashboard.interviews": "面试数量",
  "dashboard.offers": "Offer 数量",
  "dashboard.todayTasks": "今日任务",
  "dashboard.aiInsights": "AI 建议",
  "dashboard.atsTrend": "ATS 分数趋势",
  "dashboard.skillRadar": "技能雷达",
  "dashboard.applicationTrend": "投递趋势",
  "dashboard.recentApplications": "最近投递",
  "dashboard.learningProgress": "学习进度",
  "dashboard.quickActions": "快捷操作",
  "dashboard.startAgent": "启动 AI Agent",
  "dashboard.optimizeResume": "优化简历",

  "resume.title": "简历管理",
  "resume.subtitle": "创建、优化、管理你的简历",
  "resume.upload": "上传简历",
  "resume.optimize": "AI 优化",
  "resume.versions": "版本管理",
  "resume.export": "导出",

  "ats.title": "ATS 扫描",
  "ats.subtitle": "检测简历的 ATS 兼容性，实时刷新",
  "ats.rescan": "重新扫描",
  "ats.score": "ATS 分数",
  "ats.dimensions": "检测维度",
  "ats.suggestions": "优化建议",

  "chat.title": "AI 对话",
  "chat.subtitle": "与你的 AI 职业教练对话",
  "chat.placeholder": "输入消息... (Enter 发送, Shift+Enter 换行)",
  "chat.newChat": "新对话",
  "chat.history": "历史记录",

  "interview.title": "模拟面试",
  "interview.subtitle": "AI 模拟真实面试场景",
  "interview.start": "开始面试",
  "interview.score": "面试评分",
  "interview.feedback": "AI 反馈",

  "voice.title": "语音面试",
  "voice.subtitle": "AI 实时语音对话与评分",
  "voice.start": "开始语音面试",
  "voice.listening": "正在聆听...",
  "voice.thinking": "AI 思考中...",
  "voice.speaking": "AI 正在回答...",
  "voice.end": "结束面试",
  "voice.mute": "静音",
  "voice.unmute": "取消静音",

  "video.title": "视频面试",
  "video.subtitle": "摄像头分析眼神、语速、表情",
  "video.startCamera": "开启摄像头",
  "video.startInterview": "开始面试",
  "video.eyeContact": "眼神交流",
  "video.expression": "面部表情",
  "video.posture": "姿态",
  "video.gesture": "手势",
  "video.engagement": "参与度",
  "video.nervousness": "紧张度",

  "billing.title": "订阅与账单",
  "billing.subtitle": "管理你的套餐和积分",
  "billing.currentPlan": "当前套餐",
  "billing.credits": "积分余额",
  "billing.upgrade": "升级套餐",
  "billing.invoices": "账单记录",

  "settings.title": "设置",
  "settings.subtitle": "管理你的账户和偏好",
  "settings.profile": "个人资料",
  "settings.aiProvider": "AI 服务商",
  "settings.apiKey": "API 密钥",
  "settings.language": "语言",
  "settings.notifications": "通知",
  "settings.privacy": "隐私",
};

// English
const en: TranslationDict = {
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.create": "Create",
  "common.search": "Search",
  "common.loading": "Loading...",
  "common.empty": "No data",
  "common.error": "Error",
  "common.success": "Success",
  "common.retry": "Retry",
  "common.new": "New",
  "common.export": "Export",
  "common.import": "Import",
  "common.settings": "Settings",
  "common.back": "Back",
  "common.next": "Next",
  "common.confirm": "Confirm",

  "nav.groupMain": "Core",
  "nav.groupAi": "AI",
  "nav.groupAgents": "Agents",
  "nav.groupPlatform": "Platform",
  "nav.groupTools": "Tools",
  "nav.groupAccount": "Account",

  "nav.dashboard": "Dashboard",
  "nav.resume": "Resume",
  "nav.ats": "ATS Scan",
  "nav.jdMatch": "JD Match",
  "nav.tracker": "Job Tracker",
  "nav.chat": "AI Chat",
  "nav.careerCoach": "Career Coach",
  "nav.interview": "Mock Interview",
  "nav.voiceInterview": "Voice Interview",
  "nav.videoInterview": "Video Interview",
  "nav.agent": "AI Job Agent",
  "nav.agents": "Agent Hub",
  "nav.workflow": "Workflow",
  "nav.rag": "RAG Knowledge",
  "nav.mcp": "MCP Protocol",
  "nav.browserAgent": "Browser Agent",
  "nav.plugins": "Plugins",
  "nav.portfolio": "Portfolio",
  "nav.learning": "Learning",
  "nav.analytics": "Analytics",
  "nav.billing": "Billing",
  "nav.team": "Team",
  "nav.settings": "Settings",

  "landing.badge": "New V1 Enterprise Edition Released",
  "landing.heroTitle1": "Let AI Be Your",
  "landing.heroTitle2": "Career Coach",
  "landing.heroSubtitle": "An AI workspace covering the entire job search journey, from career planning to offer analysis.",
  "landing.ctaStart": "Get Started Free",
  "landing.ctaDemo": "Try Now",
  "landing.ctaAgent": "View AI Agent",
  "landing.featuresTitle": "One Platform, Covers",
  "landing.featuresSubtitle": "The Entire Job Search Loop",
  "landing.workflowTitle": "From Planning to Offer in 7 Steps",
  "landing.testimonialsTitle": "They Got Their Dream Offers",
  "landing.pricingTitle": "Choose Your",
  "landing.ctaTitle": "Ready to Transform Your Job Search with AI?",
  "landing.ctaButton": "Get Started Free",

  "dashboard.welcome": "Welcome back",
  "dashboard.title": "Dashboard",
  "dashboard.subtitle": "Your job search overview",
  "dashboard.atsScore": "ATS Score",
  "dashboard.applications": "Applications",
  "dashboard.interviews": "Interviews",
  "dashboard.offers": "Offers",
  "dashboard.todayTasks": "Today's Tasks",
  "dashboard.aiInsights": "AI Insights",
  "dashboard.atsTrend": "ATS Score Trend",
  "dashboard.skillRadar": "Skill Radar",
  "dashboard.applicationTrend": "Application Trend",
  "dashboard.recentApplications": "Recent Applications",
  "dashboard.learningProgress": "Learning Progress",
  "dashboard.quickActions": "Quick Actions",
  "dashboard.startAgent": "Start AI Agent",
  "dashboard.optimizeResume": "Optimize Resume",

  "resume.title": "Resume Builder",
  "resume.subtitle": "Create, optimize, and manage your resumes",
  "resume.upload": "Upload Resume",
  "resume.optimize": "AI Optimize",
  "resume.versions": "Versions",
  "resume.export": "Export",

  "ats.title": "ATS Scanner",
  "ats.subtitle": "Check ATS compatibility, auto-refresh",
  "ats.rescan": "Rescan",
  "ats.score": "ATS Score",
  "ats.dimensions": "Dimensions",
  "ats.suggestions": "Suggestions",

  "chat.title": "AI Chat",
  "chat.subtitle": "Chat with your AI career coach",
  "chat.placeholder": "Type a message... (Enter to send, Shift+Enter for newline)",
  "chat.newChat": "New Chat",
  "chat.history": "History",

  "interview.title": "Mock Interview",
  "interview.subtitle": "AI-simulated real interview scenarios",
  "interview.start": "Start Interview",
  "interview.score": "Interview Score",
  "interview.feedback": "AI Feedback",

  "voice.title": "Voice Interview",
  "voice.subtitle": "Real-time AI voice conversation and scoring",
  "voice.start": "Start Voice Interview",
  "voice.listening": "Listening...",
  "voice.thinking": "AI thinking...",
  "voice.speaking": "AI speaking...",
  "voice.end": "End Interview",
  "voice.mute": "Mute",
  "voice.unmute": "Unmute",

  "video.title": "Video Interview",
  "video.subtitle": "Camera analysis of eye contact, pace, expressions",
  "video.startCamera": "Start Camera",
  "video.startInterview": "Start Interview",
  "video.eyeContact": "Eye Contact",
  "video.expression": "Facial Expression",
  "video.posture": "Posture",
  "video.gesture": "Gesture",
  "video.engagement": "Engagement",
  "video.nervousness": "Nervousness",

  "billing.title": "Billing",
  "billing.subtitle": "Manage your plan and credits",
  "billing.currentPlan": "Current Plan",
  "billing.credits": "Credits",
  "billing.upgrade": "Upgrade",
  "billing.invoices": "Invoices",

  "settings.title": "Settings",
  "settings.subtitle": "Manage your account and preferences",
  "settings.profile": "Profile",
  "settings.aiProvider": "AI Provider",
  "settings.apiKey": "API Key",
  "settings.language": "Language",
  "settings.notifications": "Notifications",
  "settings.privacy": "Privacy",
};

// Japanese
const ja: TranslationDict = {
  ...en,
  "common.save": "保存",
  "common.cancel": "キャンセル",
  "common.delete": "削除",
  "common.edit": "編集",
  "common.create": "作成",
  "common.search": "検索",
  "common.loading": "読み込み中...",
  "common.empty": "データなし",
  "common.error": "エラー",
  "common.success": "成功",
  "common.new": "新規",
  "common.settings": "設定",
  "nav.groupMain": "コア",
  "nav.groupAi": "AI",
  "nav.dashboard": "ダッシュボード",
  "nav.resume": "履歴書",
  "nav.ats": "ATSスキャン",
  "nav.jdMatch": "JDマッチ",
  "nav.tracker": "求人追跡",
  "nav.chat": "AIチャット",
  "nav.careerCoach": "キャリアコーチ",
  "nav.interview": "模擬面接",
  "nav.voiceInterview": "音声面接",
  "nav.videoInterview": "ビデオ面接",
  "nav.agent": "AIジョブエージェント",
  "nav.settings": "設定",
  "landing.badge": "新V1エンタープライズ版リリース",
  "landing.heroTitle1": "AIをあなたの",
  "landing.heroTitle2": "キャリアコーチに",
  "landing.heroSubtitle": "就職活動の全プロセスをカバーするAIワークスペース。",
  "landing.ctaStart": "無料で始める",
  "dashboard.welcome": "おかえりなさい",
  "dashboard.title": "ダッシュボード",
  "dashboard.atsScore": "ATSスコア",
  "dashboard.applications": "応募数",
  "dashboard.interviews": "面接数",
  "dashboard.offers": "オファー数",
  "chat.placeholder": "メッセージを入力... (Enter で送信)",
  "voice.listening": "聞いています...",
  "voice.thinking": "AI考え中...",
  "voice.speaking": "AI回答中...",
  "settings.aiProvider": "AIプロバイダー",
  "settings.apiKey": "APIキー",
  "settings.language": "言語",
};

// Korean
const ko: TranslationDict = {
  ...en,
  "common.save": "저장",
  "common.cancel": "취소",
  "common.delete": "삭제",
  "common.edit": "편집",
  "common.create": "생성",
  "common.search": "검색",
  "common.loading": "로딩 중...",
  "common.empty": "데이터 없음",
  "common.error": "오류",
  "common.success": "성공",
  "common.new": "신규",
  "common.settings": "설정",
  "nav.groupMain": "핵심",
  "nav.groupAi": "AI",
  "nav.dashboard": "대시보드",
  "nav.resume": "이력서",
  "nav.ats": "ATS 스캔",
  "nav.jdMatch": "JD 매치",
  "nav.tracker": "구직 추적",
  "nav.chat": "AI 채팅",
  "nav.careerCoach": "커리어 코치",
  "nav.interview": "모의 면접",
  "nav.voiceInterview": "음성 면접",
  "nav.videoInterview": "비디오 면접",
  "nav.agent": "AI 잡 에이전트",
  "nav.settings": "설정",
  "landing.badge": "새 V1 엔터프라이즈 에디션 출시",
  "landing.heroTitle1": "AI를 당신의",
  "landing.heroTitle2": "커리어 코치로",
  "landing.heroSubtitle": "구직 여정 전체를 커버하는 AI 워크스페이스.",
  "landing.ctaStart": "무료로 시작",
  "dashboard.welcome": "다시 오신 것을 환영합니다",
  "dashboard.title": "대시보드",
  "dashboard.atsScore": "ATS 점수",
  "dashboard.applications": "지원 수",
  "dashboard.interviews": "면접 수",
  "dashboard.offers": "오퍼 수",
  "chat.placeholder": "메시지 입력... (Enter로 전송)",
  "voice.listening": "듣는 중...",
  "voice.thinking": "AI 생각 중...",
  "voice.speaking": "AI 답변 중...",
  "settings.aiProvider": "AI 제공자",
  "settings.apiKey": "API 키",
  "settings.language": "언어",
};

// German
const de: TranslationDict = {
  ...en,
  "common.save": "Speichern",
  "common.cancel": "Abbrechen",
  "common.delete": "Löschen",
  "common.edit": "Bearbeiten",
  "common.create": "Erstellen",
  "common.search": "Suchen",
  "common.loading": "Laden...",
  "common.empty": "Keine Daten",
  "common.error": "Fehler",
  "common.success": "Erfolg",
  "common.new": "Neu",
  "common.settings": "Einstellungen",
  "nav.groupMain": "Kern",
  "nav.groupAi": "AI",
  "nav.dashboard": "Dashboard",
  "nav.resume": "Lebenslauf",
  "nav.ats": "ATS-Scan",
  "nav.jdMatch": "JD-Match",
  "nav.tracker": "Bewerbungen",
  "nav.chat": "AI-Chat",
  "nav.careerCoach": "Karrierecoach",
  "nav.interview": "Mock-Interview",
  "nav.voiceInterview": "Sprach-Interview",
  "nav.videoInterview": "Video-Interview",
  "nav.agent": "AI Job-Agent",
  "nav.settings": "Einstellungen",
  "landing.badge": "Neue V1 Enterprise Edition veröffentlicht",
  "landing.heroTitle1": "Lassen Sie AI Ihr",
  "landing.heroTitle2": "Karrierecoach sein",
  "landing.heroSubtitle": "Eine AI-Plattform für den gesamten Bewerbungsprozess.",
  "landing.ctaStart": "Kostenlos starten",
  "dashboard.welcome": "Willkommen zurück",
  "dashboard.title": "Dashboard",
  "dashboard.atsScore": "ATS-Score",
  "dashboard.applications": "Bewerbungen",
  "dashboard.interviews": "Interviews",
  "dashboard.offers": "Angebote",
  "chat.placeholder": "Nachricht eingeben... (Enter zum Senden)",
  "voice.listening": "Höre zu...",
  "voice.thinking": "AI denkt nach...",
  "voice.speaking": "AI spricht...",
  "settings.aiProvider": "AI-Anbieter",
  "settings.apiKey": "API-Schlüssel",
  "settings.language": "Sprache",
};

// French
const fr: TranslationDict = {
  ...en,
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.delete": "Supprimer",
  "common.edit": "Modifier",
  "common.create": "Créer",
  "common.search": "Rechercher",
  "common.loading": "Chargement...",
  "common.empty": "Aucune donnée",
  "common.error": "Erreur",
  "common.success": "Succès",
  "common.new": "Nouveau",
  "common.settings": "Paramètres",
  "nav.groupMain": "Principal",
  "nav.groupAi": "AI",
  "nav.dashboard": "Tableau de bord",
  "nav.resume": "CV",
  "nav.ats": "Scan ATS",
  "nav.jdMatch": "Match JD",
  "nav.tracker": "Candidatures",
  "nav.chat": "Chat AI",
  "nav.careerCoach": "Coach de carrière",
  "nav.interview": "Entretien simulé",
  "nav.voiceInterview": "Entretien vocal",
  "nav.videoInterview": "Entretien vidéo",
  "nav.agent": "AI Job Agent",
  "nav.settings": "Paramètres",
  "landing.badge": "Nouvelle V1 Enterprise Edition publiée",
  "landing.heroTitle1": "Laissez AI être votre",
  "landing.heroTitle2": "Coach de carrière",
  "landing.heroSubtitle": "Un espace de travail AI couvrant tout le processus de recherche d'emploi.",
  "landing.ctaStart": "Commencer gratuitement",
  "dashboard.welcome": "Bon retour",
  "dashboard.title": "Tableau de bord",
  "dashboard.atsScore": "Score ATS",
  "dashboard.applications": "Candidatures",
  "dashboard.interviews": "Entretiens",
  "dashboard.offers": "Offres",
  "chat.placeholder": "Tapez un message... (Entrée pour envoyer)",
  "voice.listening": "Écoute...",
  "voice.thinking": "AI réfléchit...",
  "voice.speaking": "AI parle...",
  "settings.aiProvider": "Fournisseur AI",
  "settings.apiKey": "Clé API",
  "settings.language": "Langue",
};

export const translations: Record<Locale, TranslationDict> = { zh, en, ja, ko, de, fr };
