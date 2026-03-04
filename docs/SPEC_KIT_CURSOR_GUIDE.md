# Spec-kit 在 Cursor 中的实践指南

本指南面向spec-kit应用入门实践，说明如何用 [Spec-kit](https://github.com/github/spec-kit) 在 Cursor 里做**规格驱动开发（Spec-Driven Development, SDD）**，从意图到可运行代码的完整流程。

---

## 一、Spec-kit 与 SDD 是什么

### 核心思路

- **传统方式**：在 Cursor 里反复对话、改需求、改代码，容易偏离目标、遗漏边界。
- **SDD 方式**：先写「要做什么、为谁做、做到什么程度」，再由 Spec-kit 生成规格与计划，最后让 Cursor 按规格生成代码。

一句话：**你描述意图 → Spec-kit 产出规格与计划 → Cursor 按规格实现代码。**

### Spec-kit 能解决什么

- 减少「说了很多次还是不对」的情况：规格就是单一事实来源。
- 把需求拆成可执行任务，模型按任务一步步写代码，更可控。
- 自动带出契约、数据模型、研究结论等文档，方便后续维护和迭代。

---

## 二、环境准备

### 1. 安装前置

- **Python 3.8+**
- **Git 2.20+**
- **uv**（推荐）：<https://docs.astral.sh/uv/getting-started/installation/>
- **Cursor** 且已登录/配置好 AI 能力

### 2. 安装 Specify CLI

```bash
# 推荐：用 uv 全局安装
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git

# 校验
specify --version
specify check
```

未安装 uv 时，可一次性运行（不持久安装）：

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init . --ai cursor-agent
```

### 3. 在现有工程中初始化 Spec-kit（本项目适用）

当前仓库已存在，应在**当前目录**初始化，让 Cursor 获得斜杠命令和脚本：

```bash
cd /path/to/flight_monitoring_speckit

# 在当前目录初始化，并选择 Cursor 作为 AI 环境，以实际版本为准
specify init . --ai cursor-agent

```

执行后会：

- 在项目中生成 `.specify/`、`specs/`、以及 Cursor 所需的命令/脚本。
- 把这些目录和文件纳入 Git，它们和代码一样重要（甚至更优先于实现细节）。

若脚本无执行权限（Linux/macOS）：

```bash
chmod +x .specify/scripts/bash/*.sh
# 或
chmod +x scripts/*.sh
```

---

## 三、Cursor 中的 Spec-kit 斜杠命令

初始化完成后，在 Cursor 的 AI 对话里可以使用以下**斜杠命令**（具体前缀可能是 `/speckit.xxx` 或 `/specify.xxx`，以 Cursor 里实际显示为准）：

| 命令              | 作用                                               | 建议使用时机                                     |
| ----------------- | -------------------------------------------------- | ------------------------------------------------ |
| **/constitution** | 定义项目「宪法」：技术栈倾向、测试/文档/代码风格等 | 第一次用 Spec-kit 时优先做，之后大方向变更时再调 |
| **/specify**      | 描述「要做什么、为谁做、做到什么程度」             | 每个新功能或新迭代的起点                         |
| **/clarify**      | 对规格做结构化澄清，补全模糊和边界                 | 在 specify 之后、plan 之前（除非你主动跳过）     |
| **/plan**         | 根据规格做技术方案：架构、框架、接口、数据模型等   | clarify 之后（或跳过 clarify 后直接）            |
| **/tasks**        | 把计划拆成可执行任务列表                           | plan 完成后                                      |
| **/analyze**      | 检查规格、计划、任务之间的一致性与覆盖度           | 在 tasks 之后、implement 之前（可选但推荐）      |
| **/implement**    | 按任务在 Cursor 中生成/修改代码                    | 最后一步，可指定「只做某几个 Phase」             |

记忆顺序：**constitution → specify → clarify → plan → tasks → [analyze] → implement**。

---

## 四、推荐工作流（从 0 到可运行功能）

### Phase 0：立宪（可选但推荐）

在 Cursor 中执行例如：

```
/constitution 本项目为国内航班与价格查询的网页应用。前端希望用现代框架（如 React/Vue），
后端或 BFF 可选用 Node 或直接调用第三方 API；需要写单元测试与少量 E2E；
文档用中文；代码注释关键逻辑即可。
```

这样后续 `/plan` 和 `/implement` 会尽量遵守这些约束。

### Phase 1：描述意图（Specify）

**不要在这里写技术实现**，只写「做什么、给谁用、成功标准」：

```
/specify 做一个网页应用，供用户查询国内航班与价格。用户能按出发地、目的地、日期搜索航班，
看到航班号、起降时间、舱位与价格；结果要清晰可读，并考虑加载中和无结果时的展示。
数据来自互联网上可用的航班/价格接口（具体接口在 plan 阶段再选型）。
```

也可以使用脚本方式（若项目里有 `.specify/scripts/bash/create-new-feature.sh`）：

```bash
.specify/scripts/bash/create-new-feature.sh --json "国内航班与价格查询网页应用，按出发地、目的地、日期搜索并展示航班与价格" --number 1 --short-name "flight-search" "航班搜索与价格展示"
```

### Phase 2：澄清（Clarify）

在 Cursor 里执行：

```
/clarify
```

让模型针对规格里不清晰的地方提问（例如：单程/往返、是否要比价、是否需要历史搜索等），你在对话里回答，模型会更新规格。

### Phase 3：技术方案（Plan）

在 Cursor 里执行，并可附带技术偏好：

```
/plan 前端用 React + TypeScript，用 Vite 构建；优先选用国内可访问的航班/价格 API（如携程、飞猪等开放接口或可用的第三方聚合接口），
若需后端则用 Node 做一层 BFF。在 README 中说明架构与 API 选型理由。
```

生成内容通常会出现在 `specs/` 下，例如：

- `research.md`：接口/技术选型调研
- `data-model.md`：核心数据结构
- `contracts/`：接口契约等

### Phase 4：任务拆分（Tasks）

```
/tasks
```

会得到按 Phase 划分的可执行任务列表，便于分步实现和分步 `/implement`。

### Phase 5：一致性检查（可选）

```
/analyze
```

用于检查规格、计划、任务是否一致、有无遗漏。

### Phase 6：实现（Implement）

全量实现：

```
/implement
```

或只做到某几个阶段（例如先做接口对接与列表展示）：

```
/implement 只完成 Phase 1 和 Phase 2，先实现搜索与列表展示，不做筛选和排序
```

实现过程中若发现与规格不符，可以回到 `specs/` 里改 Markdown，再重新 `/tasks` 或指定范围 `/implement`。

---

## 五、与 Cursor Rules 的配合

- **Spec-kit** 负责「要做什么、分哪些阶段、产出哪些文档」。
- **Cursor Rules**（`.cursor/rules/` 下的 `.mdc` 或项目规则）负责「代码风格、命名、测试写法、框架约定」等。

建议：

1. 在 **constitution** 里说明：遵循项目 Cursor 规则。
2. 在 `.cursor/rules/` 里加一条「本项目采用 Spec-kit 驱动，实现时以 `specs/` 下规格与任务为准」，避免 AI 脱离规格随意发挥。
3. 规则按领域拆分（如 TypeScript、React、API、测试），便于只在对应用法时生效。

这样：**规格 = 需求与计划**，**Rules = 实现时的规范**，两者互补。

---

## 六、本项目（国内航班与价格查询）第一步建议

1. **初始化 Spec-kit（若尚未做）**

   ```bash
   cd /Users/bobby/Projects/Github/zhangluka/flight_monitoring_speckit
   specify init --here --ai cursor
   ```

2. **运行 `/constitution`**  
   在 Cursor 里用一段话定好：技术栈倾向、测试与文档要求、语言（中/英）。

3. **运行 `/specify`**  
   用一段话描述：国内航班与价格查询、用户操作流程、成功标准；不写具体 API 和技术实现。

4. **运行 `/clarify`**  
   回答模型关于单程/往返、比价、排序、错误处理等问题，把边界说清。

5. **运行 `/plan`**  
   明确：前端框架、是否要 BFF、选用哪类/哪个航班价格 API、目录结构、README 里要写什么。

6. **把 `specs/` 纳入版本控制**  
   保证团队（以及后续自己）始终以规格为单一事实来源。

之后按 **tasks → [analyze] → implement** 迭代即可；新功能或大改动时，再走一轮 specify → clarify → plan → tasks → implement。

---

## 七、参考与延伸阅读

- [Spec-kit 官方仓库](https://github.com/github/spec-kit)
- [Spec-kit 官网与命令说明](https://speckit.org/)
- [Spec-Driven Development: 0 to 1 with Spec-kit & Cursor](https://maddevs.io/writeups/project-creation-using-spec-kit-and-cursor/)
- [Spec-kit: Constitutional Foundation](https://github.com/github/spec-kit/blob/main/spec-driven.md)（理解「宪法」与架构约束）
- [Evolving specs (Discussion #152)](https://github.com/github/spec-kit/discussions/152)（项目演进时如何迭代规格）

---

_本指南随 Spec-kit 与 Cursor 的更新可能需要微调命令与路径，以官方文档为准。_
