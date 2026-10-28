# AI Job Copilot

覆盖求职全流程的 AI 工作台：简历优化、ATS 扫描、JD 匹配、模拟面试、求职追踪、Agent 编排。

## 技术栈

Next.js 16（App Router）· React 19 · TypeScript 7 · Tailwind v4 · shadcn/ui · Prisma 6 + SQLite · Zustand · oxlint

## 本地开发

```bash
pnpm install
cp .env.example .env          # 然后填入 AUTH_SECRET
pnpm db:generate
pnpm db:push
pnpm db:seed                  # 演示账号 alex.chen@email.com / demo1234
pnpm dev                      # http://localhost:3000
```

> 首次拉取依赖或改动 `prisma/schema.prisma` 后，需要重新执行 `pnpm db:generate`。

## 质量门禁

```bash
pnpm verify     # = typecheck + lint + build
```

| 命令 | 说明 |
| --- | --- |
| `pnpm typecheck` | `tsc --noEmit`（TypeScript 7） |
| `pnpm lint` | `oxlint --type-aware` |
| `pnpm build` | `next build` + 拷贝 standalone 静态资源 |

CI 在每次 push / PR 到 `main` 时自动跑完整门禁，见 `.github/workflows/ci.yml`。

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | 是 | SQLite 路径。相对路径基于 `prisma/` 目录，如 `file:./dev.db` |
| `AUTH_SECRET` | 生产必填 | session token 的 HMAC 密钥，`openssl rand -hex 32` 生成 |

⚠️ **`AUTH_SECRET` 在构建期与运行期必须一致**。Edge Runtime 的 `proxy.ts` 会在构建时把 `process.env.AUTH_SECRET` 内联进产物，构建时缺失会退化为默认密钥，登录接口会直接拒绝（fail closed），但所有请求都会 401。

## 鉴权模型

- 密码哈希：`node:crypto` 的 scrypt（`src/lib/password.ts`），无需额外依赖
- 会话：HMAC-SHA256 签名的 httpOnly cookie（`src/lib/session-token.ts`），Edge 与 Node 双端通用
- 拦截：`src/proxy.ts`（Next 16 的请求拦截约定，`middleware.ts` 已弃用）在入口统一鉴权
  - 未登录访问 API → `401`
  - 未登录访问页面 → `302 /login`

## 入参校验

所有写接口的请求体统一走 zod（`src/lib/validate.ts` 的 `parseBody`），非法输入返回 `400` 并附带字段级错误：

```json
{ "error": "参数不合法", "details": [{ "path": "company", "message": "..." }] }
```

共享的 schema 片段在 `src/lib/schemas.ts`（AI 供应商参数、对话消息结构等）。

## 目录速览

```
src/
  app/            页面与 Route Handlers（api/ 下 50+ 接口）
  components/
    ui/           shadcn/ui 基础组件
    views/        39 个业务视图（按 viewMap 懒加载）
    layout/       AppShell / Sidebar / Topbar / 命令面板
    shared/       玻璃拟态卡片、骨架屏、错误边界等
  lib/            db / auth / session / AI provider 抽象 / zustand store
  proxy.ts        请求入口鉴权
prisma/           schema + seed
```
