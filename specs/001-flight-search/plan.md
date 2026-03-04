# Implementation Plan: 国内航班与价格查询

**Branch**: `001-flight-search` | **Date**: 2025-03-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-flight-search/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

用户通过网页按出发地、目的地与日期查询国内航班并查看航班号、起降时间、舱位与价格；支持城市或机场粒度，选城市时展示该城市所有相关机场航班。前端采用 Next.js + shadcn/ui，数据通过 BFF（Next.js API Routes）调用互联网开放可用的航班/价格第三方 API；加载中、无结果与错误态明确区分，表单校验与列表展示满足规格。技术选型与 API 来源见 `research.md`。

## Technical Context

**Language/Version**: TypeScript 5.x（Node 20+）、React 18+  
**Primary Dependencies**: Next.js 14+ (App Router)、shadcn/ui、Tailwind CSS  
**Storage**: N/A（无持久化库；会话状态仅前端）  
**Testing**: Jest + React Testing Library（单元）、Playwright（E2E，少量核心流程）  
**Target Platform**: 现代浏览器（Chrome/Firefox/Safari 近期版本）、Node 20+ 服务端  
**Project Type**: web-application（Next.js 全栈，前端 + API Routes 作为 BFF）  
**Performance Goals**: 正常网络下首屏/搜索结果在数秒内可见；列表分页或虚拟滚动避免首屏卡顿  
**Constraints**: 航班与价格数据仅来自开放可调用的第三方 API；API Key 不暴露给前端，经 BFF 转发  
**Scale/Scope**: 单页搜索 + 结果列表；国内航线、单程；城市/机场双粒度

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **技术栈**：前端采用 Next.js，UI 基于 shadcn/ui。✅
- **数据源**：航班/价格仅使用开放可调用的第三方 API，来源与合规性见 `research.md`。✅
- **测试**：单元测试覆盖搜索、校验、列表与 API 适配层；E2E 仅覆盖「搜索 → 结果/无结果/错误」等少量核心流程。✅
- **文档与注释**：文档使用中文；代码仅对关键逻辑添加注释。✅

## Project Structure

### Documentation (this feature)

```text
specs/001-flight-search/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan)
├── data-model.md        # Phase 1 output (/speckit.plan)
├── quickstart.md        # Phase 1 output (/speckit.plan)
├── contracts/           # Phase 1 output (/speckit.plan)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                 # 搜索页
├── layout.tsx
├── api/
│   └── flights/
│       └── search/
│           └── route.ts     # BFF: 转发航班搜索至第三方 API
components/
├── ui/                      # shadcn/ui 组件
├── flight-search-form.tsx   # 出发地、目的地、日期表单
├── flight-list.tsx          # 航班列表（含加载/无结果/错误态）
└── ...
lib/
├── api/
│   └── flights.ts           # 前端调用 BFF 的客户端封装
├── types/
│   └── flight.ts            # 航班、搜索条件等类型
└── validation/
    └── search-params.ts     # 搜索参数校验
tests/
├── unit/
│   ├── validation/
│   ├── components/
│   └── lib/
└── e2e/
    └── flight-search.spec.ts
```

**Structure Decision**: 采用 Next.js App Router 单仓库结构；无独立 backend 目录，使用 `app/api/` 作为 BFF 代理第三方 API，避免 CORS 与 API Key 暴露。前端组件与类型集中在 `components/`、`lib/`，测试按单元与 E2E 分目录。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

（当前无违反宪章项，不填。）
