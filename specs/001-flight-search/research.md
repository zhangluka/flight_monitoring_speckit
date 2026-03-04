# Research: 国内航班与价格查询

**Feature**: 001-flight-search  
**Date**: 2025-03-04

## 1. 航班/价格数据源（第三方 API）

### Decision

- **生产/演示优先**：选用互联网上**开放可调用**的第三方航班/价格 API；具体供应商在实现时根据注册与合规性确定（见下方备选）。
- **开发与联调**：若暂无可用 Key 或需稳定契约，可先使用 **Mock 数据** 或 **Amadeus 测试环境** 实现 BFF 与前端，通过 `contracts/` 约定请求/响应形状，便于后续替换为国内 API。

### Rationale

- 宪章要求数据来自开放可调用的第三方 API，不得使用未公开或私有接口。
- 国内航班开放 API 多需企业注册（如飞猪开放平台、聚合数据、磐河旅行等），选型时须在文档中记录来源与使用条款。
- Amadeus Self-Service 提供免费额度（如 Flight Offers Search 约 2000 次/月）、文档完善，适合作为国际/演示数据源或契约参考；若仅做国内航线，需在 research 中说明并优先评估国内开放接口。

### Alternatives Considered

| 选项                         | 说明                                         | 未选原因                                   |
| ---------------------------- | -------------------------------------------- | ------------------------------------------ |
| 飞猪开放平台（阿里）         | 国内机票导购搜索 API，支持航班列表与低价查询 | 需注册、合规与配额；可作为生产备选         |
| 聚合数据（天聚地合）         | 航班动态、航线等 API                         | 需注册；适合补充或替代                     |
| 磐河旅行开放平台             | 国内机票航班查询、验舱验价等                 | 需注册；功能完整，可作为生产备选           |
| Amadeus Flight Offers Search | 国际常用、免费层明确                         | 国内航线覆盖与配额限制；适合演示或契约对齐 |
| 纯 Mock / 静态 JSON          | 无外部依赖                                   | 满足契约与 UI 开发，生产须替换为真实 API   |

### 合规与记录

- 最终采用的 API 供应商、接口文档链接、使用条款与数据范围须在 README 或本目录下说明。
- API Key 仅存放在服务端环境变量，经 Next.js API Routes 转发，不暴露给前端。

---

## 2. 前端框架与 UI

### Decision

- **框架**：Next.js 14+（App Router）。
- **UI**：shadcn/ui + Tailwind CSS，组件按需引入、可定制。

### Rationale

- 宪章明确要求 Next.js 与 shadcn/ui；与规格中的「清晰可读、加载/无结果态」一致。
- App Router 便于集成 API Routes 作为 BFF，单仓库维护成本低。

### Alternatives Considered

- 其他 React 元框架（如 Remix）：宪章已定 Next.js，不采纳。
- 其他 UI 库：宪章已定 shadcn/ui，不采纳。

---

## 3. BFF 与 API 安全

### Decision

- 浏览器不直接调用第三方航班 API；由 Next.js API Routes（如 `app/api/flights/search/route.ts`）作为 BFF 转发请求，在服务端注入 API Key 并归一化响应。

### Rationale

- 避免 CORS、避免将 Key 暴露给前端；便于统一错误处理与响应格式（对齐 `contracts/`）。

---

## 4. 测试栈

### Decision

- **单元测试**：Jest + React Testing Library；覆盖表单校验、搜索参数校验、列表展示与 BFF 客户端逻辑。
- **E2E**：Playwright；少量用例覆盖「输入条件 → 提交 → 结果/无结果/错误」主流程。

### Rationale

- 宪章要求单元测试必写、E2E 少量；Jest 与 Playwright 与 Next.js 生态常用，文档齐全。

### Alternatives Considered

- Vitest：可替代 Jest，与 Next 兼容；当前选 Jest 以与多数教程一致，后续可迁移。
- Cypress：可选；Playwright 对 Next 与多浏览器支持良好，优先选用。

---

## 5. 列表展示与性能

### Decision

- 结果列表首屏优先渲染；若单次返回条数过多（如 >50），采用**分页**或**虚拟滚动**，具体策略在实现时根据 API 分页能力与 UI 库选定。

### Rationale

- 规格与 Edge Cases 要求避免首屏卡顿与过多 DOM；分页或虚拟滚动二选一即可满足，不引入复杂状态管理。
