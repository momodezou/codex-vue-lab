<script setup lang="ts">
import type { User, UserStatus } from './types'

const props = defineProps<{
  users: readonly User[]
}>()

const emit = defineEmits<{
  edit: [userId: User['id'], trigger: HTMLButtonElement]
}>()

function requestEdit(userId: User['id'], event: MouseEvent) {
  if (event.currentTarget instanceof HTMLButtonElement) {
    emit('edit', userId, event.currentTarget)
  }
}

function editButtonLabel(user: User) {
  const phoneSuffix = user.phone.slice(-4)
  const label = `编辑用户 ${user.name}，手机号尾号 ${phoneSuffix}`
  const duplicateLabel = props.users.some(record =>
    record.id !== user.id && record.name === user.name && record.phone.endsWith(phoneSuffix),
  )
  return duplicateLabel ? `${label}，用户编号 ${user.id}` : label
}

const statusLabels: Record<UserStatus, string> = {
  active: '正常',
  disabled: '禁用',
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})
</script>

<template>
  <div
    class="table-scroll"
    role="region"
    aria-label="用户表格"
    tabindex="0"
  >
    <table>
      <thead>
        <tr>
          <th scope="col">
            姓名
          </th>
          <th scope="col">
            手机号
          </th>
          <th scope="col">
            邮箱
          </th>
          <th scope="col">
            状态
          </th>
          <th scope="col">
            创建时间
          </th>
          <th scope="col">
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="user in users"
          :key="user.id"
        >
          <th scope="row">
            {{ user.name }}
          </th>
          <td>{{ user.phone }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span
              class="user-status"
              :class="`user-status--${user.status}`"
            >
              {{ statusLabels[user.status] }}
            </span>
          </td>
          <td>
            <time :datetime="user.createdAt">{{ dateFormatter.format(new Date(user.createdAt)) }}</time>
          </td>
          <td>
            <button
              class="edit-button"
              type="button"
              aria-haspopup="dialog"
              :aria-label="editButtonLabel(user)"
              @click="requestEdit(user.id, $event)"
            >
              编辑
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-scroll {
  overflow-x: auto;
  border: 1px solid #dfe7f1;
  border-radius: 0.75rem;
  background: #fff;
}

.table-scroll:focus-visible {
  outline: 2px solid #205ed3;
  outline-offset: 3px;
}

table {
  width: 100%;
  min-width: 42rem;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th,
td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #dfe7f1;
  text-align: left;
  overflow-wrap: anywhere;
}

thead {
  background: #edf3fb;
  color: #20324f;
}

tbody th {
  font-weight: 600;
}

tbody tr:last-child > * {
  border-bottom: 0;
}

.user-status {
  display: inline-block;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 650;
  white-space: nowrap;
}

.user-status--active {
  background: #e0f4e8;
  color: #21633f;
}

.user-status--disabled {
  background: #fce7e8;
  color: #952e3d;
}

.edit-button {
  min-height: 2.25rem;
  padding: 0.25rem 0.65rem;
  border: 1px solid #cbd8e8;
  border-radius: 0.6rem;
  background: #fff;
  color: #1857bc;
  font: inherit;
  font-weight: 650;
  white-space: nowrap;
  cursor: pointer;
}

.edit-button:hover {
  background: #e8f1ff;
}

.edit-button:focus-visible {
  outline: 2px solid #205ed3;
  outline-offset: 2px;
}
</style>
