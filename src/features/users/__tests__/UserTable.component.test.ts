import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import { mockUsers } from '../mockUsers'
import UserTable from '../UserTable.vue'

enableAutoUnmount(afterEach)

it('区分同名同尾号的编辑按钮，并发出被点击的用户 ID', async () => {
  const original = mockUsers[0]
  const duplicate = { ...original, id: 'same-name-user', phone: '+447700900100' }
  const table = mount(UserTable, { props: { users: [original, duplicate] } })
  const buttons = table.findAll('button[aria-haspopup="dialog"]')

  expect(buttons.map(button => button.attributes('aria-label'))).toEqual([
    `编辑用户 ${original.name}，手机号尾号 0100，用户编号 ${original.id}`,
    `编辑用户 ${duplicate.name}，手机号尾号 0100，用户编号 ${duplicate.id}`,
  ])

  await buttons[1].trigger('click')

  expect(table.emitted('edit')).toEqual([[duplicate.id, buttons[1].element]])
})
