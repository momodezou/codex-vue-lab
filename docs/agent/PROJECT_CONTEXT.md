# 项目上下文

codex-vue-lab 是用于学习 AI Agent 与前端工程化的 Vue 项目。应用使用 Vue 3、TypeScript、Vite 和 Composition API，质量检查使用 ESLint、Vitest 和 Playwright。CI 使用 Node.js 26 和 npm 锁文件。 [项目规范](../../AGENTS.md) · [依赖与脚本](../../package.json) · [CI 配置](../../.github/workflows/ci.yml)

## 目录与入口

```text
index.html                         HTML 入口
src/
  main.ts                          挂载 App 并加载全局样式
  App.vue                          学习中心和用户管理的入口
  components/LearningCenter.vue    学习任务计数、汇总和重置
  features/users/                  用户管理页面、表格、弹窗、Mock 和纯函数
  __tests__/                       应用入口组件测试
tests/e2e/                         Playwright 用例
vite.config.ts                     Vue 插件与开发构建配置
vitest.config.ts                   Vitest 配置与覆盖率
playwright.config.ts               浏览器与 Vite 测试服务配置
.github/workflows/ci.yml           分支和 PR 质量检查
docs/agent/                        项目上下文、任务模板和交接
```

[HTML 入口](../../index.html) · [应用挂载](../../src/main.ts) · [应用组件](../../src/App.vue) · [测试配置](../../vitest.config.ts)

## 已实现的模块与数据流

| 模块 | 职责与边界 |
| --- | --- |
| 应用入口 | 默认显示学习中心，以 `v-show` 切换两个页面。页面保持挂载，导航往返保留各自的内存状态。 [App.vue](../../src/App.vue) |
| 学习中心 | 维护 Codex、Cursor 和 Claude Code 的任务计数，通过 `computed` 计算总数，支持重置单项进度。 [LearningCenter.vue](../../src/components/LearningCenter.vue) |
| 用户管理页面 | 从 25 条 Mock 记录的副本初始化列表，持有查询、分页和表单会话，负责新增、编辑、反馈及关闭后的焦点恢复。 [UserManagementPage.vue](../../src/features/users/UserManagementPage.vue) · [mockUsers.ts](../../src/features/users/mockUsers.ts) |
| 用户表格与弹窗 | 页面向表格传入当前页记录，表格发出编辑用户 ID 和触发按钮。页面为弹窗提供模式与初始值，弹窗编辑独立草稿并发出提交或取消事件。 [UserTable.vue](../../src/features/users/UserTable.vue) · [UserFormDialog.vue](../../src/features/users/UserFormDialog.vue) |
| 纯函数与类型 | `userList.ts` 计算筛选结果、显示页码和切片起点。弹窗读取原生邮箱校验状态，`userFormValidation.ts` 接收该状态和草稿，返回规范化后的值与字段错误。手机号规范化由搜索和表单共用。 [userList.ts](../../src/features/users/userList.ts) · [userFormValidation.ts](../../src/features/users/userFormValidation.ts) · [phone.ts](../../src/features/users/phone.ts) · [types.ts](../../src/features/users/types.ts) |

## 业务规则

- 姓名搜索忽略关键词首尾空格和英文大小写，手机号搜索支持规范化后的片段。两个字段任一命中后再与状态筛选组合。状态为全部、正常或禁用。 [查询入口](../../src/features/users/UserManagementPage.vue) · [匹配规则](../../src/features/users/userList.ts)
- 每页默认 10 条，可选 20 或 50 条。关键词、状态或每页数量变化时回到第一页，零结果显示 `0 / 0`。新增置顶并回首页，编辑保留原 ID 和创建时间，当前页失效时回退到有效页。 [分页及保存](../../src/features/users/UserManagementPage.vue)
- 新增默认正常。姓名、手机号、邮箱必填，手机号规范化后须含 7 至 15 位数字，可带 `+` 前缀。邮箱使用浏览器校验结果并要求域名含点。取消或按 Esc 放弃草稿，关闭后恢复焦点。 [表单校验](../../src/features/users/userFormValidation.ts) · [弹窗](../../src/features/users/UserFormDialog.vue) · [焦点恢复](../../src/features/users/UserManagementPage.vue)

## 开发与验证入口

| 命令 | 用途 |
| --- | --- |
| `npm ci` | 按锁文件安装依赖，CI 采用此命令 |
| `npm run dev` / `npm run preview` | 启动开发服务 / 预览生产构建 |
| `npm run lint` / `npm run build` | 运行 ESLint / 执行 `vue-tsc -b` 后构建 |
| `npm test` / `npm run test:coverage` | 单次执行 Vitest / 生成 V8 覆盖率报告 |
| `npm run test:e2e` / `npm run test:e2e:ui` | 运行 Playwright / 打开其测试界面 |

Playwright 自动启动 Vite，使用 `127.0.0.1:4173`。CI 安装 Chromium 及其系统依赖，并运行 Lint、Build、Vitest 和 E2E。产物目录按 `.gitignore` 排除。 [脚本](../../package.json) · [Playwright 配置](../../playwright.config.ts) · [CI 配置](../../.github/workflows/ci.yml) · [产物忽略规则](../../.gitignore)

Vitest 包含手机号、筛选与页码、表单校验的单测，也包含学习进度保留与重置、用户列表和表单交互的组件测试。E2E 用例包含导航、查询与分页、新增、编辑、取消、末页回退和刷新恢复 Mock 的断言。实际执行记录见交接。 [Vitest 配置](../../vitest.config.ts) · [应用测试](../../src/__tests__/App.component.test.ts) · [用户模块测试](../../src/features/users/__tests__) · [E2E 用例](../../tests/e2e/user-management.spec.ts)

## 约束、技术债务与待确认范围

- 应用使用页面本地状态和内存 Mock。刷新会重建状态。依赖中没有 Vue Router 或 Pinia，当前应用入口未接入后端、持久化或删除流程。仓库未记录这些功能的实施计划，是否纳入后续任务尚待确认。 [应用入口](../../src/App.vue) · [依赖](../../package.json) · [用户管理页面](../../src/features/users/UserManagementPage.vue)
- README 仍是 Vite 模板介绍。部分 E2E 场景依赖 Mock 顺序和当前记录数，调整种子数据时应同时核对这些断言。 [README](../../README.md) · [E2E 用例](../../tests/e2e/user-management.spec.ts)
- 当前 E2E 配置只有桌面 Chromium。jsdom 的弹窗补丁仅处理 `open` 状态，跨浏览器、移动端布局及真实屏幕阅读器播报需另行验证。 [Playwright 配置](../../playwright.config.ts) · [弹窗测试补丁](../../src/features/users/__tests__/setup-dialog.ts)

稳定事实随源码、命令或架构改变一起更新。一次性的进度和验证结果留在 [当前交接](HANDOFF.md)，通用开发规则见 [AGENTS.md](../../AGENTS.md)。
