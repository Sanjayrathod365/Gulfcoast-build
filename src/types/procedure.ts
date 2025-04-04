export interface Procedure {
  id: string
  patientId: string
  examId: string
  scheduleDate: string
  scheduleTime: string
  facilityId: string
  physicianId: string
  statusId: string
  lop?: string
  isCompleted: boolean
  exam?: {
    id: string
    name: string
  }
  facility?: {
    id: string
    name: string
  }
  physician?: {
    id: string
    name: string
  }
  status?: {
    id: string
    name: string
    color: string
  }
  createdAt: string
  updatedAt: string
} 