# AI Agent 专项学习复盘

`codex-vue-lab` 是个人前端工程实验项目。它把 Vue 业务开发、自动化测试和 GitHub 协作放在同一个仓库中练习，业务数据来自前端内存 Mock。 [项目规范](../../AGENTS.md)

## 成果与证据范围

本次核验以 2026 年 11 月 21 日可见的源码、Git 引用、测试记录和 GitHub Actions 结果为准。核验开始时工作区干净，本地 `feature/reset-user-filters` 和本地跟踪引用均指向 `dd0687c`。本地 `main` 以及本地 `origin/main` 仍指向 `d57bd43`，GitHub 上的 `main` 已指向合并提交 `c761a47`。重置筛选的 Issue #1 为已完成，PR #2 已合并。PR 的正式 Review 列表为空，Issue 和 PR 的自动关闭关联未核实。 [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65) · [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2) · [远端合并提交](https://github.com/momodezou/codex-vue-lab/commit/c761a47892a5cbf0b841daab46083f0b3b9892f4)

| 分类 | 核验结论 |
| --- | --- |
| 已实际实现 | 学习中心支持 Codex、Cursor、Claude Code 的任务累加、汇总和单项重置。用户管理支持姓名和手机号搜索、状态筛选、分页、重置筛选、新增和编辑。导航往返保留页面内存状态，刷新重建状态。 [应用入口](../../src/App.vue) · [学习中心](../../src/components/LearningCenter.vue) · [用户管理](../../src/features/users/UserManagementPage.vue) |
| 已有测试但尚未验证 | 就 `dd0687c` 已有的 Vitest 和 Chromium E2E 套件而言，未发现只有用例、缺少执行证据的功能，PR CI 中两套测试步骤均成功。本次文档核验未重新运行本地套件。覆盖率报告命令已配置，未核实实际覆盖率结果。 [CI 质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844) · [Vitest 配置](../../vitest.config.ts) |
| 仅在文档中规划 | 未发现仅由文档承诺且已有明确验收范围的业务功能。跨浏览器、移动布局和真实屏幕阅读器是明确记录的后续验证项。任务模板中的错误和并发场景是提示项，是否适用取决于具体需求。 [项目上下文](PROJECT_CONTEXT.md) · [任务模板](TASK_TEMPLATE.md) |
| 完全未实现 | 当前业务入口没有后端 API、持久化、用户删除、登录鉴权、Vue Router 或 Pinia。学习中心的三个工具条目用于记录学习进度。应用本身没有 Agent 运行时或 MCP 客户端。 [入口组件](../../src/App.vue) · [用户管理](../../src/features/users/UserManagementPage.vue) · [依赖清单](../../package.json) |

### 验证记录

- 功能开发会话对 `dd0687c` 的待提交改动实际运行过 Lint、Build、Vitest 和 Playwright。Vitest 为 7 个测试文件、61 项通过，Chromium E2E 为 15 项通过、退出码 `0`。Windows 上的 E2E 需要手动停止本次测试启动的 Vite 进程才完成收尾。本地保留的 Playwright 上次运行摘要显示 `passed`，该摘要自身不记录提交 SHA。
- GitHub Actions 对 `dd0687c` 的 PR 运行 #6 已完成。`quality` job 的依赖安装、Lint、Build、Vitest、Chromium 安装和 Playwright 步骤均成功。失败诊断上传按条件跳过。这个结果对应 PR 提交，合并后 `main` 的 push 工作流结果未单独核验。 [CI 运行 #6](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193) · [质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844)
- Playwright MCP 浏览器观察会话只完成工具可用性检查。当时没有暴露可调用的浏览器工具，实际 MCP 浏览器调用为零，也没有生成可访问性快照。Chromium E2E 的通过证据来自项目测试脚本和 CI。

### 文档与现状的差异

- `README.md` 仍是 Vite 模板介绍。`PROJECT_CONTEXT.md` 描述了用户查询和分页，尚未列出后续加入的「重置筛选」。`HANDOFF.md` 保留 Phase 12 完成时的工作区与验证快照，当前提交、Issue、PR 和 CI 以本次实查为准。 [README](../../README.md) · [项目上下文](PROJECT_CONTEXT.md) · [历史交接](HANDOFF.md)

## AI Agent 能力评估

「已实践」指有具体产物或执行记录。「部分实践」指已完成一部分且有明确边界。「未验证」指已有线索但缺少确认结果。「尚未学习」用于明确尚未开展的学习事项，仓库证据不足时仅记录可见范围。

| 能力 | 评价 | 项目证据 |
| --- | --- | --- |
| Codex 项目分析 | 已实践 | 从规则、入口、源码、测试脚本和 Git 状态还原应用结构。跨会话核对发现 Phase 12 文档的分支快照已过时。 [项目上下文](PROJECT_CONTEXT.md) · [历史交接](HANDOFF.md) |
| Prompt Engineering | 已实践 | 用背景、功能、非目标、验收和测试要求描述重置筛选，能把「不修改用户数据」转成可执行断言。 [任务模板](TASK_TEMPLATE.md) · [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1) |
| Context Engineering | 已实践 | 把长期规则、稳定项目事实、单次任务模板和交接快照放入独立文档，跨会话再用源码和 Git 修正判断。提交 `d57bd43` 记录了这次建设。 [规范](../../AGENTS.md) · [项目上下文](PROJECT_CONTEXT.md) · [任务模板](TASK_TEMPLATE.md) · [历史交接](HANDOFF.md) |
| AGENTS.md 项目规则 | 已实践 | 约束最小改动、依赖变更、Git 发布和真实验证。功能提交实际涉及一个页面和两个测试文件。 [AGENTS.md](../../AGENTS.md) · [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65) |
| Agent Planning | 已实践 | 将重置筛选拆为仓库及基线检查、Issue 草稿、页面与测试改动、Diff 审查、质量检查、授权提交。开发会话记录包含创建 Issue 被拒绝后继续本地工作的调整。 [任务模板](TASK_TEMPLATE.md) · [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65) |
| Tool Calling | 已实践 | 实际使用终端读取文件和 Git 状态、编辑工具应用补丁、终端运行测试，并通过 GitHub 工具读取 PR、CI 和 steps。操作结果依据退出码与工具返回。 [质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844) |
| MCP 工具调用 | 部分实践 | GitHub 集成的只读查询成功，开发期间创建 Issue 的请求返回 `403`。浏览器会话未暴露 Playwright MCP 工具，浏览器 MCP 的实际调用和页面观察未验证。 [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2) |
| AI 辅助业务开发 | 已实践 | Agent 协助实现筛选重置，复用现有查询状态、派生列表和分页。数据修改路径保持独立。 [用户管理页](../../src/features/users/UserManagementPage.vue) · [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65) |
| AI 辅助测试 | 已实践 | 对空结果、默认条件下返回第一页、组合条件及保留新增和编辑数据分别写入组件或 E2E 用例，并核对实际结果。 [组件测试](../../src/features/users/__tests__/UserManagementPage.component.test.ts) · [E2E 测试](../../tests/e2e/user-management.spec.ts) · [质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844) |
| AI 辅助重构 | 已实践 | `47556cd` 把列表计算和保存前校验提取为纯函数。组件保留 DOM 与响应式状态，新增纯函数单测。 [重构提交](https://github.com/momodezou/codex-vue-lab/commit/47556cd) · [列表规则](../../src/features/users/userList.ts) · [表单规则](../../src/features/users/userFormValidation.ts) |
| AI Code Review | 已实践 | 本地审查逐项核对需求、改动范围、响应式更新、类型和回归用例，检查后由用户授权提交。PR #2 的正式 Review 列表为空，独立人工 Review 尚无记录。 [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2) |
| Git 和 CI 协同 | 已实践 | 可追踪到独立 feature 分支、提交、真实 Issue、PR、CI 步骤及 `main` 合并。Agent 在开发会话获准执行本地提交，后续远端发布及合并由 GitHub 记录证实。 [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2) · [CI 运行 #6](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193) |

## 前端与工程化复盘

- **实际技术栈**为 Vue 3 Composition API、`<script setup lang="ts">`、TypeScript、Vite、npm 和 ESLint。CI 用 Node.js 26 和 `npm ci`，`npm run build` 先执行 `vue-tsc -b`，再交给 Vite 打包。 [依赖与脚本](../../package.json) · [Vite](../../vite.config.ts) · [ESLint](../../eslint.config.mjs) · [CI 配置](../../.github/workflows/ci.yml)
- **组件设计**由 `App` 管理两个页面的可见性，`UserManagementPage` 持有列表和表单会话，`UserTable` 接收当页记录并发出编辑 ID 和触发按钮，`UserFormDialog` 接收模式与初始值并管理表单草稿。关闭弹窗后由页面恢复焦点。 [App](../../src/App.vue) · [页面](../../src/features/users/UserManagementPage.vue) · [表格](../../src/features/users/UserTable.vue) · [表单](../../src/features/users/UserFormDialog.vue)
- **数据与响应式**从 25 条 Mock 的副本初始化 `users`。页面用 `ref` 管理输入与请求页码，用 `computed` 派生匹配记录、有效页码和切片，用 `watch` 在查询或每页数量变化时归第一页。`v-show` 保留页面实例，表单的 `reactive` 草稿在打开时创建。提交才由页面新增或更新，编辑保留原 ID 和创建时间。 [Mock](../../src/features/users/mockUsers.ts) · [页面](../../src/features/users/UserManagementPage.vue) · [表单](../../src/features/users/UserFormDialog.vue)
- **测试体系**由纯函数单测、Vue Test Utils 组件测试和真实 Chromium E2E 组成。单测校验手机号、列表和表单规则，组件测试校验状态和事件，E2E 验证外部可观察的浏览器行为，包括 Esc、焦点与刷新。Vitest 配置 V8 覆盖率，Playwright 管理本地 Vite 测试服务与失败诊断。 [单测和组件测试](../../src/features/users/__tests__) · [App 测试](../../src/__tests__/App.component.test.ts) · [E2E](../../tests/e2e/user-management.spec.ts) · [Playwright 配置](../../playwright.config.ts)

| 典型技术问题 | 项目里的处理 |
| --- | --- |
| 关键词和状态已是默认值时，重置仍需有分页效果 | 直接设置 `requestedPage` 为 `1`，专门测从未筛选的第二页回第一页。 [页面](../../src/features/users/UserManagementPage.vue) · [组件测试](../../src/features/users/__tests__/UserManagementPage.component.test.ts) |
| 编辑使末页唯一记录退出当前筛选 | 根据筛选后的条数收敛有效页码，编辑触发按钮脱离 DOM 时将焦点恢复到搜索框。 [列表规则](../../src/features/users/userList.ts) · [页面](../../src/features/users/UserManagementPage.vue) · [E2E](../../tests/e2e/user-management.spec.ts) |
| 取消编辑、无效表单和重复提交 | 表单独立保存草稿。校验失败聚焦首个错误字段，合法提交设定提交状态，取消或 Esc 关闭时放弃草稿。浏览器邮箱状态作为纯函数的显式输入。 [表单](../../src/features/users/UserFormDialog.vue) · [表单规则](../../src/features/users/userFormValidation.ts) · [表单组件测试](../../src/features/users/__tests__/UserFormDialog.component.test.ts) |
| 格式化手机号、无效查询和空分页 | 搜索与表单共用手机号规范化，匹配前排除空的手机号查询。分页函数在零结果时返回 `0 / 0`，此时翻页按钮不可用。 [手机号](../../src/features/users/phone.ts) · [列表规则](../../src/features/users/userList.ts) · [列表单测](../../src/features/users/__tests__/userList.unit.test.ts) |

### 尚存问题与复习重点

- 测试覆盖边界集中在 Chromium 和本地 Mock。复习怎样将可访问名称、键盘焦点和真实屏幕阅读器验收结合起来，以及怎样为 Firefox、WebKit 与移动视口设计最小验证矩阵。 [Playwright 配置](../../playwright.config.ts) · [弹窗测试补丁](../../src/features/users/__tests__/setup-dialog.ts)
- 部分 E2E 用例依赖种子数据顺序或条数。复习测试数据构造、独立 fixture、可观察断言与回归测试的取舍。 [E2E 用例](../../tests/e2e/user-management.spec.ts)
- 复习 `ref`、`computed`、`watch`、`nextTick` 的各自用途，以及 Modal 卸载和焦点恢复的时序。结合 Git SHA、CI 事件及 job steps 区分本地通过、PR CI 通过和合并后验证。 [用户管理页](../../src/features/users/UserManagementPage.vue) · [CI 配置](../../.github/workflows/ci.yml)
- 继续练习成功的浏览器 MCP 工具发现、可访问性快照和只读浏览器操作。当前能复盘的是工具能力检查、GitHub 读写权限边界，以及 npm E2E 与 MCP 观察两种证据的区别。

[可复用开发工作流](AI_DEVELOPMENT_WORKFLOW.md) · [面试准备](AI_INTERVIEW_PREPARATION.md)
