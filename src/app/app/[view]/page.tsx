import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { VIEW_IDS, VIEW_META, isViewId } from "@/lib/views";

interface PageProps {
  params: Promise<{ view: string }>;
}

/** 所有视图在构建期静态化 */
export function generateStaticParams() {
  return VIEW_IDS.map((view) => ({ view }));
}

/** 未登记的视图一律 404，不进入 AppShell 兜底渲染 */
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { view } = await params;
  if (!isViewId(view)) return {};
  const meta = VIEW_META[view];
  return {
    title: `${meta.title} — AI Job Copilot`,
    description: meta.desc,
  };
}

export default async function AppViewPage({ params }: PageProps) {
  const { view } = await params;
  if (!isViewId(view)) notFound();
  return <AppShell view={view} />;
}
