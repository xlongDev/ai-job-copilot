import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

/**
 * 统一的请求体校验。
 * 用法：
 *   const parsed = await parseBody(req, schema);
 *   if (!parsed.ok) return parsed.response;
 *   const { a, b } = parsed.data;
 */
export async function parseBody<T extends z.ZodType>(
  req: NextRequest,
  schema: T
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "参数不合法",
          details: parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 }
      ),
    };
  }

  return { ok: true, data: parsed.data };
}
