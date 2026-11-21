export type UserStatus = 'active' | 'disabled'

export type UserStatusFilter = 'all' | UserStatus

export interface UserFormValues {
  name: string
  phone: string
  email: string
  status: UserStatus
}

export interface User extends UserFormValues {
  id: string
  createdAt: string
}
