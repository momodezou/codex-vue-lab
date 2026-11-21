import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import App from '../App.vue'
import LearningCenter from '../components/LearningCenter.vue'
import UserManagementPage from '../features/users/UserManagementPage.vue'

enableAutoUnmount(afterEach)

it('往返页面时保留学习进度和用户筛选条件，并仍可重置任务', async () => {
  const app = mount(App, { attachTo: document.body })
  const learningNav = app.get('button[aria-controls="learning-center"]')
  const userNav = app.get('button[aria-controls="user-management"]')
  const learning = app.getComponent(LearningCenter)
  const completeTask = learning.get('button[aria-label="完成 Codex 的一项任务"]')

  expect(learning.isVisible()).toBe(true)
  expect(app.getComponent(UserManagementPage).isVisible()).toBe(false)
  await completeTask.trigger('click')
  await completeTask.trigger('click')
  expect(learning.get('.summary dd').text()).toBe('2 项')

  await userNav.trigger('click')
  const users = app.getComponent(UserManagementPage)
  expect(users.isVisible()).toBe(true)
  await users.get('#user-search').setValue('晨曦')
  await users.get('#user-status-filter').setValue('disabled')
  expect(users.findAll('tbody th').map(cell => cell.text())).toEqual(['周晨曦'])

  await learningNav.trigger('click')
  const restoredLearning = app.getComponent(LearningCenter)
  expect(restoredLearning.get('.summary dd').text()).toBe('2 项')
  await restoredLearning.get('button[aria-label="重置 Codex 的任务"]').trigger('click')
  expect(restoredLearning.get('.summary dd').text()).toBe('0 项')
  expect(restoredLearning.text()).toContain('Codex 的任务进度已重置')

  await userNav.trigger('click')
  const restoredUsers = app.getComponent(UserManagementPage)
  expect(restoredUsers.get('#user-search').element).toHaveProperty('value', '晨曦')
  expect(restoredUsers.get('#user-status-filter').element).toHaveProperty('value', 'disabled')
  expect(restoredUsers.findAll('tbody th').map(cell => cell.text())).toEqual(['周晨曦'])
})
