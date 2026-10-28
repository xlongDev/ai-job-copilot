import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";


const notificationSchema = z.object({
  action: z.enum(["mark-read","mark-all-read","create"]),
  id: z.string().max(100).optional(),
  notification: z.object({
    type: z.enum(["success","info","warning","error"]).optional(),
    title: z.string().max(300),
    message: z.string().max(5000),
  }).optional(),
});

export const runtime = "nodejs";

// In-memory notifications (would be DB in production)
interface Notification {
  id: string;
  userId: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const notificationsStore = new Map<string, Notification[]>();

// Initialize default notifications
async function getOrCreateNotifications(userId: string): Promise<Notification[]> {
  if (notificationsStore.has(userId)) {
    return notificationsStore.get(userId)!;
  }

  const defaults: Notification[] = [
    {
      id: "n1",
      userId,
      type: "success",
      title: "ATS 分数提升",
      message: "你的简历 ATS 分数从 79 提升至 92，超过 73% 的求职者",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "n2",
      userId,
      type: "info",
      title: "面试提醒",
      message: "字节跳动技术一面将于明天 14:00 进行，请提前准备",
      read: false,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "n3",
      userId,
      type: "warning",
      title: "技能缺口提醒",
      message: "目标岗位 Tencent Staff 前端要求系统设计能力，建议补充相关项目",
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "n4",
      userId,
      type: "success",
      title: "投递成功",
      message: "已成功投递腾讯 Staff 前端工程师岗位",
      read: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "n5",
      userId,
      type: "info",
      title: "学习计划更新",
      message: "AI 已为你生成新的 30 天学习计划，查看详情",
      read: true,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  notificationsStore.set(userId, defaults);
  return defaults;
}

// GET /api/notifications
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const notifications = await getOrCreateNotifications(userId);
    const unreadCount = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST /api/notifications — mark as read / create
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, notificationSchema);
    if (!parsed.ok) return parsed.response;
    const {action, id, notification} = parsed.data;

    const notifications = await getOrCreateNotifications(userId);

    if (action === "mark-read" && id) {
      const n = notifications.find((n) => n.id === id);
      if (n) n.read = true;
    } else if (action === "mark-all-read") {
      notifications.forEach((n) => (n.read = true));
    } else if (action === "create" && notification) {
      const newN: Notification = {
        id: `n${Date.now()}`,
        userId,
        type: notification.type || "info",
        title: notification.title,
        message: notification.message,
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(newN);
    }

    const unreadCount = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("POST /api/notifications error:", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
