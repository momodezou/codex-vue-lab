import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import type { UserFormValues } from '../types'
import UserFormDialog from '../UserFormDialog.vue'
import './setup-dialog'

enableAutoUnmount(afterEach)

const validValues: Readonly<UserFormValues> = {
  name: '陈小雨',
  phone: '+12025550150',
  email: 'chen@example.com',
  status: 'active',
}

function mountForm() {
  return mount(UserFormDialog, {
    attachTo: document.body,
    props: { mode: 'create', initialValues: validValues },
  })
}

describe('UserFormDialog 提交校验', () => {
  it.each([
    { label: '姓名为空', field: 'name', value: '', message: '请输入姓名。' },
    { label: '姓名只有空格', field: 'name', value: '   ', message: '请输入姓名。' },
    { label: '手机号为空', field: 'phone', value: '', message: '请输入手机号。' },
    { label: '手机号数字太少', field: 'phone', value: '123456', message: '请输入包含 7 至 15 位数字的手机号，可带 + 前缀。' },
    { label: '手机号分隔符位置错误', field: 'phone', value: '--+1234567--', message: '请输入包含 7 至 15 位数字的手机号，可带 + 前缀。' },
    { label: '邮箱为空', field: 'email', value: '', message: '请输入邮箱。' },
    { label: '邮箱本地部分含逗号', field: 'email', value: 'alice,bob@example.com', message: '请输入有效的邮箱地址。' },
    { label: '邮箱域名以连字符开头', field: 'email', value: 'alice@-example.com', message: '请输入有效的邮箱地址。' },
    { label: '邮箱域名无点号', field: 'email', value: 'alice@localhost', message: '请输入有效的邮箱地址。' },
  ])('$label 时阻止提交并关联字段错误', async ({ field, value, message }) => {
    const wrapper = mountForm()
    const input = wrapper.get(`input[name="${field}"]`)
    await input.setValue(value)
    await wrapper.get('form').trigger('submit')
    await nextTick()

    const error = wrapper.get('.field-error')
    expect(error.text()).toBe(message)
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe(error.attributes('id'))
    expect(document.activeElement).toBe(input.element)
    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('提交规范化的合法字段值', async () => {
    const wrapper = mountForm()
    await wrapper.get('[name="name"]').setValue('  Alice Chen  ')
    await wrapper.get('[name="phone"]').setValue(' +1 (202) 555-0150 ')
    await wrapper.get('[name="email"]').setValue(' alice+qa@example.com ')
    await wrapper.get('[name="status"]').setValue('disabled')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[
      {
        name: 'Alice Chen',
        phone: '+12025550150',
        email: 'alice+qa@example.com',
        status: 'disabled',
      },
    ]])
    expect(wrapper.find('.field-error').exists()).toBe(false)
  })

  it('连续提交时只发出一次保存事件', async () => {
    const wrapper = mountForm()
    const form = wrapper.get('form')

    await Promise.all([form.trigger('submit'), form.trigger('submit')])

    expect(wrapper.emitted('submit')).toEqual([[validValues]])
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
