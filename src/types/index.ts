export interface Physician {
  id: string
  prefix: string
  name: string
  suffix: string | null
  phoneNumber: string
  faxNumber: string | null
  email: string
  npiNumber: string | null
  clinicName: string | null
  address: string | null
  mapLink: string | null
  status: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Procedure {
  id?: string
  patientId: string
  examId: string
  scheduleDate: string
  scheduleTime: string
  facilityId: string
  physicianId: string
  statusId: string
  lop: string | null
  isCompleted: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Patient {
  id: string
  firstName: string
  middleName: string | null
  lastName: string
  dateOfBirth: string
  phone: string | null
  altNumber: string | null
  email: string | null
  doidol: string | null
  gender: string | null
  address: string | null
  city: string | null
  zip: string | null
  statusId: string
  payerId: string
  lawyer: string | null
  attorneyId: string | null
  orderDate: string | null
  orderFor: string | null
  referringDoctorId: string | null
  procedures: Procedure[]
  createdAt: string
  updatedAt: string
}

export interface Facility {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Exam {
  id: string
  name: string
  description: string | null
  duration: number
  createdAt: string
  updatedAt: string
}

export interface Status {
  id: string
  name: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Payer {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
} 