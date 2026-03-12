# Quickstart: 航班搜索数据源切换为真实接口

**Feature**: 002-real-api-integration  
**Date**: 2026-03-05

本 feature 在 001 的本地运行与测试基础上，增加「数据源配置」说明；通用安装、启动与测试步骤见 [001-flight-search/quickstart.md](../001-flight-search/quickstart.md)。

---

## 1. 环境变量（数据源）

在 `.env.local`（或部署环境）中配置，**不要**将密钥提交到版本库。

### 使用 Mock（默认）

不设置 `FLIGHT_DATA_SOURCE` 或设为 `mock` 时，BFF 使用内存 mock 数据，无需真实 API 密钥：

```bash
# 可选，不设置则默认 mock
FLIGHT_DATA_SOURCE=mock
```

### 使用真实 API

1. 将数据源设为 `real`。
2. 配置真实航班 API 的 base URL 与认证（键名以实际选型为准，示例见下）。

```bash
FLIGHT_DATA_SOURCE=real
FLIGHT_API_BASE_URL=https://api.example.com   # 以供应商文档为准
FLIGHT_API_KEY=your_api_key                   # 以供应商文档为准，勿提交
```

- 若 `FLIGHT_DATA_SOURCE=real` 但未配置 `FLIGHT_API_BASE_URL` 或密钥，BFF 会回退到 mock 并记录日志（或按实现返回 503）；具体见 [contracts/data-source-config.md](./contracts/data-source-config.md)。

---

## 2. 切换数据源

修改上述环境变量后，**重启** Next.js 开发服务器或生产进程，使配置生效：

```bash
# 开发
npm run dev

# 生产
npm run build && npm run start
```

无需改代码或重新构建；仅环境变量变化即可在 mock 与真实 API 之间切换。

---

## 3. 日志与排查

- **真实接口失败**（超时、4xx/5xx、网络错误）：BFF 会记录运维可用日志（至少错误类型，可选请求标识）；查看控制台或部署环境的日志输出。
- **映射异常**（真实 API 返回字段与契约不一致）：BFF 会尽力映射并记录日志，缺失字段用占位或隐藏；通过日志排查供应商响应格式。

---

## 4. 相关文档

- 规格与澄清：`specs/002-real-api-integration/spec.md`
- 技术方案：`specs/002-real-api-integration/plan.md`
- 数据模型：`specs/002-real-api-integration/data-model.md`
- 数据源配置契约：`specs/002-real-api-integration/contracts/data-source-config.md`
- 航班搜索 API 契约（BFF 对外）：`specs/001-flight-search/contracts/flight-search-api.md`
- API 选型与合规：`specs/001-flight-search/research.md`
