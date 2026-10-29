"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "./command-palette";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import type { ViewId } from "@/lib/views";

// Lazy load views for code splitting
const DashboardView = lazy(() => import("@/components/views/dashboard-view").then(m => ({ default: m.DashboardView })));
const ResumeView = lazy(() => import("@/components/views/resume-view").then(m => ({ default: m.ResumeView })));
const ATSView = lazy(() => import("@/components/views/ats-view").then(m => ({ default: m.ATSView })));
const JDMatchView = lazy(() => import("@/components/views/jd-match-view").then(m => ({ default: m.JDMatchView })));
const ChatView = lazy(() => import("@/components/views/chat-view").then(m => ({ default: m.ChatView })));
const CareerCoachView = lazy(() => import("@/components/views/career-coach-view").then(m => ({ default: m.CareerCoachView })));
const InterviewView = lazy(() => import("@/components/views/interview-view").then(m => ({ default: m.InterviewView })));
const VoiceInterviewView = lazy(() => import("@/components/views/voice-interview-view").then(m => ({ default: m.VoiceInterviewView })));
const VideoInterviewView = lazy(() => import("@/components/views/video-interview-view").then(m => ({ default: m.VideoInterviewView })));
const PortfolioView = lazy(() => import("@/components/views/portfolio-view").then(m => ({ default: m.PortfolioView })));
const LearningView = lazy(() => import("@/components/views/learning-view").then(m => ({ default: m.LearningView })));
const TrackerView = lazy(() => import("@/components/views/tracker-view").then(m => ({ default: m.TrackerView })));
const AnalyticsView = lazy(() => import("@/components/views/analytics-view").then(m => ({ default: m.AnalyticsView })));
const AgentView = lazy(() => import("@/components/views/agent-view").then(m => ({ default: m.AgentView })));
const AgentsView = lazy(() => import("@/components/views/agents-view").then(m => ({ default: m.AgentsView })));
const WorkflowView = lazy(() => import("@/components/views/workflow-view").then(m => ({ default: m.WorkflowView })));
const RagView = lazy(() => import("@/components/views/rag-view").then(m => ({ default: m.RagView })));
const McpView = lazy(() => import("@/components/views/mcp-view").then(m => ({ default: m.McpView })));
const BrowserAgentView = lazy(() => import("@/components/views/browser-agent-view").then(m => ({ default: m.BrowserAgentView })));
const PluginsView = lazy(() => import("@/components/views/plugins-view").then(m => ({ default: m.PluginsView })));
const BillingView = lazy(() => import("@/components/views/billing-view").then(m => ({ default: m.BillingView })));
const TeamView = lazy(() => import("@/components/views/team-view").then(m => ({ default: m.TeamView })));
const SettingsView = lazy(() => import("@/components/views/settings-view").then(m => ({ default: m.SettingsView })));
const StarGeneratorView = lazy(() => import("@/components/views/star-generator-view").then(m => ({ default: m.StarGeneratorView })));
const PromptLibraryView = lazy(() => import("@/components/views/prompt-library-view").then(m => ({ default: m.PromptLibraryView })));
const OfferAnalysisView = lazy(() => import("@/components/views/offer-analysis-view").then(m => ({ default: m.OfferAnalysisView })));
const SkillGapView = lazy(() => import("@/components/views/skill-gap-view").then(m => ({ default: m.SkillGapView })));
const ResumeTemplatesView = lazy(() => import("@/components/views/resume-templates-view").then(m => ({ default: m.ResumeTemplatesView })));
const InterviewRecordsView = lazy(() => import("@/components/views/interview-records-view").then(m => ({ default: m.InterviewRecordsView })));
const ResumeCompareView = lazy(() => import("@/components/views/resume-compare-view").then(m => ({ default: m.ResumeCompareView })));
const WeeklyReportView = lazy(() => import("@/components/views/weekly-report-view").then(m => ({ default: m.WeeklyReportView })));
const CalendarView = lazy(() => import("@/components/views/calendar-view").then(m => ({ default: m.CalendarView })));
const AchievementsView = lazy(() => import("@/components/views/achievements-view").then(m => ({ default: m.AchievementsView })));
const GoalsView = lazy(() => import("@/components/views/goals-view").then(m => ({ default: m.GoalsView })));
const HeatmapView = lazy(() => import("@/components/views/heatmap-view").then(m => ({ default: m.HeatmapView })));
const CockpitView = lazy(() => import("@/components/views/cockpit-view").then(m => ({ default: m.CockpitView })));
const InterviewChatView = lazy(() => import("@/components/views/interview-chat-view").then(m => ({ default: m.InterviewChatView })));
const ResumeScoreView = lazy(() => import("@/components/views/resume-score-view").then(m => ({ default: m.ResumeScoreView })));

/**
 * Record<ViewId, ...> 而非 Record<string, ...>：新增 VIEW_LIST 条目而忘记在这里登记，
 * 会在 tsc 阶段直接报错，而不是运行时白屏。
 */
const viewMap: Record<ViewId, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: DashboardView,
  resume: ResumeView,
  ats: ATSView,
  "jd-match": JDMatchView,
  chat: ChatView,
  "career-coach": CareerCoachView,
  interview: InterviewView,
  "voice-interview": VoiceInterviewView,
  "video-interview": VideoInterviewView,
  portfolio: PortfolioView,
  learning: LearningView,
  tracker: TrackerView,
  analytics: AnalyticsView,
  agent: AgentView,
  agents: AgentsView,
  workflow: WorkflowView,
  rag: RagView,
  mcp: McpView,
  "browser-agent": BrowserAgentView,
  plugins: PluginsView,
  billing: BillingView,
  team: TeamView,
  settings: SettingsView,
  "star-generator": StarGeneratorView,
  "prompt-library": PromptLibraryView,
  "offer-analysis": OfferAnalysisView,
  "skill-gap": SkillGapView,
  "resume-templates": ResumeTemplatesView,
  "interview-records": InterviewRecordsView,
  "resume-compare": ResumeCompareView,
  "weekly-report": WeeklyReportView,
  calendar: CalendarView,
  achievements: AchievementsView,
  goals: GoalsView,
  heatmap: HeatmapView,
  cockpit: CockpitView,
  "interview-chat": InterviewChatView,
  "resume-score": ResumeScoreView,
};

export function AppShell({ view }: { view: ViewId }) {
  useKeyboardShortcuts();

  const ViewComponent = viewMap[view];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar view={view} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="min-h-full"
            >
              <Suspense fallback={<LoadingSkeleton variant="dashboard" />}>
                <ErrorBoundary>
                  <ViewComponent />
                </ErrorBoundary>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
