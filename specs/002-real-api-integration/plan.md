# Implementation Plan: 航班搜索数据源切换为真实接口

**Branch**: `002-real-api-integration` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-real-api-integration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

将 BFF 航班搜索由当前仅使用的内存 mock 切换为「可配置的单一真实航班搜索接口」；通过配置（环境变量）在「真实 API」与「mock」之间切换数据源，配置缺失或无效时回退到 mock。真实接口失败时返回用户可理解的错误并记录运维可用日志；真实 API 响应在服务端尽力映射为现有展示契约，缺失字段用占位或隐藏并记录日志。不要求降级、不要求多数据源或主备。

## Technical Context

**Language/Version**: TypeScript 5.x（Node 20+）  
**Primary Dependencies**: Next.js 14+（App Router）、React 18+、shadcn/ui、Tailwind CSS  
**Storage**: N/A（本 feature 无新增持久化；配置来自环境变量）  
**Testing**: Jest + React Testing Library（单元测试）；Playwright（E2E，少量核心流程）  
**Target Platform**: Web（浏览器 + Node 服务端 BFF）  
**Project Type**: web-service（Next.js 全栈应用，BFF + 前端）  
**Performance Goals**: 单次搜索响应 ≤5s（或符合所选真实接口 SLA）；错误态 ≤10s 内展示  
**Constraints**: 凭证与 API Key 仅服务端；不暴露内部错误堆栈；文档中文  
**Scale/Scope**: 单一真实 API 实例；通过配置切换，无多源/主备

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **技术栈**：是。前端沿用 Next.js，UI 沿用 shadcn/ui（本 feature 不改动前端技术栈）。
- **数据源**：是。真实接口来自开放可调用的第三方 API，选型与合规由 001 的 research 覆盖；本 feature 在 BFF 内做可配置切换与映射，合规与记录在 research/quickstart 中说明。
- **测试**：是。单元测试覆盖数据源切换、映射逻辑、配置回退与失败日志；E2E 沿用 001 少量核心流程，可增加「真实数据源」下的冒烟场景（若环境可配置）。
- **文档与注释**：是。文档中文；代码仅对数据源分支、映射与日志等关键逻辑添加必要注释。

## Project Structure

### Documentation (this feature)

```text
specs/002-real-api-integration/
├── plan.md              # 本文件
├── research.md          # Phase 0：配置策略、BFF 抽象、映射与日志
├── data-model.md        # Phase 1：数据源配置实体 + 沿用 001 航班/舱位
├── quickstart.md        # Phase 1：环境变量与切换说明
├── contracts/           # Phase 1：BFF 数据源配置契约（环境变量约定）
└── tasks.md             # Phase 2 输出（/speckit.tasks，非本命令生成）
```

### Source Code (repository根目录)

```text
app/
├── api/
│   └── flights/
│       └── search/
│           └── route.ts    # BFF：按配置调用 mock 或真实 API，映射与日志
├── page.tsx
├── layout.tsx
└── globals.css

components/
├── flight-search-form.tsx
├── flight-list.tsx
└── ui/

lib/
├── api/
│   └── flights.ts          # 前端调 BFF 的客户端（契约不变）
├── types/
│   └── flight.ts           # Flight / SearchParams 等（契约不变）
├── validation/
│   └── search-params.ts
└── utils.ts

tests/
├── unit/                   # 数据源逻辑、映射、配置回退的单元测试
└── e2e/                    # 可选：真实数据源下的冒烟
```

**Structure Decision**: 沿用 001 的单一 Next.js 应用结构；本 feature 仅修改 BFF 层（`app/api/flights/search/route.ts`）并新增配置读取与真实 API 客户端（或放在 `lib/` 下），不新增顶层目录。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

无违规；无需填写。
