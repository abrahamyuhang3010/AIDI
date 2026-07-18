# AIDI 2.0 Demo

独立的 AIDI 2.0 企业 AI 工作平台交互原型。

## 启动

```bash
pnpm install
pnpm dev
```

默认入口为 `http://localhost:3000/home`。

## Cloudflare Workers 部署

Cloudflare Workers Builds 使用以下配置：

```text
Build command: pnpm run build
Deploy command: pnpm exec wrangler deploy
Root directory: /
Node.js version: 22
pnpm version: 11.9.0
```

`pnpm run build` 会先执行 Next.js 生产构建，再生成 `.open-next` Worker 部署产物。
