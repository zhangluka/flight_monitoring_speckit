# Contract: 航班搜索 API

**Feature**: 001-flight-search  
**Date**: 2025-03-04

本契约描述前端与 BFF 之间的「航班搜索」接口；BFF 再转发至第三方航班 API 并归一化响应。实现时第三方请求/响应格式可不同，但 BFF 对外暴露的本契约保持不变。

---

## 1. 请求

**Endpoint**: `GET /api/flights/search`（或 `POST`，由实现决定）

**Query / Body 参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| origin | string | 是 | 出发地（城市或机场代码/名称） |
| destination | string | 是 | 目的地（城市或机场代码/名称） |
| date | string | 是 | 出行日期，格式 `YYYY-MM-DD` |

**校验**（BFF 或前端须至少一处保证）：

- origin、destination、date 非空。
- origin ≠ destination。
- date ≥ 当前日期（不包含过去日期）。

---

## 2. 响应

### 2.1 成功（200）

**Body**: JSON

```json
{
  "flights": [
    {
      "flightNumber": "CA1234",
      "departureTime": "2025-03-10T08:00:00+08:00",
      "arrivalTime": "2025-03-10T10:30:00+08:00",
      "origin": "北京",
      "destination": "上海",
      "cabins": [
        { "name": "经济舱", "price": 800 }
      ]
    }
  ]
}
```

- **flights**：数组，可为空（表示无匹配航班）。
- 每条航班至少包含：**flightNumber**、**departureTime**、**arrivalTime**、**origin**、**destination**、**cabins**（至少一个元素，含 name 与 price）。
- 时间建议 ISO 8601，带时区；展示时统一为北京时间。
- 价格建议为数字，货币为人民币（实现时可加 currency 字段）。

### 2.2 无结果（200，空列表）

与 2.1 结构相同，`flights` 为 `[]`。前端据此展示「无结果」提示。

### 2.3 错误（4xx / 5xx）

**Body**: JSON（建议）

```json
{
  "error": "用户可读的错误描述",
  "code": "OPTIONAL_ERROR_CODE"
}
```

- 不暴露技术堆栈或第三方 API 细节；用户可见文案友好、可理解。

---

## 3. 与 data-model 的对应

- 请求参数对应 **搜索条件（SearchParams）**。
- 响应中 `flights[]` 对应 **航班（Flight）**，`cabins[]` 对应 **舱位（Cabin）**。
