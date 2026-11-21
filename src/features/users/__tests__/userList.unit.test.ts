// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { User } from '../types'
import { filterUsers, getUserPagination } from '../userList'

const contact = { email: 'example@example.com', createdAt: '2026-01-01T00:00:00.000Z' }
const users: readonly User[] = Object.freeze([
  { ...contact, id: 'user-2', name: 'Alice Chen', phone: '+12025550100', status: 'active' },
  { ...contact, id: 'user-3', name: '周晨曦', phone: '+12025550102', status: 'disabled' },
  { ...contact, id: 'user-1', name: 'ALICE Lin', phone: '+12025550101', status: 'active' },
])

describe('filterUsers', () => {
  it('匹配规范化后的姓名关键词并保留输入顺序', () => {
    const result = filterUsers(users, 'alice', 'active')

    expect(result.map(user => user.id)).toEqual(['user-2', 'user-1'])
    expect(users.map(user => user.id)).toEqual(['user-2', 'user-3', 'user-1'])
  })

  it('同时应用格式化手机号查询和状态条件', () => {
    expect(filterUsers(users, '+1 (202) 555-01', 'disabled')).toEqual([users[1]])
  })

  it('关键词为空时仍应用状态条件', () => {
    expect(filterUsers(users, '', 'disabled')).toEqual([users[1]])
  })

  it('无效号码不会因规范化为空而匹配全部用户', () => {
    expect(filterUsers(users, '+.-', 'all')).toEqual([])
  })
})

describe('getUserPagination', () => {
  it.each([
    { label: '无结果', records: 0, requestedPage: 3, totalPages: 0, currentPage: 0, startIndex: 0 },
    { label: '请求在有效范围内', records: 21, requestedPage: 2, totalPages: 3, currentPage: 2, startIndex: 10 },
    { label: '请求超过末页', records: 21, requestedPage: 99, totalPages: 3, currentPage: 3, startIndex: 20 },
    { label: '请求小于首页', records: 21, requestedPage: 0, totalPages: 3, currentPage: 1, startIndex: 0 },
  ])('$label 时推导显示页码及切片起点', ({ records, requestedPage, totalPages, currentPage, startIndex }) => {
    expect(getUserPagination(records, 10, requestedPage)).toEqual({ totalPages, currentPage, startIndex })
  })
})
