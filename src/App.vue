<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

interface LearningTool {
  id: 'codex' | 'cursor' | 'claude-code'
  name: string
  symbol: string
  description: string
  completedTasks: number
}

const tools = reactive<LearningTool[]>([
  {
    id: 'codex',
    name: 'Codex',
    symbol: '>_',
    description: 'OpenAI 的编程助手，帮助你阅读代码、实现功能和验证改动。',
    completedTasks: 0,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    symbol: '◈',
    description: '集成 AI 的代码编辑器，支持代码补全、项目问答和跨文件编辑。',
    completedTasks: 0,
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    symbol: '✳',
    description: '在终端中工作的编程助手，可以探索代码库、修改文件并运行测试。',
    completedTasks: 0,
  },
])

const totalCompletedTasks = computed(() =>
  tools.reduce((total, tool) => total + tool.completedTasks, 0),
)

const lastResetToolId = ref<LearningTool['id'] | null>(null)

function resetTasks(tool: LearningTool) {
  tool.completedTasks = 0
  lastResetToolId.value = tool.id
}
</script>

<template>
  <main
    class="learning-center"
    lang="zh-CN"
  >
    <header class="page-header">
      <div class="hero-inner">
        <div>
          <h1>AI 工具学习中心</h1>
          <p class="subtitle">
            记录和管理我的 AI 技术学习进度。
          </p>
        </div>
        <dl class="summary">
          <dt>累计完成任务</dt>
          <dd>{{ totalCompletedTasks }} <span>项</span></dd>
        </dl>
      </div>
    </header>

    <section
      class="tool-section"
      aria-labelledby="tool-section-title"
    >
      <h2 id="tool-section-title">
        学习进度
      </h2>
      <ul class="tool-grid">
        <li
          v-for="tool in tools"
          :key="tool.id"
          class="tool-card"
        >
          <div class="card-top">
            <span
              class="tool-icon"
              :class="tool.id"
              aria-hidden="true"
            >{{ tool.symbol }}</span>
            <span
              class="status"
              :class="{ 'in-progress': tool.completedTasks > 0 }"
            >
              {{ tool.completedTasks > 0 ? '学习中' : '未开始' }}
            </span>
          </div>

          <h3>{{ tool.name }}</h3>
          <p class="tool-description">
            {{ tool.description }}
          </p>

          <div class="card-bottom">
            <dl class="task-count">
              <dt>已完成任务</dt>
              <dd aria-live="polite">
                <span class="sr-only">{{ tool.name }} 已完成 </span>{{ tool.completedTasks }} 项
              </dd>
            </dl>
            <div class="card-actions">
              <button
                type="button"
                :aria-label="'完成 ' + tool.name + ' 的一项任务'"
                @click="tool.completedTasks++"
              >
                <span aria-hidden="true">+</span>
                完成任务
              </button>
              <button
                class="reset-button"
                type="button"
                :aria-label="'重置 ' + tool.name + ' 的任务'"
                :disabled="tool.completedTasks === 0"
                @click="resetTasks(tool)"
              >
                重置任务
              </button>
            </div>
          </div>
          <div
            class="reset-feedback"
            role="status"
          >
            <p v-if="lastResetToolId === tool.id && tool.completedTasks === 0">
              {{ tool.name }} 的任务进度已重置。
            </p>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<style scoped>
:global(#app) {
  width: 100%;
  border: 0;
}

.learning-center {
  --ink: #132440;
  --muted: #53647c;
  --line: #dfe7f1;
  color-scheme: light;
  min-height: 100vh;
  background: #f3f6fb;
  color: var(--ink);
  font-family: system-ui, 'Microsoft YaHei', sans-serif;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
}

.page-header {
  background: radial-gradient(ellipse at top right, #2457a4, transparent 65%), #10264b;
  color: #fff;
}

.hero-inner,
.tool-section {
  box-sizing: border-box;
  width: min(100%, 76rem);
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 3rem);
}

.hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-block: clamp(2.5rem, 6vw, 4.5rem);
}

.page-header h1 {
  margin: 0;
  color: inherit;
  font: 750 clamp(1.85rem, 5vw, 3rem) / 1.15 system-ui, 'Microsoft YaHei', sans-serif;
  letter-spacing: -0.035em;
}

.subtitle {
  margin-top: 0.85rem;
  color: #d4e2fb;
  font-size: 1rem;
}

.summary {
  min-width: 8.5rem;
  margin: 0;
  padding: 0.85rem 1.1rem;
  border: 1px solid #7797c7;
  border-radius: 0.9rem;
  background: rgb(255 255 255 / 9%);
}

.summary dt,
.task-count dt {
  font-size: 0.875rem;
}

.summary dt {
  color: #d4e2fb;
}

.summary dd,
.task-count dd {
  margin: 0.15rem 0 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.summary dd {
  font-size: 1.75rem;
}

.summary dd span {
  font-size: 0.875rem;
  font-weight: 500;
}

.tool-section {
  padding-block: 2rem 3rem;
}

.tool-section h2 {
  margin: 0 0 1.1rem;
  color: var(--ink);
  font-size: 1.35rem;
  font-weight: 700;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16.5rem), 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tool-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 8px 24px rgb(19 36 64 / 5%);
}

.card-top,
.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tool-icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: 0.75rem;
  background: #e8f1ff;
  color: #1857bc;
  font: 700 1.25rem / 1 ui-monospace, monospace;
}

.tool-icon.cursor {
  background: #eef1f6;
  color: #20324f;
}

.tool-icon.claude-code {
  background: #fff0e7;
  color: #9d481f;
}

.status {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: #eef2f7;
  color: var(--muted);
  font-size: 0.875rem;
  font-weight: 600;
}

.status.in-progress {
  background: #e8f1ff;
  color: #1857bc;
}

.tool-card h3 {
  margin: 1rem 0 0.35rem;
  font-size: 1.25rem;
}

.tool-description {
  margin: 0 0 1.25rem;
  color: var(--muted);
  font-size: 1rem;
}

.card-bottom {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}

.task-count {
  margin: 0;
}

.task-count dt {
  color: var(--muted);
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-bottom button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.8rem;
  border: 0;
  border-radius: 0.6rem;
  background: #205ed3;
  color: #fff;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 650;
  cursor: pointer;
}

.card-bottom button:hover {
  background: #184eae;
}

.card-bottom button:focus-visible {
  outline: 2px solid #205ed3;
  outline-offset: 3px;
}

.card-bottom .reset-button {
  border: 1px solid var(--line);
  background: #fff;
  color: #1857bc;
}

.card-bottom .reset-button:not(:disabled):hover {
  background: #e8f1ff;
}

.card-bottom .reset-button:disabled {
  background: #eef2f7;
  color: var(--muted);
  cursor: default;
}

.reset-feedback p {
  margin: 0.5rem 0 0;
  color: var(--muted);
  font-size: 0.875rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
