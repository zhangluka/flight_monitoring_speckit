# Tasks: 国内航班与价格查询

**Input**: Design documents from `specs/001-flight-search/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 宪章要求单元测试必写、E2E 仅少量覆盖核心流程。以下包含单元测试任务与少量 E2E 任务。

**Organization**: 按用户故事分组，便于独立实现与验收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行（不同文件、无未完成依赖）
- **[Story]**: 所属用户故事（US1, US2, US3）
- 描述中写明具体文件路径

## Path Conventions

- Next.js App Router：`app/`、`components/`、`lib/` 位于仓库根
- 测试：`tests/unit/`、`tests/e2e/`

---

## Phase 1: Setup（项目初始化）

**Purpose**: 初始化 Next.js 项目与基础结构

- [ ] T001 按 plan.md 创建项目目录结构（app/、components/、lib/、tests/unit/、tests/e2e/）
- [ ] T002 初始化 Next.js 14+ 项目（TypeScript、App Router、Tailwind），安装依赖；含 app/layout.tsx，按需调整全局布局
- [ ] T003 [P] 配置 ESLint 与 Prettier（或项目既定 lint/format 工具）
- [ ] T004 [P] 引入并配置 shadcn/ui，安装本功能所需基础组件（如 Button、Input、Card、Skeleton）

**Checkpoint**: 项目可 `npm run dev` 与 `npm run build`，shadcn 可用

---

## Phase 2: Foundational（阻塞所有用户故事）

**Purpose**: 类型、校验、BFF 骨架与前端 API 客户端，所有故事依赖

**⚠️ CRITICAL**: 未完成前不得开始用户故事实现

- [ ] T005 [P] 在 lib/types/flight.ts 中定义 SearchParams、Flight、Cabin 类型（与 data-model.md、contracts 一致）
- [ ] T006 [P] 在 lib/validation/search-params.ts 中实现搜索参数校验：必填、origin≠destination、date≥今日；并导出校验函数
- [ ] T007 在 app/api/flights/search/route.ts 实现 BFF 路由骨架：接收 origin/destination/date，校验后转发至第三方 API 或 Mock，按 contracts 返回 { flights: [] } 或错误 JSON
- [ ] T008 在 lib/api/flights.ts 实现前端调用 BFF 的客户端（如 searchFlights(params)），返回类型与 contracts 一致
- [ ] T009 配置 Jest + React Testing Library；在 tests/unit 下建立 validation、lib、components 子目录

**Checkpoint**: 类型与校验可用、BFF 可调通（可用 Mock）、前端可调用 BFF、单测环境就绪

---

## Phase 3: User Story 1 - 按条件搜索并查看航班列表 (Priority: P1) 🎯 MVP

**Goal**: 用户输入出发地、目的地、日期并提交，页面展示航班列表（航班号、起降时间、舱位、价格）。

**Independent Test**: 输入有效条件并搜索，结果区展示至少一条航班且包含航班号、起飞/降落时间、舱位与价格。

### Tests for User Story 1

- [ ] T010 [P] [US1] 在 tests/unit/validation/search-params.test.ts 为 lib/validation/search-params.ts 编写单元测试（必填、出发地≠目的地、日期非过去）
- [ ] T011 [P] [US1] 在 tests/unit/lib/flights.test.ts 为 lib/api/flights.ts 编写单元测试（请求参数与响应形状、错误处理）
- [ ] T012 [P] [US1] 在 tests/unit/components/flight-list.test.tsx 为航班列表组件编写单元测试（有数据时渲染字段、空列表不报错）

### Implementation for User Story 1

- [ ] T013 [US1] 在 components/flight-search-form.tsx 实现搜索表单：出发地、目的地、日期输入与提交，调用 lib/api/flights.ts 的 searchFlights
- [ ] T014 [US1] 在 components/flight-list.tsx 实现航班列表展示：接收 flights 数组，渲染航班号、起飞时间、降落时间、舱位与价格（至少一种舱位）
- [ ] T015 [US1] 在 app/page.tsx 集成表单与列表：表单提交后请求 BFF，将结果传入 flight-list；无结果时先显示空列表（无结果提示在 US2）
- [ ] T016 [US1] 在 BFF app/api/flights/search/route.ts 中对接真实第三方 API 或稳定 Mock，按 contracts 归一化响应（flights[].flightNumber, departureTime, arrivalTime, origin, destination, cabins）；API 选型与环境变量见 research.md、quickstart.md

**Checkpoint**: 用户可搜索并看到航班列表，单测通过

---

## Phase 4: User Story 2 - 加载中与无结果时的展示 (Priority: P2)

**Goal**: 搜索中显示加载态，无匹配航班时显示「无结果」，请求失败时显示友好错误提示。

**Independent Test**: 通过延迟或 Mock 空/错误响应，可分别验证加载中、无结果、错误三种状态的展示。

### Tests for User Story 2

- [ ] T017 [P] [US2] 在 tests/unit/components/flight-list.test.tsx 中增加加载中、无结果、错误态的展示用例（如 loading、empty、error 状态下的文案或占位）

### Implementation for User Story 2

- [ ] T018 [US2] 在 components/flight-list.tsx 或上层增加 loading 状态：请求进行中显示加载指示器或「加载中」文案
- [ ] T019 [US2] 在 components/flight-list.tsx 或上层增加空结果态：flights 为空且非错误时显示「暂无符合条件的航班」等无结果提示
- [ ] T020 [US2] 在 components/flight-list.tsx 或上层增加错误态：BFF 或网络错误时显示用户可理解的错误提示，不暴露技术堆栈

**Checkpoint**: 加载中、无结果、错误三种状态可区分且符合规格

---

## Phase 5: User Story 3 - 结果清晰可读与信息完整 (Priority: P3)

**Goal**: 列表信息对齐、格式统一（时间、价格），便于比较。

**Independent Test**: 对任意有结果的搜索，列表项均包含规定字段且格式一致、视觉对齐。

### Tests for User Story 3

- [ ] T021 [P] [US3] 在 tests/unit/components/flight-list.test.tsx 中增加格式与一致性用例（时间、价格展示格式统一）

### Implementation for User Story 3

- [ ] T022 [US3] 在 components/flight-list.tsx 中统一时间展示（如北京时间、HH:mm 或 YYYY-MM-DD HH:mm），价格统一为人民币格式
- [ ] T023 [US3] 在 components/flight-list.tsx 中保证列表列对齐或统一布局（使用 shadcn Table/Card 等），便于扫读与比较
- [ ] T024 [US3] 在 components/flight-list.tsx 或页面层实现分页或虚拟滚动（当结果条数超过阈值时），满足 FR-006 与 Edge Cases，避免首屏卡顿

**Checkpoint**: 列表格式统一、可读性满足 SC-002/SC-003；大量结果时分页/虚拟滚动可用

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: E2E、表单校验与文档

- [ ] T025 在表单提交前增加前端校验：必填、出发地≠目的地、日期非过去；不通过时提示且不发起请求（FR-005）
- [ ] T026 [P] 在 tests/e2e/flight-search.spec.ts 编写少量 E2E：输入条件 → 提交 → 出现结果列表或加载/无结果/错误态（覆盖主流程）
- [ ] T027 更新 README 或 quickstart：运行方式、环境变量（FLIGHT_API_KEY 等）、测试命令
- [ ] T028 按 quickstart.md 执行一次本地运行与单测/E2E 验证

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 无依赖，可立即开始
- **Phase 2 (Foundational)**: 依赖 Phase 1 完成，阻塞所有用户故事
- **Phase 3–5 (US1–US3)**: 均依赖 Phase 2；US2/US3 依赖 US1 的列表与请求链路，可在 US1 完成后顺序或并行推进
- **Phase 6 (Polish)**: 依赖 US1–US3 功能就绪

### User Story Dependencies

- **US1**: 仅依赖 Foundational；完成后具备可用的搜索与列表
- **US2**: 依赖 US1 的请求与列表组件，在其上增加状态展示
- **US3**: 依赖 US1 的列表组件，在其上增加格式与布局

### Parallel Opportunities

- T003 与 T004 可并行
- T005、T006 可并行；T010、T011、T012 可并行；T017、T021 可并行
- T022、T023、T024 可同文件内顺序完成

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1 + Phase 2
2. 完成 Phase 3（US1）
3. 验收：输入条件能搜到并看到列表
4. 再推进 US2、US3 与 Polish

### Incremental Delivery

1. Phase 1 + 2 → 基础就绪
2. Phase 3 (US1) → 可演示搜索与列表
3. Phase 4 (US2) → 加载/无结果/错误态完整
4. Phase 5 (US3) → 列表可读性达标
5. Phase 6 → E2E 与文档收尾

---

## Notes

- 任务格式：`- [ ] Txxx [P?] [USn?] 描述（含路径）`；总任务数 28（T001–T028）
- [P] 表示可与其他同阶段 [P] 任务并行
- 单测先写（T010–T012、T017、T021），再实现对应功能
- 每完成一个 Phase 可在对应 Checkpoint 自测后再进入下一阶段
