import { normalizePhone } from './phone'
import type { UserFormValues } from './types'

interface EmailValidity {
  readonly badInput: boolean
  readonly typeMismatch: boolean
}

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>

export function validateUserForm(draft: Readonly<UserFormValues>, emailValidity?: EmailValidity) {
  const phoneInput = draft.phone.trim()
  const values: UserFormValues = {
    name: draft.name.trim(),
    phone: normalizePhone(phoneInput),
    email: draft.email.trim(),
    status: draft.status,
  }
  const fieldErrors: UserFormErrors = {}

  if (!values.name) {
    fieldErrors.name = '请输入姓名。'
  }

  if (!phoneInput) {
    fieldErrors.phone = '请输入手机号。'
  } else if (!/^\+?\d{7,15}$/.test(values.phone)) {
    fieldErrors.phone = '请输入包含 7 至 15 位数字的手机号，可带 + 前缀。'
  }

  if (!values.email && !emailValidity?.badInput) {
    fieldErrors.email = '请输入邮箱。'
  } else if (
    !emailValidity
    || emailValidity.badInput
    || emailValidity.typeMismatch
    || !values.email.split('@')[1]?.includes('.')
  ) {
    fieldErrors.email = '请输入有效的邮箱地址。'
  }

  if (values.status !== 'active' && values.status !== 'disabled') {
    fieldErrors.status = '请选择正常或禁用。'
  }

  return { values, fieldErrors }
}
