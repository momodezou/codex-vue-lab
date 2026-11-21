import { normalizePhone } from './phone'
import type { User, UserStatusFilter } from './types'

export function filterUsers(
  users: readonly User[],
  normalizedKeyword: string,
  status: UserStatusFilter,
) {
  const phoneQuery = normalizePhone(normalizedKeyword)

  return users.filter(user =>
    (!normalizedKeyword
      || user.name.toLowerCase().includes(normalizedKeyword)
      || (phoneQuery.length > 0 && user.phone.includes(phoneQuery)))
    && (status === 'all' || user.status === status),
  )
}

export function getUserPagination(totalRecords: number, pageSize: number, requestedPage: number) {
  const totalPages = Math.ceil(totalRecords / pageSize)
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages)
  const startIndex = Math.max(0, currentPage - 1) * pageSize

  return { totalPages, currentPage, startIndex }
}
