// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { UserFormValues } from '../types'
import { validateUserForm } from '../userFormValidation'

const validDraft: Readonly<UserFormValues> = Object.freeze({
  name: '  Alice Chen  ',
  phone: ' +1 (202) 555-0150 ',
  email: ' alice@example.com ',
  status: 'disabled',
})

const validEmail = { badInput: false, typeMismatch: false }
const invalidEmailMessage = '请输入有效的邮箱地址。'

describe('validateUserForm', () => {
  it('返回规范化的保存值并保留原表单草稿', () => {
    const result = validateUserForm(validDraft, validEmail)

    expect(result).toEqual({
      values: {
        name: 'Alice Chen',
        phone: '+12025550150',
        email: 'alice@example.com',
        status: 'disabled',
      },
      fieldErrors: {},
    })
    expect(result.values).not.toBe(validDraft)
  })

  it.each([
    { label: '空邮箱', email: ' ', validity: undefined, message: '请输入邮箱。' },
    { label: '原生 badInput 优先于空值', email: '', validity: { ...validEmail, badInput: true }, message: invalidEmailMessage },
    { label: '原生 typeMismatch', email: 'alice,bob@example.com', validity: { ...validEmail, typeMismatch: true }, message: invalidEmailMessage },
    { label: '域名没有点号', email: 'alice@localhost', validity: validEmail, message: invalidEmailMessage },
    { label: '非空邮箱缺少原生校验结果', email: 'alice@example.com', validity: undefined, message: invalidEmailMessage },
  ])('$label 时返回对应的邮箱错误', ({ email, validity, message }) => {
    const result = validateUserForm({ ...validDraft, email }, validity)

    expect(result.fieldErrors).toEqual({ email: message })
  })
})
