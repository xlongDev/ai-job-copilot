import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Job Copilot — 下一代 AI 求职工作台",
  description:
    "覆盖整个求职流程的 AI 智能工作台：简历优化、ATS 扫描、JD 匹配、模拟面试、求职追踪、AI Job Agent。让 AI 成为你的职业教练。",
  keywords: [
    "AI 求职",
    "简历优化",
    "ATS 扫描",
    "JD 匹配",
    "模拟面试",
    "求职追踪",
    "AI Job Agent",
    "Career Coach",
  ],
  authors: [{ name: "AI Job Copilot" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "AI Job Copilot — 下一代 AI 求职工作台",
    description: "让 AI 成为你的职业教练，覆盖整个求职闭环。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
