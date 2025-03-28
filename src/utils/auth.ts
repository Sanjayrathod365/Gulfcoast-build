import { headers } from 'next/headers'

export type Role = 'ADMIN' | 'STAFF' | 'DOCTOR' | 'ATTORNEY'

export async function getUserInfo() {
  const headersList = await headers()
  const userId = headersList.get('x-user-id')
  const userRole = headersList.get('x-user-role') as Role

  return {
    userId,
    userRole,
  }
}

export async function hasPermission(requiredRole: Role) {
  const { userRole } = await getUserInfo()
  
  if (!userRole) return false

  const roleHierarchy = {
    ADMIN: 4,
    STAFF: 3,
    DOCTOR: 2,
    ATTORNEY: 1,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export async function canAccessPatient(patientId: string, doctorId?: string, attorneyId?: string) {
  const { userRole, userId } = await getUserInfo()

  if (!userRole || !userId) return false

  switch (userRole) {
    case 'ADMIN':
    case 'STAFF':
      return true
    case 'DOCTOR':
      return doctorId === userId
    case 'ATTORNEY':
      return attorneyId === userId
    default:
      return false
  }
} 