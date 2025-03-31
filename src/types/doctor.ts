export interface Doctor {
  id: string
  prefix?: string
  name: string
  phoneNumber?: string
  faxNumber?: string
  email: string
  clinicName?: string
  address?: string
  mapLink?: string
  status: 'ACTIVE' | 'INACTIVE'
  hasLogin: boolean
  createdAt: string
  updatedAt: string
} 