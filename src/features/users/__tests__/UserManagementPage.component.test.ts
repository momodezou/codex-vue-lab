import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { UserFormValues } from '../types'
import UserFormDialog from '../UserFormDialog.vue'
import UserManagementPage from '../UserManagementPage.vue'
import UserTable from '../UserTable.vue'
import './setup-dialog'

enableAutoUnmount(afterEach)
afterEach(() => vi.useRealTimers())

const newUserValues: Readonly<UserFormValues> = {
  name: 'Alice Chen',
  phone: '+1 (202) 555-0150',
  email: 'alice@example.com',
  status: 'active',
}

function mountPage() {
  return mount(UserManagementPage, { attachTo: document.body })
}

type Page = ReturnType<typeof mountPage>

function rowNames(page: Page) {
  return page.findAll('tbody th').map(cell => cell.text())
}

function tableUsers(page: Page) {
  return page.getComponent(UserTable).props('users')
}

function previousPage(page: Page) {
  return page.get('.page-controls button:first-of-type')
}

function nextPage(page: Page) {
  return page.get('.page-controls button:last-of-type')
}

async function createUser(page: Page) {
  await page.get('.add-user-button').trigger('click')
  const form = page.getComponent(UserFormDialog)
  await form.get('[name="name"]').setValue(newUserValues.name)
  await form.get('[name="phone"]').setValue(newUserValues.phone)
  await form.get('[name="email"]').setValue(newUserValues.email)
  await form.get('form').trigger('submit')
}

describe('UserManagementPage 搜索和筛选', () => {
  it('按姓名部分匹配并忽略首尾空格', async () => {
    const page = mountPage()

    await page.get('#user-search').setValue('  晨曦  ')

    expect(rowNames(page)).toEqual(['周晨曦'])
  })

  it('用带分隔符的号码和纯数字匹配同一用户', async () => {
    const page = mountPage()
    const search = page.get('#user-search')

    await search.setValue('+1 (202) 555-0102')
    expect(rowNames(page)).toEqual(['周晨曦'])

    await search.setValue('2025550102')
    expect(rowNames(page)).toEqual(['周晨曦'])
  })

  it('按英文姓名搜索时忽略大小写', async () => {
    const page = mountPage()
    await createUser(page)

    await page.get('#user-search').setValue('  aLiCe  ')

    expect(rowNames(page)).toEqual(['Alice Chen'])
  })

  it.each([
    { label: '全部', status: 'all', total: 25, statuses: ['正常', '禁用'] },
    { label: '正常', status: 'active', total: 19, statuses: ['正常'] },
    { label: '禁用', status: 'disabled', total: 6, statuses: ['禁用'] },
  ])('显示 $label 用户及匹配总数', async ({ status, total, statuses }) => {
    const page = mountPage()
    const filter = page.get('#user-status-filter')
    expect(filter.element).toHaveProperty('value', 'all')
    await filter.setValue(status)

    const visibleStatuses = page.findAll('.user-status').map(cell => cell.text())
    expect(new Set(visibleStatuses)).toEqual(new Set(statuses))
    expect(page.get('.page-summary').text()).toContain(`共 ${total} 条记录`)
  })

  it('组合手机号搜索与禁用状态筛选', async () => {
    const page = mountPage()
    await page.get('#user-search').setValue('5010')
    await page.get('#user-status-filter').setValue('disabled')

    expect(rowNames(page)).toEqual(['周晨曦', '刘书瑶'])
    expect(page.get('.page-summary').text()).toBe('共 2 条记录 · 第 1 / 1 页')
  })

  it('无匹配结果时显示提示并禁用翻页', async () => {
    const page = mountPage()
    await page.get('#user-search').setValue('没有匹配的用户')

    expect(page.get('.empty-state').text()).toContain('没有找到匹配的用户')
    expect(page.get('.page-summary').text()).toBe('共 0 条记录 · 第 0 / 0 页')
    expect(page.findComponent(UserTable).exists()).toBe(false)
    expect(previousPage(page).attributes('disabled')).toBeDefined()
    expect(nextPage(page).attributes('disabled')).toBeDefined()
  })

  it('重置无匹配结果的筛选时恢复列表并保留每页条数', async () => {
    const page = mountPage()
    const pageSize = page.get('#user-page-size')
    await pageSize.setValue('20')
    await page.get('#user-search').setValue('没有匹配的用户')
    expect(page.get('.page-summary').text()).toContain('第 0 / 0 页')

    await page.get('.reset-filters-button').trigger('click')

    expect(pageSize.element).toHaveProperty('value', '20')
    expect(rowNames(page)).toHaveLength(20)
    expect(page.get('.page-summary').text()).toBe('共 25 条记录 · 第 1 / 2 页')
  })
})

describe('UserManagementPage 分页', () => {
  it('默认每页 10 条，支持上一页和下一页并限制首尾边界', async () => {
    const page = mountPage()

    expect(page.get('#user-page-size').element).toHaveProperty('value', '10')
    expect(rowNames(page)).toHaveLength(10)
    expect(previousPage(page).attributes('disabled')).toBeDefined()
    expect(nextPage(page).attributes('disabled')).toBeUndefined()

    await nextPage(page).trigger('click')
    expect(rowNames(page)).toHaveLength(10)
    expect(rowNames(page)[0]).toBe('郑知夏')
    expect(page.get('.page-summary').text()).toBe('共 25 条记录 · 第 2 / 3 页')

    await nextPage(page).trigger('click')
    expect(rowNames(page)).toHaveLength(5)
    expect(page.get('.page-summary').text()).toBe('共 25 条记录 · 第 3 / 3 页')
    expect(nextPage(page).attributes('disabled')).toBeDefined()
    expect(previousPage(page).attributes('disabled')).toBeUndefined()

    await previousPage(page).trigger('click')
    expect(page.get('.page-summary').text()).toBe('共 25 条记录 · 第 2 / 3 页')
  })

  it('关键词和状态已是默认值时仍可重置到第一页', async () => {
    const page = mountPage()
    await nextPage(page).trigger('click')
    expect(page.get('.page-summary').text()).toContain('第 2 / 3 页')

    await page.get('.reset-filters-button').trigger('click')

    expect(page.get('.page-summary').text()).toContain('第 1 / 3 页')
    expect(previousPage(page).attributes('disabled')).toBeDefined()
  })

  it.each([
    { size: '20', rows: 20, pages: 2 },
    { size: '50', rows: 25, pages: 1 },
  ])('切换至每页 $size 条时从第二页回到第一页', async ({ size, rows, pages }) => {
    const page = mountPage()
    await nextPage(page).trigger('click')
    await page.get('#user-page-size').setValue(size)

    expect(rowNames(page)).toHaveLength(rows)
    expect(page.get('.page-summary').text()).toBe(`共 25 条记录 · 第 1 / ${pages} 页`)
  })

  it.each([
    { label: '搜索词', selector: '#user-search', value: '+1202', total: 25, pages: 3 },
    { label: '状态筛选', selector: '#user-status-filter', value: 'active', total: 19, pages: 2 },
  ])('修改 $label 时回到第一页，即使原页码仍有效', async ({ selector, value, total, pages }) => {
    const page = mountPage()
    await nextPage(page).trigger('click')
    expect(page.get('.page-summary').text()).toContain('第 2 /')

    await page.get(selector).setValue(value)

    expect(page.get('.page-summary').text()).toBe(`共 ${total} 条记录 · 第 1 / ${pages} 页`)
    expect(rowNames(page)[0]).toBe('陈雨桐')
  })
})

describe('UserManagementPage 数据更新', () => {
  it('新增后插入首行、生成唯一 ID 和创建时间并回到第一页', async () => {
    vi.setSystemTime(new Date('2026-11-21T08:00:00.000Z'))
    const page = mountPage()
    await page.get('#user-page-size').setValue('50')
    const existingIds = tableUsers(page).map(user => user.id)
    await page.get('#user-page-size').setValue('10')
    await nextPage(page).trigger('click')

    await createUser(page)

    expect(page.findComponent(UserFormDialog).exists()).toBe(false)
    expect(page.get('.form-feedback').text()).toContain('已新增用户')
    expect(page.get('.page-summary').text()).toBe('共 26 条记录 · 第 1 / 3 页')
    expect(rowNames(page)[0]).toBe(newUserValues.name)
    const added = tableUsers(page)[0]
    expect(added).toMatchObject({
      name: newUserValues.name,
      phone: '+12025550150',
      email: newUserValues.email,
      status: 'active',
      id: expect.any(String),
      createdAt: '2026-11-21T08:00:00.000Z',
    })
    expect(existingIds).not.toContain(added.id)
  })

  it('新增后保持当前搜索和状态筛选，切换条件后可找到新用户', async () => {
    const page = mountPage()
    const search = page.get('#user-search')
    const statusFilter = page.get('#user-status-filter')
    await search.setValue('晨曦')
    await statusFilter.setValue('disabled')

    await createUser(page)

    expect(search.element).toHaveProperty('value', '晨曦')
    expect(statusFilter.element).toHaveProperty('value', 'disabled')
    expect(rowNames(page)).toEqual(['周晨曦'])
    expect(page.get('.page-summary').text()).toBe('共 1 条记录 · 第 1 / 1 页')
    expect(page.get('.form-feedback').text()).toContain('调整当前搜索或筛选条件即可查看')

    await statusFilter.setValue('all')
    expect(rowNames(page)).toEqual(['周晨曦'])
    await search.setValue('Alice')
    expect(rowNames(page)).toEqual([newUserValues.name])
  })

  it('只修改目标用户的表单字段并保留原 ID 和创建时间', async () => {
    const page = mountPage()
    await page.get('#user-page-size').setValue('50')
    const before = tableUsers(page).map(user => ({ ...user }))
    const target = before[2]
    const editButton = page.get(`button[aria-label="编辑用户 ${target.name}，手机号尾号 ${target.phone.slice(-4)}"]`)
    await editButton.trigger('click')
    const form = page.getComponent(UserFormDialog)
    expect(form.get('[name="name"]').element).toHaveProperty('value', target.name)

    const changes: UserFormValues = {
      name: '周晨曦（已更新）',
      phone: '+12025550157',
      email: 'zhou.new@example.com',
      status: 'active',
    }
    await form.get('[name="name"]').setValue(changes.name)
    await form.get('[name="phone"]').setValue(changes.phone)
    await form.get('[name="email"]').setValue(changes.email)
    await form.get('[name="status"]').setValue(changes.status)
    await form.get('form').trigger('submit')

    const updated = tableUsers(page)
    expect(updated.find(user => user.id === target.id)).toEqual({ ...target, ...changes })
    expect(updated.filter(user => user.id !== target.id)).toEqual(before.filter(user => user.id !== target.id))
    expect(rowNames(page)[2]).toBe(changes.name)
    expect(page.get('.form-feedback').text()).toBe('用户信息更新成功')
  })

  it('取消编辑保留列表数据并丢弃草稿', async () => {
    const page = mountPage()
    const before = tableUsers(page).map(user => ({ ...user }))
    const editButton = page.get('.edit-button')
    await editButton.trigger('click')
    const form = page.getComponent(UserFormDialog)
    await form.get('[name="name"]').setValue('尚未保存的姓名')

    await form.get('button[type="button"]').trigger('click')

    expect(page.findComponent(UserFormDialog).exists()).toBe(false)
    expect(tableUsers(page)).toEqual(before)
    await editButton.trigger('click')
    expect(page.getComponent(UserFormDialog).get('[name="name"]').element).toHaveProperty('value', before[0].name)
  })

  it('编辑后退出搜索结果仍显示成功反馈', async () => {
    const page = mountPage()
    await page.get('#user-search').setValue('周晨曦')
    await page.get('.edit-button').trigger('click')
    const form = page.getComponent(UserFormDialog)
    await form.get('[name="name"]').setValue('新的姓名')

    await form.get('form').trigger('submit')

    expect(page.find('.empty-state').exists()).toBe(true)
    expect(page.get('.page-summary').text()).toBe('共 0 条记录 · 第 0 / 0 页')
    expect(page.get('.form-feedback').text()).toBe('用户信息更新成功')
  })

  it('编辑仍符合搜索和状态筛选时保留当前页', async () => {
    const page = mountPage()
    const search = page.get('#user-search')
    const statusFilter = page.get('#user-status-filter')
    await search.setValue('+1202')
    await statusFilter.setValue('active')
    await nextPage(page).trigger('click')
    expect(page.get('.page-summary').text()).toBe('共 19 条记录 · 第 2 / 2 页')

    await page.get('.edit-button').trigger('click')
    const form = page.getComponent(UserFormDialog)
    await form.get('[name="name"]').setValue('第二页已更新用户')
    await form.get('form').trigger('submit')

    expect(rowNames(page)[0]).toBe('第二页已更新用户')
    expect(page.get('.page-summary').text()).toBe('共 19 条记录 · 第 2 / 2 页')
    expect(search.element).toHaveProperty('value', '+1202')
    expect(statusFilter.element).toHaveProperty('value', 'active')
  })
})
