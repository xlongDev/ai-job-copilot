import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { parseBody } from "@/lib/validate";
import { z } from "zod";

const applicationSchema = z.object({
  company: z.string().min(1).max(200),
  position: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  salary: z.string().max(100).optional(),
  status: z.enum(["wishlist","applied","hr","tech1","tech2","hr-final","offer","rejected"]).optional(),
  priority: z.enum(["low","medium","high"]).optional(),
  matchScore: z.number().int().min(0).max(100).optional(),
  url: z.string().max(2000).optional(),
});

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    const applications = await db.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ applications });
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const parsed = await parseBody(req, applicationSchema);
    if (!parsed.ok) return parsed.response;
    const {company, position, location, salary, status, priority, matchScore, url} = parsed.data;

    if (!company || !position) {
      return NextResponse.json({ error: "Company and position are required" }, { status: 400 });
    }

    const application = await db.application.create({
      data: {
        userId,
        company,
        position,
        location: location || null,
        salary: salary || null,
        status: status || "wishlist",
        priority: priority || "medium",
        matchScore: matchScore || 0,
        url: url || null,
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}
