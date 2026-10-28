import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, isUsingDefaultSecret, verifyPassword } from "@/lib/auth";

export const runtime = "nodejs";

// POST /api/auth/login — 邮箱 + 密码登录
export async function POST(req: NextRequest) {
  try {
    if (isUsingDefaultSecret() && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "服务端未配置 AUTH_SECRET，拒绝使用默认密钥登录" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    await createSession(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        plan: user.plan,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "登录失败" }, { status: 500 });
  }
}
