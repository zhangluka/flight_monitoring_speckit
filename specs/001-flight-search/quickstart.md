# Quickstart: 国内航班与价格查询

**Feature**: 001-flight-search  
**Date**: 2025-03-04

本地运行、测试与最小环境说明。

---

## 1. 环境要求

- **Node.js**: 20+
- **包管理**: npm / pnpm / yarn（任选其一）

---

## 2. 安装与运行

```bash
# 克隆或进入仓库后安装依赖
npm install

# 开发模式（Next.js 开发服务器）
npm run dev
```

浏览器访问 `http://localhost:3000`，进入搜索页；输入出发地、目的地与日期后提交，查看航班列表或加载/无结果/错误态。

---

## 3. 环境变量

BFF 调用第三方航班 API 时需在服务端配置密钥，**不要**将密钥提交到版本库。

示例（`.env.local`，不提交）：

```bash
# 第三方航班 API（示例键名，以实际选型为准）
FLIGHT_API_KEY=your_api_key
FLIGHT_API_BASE_URL=https://api.example.com
```

- 若使用 Mock 数据或本地 JSON，可不配置上述变量；实现时在 BFF 中根据环境切换真实 API / Mock。

---

## 4. 测试

```bash
# 单元测试
npm test

# E2E 测试（需已安装 Playwright 依赖）
npx playwright test
```

- 单元测试：覆盖表单校验、搜索参数校验、列表展示与 BFF 客户端逻辑。
- E2E：少量用例覆盖「输入条件 → 提交 → 结果/无结果/错误」主流程。

---

## 5. 构建与生产

```bash
npm run build
npm run start
```

---

## 6. 相关文档

- 规格与用户故事：`specs/001-flight-search/spec.md`
- 技术方案与结构：`specs/001-flight-search/plan.md`
- 数据模型：`specs/001-flight-search/data-model.md`
- 航班搜索接口契约：`specs/001-flight-search/contracts/flight-search-api.md`
- API 选型与合规：`specs/001-flight-search/research.md`
