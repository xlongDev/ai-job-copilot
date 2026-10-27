import { db } from "@/lib/db";

// In production, this would use Clerk auth or session.
// For now, we use the demo user.
export async function getDemoUserId(): Promise<string> {
  const user = await db.user.findFirst({
    where: { email: "alex.chen@email.com" },
  });
  if (!user) {
    const newUser = await db.user.create({
      data: {
        email: "alex.chen@email.com",
        name: "Alex Chen",
        avatar: "AC",
        role: "Senior Frontend Engineer",
        plan: "pro",
        credits: 1250,
      },
    });
    return newUser.id;
  }
  return user.id;
}
