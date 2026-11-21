# AI Agent 与前端工程化面试准备

## 约 60 秒项目介绍

> `codex-vue-lab` 是我的个人学习项目，用 Vue 3、TypeScript 和 Vite 做了学习中心和用户管理两个模块。学习中心记录任务进度，用户管理用内存 Mock 支持搜索、状态筛选、分页、新增和编辑。我把列表状态放在页面层，表格通过事件传出编辑目标，弹窗用独立草稿管理输入。筛选、分页和表单规则提取成纯函数，便于写单测。我用 Vitest 验证逻辑和组件交互，再用 Playwright 检查 Chromium 里的实际操作。以重置筛选为例，我用 Codex 辅助实现和审查，并在 GitHub 上走了 Issue、分支、PR 和 CI，最终功能通过 PR 合入 `main`。这个实验让我练习了如何定义验收条件，以及如何用源码、测试和提交记录验证 Agent 的交付。

[应用入口](../../src/App.vue) · [用户管理](../../src/features/users/UserManagementPage.vue) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2) · [CI 运行](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193)

## AI 辅助开发实践介绍

> 我先用 AGENTS.md 固定项目规则，再让 Codex 根据项目上下文、交接文档、当前代码和 Git 分支还原现场。给重置筛选任务时，我明确列出需要修改的状态、应保留的数据和要覆盖的场景。Agent 负责提出最小改动、实现、补测试和检查 Diff。我用可观察的验收条件判断交付，并单独批准本地提交。这个过程中，GitHub 集成查询成功，但创建 Issue 返回了权限错误，后续 Issue 和合并结果可以在 GitHub 核对。浏览器 MCP 会话没有可调用工具，那一轮只记录了可用性检查。浏览器自动化证据来自实际运行的 Playwright 测试和 CI。

[项目规则](../../AGENTS.md) · [任务模板](TASK_TEMPLATE.md) · [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1) · [学习复盘](AI_LEARNING_REVIEW.md)

## AI Agent 面试题（10 道）

1. **Agent 接手陌生仓库时，你让它先做什么？** 让它读取根目录规则、项目上下文和交接，再检查入口、相关测试、基准 SHA 与工作区。举例说明本地 `origin/main` 可能落后于 GitHub 上的 `main`。 [项目上下文](PROJECT_CONTEXT.md) · [学习复盘](AI_LEARNING_REVIEW.md)
2. **怎样写一个能验收的开发 Prompt？** 写清背景、目标、约束、非目标、典型与边界场景，以及实际要交付的证据。重置筛选要覆盖默认条件下仍能翻回第一页，并验证已保存的用户数据。 [任务模板](TASK_TEMPLATE.md) · [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1)
3. **Context Engineering 在项目里体现在哪里？** 项目规则约束操作，项目上下文介绍稳定的架构与命令，任务模板约束输入，交接记录最后一次实际进展。恢复会话时用最新源码、Git 和执行结果校验历史快照。 [项目规则](../../AGENTS.md) · [项目上下文](PROJECT_CONTEXT.md) · [历史交接](HANDOFF.md)
4. **你会在 AGENTS.md 中写哪些规则？** 写团队长期适用的技术约定、最小变更原则、验证命令、敏感文件限制和 Git 发布权限。用任务描述说明单次需求或例外的范围。 [AGENTS.md](../../AGENTS.md)
5. **如何拆分一个适合 Agent 执行的任务？** 按依赖拆为基线检查、设计、实现、测试、审查和发布。对外写入或范围扩大时明确审批。遇到权限失败，保留证据和草稿，继续独立的本地工作。 [开发工作流](AI_DEVELOPMENT_WORKFLOW.md)
6. **怎样判断工具任务真的执行过？** 查看调用名称、参数范围、真实返回、退出码或服务端记录。Git Diff 检查、测试命令输出与 GitHub Actions run 分别支持不同结论。 [CI 质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844)
7. **Playwright MCP 和 `npm run test:e2e` 在这个项目里有何区别？** E2E 通过测试脚本运行预先编写的断言。MCP 接入后可以通过暴露的工具操作页面、获取快照。实际调用要以当前会话可用工具和返回结果为准，本项目的浏览器 MCP 观察未完成。 [E2E 配置](../../playwright.config.ts) · [学习复盘](AI_LEARNING_REVIEW.md)
8. **怎样验证 Agent 的「最小改动」符合需求？** 从正常入口追到状态变化，核对只改了关键词、状态和请求页码，再通过 Diff、组件测试及 E2E 检查保留数据和原行为。 [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65)
9. **怎样让 Agent 做可验证的重构？** 先列原接口及行为不变量，再提取计算逻辑，把浏览器依赖转成显式输入，补充有代表性的边界单测并跑回归。用户管理的邮箱检查和分页函数都可举例。 [重构提交](https://github.com/momodezou/codex-vue-lab/commit/47556cd)
10. **AI Review 和人的责任怎样分配？** Agent 对照验收逐项检查 Diff、类型、状态变更、边界和测试。开发者确认业务取舍，决定授权与合并。当前项目有本地 AI Diff 审查记录，PR #2 的正式 Review 列表为空。 [开发工作流](AI_DEVELOPMENT_WORKFLOW.md) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2)

## 工程化与自动化测试面试题（5 道）

1. **同一个功能怎样分配给单测、组件测试和 E2E？** 纯函数单测覆盖规则和边界，组件测试验证按钮引起的状态与渲染变化，E2E 从可访问的界面入口验证组合查询、真实焦点和保存流程。 [用户模块测试](../../src/features/users/__tests__) · [E2E](../../tests/e2e/user-management.spec.ts)
2. **为什么 jsdom 的 Dialog 测试还需要 Chromium E2E？** jsdom 补丁只控制 `open`。Esc、焦点和原生邮箱行为涉及浏览器实现。真实屏幕阅读器仍需要独立人工验证。 [弹窗测试补丁](../../src/features/users/__tests__/setup-dialog.ts) · [E2E](../../tests/e2e/user-management.spec.ts)
3. **怎样降低 Playwright 测试的脆弱性？** 优先按角色和标签定位，使用可重试的断言、明确的记录及可观察的状态。现有用例部分依赖 Mock 顺序和条数，可以用测试构造的数据降低这种耦合。 [E2E](../../tests/e2e/user-management.spec.ts)
4. **项目里的 Lint、Type Check 和 Build 各负责什么？** ESLint 检查配置约定的静态规则，`vue-tsc -b` 检查项目引用范围内的 TS 和 Vue 类型，Vite 负责打包产物。运行单测和浏览器 E2E 另行提供行为证据。 [npm 脚本](../../package.json) · [TypeScript 配置](../../tsconfig.json)
5. **怎样保证 PR CI 结果可复核？** 用锁文件和 `npm ci` 固定依赖输入，确认对应候选 SHA 的工作流事件、job、步骤和结论。Chromium 安装步骤、失败 trace 和报告有助于定位环境或测试问题。 [CI 配置](../../.github/workflows/ci.yml) · [实际运行](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193)

## STAR 案例一 · 重置筛选与 GitHub 协作

- **S（情境）** 用户管理有搜索、状态和分页，恢复默认列表需要逐项操作。项目用这一小功能练习端到端的 GitHub 协作。
- **T（任务）** 明确按钮要恢复关键词、状态和页码，同时保留每页条数和数据，覆盖空结果和默认条件下第二页的边界。
- **A（行动）** 我把需求和非目标写成可测试的任务，使用 Codex 核对分支与实现，让它复用已有 Vue 状态并补齐边界测试。我根据 Diff 与实际命令结果审批本地提交。GitHub 写 Issue 请求遇到权限拒绝，后续在 GitHub 能查到对应 Issue、PR 和质量检查。 [功能提交](https://github.com/momodezou/codex-vue-lab/commit/dd0687c2206bf697741eb9287abc21fbad97df65) · [Issue #1](https://github.com/momodezou/codex-vue-lab/issues/1)
- **R（结果）** 组件测试和 Chromium E2E 覆盖了重置及保留数据，PR 质量任务通过，PR #2 合并到 `main`。 [组件测试](../../src/features/users/__tests__/UserManagementPage.component.test.ts) · [E2E](../../tests/e2e/user-management.spec.ts) · [PR #2](https://github.com/momodezou/codex-vue-lab/pull/2) · [CI 质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844)

## STAR 案例二 · 在保留行为的前提下重构用户管理

- **S（情境）** 用户管理页面和弹窗同时处理交互与业务计算，筛选、分页及表单校验集中在组件里。
- **T（任务）** 在保留筛选顺序、空结果页码、字段校验和焦点处理的前提下，为业务规则提供可独立测试的边界。
- **A（行动）** 我在个人项目中练习用 Agent 辅助拆分规则。列表部分提取筛选和分页函数，表单部分把浏览器 `ValidityState` 的相关字段作为显式输入，纯函数返回规范化数据与字段错误。组件继续处理原生弹窗、提交事件和焦点。 [重构提交](https://github.com/momodezou/codex-vue-lab/commit/47556cd) · [列表规则](../../src/features/users/userList.ts) · [表单规则](../../src/features/users/userFormValidation.ts)
- **R（结果）** Git 提交中可以看到两组新增的纯函数单测。后续 `dd0687c` 的 PR CI 在包含该重构的版本上通过了 Vitest 与 Chromium 回归。 [列表单测](../../src/features/users/__tests__/userList.unit.test.ts) · [表单单测](../../src/features/users/__tests__/userFormValidation.unit.test.ts) · [CI 质量任务](https://github.com/momodezou/codex-vue-lab/actions/runs/44890954193/job/136806421844)

[学习复盘](AI_LEARNING_REVIEW.md) · [开发工作流](AI_DEVELOPMENT_WORKFLOW.md)
