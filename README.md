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

## 路由

视图状态放在 URL 里而不是 zustand，因此支持深链、分享、前进/后退与逐页标题。

| 路径 | 说明 |
| --- | --- |
| `/` | 落地页 |
| `/login` | 登录页（已登录自动跳 `/app/dashboard`） |
| `/app/[view]` | 应用内视图，共 38 个，构建期静态化 |

- 路由表单一数据源在 `src/lib/views.ts`（id / 侧栏文案 / 顶栏标题 / 分组 / 角标 / 快捷键），
  图标映射在 `src/lib/view-icons.ts`。新增视图：加一条 `VIEW_LIST` + 在 `app-shell.tsx` 的
  `viewMap` 登记组件 —— `viewMap` 声明为 `Record<ViewId, ...>`，漏登记会直接编译报错。
- `dynamicParams = false`：未登记的 view 一律 404，不会落到「兜底仪表盘」这种暧昧行为。

## 入参校验

所有写接口的请求体统一走 zod（`src/lib/validate.ts` 的 `parseBody`），非法输入返回 `400` 并附带字段级错误：

```json
{ "error": "参数不合法", "details": [{ "path": "company", "message": "..." }] }
```

共享的 schema 片段在 `src/lib/schemas.ts`（AI 供应商参数、对话消息结构等）。

## 积分与配额

`users.credits` 是唯一真源。之前 credits / plan 存在 localStorage 的 zustand store 里，
前端改个数字就能显示 99999，服务端既不扣减也不校验。

- 侧栏的套餐与额度读 `/api/user`，不再读 localStorage（`store` 已移除 `credits` / `plan`）
- 平台侧 LLM 调用统一走 `src/lib/ai-metering.ts` 的 `callAIWithCredits`
  - 事务内原子扣减，余额不足返回 `402 INSUFFICIENT_CREDITS`
  - LLM 调用失败会原额退还
  - 用户自带 API Key（`params.apiKey` 非空）时不消耗平台额度
- 计费单位：1 credit / 次 LLM 调用（按功能分层，见 `AI_FEATURE_COST`）
- `/api/billing` 的 `planId` 按枚举校验（此前任意字符串即可把自己改成 enterprise），
  买积分改为原子自增，不再「读余额 → 加 → 写回」

## 目录速览

```
src/
  app/
    page.tsx        落地页
    login/          登录页
    app/[view]/     视图路由（38 个，构建期静态化）
    api/            Route Handlers（50+ 接口）
  components/
    ui/           shadcn/ui 基础组件
    views/        38 个业务视图（按路由懒加载）
    layout/       AppShell / Sidebar / Topbar / 命令面板
    shared/       玻璃拟态卡片、骨架屏、错误边界等
  lib/
    views.ts        视图路由单一数据源
    validate.ts     zod 入参校验
    schemas.ts      共享 schema 片段
    ai-metering.ts  平台侧 LLM 调用的积分计量
    db / auth / session-token / ai-provider / store
  proxy.ts        请求入口鉴权
prisma/           schema + seed
```
