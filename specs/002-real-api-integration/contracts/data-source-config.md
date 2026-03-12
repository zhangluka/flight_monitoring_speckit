# Contract: BFF 数据源配置（环境变量）

**Feature**: 002-real-api-integration  
**Date**: 2026-03-05

本契约描述 BFF 用于选择航班搜索数据源的环境变量约定；供部署与本地开发使用。前端不读取这些变量；密钥仅存服务端。

---

## 1. 数据源模式

| 变量名 | 说明 | 可选值 | 默认/未设置时 |
|--------|------|--------|----------------|
| FLIGHT_DATA_SOURCE | 当前数据源 | `mock` \| `real` | 视为 `mock`，BFF 使用内存 mock，搜索可用 |

- 当为 `real` 时，BFF 会请求真实航班 API；须同时配置真实 API 的端点与认证（见下）。
- 当为 `mock` 或未设置、或无效值时，BFF 回退到内存 mock，不请求外部 API。

---

## 2. 真实 API 配置（仅当 FLIGHT_DATA_SOURCE=real 时生效）

| 变量名 | 说明 | 必填 | 备注 |
|--------|------|------|------|
| FLIGHT_API_BASE_URL | 真实航班搜索 API 的 base URL | 是（当使用 real 时） | 具体以所选供应商文档为准 |
| FLIGHT_API_KEY | 真实 API 的密钥或 token | 视供应商要求 | 不提交版本库；可改用 FLIGHT_API_KEY_FILE 等安全方式 |

- 变量名可与供应商文档对齐（如 Amadeus 使用不同键名）；实现与 quickstart 中注明实际采用的键名。
- 若 `FLIGHT_DATA_SOURCE=real` 但端点或认证缺失/无效，实现可回退到 mock 或返回 503；规格要求「配置缺失或无效时回退 mock」，推荐回退 mock 并记录日志。

---

## 3. 与 BFF 行为对应

- **配置缺失或无效**：BFF 回退到 mock，保证搜索可用；该行为在 quickstart 与文档中说明。
- **真实接口失败**：BFF 返回用户可理解错误（见 001 的 flight-search-api 错误响应），并记录运维可用日志；不暴露堆栈或密钥。
