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

BFF 数据源由环境变量控制（见 [specs/002-real-api-integration/quickstart.md](specs/002-real-api-integration/quickstart.md) 与 [contracts/data-source-config.md](specs/002-real-api-integration/contracts/data-source-config.md)）：

- `FLIGHT_DATA_SOURCE`：`mock`（默认）或 `real`；未设置时使用 Mock，搜索可用
- `FLIGHT_API_BASE_URL`、`FLIGHT_API_KEY`：仅当 `FLIGHT_DATA_SOURCE=real` 时生效

将变量写入 `.env.local`（勿提交版本库）。使用 Mock 时可不配置。

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

- 规格与用户故事：`specs/001-flight-search/spec.md`、`specs/002-real-api-integration/spec.md`
- 技术方案：`specs/001-flight-search/plan.md`、`specs/002-real-api-integration/plan.md`
- 快速上手：`specs/001-flight-search/quickstart.md`、[数据源切换与真实 API（002）](specs/002-real-api-integration/quickstart.md)
