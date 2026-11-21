import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mockUsers } from '../../src/features/users/mockUsers'

const [firstUser, secondUser, disabledUser] = mockUsers

const newUser = {
  name: '端到端测试用户',
  phone: '+1 (202) 555-0150',
  email: 'e2e-user@example.com',
}

function userNavigation(page: Page) {
  return page.getByRole('navigation', { name: '主导航' }).getByRole('button', { name: '用户管理', exact: true })
}

function userRow(page: Page, name: string) {
  return page.getByRole('table').getByRole('row').filter({
    has: page.getByRole('rowheader', { name, exact: true }),
  })
}

function rowNames(page: Page) {
  return page.getByRole('table').getByRole('rowheader')
}

function pagination(page: Page) {
  return page.getByRole('navigation', { name: '用户列表分页' })
}

async function addUser(page: Page, values = newUser) {
  await page.getByRole('button', { name: '新增用户', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: '新增用户' })
  await dialog.getByLabel('姓名', { exact: true }).fill(values.name)
  await dialog.getByLabel('手机号', { exact: true }).fill(values.phone)
  await dialog.getByLabel('邮箱', { exact: true }).fill(values.email)
  await expect(dialog.getByLabel('用户状态', { exact: true })).toHaveValue('active')
  await dialog.getByRole('button', { name: '提交', exact: true }).click()
  await expect(dialog).toBeHidden()
}

test('默认显示学习中心，点击导航后显示用户列表', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'AI 工具学习中心', level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: '用户列表', exact: true })).toBeHidden()

  await userNavigation(page).click()

  await expect(userNavigation(page)).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('heading', { name: '用户列表', level: 2 })).toBeVisible()
  await expect(page.getByRole('table')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'AI 工具学习中心', level: 1 })).toBeHidden()
})

test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await userNavigation(page).click()
    await expect(pagination(page).getByRole('status')).toContainText(`共 ${mockUsers.length} 条记录`)
  })

  test('展示表头、用户信息和正常及禁用状态', async ({ page }) => {
    const table = page.getByRole('table')
    await expect(table.getByRole('columnheader')).toHaveText(['姓名', '手机号', '邮箱', '状态', '创建时间', '操作'])

    const activeRow = userRow(page, firstUser.name)
    await expect(activeRow.getByRole('cell', { name: firstUser.phone, exact: true })).toBeVisible()
    await expect(activeRow.getByRole('cell', { name: firstUser.email, exact: true })).toBeVisible()
    await expect(activeRow.getByRole('cell', { name: '正常', exact: true })).toBeVisible()
    await expect(userRow(page, disabledUser.name).getByRole('cell', { name: '禁用', exact: true })).toBeVisible()
  })

  test('按姓名搜索只保留匹配的用户', async ({ page }) => {
    await page.getByLabel('搜索用户').fill(` ${disabledUser.name} `)

    await expect(rowNames(page)).toHaveText([disabledUser.name])
    await expect(userRow(page, firstUser.name)).toHaveCount(0)
  })

  test('按手机号片段搜索对应用户', async ({ page }) => {
    await page.getByLabel('搜索用户').fill(secondUser.phone.slice(-7))

    await expect(rowNames(page)).toHaveText([secondUser.name])
    await expect(userRow(page, secondUser.name).getByRole('cell', { name: secondUser.phone, exact: true })).toBeVisible()
  })

  test('切换正常、禁用和全部状态筛选', async ({ page }) => {
    const filter = page.getByLabel('状态', { exact: true })
    const summary = pagination(page).getByRole('status')
    await expect(filter).toHaveValue('all')

    await filter.selectOption({ label: '正常用户' })
    await expect(summary).toContainText(`共 ${mockUsers.filter(user => user.status === 'active').length} 条记录`)
    await expect(userRow(page, firstUser.name)).toBeVisible()
    await expect(page.getByRole('table').getByRole('cell', { name: '禁用', exact: true })).toHaveCount(0)

    await filter.selectOption({ label: '禁用用户' })
    await expect(summary).toContainText(`共 ${mockUsers.filter(user => user.status === 'disabled').length} 条记录`)
    await expect(userRow(page, disabledUser.name)).toBeVisible()
    await expect(page.getByRole('table').getByRole('cell', { name: '正常', exact: true })).toHaveCount(0)

    await filter.selectOption({ label: '全部用户' })
    await expect(summary).toContainText(`共 ${mockUsers.length} 条记录`)
    await expect(userRow(page, firstUser.name)).toBeVisible()
    await expect(userRow(page, disabledUser.name)).toBeVisible()
  })

  test('组合手机号搜索和禁用状态筛选', async ({ page }) => {
    await page.getByLabel('搜索用户').fill('5010')
    await page.getByLabel('状态', { exact: true }).selectOption({ label: '禁用用户' })

    await expect(rowNames(page)).toHaveText([disabledUser.name, mockUsers[6].name])
    await expect(page.getByRole('table').getByRole('cell', { name: '禁用', exact: true })).toHaveCount(2)
    await expect(pagination(page).getByRole('status')).toHaveText('共 2 条记录 · 第 1 / 1 页')
  })

  test('默认每页 10 条并正确处理上一页、下一页和首尾边界', async ({ page }) => {
    const pager = pagination(page)
    const previous = pager.getByRole('button', { name: '上一页' })
    const next = pager.getByRole('button', { name: '下一页' })
    const summary = pager.getByRole('status')
    const totalPages = Math.ceil(mockUsers.length / 10)

    await expect(pager.getByLabel('每页')).toHaveValue('10')
    await expect(rowNames(page)).toHaveText(mockUsers.slice(0, 10).map(user => user.name))
    await expect(summary).toHaveText(`共 ${mockUsers.length} 条记录 · 第 1 / ${totalPages} 页`)
    await expect(previous).toBeDisabled()
    await expect(next).toBeEnabled()

    await next.click()
    await expect(summary).toHaveText(`共 ${mockUsers.length} 条记录 · 第 2 / ${totalPages} 页`)
    await expect(rowNames(page)).toHaveText(mockUsers.slice(10, 20).map(user => user.name))
    await expect(previous).toBeEnabled()

    await next.click()
    await expect(summary).toHaveText(`共 ${mockUsers.length} 条记录 · 第 ${totalPages} / ${totalPages} 页`)
    await expect(rowNames(page)).toHaveText(mockUsers.slice(20).map(user => user.name))
    await expect(next).toBeDisabled()
    await expect(previous).toBeEnabled()

    await previous.click()
    await expect(summary).toHaveText(`共 ${mockUsers.length} 条记录 · 第 2 / ${totalPages} 页`)
    await expect(rowNames(page)).toHaveText(mockUsers.slice(10, 20).map(user => user.name))
    await expect(next).toBeEnabled()
  })

  test('提交合法新增表单后显示反馈和新用户', async ({ page }) => {
    await addUser(page)

    await expect(page.getByText(`已新增用户「${newUser.name}」。`, { exact: true })).toBeVisible()
    await expect(rowNames(page).first()).toHaveText(newUser.name)
    const row = userRow(page, newUser.name)
    await expect(row.getByRole('cell', { name: '+12025550150', exact: true })).toBeVisible()
    await expect(row.getByRole('cell', { name: newUser.email, exact: true })).toBeVisible()
    await expect(row.getByRole('cell', { name: '正常', exact: true })).toBeVisible()
    await expect(pagination(page).getByRole('status')).toContainText(`共 ${mockUsers.length + 1} 条记录`)
  })

  test('无效表单显示字段错误且不新增记录', async ({ page }) => {
    await page.getByRole('button', { name: '新增用户', exact: true }).click()
    const dialog = page.getByRole('dialog', { name: '新增用户' })
    await dialog.getByLabel('姓名', { exact: true }).fill('   ')
    await dialog.getByLabel('手机号', { exact: true }).fill('--+1234567--')
    await dialog.getByLabel('邮箱', { exact: true }).fill('alice,bob@example.com')

    await dialog.getByRole('button', { name: '提交', exact: true }).click()

    await expect(dialog).toBeVisible()
    await expect(dialog.getByLabel('姓名', { exact: true })).toBeFocused()
    await expect(dialog.getByText('请输入姓名。', { exact: true })).toBeVisible()
    await expect(dialog.getByText('请输入包含 7 至 15 位数字的手机号，可带 + 前缀。', { exact: true })).toBeVisible()
    await expect(dialog.getByText('请输入有效的邮箱地址。', { exact: true })).toBeVisible()
    await dialog.getByRole('button', { name: '取消', exact: true }).click()
    await expect(pagination(page).getByRole('status')).toContainText(`共 ${mockUsers.length} 条记录`)
    await expect(page.getByText('已新增用户')).toHaveCount(0)
  })

  test('编辑已有用户的姓名和状态并保存', async ({ page }) => {
    const updatedName = '端到端编辑后的用户'
    await userRow(page, firstUser.name).getByRole('button', { name: /编辑用户/ }).click()
    const dialog = page.getByRole('dialog', { name: '编辑用户' })
    await expect(dialog.getByLabel('姓名', { exact: true })).toHaveValue(firstUser.name)
    await expect(dialog.getByLabel('用户状态', { exact: true })).toHaveValue('active')
    await dialog.getByLabel('姓名', { exact: true }).fill(updatedName)
    await dialog.getByLabel('用户状态', { exact: true }).selectOption({ label: '禁用' })
    await dialog.getByRole('button', { name: '保存修改', exact: true }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByText('用户信息更新成功', { exact: true })).toBeVisible()
    await expect(userRow(page, firstUser.name)).toHaveCount(0)
    const updatedRow = userRow(page, updatedName)
    await expect(updatedRow.getByRole('cell', { name: '禁用', exact: true })).toBeVisible()
    await expect(updatedRow.getByRole('cell', { name: firstUser.email, exact: true })).toBeVisible()
    await expect(pagination(page).getByRole('status')).toContainText(`共 ${mockUsers.length} 条记录`)
  })

  test('编辑末页唯一记录使其退出筛选后回退页码并聚焦搜索框', async ({ page }) => {
    await addUser(page)
    await addUser(page, {
      name: '端到端分页预置用户',
      phone: '+1 (202) 555-0151',
      email: 'e2e-pagination@example.com',
    })

    const search = page.getByLabel('搜索用户')
    const filter = page.getByLabel('状态', { exact: true })
    const pager = pagination(page)
    const summary = pager.getByRole('status')
    const previous = pager.getByRole('button', { name: '上一页' })
    const next = pager.getByRole('button', { name: '下一页' })
    const activeUsers = mockUsers.filter(user => user.status === 'active')
    const lastUser = activeUsers[activeUsers.length - 1]

    await search.fill('+1 (202)')
    await filter.selectOption('active')
    await pager.getByLabel('每页').selectOption('20')
    await expect(summary).toHaveText('共 21 条记录 · 第 1 / 2 页')
    await next.click()
    await expect(summary).toHaveText('共 21 条记录 · 第 2 / 2 页')
    await expect(rowNames(page)).toHaveText([lastUser.name])

    await userRow(page, lastUser.name).getByRole('button', { name: /编辑用户/ }).click()
    const dialog = page.getByRole('dialog', { name: '编辑用户' })
    await dialog.getByLabel('用户状态', { exact: true }).selectOption('disabled')
    await dialog.getByRole('button', { name: '保存修改', exact: true }).click()

    await expect(dialog).toBeHidden()
    await expect(summary).toHaveText('共 20 条记录 · 第 1 / 1 页')
    await expect(rowNames(page)).toHaveCount(20)
    await expect(previous).toBeDisabled()
    await expect(next).toBeDisabled()
    await expect(filter).toHaveValue('active')
    await expect(search).toHaveValue('+1 (202)')
    await expect(search).toBeFocused()
    await expect(userRow(page, lastUser.name)).toHaveCount(0)
    await expect(page.getByText('用户信息更新成功', { exact: true })).toBeVisible()

    await filter.selectOption('disabled')
    await expect(userRow(page, lastUser.name).getByRole('cell', { name: '禁用', exact: true })).toBeVisible()
  })

  test('取消编辑后保留原姓名和状态', async ({ page }) => {
    const draftName = '未保存的草稿姓名'
    const original = userRow(page, firstUser.name)
    const edit = original.getByRole('button', { name: /编辑用户/ })
    await edit.click()
    const dialog = page.getByRole('dialog', { name: '编辑用户' })
    await dialog.getByLabel('姓名', { exact: true }).fill(draftName)
    await dialog.getByLabel('用户状态', { exact: true }).selectOption({ label: '禁用' })

    await dialog.getByRole('button', { name: '取消', exact: true }).click()

    await expect(dialog).toBeHidden()
    await expect(userRow(page, draftName)).toHaveCount(0)
    await expect(original.getByRole('cell', { name: '正常', exact: true })).toBeVisible()
    await expect(original.getByRole('cell', { name: firstUser.email, exact: true })).toBeVisible()
    await expect(edit).toBeFocused()
  })

  test('按 Esc 放弃编辑后，下一位用户的表单只显示自己的数据', async ({ page }) => {
    const original = userRow(page, firstUser.name)
    const firstEdit = original.getByRole('button', { name: /编辑用户/ })
    await firstEdit.click()
    const dialog = page.getByRole('dialog', { name: '编辑用户' })
    await dialog.getByLabel('姓名', { exact: true }).fill(' ')
    await dialog.getByRole('button', { name: '保存修改', exact: true }).click()
    await expect(dialog.getByText('请输入姓名。', { exact: true })).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(dialog).toBeHidden()
    await expect(firstEdit).toBeFocused()
    await expect(original).toBeVisible()
    await userRow(page, disabledUser.name).getByRole('button', { name: /编辑用户/ }).click()
    await expect(dialog.getByLabel('姓名', { exact: true })).toHaveValue(disabledUser.name)
    await expect(dialog.getByLabel('手机号', { exact: true })).toHaveValue(disabledUser.phone)
    await expect(dialog.getByLabel('邮箱', { exact: true })).toHaveValue(disabledUser.email)
    await expect(dialog.getByLabel('用户状态', { exact: true })).toHaveValue('disabled')
    await expect(dialog.getByText('请输入姓名。', { exact: true })).toHaveCount(0)
  })

  test('刷新应用后从 Mock 数据重新初始化列表', async ({ page }) => {
    await addUser(page)
    await expect(userRow(page, newUser.name)).toBeVisible()

    await page.reload()
    await expect(page.getByRole('heading', { name: 'AI 工具学习中心', level: 1 })).toBeVisible()
    await userNavigation(page).click()

    await expect(userRow(page, newUser.name)).toHaveCount(0)
    await expect(rowNames(page)).toHaveText(mockUsers.slice(0, 10).map(user => user.name))
    await expect(pagination(page).getByRole('status')).toContainText(`共 ${mockUsers.length} 条记录`)
  })
})
