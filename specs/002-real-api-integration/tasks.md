# Tasks: 航班搜索数据源切换为真实接口

**Input**: Design documents from `/specs/002-real-api-integration/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: 宪章要求单元测试必写、E2E 仅少量核心流程。本任务列表包含数据源配置、真实客户端与 BFF 的单元测试；E2E 沿用 001 流程，可选增加「真实数据源」冒烟。

**Organization**: 按用户故事分组，便于独立实现与验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成任务依赖）
- **[Story]**: 所属用户故事（US1, US2, US3）
- 描述中含具体文件路径

## Path Conventions

- 仓库根目录：`app/`、`lib/`、`tests/`（与 plan.md 一致）
- 新增模块：`lib/flights/` 下配置、mock、真实客户端与映射

---

## Phase 1: Setup（共享准备）

**Purpose**: 确认项目结构与 002 所需环境变量约定

- [x] T001 在项目根目录新增或更新 `.env.example`，加入 `FLIGHT_DATA_SOURCE`、`FLIGHT_API_BASE_URL`、`FLIGHT_API_KEY` 的说明（与 specs/002-real-api-integration/contracts/data-source-config.md 一致）

---

## Phase 2: Foundational（前置能力）

**Purpose**: 数据源配置读取与 mock 抽取，BFF 可据此选择数据源；所有用户故事依赖本阶段完成。

**⚠️ CRITICAL**: 未完成本阶段前不得开始用户故事实现

- [x] T002 实现数据源配置读取：在 `lib/flights/data-source-config.ts` 中读取 `FLIGHT_DATA_SOURCE`、`FLIGHT_API_BASE_URL`、`FLIGHT_API_KEY`，返回 `{ mode: 'mock'|'real', baseUrl?: string, apiKey?: string }`；未设置或无效时 `mode` 为 `mock`
- [x] T003 [P] 为数据源配置添加单元测试：在 `tests/unit/lib/data-source-config.test.ts` 中覆盖「未设置→mock」「FLIGHT_DATA_SOURCE=real 且 URL/Key 有效→real」「无效值→mock」
- [x] T004 [P] 将现有 mock 逻辑抽取到 `lib/flights/mock-flights.ts`：从 `app/api/flights/search/route.ts` 移出 `getMockFlights`，导出供 BFF 与测试使用

**Checkpoint**: 配置与 mock 就绪，可开始按用户故事实现

---

## Phase 3: User Story 1 - 从真实数据源获取并展示航班 (Priority: P1) — MVP

**Goal**: 配置为真实数据源时，BFF 调用真实航班 API，将响应尽力映射为现有 Flight 契约并返回；用户看到来自真实接口的列表。

**Independent Test**: 设置 `FLIGHT_DATA_SOURCE=real` 且配置有效 baseUrl/apiKey 后，提交有效出发地、目的地、日期并搜索，结果列表来自真实 API 且符合现有展示契约（航班号、起降时间、舱位与价格等）。

### Implementation for User Story 1

- [x] T005 [US1] 在 `lib/flights/real-client.ts` 中实现真实 API 客户端：接收配置（baseUrl、apiKey）与搜索参数（origin、destination、date），请求外部 API，解析响应
- [x] T006 [US1] 在 `lib/flights/real-client.ts` 中实现响应映射：将供应商响应尽力映射为 `Flight[]`（符合 `lib/types/flight.ts`），缺失或无法映射的字段用占位或隐藏，并记录日志（如 console 或 logger），不向前端暴露原始错误
- [x] T007 [US1] 重构 `app/api/flights/search/route.ts`：读取数据源配置；若 mode 为 mock 则调用 `lib/flights/mock-flights.ts` 的 getMockFlights，若为 real 则调用 `lib/flights/real-client.ts` 的客户端；真实客户端抛错时捕获并返回 500 及用户可读的 `error` 文案
- [x] T008 [P] [US1] 在 `tests/unit/lib/real-client.test.ts` 中为真实客户端添加单元测试：mock fetch，断言映射后的 Flight 形状；覆盖「供应商返回部分字段」时占位/隐藏行为

**Checkpoint**: User Story 1 可独立验收（配置 real + 有效 API 时得到真实数据）

---

## Phase 4: User Story 2 - 通过配置切换数据源 (Priority: P2)

**Goal**: 通过修改环境变量并重启，在「真实 API」与「mock」之间切换，无需改代码或重新构建；配置缺失或无效时自动回退 mock。

**Independent Test**: 修改 `FLIGHT_DATA_SOURCE`（及 real 时的 URL/Key）并重启进程后，执行相同搜索，结果来自新数据源；未配置或配置无效时仍使用 mock 且搜索可用。

### Implementation for User Story 2

- [x] T009 [US2] 在 `tests/unit/lib/flights-route.test.ts`（或等效）中为 BFF 路由添加单元测试：mock 配置与数据源实现，断言 `FLIGHT_DATA_SOURCE=mock` 时返回 mock 数据、`FLIGHT_DATA_SOURCE=real` 且 fetch 被 mock 时返回真实形状数据；配置缺失时使用 mock
- [x] T010 [US2] 确认 `specs/002-real-api-integration/quickstart.md` 与 `contracts/data-source-config.md` 已说明切换步骤与回退行为；在 README 或文档中增加指向 quickstart 的链接（若尚未存在）

**Checkpoint**: User Story 2 可独立验收（改配置重启即切换、缺省回退 mock）

---

## Phase 5: User Story 3 - 真实接口不可用时的错误与日志 (Priority: P3)

**Goal**: 真实接口超时、4xx/5xx 或网络错误时，用户收到可理解的错误提示且无堆栈/密钥泄露；BFF 记录运维可用日志（至少错误类型，可选请求参数）。

**Independent Test**: 模拟真实接口超时或错误响应，用户端在合理时间内看到明确错误文案；响应体无堆栈与内部路径；服务端日志包含错误类型与请求信息。

### Implementation for User Story 3

- [x] T011 [US3] 在 `app/api/flights/search/route.ts` 与 `lib/flights/real-client.ts` 中完善错误处理：捕获超时、4xx/5xx、网络错误，记录结构化日志（至少错误类型，可选 origin/destination/date），返回 `NextResponse.json({ error: '用户可理解的描述', code?: string }, { status: 500 })`，不暴露堆栈或密钥
- [x] T012 [US3] 在真实客户端或 BFF 中识别限流/配额类错误（如 429 或供应商约定 code），映射为用户文案「请求过于频繁，请稍后再试」；同样记录日志且不暴露凭证
- [x] T013 [P] [US3] 在 `tests/unit/lib/real-client.test.ts` 或 BFF 路由测试中增加用例：真实客户端抛错时 BFF 返回 500 且 body 含 `error`、不含 stack；可 mock logger 断言日志包含错误类型或请求标识

**Checkpoint**: User Story 3 可独立验收（失败时友好错误 + 运维日志）

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: 文档、规范与收尾

- [x] T014 [P] 按 `specs/002-real-api-integration/quickstart.md` 执行本地「mock / real 切换」与错误场景验证，必要时修正 quickstart 或实现
- [x] T015 代码与配置审查：确认无 API Key 或敏感信息硬编码；仅对数据源分支、映射与日志等关键逻辑添加必要中文注释

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 无依赖，可立即开始
- **Phase 2 (Foundational)**: 依赖 Phase 1；**阻塞**所有用户故事
- **Phase 3 (US1)**: 依赖 Phase 2；可独立交付 MVP
- **Phase 4 (US2)**: 依赖 Phase 2；与 US1 无强依赖，建议在 US1 后做便于联调
- **Phase 5 (US3)**: 依赖 Phase 2，且依赖 US1 的真实客户端与 BFF 调用链；建议在 US1 后做
- **Phase 6 (Polish)**: 依赖已完成的所有 Phase

### User Story Dependencies

- **US1 (P1)**: 仅依赖 Foundational；无其他故事依赖
- **US2 (P2)**: 仅依赖 Foundational；实现上复用 US1 的 BFF 与配置，但验收可独立（配置切换）
- **US3 (P3)**: 依赖 US1 的 BFF + 真实客户端；在 US1 完成后实现错误处理与日志

### Within Each User Story

- 先实现数据/客户端与 BFF 集成，再补对应单元测试；或先写失败用例再实现以满足 TDD（按团队习惯）
- 每阶段结束可在 checkpoint 独立验证该故事

### Parallel Opportunities

- T003 与 T004 可并行（不同文件）
- T008 可与 T007 之后并行编写
- T009 与 T010 可并行（测试文件 vs 文档）
- T013 可与 T011、T012 之后并行
- T014 与 T015 可并行

---

## Parallel Example: User Story 1

```text
# 先完成 T005、T006（真实客户端与映射），再 T007（BFF 接入），最后 T008（单元测试）
T005 → T006 → T007 → T008
```

## Parallel Example: User Story 2

```text
# Foundational + US1 完成后可并行：
T009（BFF 配置/数据源单元测试）| T010（文档与 quickstart 链接）
```

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1 + Phase 2  
2. 完成 Phase 3（US1）  
3. **STOP and VALIDATE**：配置 real + 有效 API 时搜索得到真实数据  
4. 可部署/演示

### Incremental Delivery

1. Phase 1 + 2 → 配置与 mock 就绪  
2. Phase 3 (US1) → 独立验收 → 部署/演示（MVP）  
3. Phase 4 (US2) → 独立验收 → 配置切换与回退文档就绪  
4. Phase 5 (US3) → 独立验收 → 错误与日志就绪  
5. Phase 6 → 文档与规范收尾  

### Suggested MVP Scope

- **MVP = Phase 1 + Phase 2 + Phase 3（User Story 1）**  
- 交付「可配置真实数据源并展示航班」；配置切换（US2）与完善错误/日志（US3）可在后续迭代完成。

---

## Notes

- 真实 API 供应商与协议以 001 research 及最终选型为准；`lib/flights/real-client.ts` 的请求格式需与所选 API 一致。
- 路径与契约以当前仓库为准：`app/api/flights/search/route.ts`、`lib/types/flight.ts`、`specs/001-flight-search/contracts/flight-search-api.md`（BFF 对外契约不变）。
- 每项任务格式：`- [ ] Txxx [P?] [US?] 描述（含路径）`；完成后将 `- [ ]` 勾选为 `- [x]`。
