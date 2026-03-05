# 国内航班与价格查询

按出发地、目的地与日期查询国内航班与价格的网页应用，基于 Next.js + shadcn/ui，数据经 BFF 调用开放第三方航班 API。

## 环境要求

- Node.js 20+
- npm / pnpm / yarn

## 安装与运行

```bash
npm install
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 环境变量

BFF 调用第三方航班 API 时需在服务端配置（可选，当前默认使用 Mock 数据）：

- `FLIGHT_API_KEY`：第三方 API 密钥
- `FLIGHT_API_BASE_URL`：API 基础地址

将上述变量写入 `.env.local`（勿提交版本库）。使用 Mock 时可不配置。

## 测试

```bash
# 单元测试
npm test

# E2E 测试（需先安装 Playwright 并启动 dev 服务）
npx playwright install
npm run dev
npx playwright test
```

## 构建与生产

```bash
npm run build
npm run start
```

## 文档

- 规格与用户故事：`specs/001-flight-search/spec.md`
- 技术方案：`specs/001-flight-search/plan.md`
- 快速上手：`specs/001-flight-search/quickstart.md`
