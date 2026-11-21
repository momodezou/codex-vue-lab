<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, useTemplateRef, watch } from 'vue'
import { mockUsers } from './mockUsers'
import type { User, UserFormValues, UserStatusFilter } from './types'
import UserFormDialog from './UserFormDialog.vue'
import { filterUsers, getUserPagination } from './userList'
import UserTable from './UserTable.vue'

const statusOptions: ReadonlyArray<{ value: UserStatusFilter; label: string }> = [
  { value: 'all', label: '全部用户' },
  { value: 'active', label: '正常用户' },
  { value: 'disabled', label: '禁用用户' },
]

const pageSizes = [10, 20, 50] as const
type PageSize = (typeof pageSizes)[number]
type UserFormSession =
  | { mode: 'create' }
  | { mode: 'edit'; user: Readonly<User>; trigger: HTMLButtonElement }

const initialFormValues: Readonly<UserFormValues> = {
  name: '',
  phone: '',
  email: '',
  status: 'active',
}

const users = ref<User[]>(mockUsers.map(user => ({ ...user })))
const formSession = shallowRef<UserFormSession | null>(null)
const addUserButton = useTemplateRef<HTMLButtonElement>('add-user-button')
const searchInput = useTemplateRef<HTMLInputElement>('user-search')
const formFeedback = ref('')
let nextLocalUserId = 1

const keyword = ref('')
const statusFilter = ref<UserStatusFilter>('all')
const pageSize = ref<PageSize>(10)
const requestedPage = ref(1)

watch([keyword, statusFilter, pageSize], () => {
  requestedPage.value = 1
})

const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())

const filteredUsers = computed(() =>
  filterUsers(users.value, normalizedKeyword.value, statusFilter.value),
)

const totalRecords = computed(() => filteredUsers.value.length)
const pagination = computed(() =>
  getUserPagination(totalRecords.value, pageSize.value, requestedPage.value),
)

const pageUsers = computed(() => {
  const { startIndex } = pagination.value
  return filteredUsers.value.slice(startIndex, startIndex + pageSize.value)
})

function openCreateForm() {
  formFeedback.value = ''
  formSession.value = { mode: 'create' }
}

function openEditForm(userId: User['id'], trigger: HTMLButtonElement) {
  const user = users.value.find(record => record.id === userId)
  if (!user) return

  formFeedback.value = ''
  formSession.value = { mode: 'edit', user, trigger }
}

async function closeForm() {
  const session = formSession.value
  formSession.value = null
  await nextTick()

  if (session?.mode === 'edit') {
    const target = session.trigger.isConnected ? session.trigger : searchInput.value
    target?.focus()
  } else {
    addUserButton.value?.focus()
  }
}

function addUser(values: UserFormValues) {
  const user: User = {
    ...values,
    id: `local-user-${nextLocalUserId}`,
    createdAt: new Date().toISOString(),
  }

  nextLocalUserId += 1
  users.value.unshift(user)
  requestedPage.value = 1

  const matchesFilters = filteredUsers.value.some(record => record.id === user.id)
  formFeedback.value = matchesFilters
    ? `已新增用户「${user.name}」。`
    : `已新增用户「${user.name}」。调整当前搜索或筛选条件即可查看。`
}

function updateUser(userId: User['id'], values: UserFormValues) {
  const { name, phone, email, status } = values
  users.value = users.value.map(user => user.id === userId
    ? { ...user, name, phone, email, status }
    : user)
  requestedPage.value = Math.max(1, pagination.value.currentPage)
  formFeedback.value = '用户信息更新成功'
}

async function saveForm(values: UserFormValues) {
  const session = formSession.value
  if (!session) return

  if (session.mode === 'edit') {
    updateUser(session.user.id, values)
  } else {
    addUser(values)
  }

  await closeForm()
}
</script>

<template>
  <main
    class="user-management"
    lang="zh-CN"
  >
    <div class="page-content">
      <header class="page-header">
        <h1>用户管理</h1>
        <button
          ref="add-user-button"
          class="add-user-button"
          type="button"
          aria-haspopup="dialog"
          @click="openCreateForm"
        >
          新增用户
        </button>
      </header>
      <div role="status">
        <p
          v-if="formFeedback"
          class="form-feedback"
        >
          {{ formFeedback }}
        </p>
      </div>
      <section aria-labelledby="user-list-title">
        <h2 id="user-list-title">
          用户列表
        </h2>
        <div class="list-filters">
          <div class="filter-field search-field">
            <label for="user-search">搜索用户</label>
            <input
              id="user-search"
              ref="user-search"
              v-model="keyword"
              type="search"
              placeholder="输入姓名或手机号"
            >
          </div>
          <div class="filter-field status-field">
            <label for="user-status-filter">状态</label>
            <select
              id="user-status-filter"
              v-model="statusFilter"
            >
              <option
                v-for="option in statusOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        <UserTable
          v-if="totalRecords > 0"
          :users="pageUsers"
          @edit="openEditForm"
        />
        <p
          v-else
          class="empty-state"
        >
          没有找到匹配的用户，请调整搜索关键词或状态筛选。
        </p>
        <nav
          class="pagination"
          aria-label="用户列表分页"
        >
          <p
            class="page-summary"
            role="status"
          >
            共 {{ totalRecords }} 条记录 · 第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 页
          </p>
          <div class="page-controls">
            <label
              class="page-size"
              for="user-page-size"
            >
              每页
              <select
                id="user-page-size"
                v-model="pageSize"
              >
                <option
                  v-for="size in pageSizes"
                  :key="size"
                  :value="size"
                >
                  {{ size }} 条
                </option>
              </select>
            </label>
            <button
              type="button"
              :disabled="pagination.currentPage <= 1"
              @click="requestedPage = pagination.currentPage - 1"
            >
              上一页
            </button>
            <button
              type="button"
              :disabled="pagination.currentPage >= pagination.totalPages"
              @click="requestedPage = pagination.currentPage + 1"
            >
              下一页
            </button>
          </div>
        </nav>
      </section>
    </div>
    <UserFormDialog
      v-if="formSession"
      :key="formSession.mode === 'edit' ? formSession.user.id : 'create'"
      :mode="formSession.mode"
      :initial-values="formSession.mode === 'edit' ? formSession.user : initialFormValues"
      @cancel="closeForm"
      @submit="saveForm"
    />
  </main>
</template>

<style scoped>
.user-management {
  flex: 1;
  min-width: 0;
  background: #f3f6fb;
  color: #132440;
  color-scheme: light;
  font-family: system-ui, 'Microsoft YaHei', sans-serif;
  line-height: 1.5;
  letter-spacing: normal;
  text-align: left;
}

.page-content {
  box-sizing: border-box;
  width: min(100%, 76rem);
  margin-inline: auto;
  padding-block: clamp(1.5rem, 5vw, 3rem);
  padding-inline: clamp(1rem, 4vw, 3rem);
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

h1 {
  margin: 0;
  color: inherit;
  font: 750 clamp(1.75rem, 4vw, 2.5rem) / 1.2 system-ui, 'Microsoft YaHei', sans-serif;
  letter-spacing: -0.025em;
}

.add-user-button {
  min-height: 2.75rem;
  padding: 0.5rem 0.9rem;
  border: 0;
  border-radius: 0.6rem;
  background: #205ed3;
  color: #fff;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 650;
  cursor: pointer;
}

.add-user-button:hover {
  background: #184eae;
}

.form-feedback {
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  background: #e0f4e8;
  color: #21633f;
  overflow-wrap: anywhere;
}

h2 {
  margin: 0 0 0.75rem;
  color: inherit;
  font: 700 1.125rem / 1.4 system-ui, 'Microsoft YaHei', sans-serif;
  letter-spacing: normal;
}

.list-filters,
.pagination,
.page-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.list-filters {
  margin-bottom: 1rem;
}

.filter-field {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.filter-field label {
  font-size: 0.875rem;
  font-weight: 650;
}

.search-field {
  flex: 1 1 16rem;
  max-width: 24rem;
}

.status-field {
  flex: 0 1 10rem;
}

input,
select,
.page-controls button {
  box-sizing: border-box;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd8e8;
  border-radius: 0.6rem;
  background: #fff;
  color: #20324f;
  font: inherit;
}

input::placeholder {
  color: #53647c;
}

input:focus-visible,
select:focus-visible,
.add-user-button:focus-visible,
.page-controls button:focus-visible {
  outline: 2px solid #205ed3;
  outline-offset: 2px;
}

.empty-state {
  padding: 2rem 1rem;
  border: 1px solid #dfe7f1;
  border-radius: 0.75rem;
  background: #fff;
  color: #53647c;
  text-align: center;
}

.pagination {
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.page-summary {
  color: #53647c;
}

.page-controls,
.page-size {
  align-items: center;
}

.page-size {
  display: inline-flex;
  gap: 0.5rem;
}

.page-controls button {
  color: #1857bc;
  font-weight: 650;
  cursor: pointer;
}

.page-controls button:not(:disabled):hover {
  background: #e8f1ff;
}

.page-controls button:disabled {
  background: #edf3fb;
  color: #53647c;
  cursor: default;
}
</style>
