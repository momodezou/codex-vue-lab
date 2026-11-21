// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { normalizePhone } from '../phone'

describe('normalizePhone', () => {
  it.each([
    { input: '  +1 (202) 555-0100  ', expected: '+12025550100' },
    { input: '+(44) 7700-900.123', expected: '+447700900123' },
    { input: '(020)1234-5678', expected: '02012345678' },
    { input: '0100', expected: '0100' },
  ])('从 $input 保留数字与前缀', ({ input, expected }) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each(['', '  ', '+', '+.-', '202abc555', '--+1234567--', '1+2025550139', '(2025550139', '202---555-0139'])(
    '拒绝无数字或格式错误的输入 %j',
    (input) => {
      expect(normalizePhone(input)).toBe('')
    },
  )
})
