export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  examId: string
  date: string
  time: string
  type: 'checkup' | 'consultation' | 'follow-up' | 'emergency'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  createdAt: string
  updatedAt: string
} 