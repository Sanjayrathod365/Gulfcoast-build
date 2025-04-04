import { Appointment } from './appointment'
import { Procedure } from './procedure'

export interface Patient {
  id: string
  name?: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  phone: string
  altNumber?: string
  email?: string
  doidol?: string
  gender?: string
  address?: string
  city?: string
  zip?: string
  status?: {
    name: string
    color: string
  }
  lawyer?: string
  orderDate?: string
  orderFor?: string
  procedures?: Procedure[]
  createdAt: string
  updatedAt: string
} 