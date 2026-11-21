// 可选的 + 只出现在开头，点和连字符只用于分隔数字组。
const phoneFormat = /^(?:\+\s*)?(?:\d|\(\d+\))(?:\s*(?:[.-]\s*)?(?:\d|\(\d+\)))*$/

export function normalizePhone(value: string): string {
  const input = value.trim()
  return phoneFormat.test(input) ? input.replace(/[\s().-]/g, '') : ''
}
