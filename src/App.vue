<script setup lang="ts">
import { ref } from 'vue'
import LearningCenter from './components/LearningCenter.vue'
import UserManagementPage from './features/users/UserManagementPage.vue'

const currentPage = ref<'learning' | 'users'>('learning')
</script>

<template>
  <nav
    class="app-nav"
    aria-label="主导航"
    lang="zh-CN"
  >
    <div class="nav-inner">
      <button
        type="button"
        aria-controls="learning-center"
        :aria-pressed="currentPage === 'learning'"
        @click="currentPage = 'learning'"
      >
        学习中心
      </button>
      <button
        type="button"
        aria-controls="user-management"
        :aria-pressed="currentPage === 'users'"
        @click="currentPage = 'users'"
      >
        用户管理
      </button>
    </div>
  </nav>

  <LearningCenter
    v-show="currentPage === 'learning'"
    id="learning-center"
  />
  <UserManagementPage
    v-show="currentPage === 'users'"
    id="user-management"
  />
</template>

<style scoped>
:global(#app) {
  width: 100%;
  border: 0;
}

.app-nav {
  border-bottom: 1px solid #dfe7f1;
  background: #fff;
  color-scheme: light;
  font-family: system-ui, 'Microsoft YaHei', sans-serif;
}

.nav-inner {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  width: min(100%, 76rem);
  margin-inline: auto;
  padding: 0.5rem clamp(1rem, 4vw, 3rem);
}

.app-nav button {
  min-height: 2.75rem;
  padding: 0.5rem 0.9rem;
  border: 0;
  border-radius: 0.6rem;
  background: transparent;
  color: #20324f;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 650;
  line-height: 1.5;
  cursor: pointer;
}

.app-nav button:hover {
  background: #edf3fb;
}

.app-nav button[aria-pressed='true'] {
  background: #e8f1ff;
  color: #1857bc;
}

.app-nav button:focus-visible {
  outline: 2px solid #205ed3;
  outline-offset: 2px;
}
</style>
