import { z } from "zod";

/** AI 供应商参数，15+ 个路由共用 */
export const aiProviderFields = {
  provider: z.string().min(1).max(40).optional(),
  apiKey: z.string().max(500).optional(),
  model: z.string().max(200).optional(),
  baseUrl: z.string().max(500).optional(),
};

/** LLM 对话消息 */
export const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().max(50_000),
});

export const nonEmptyText = (max = 20_000) => z.string().min(1).max(max);
