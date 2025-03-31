export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
} 