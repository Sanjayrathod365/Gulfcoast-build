import { useApi } from './use-api'
import { Appointment } from '@/types/appointment'

interface AppointmentResponse {
  success: boolean
  data: Appointment
  message?: string
  status: number
}

interface AppointmentsResponse {
  success: boolean
  data: Appointment[]
  message?: string
  status: number
}

export function useAppointment() {
  const { loading, callApi } = useApi<Appointment>({
    successMessage: 'Appointment operation completed successfully',
    errorMessage: 'Failed to complete appointment operation',
  })

  const createAppointment = async (data: Omit<Appointment, 'id'>) => {
    return callApi('/api/appointments', 'POST', data, {
      successMessage: 'Appointment scheduled successfully',
      errorMessage: 'Failed to schedule appointment',
    })
  }

  const updateAppointment = async (id: string, data: Partial<Appointment>) => {
    return callApi(`/api/appointments/${id}`, 'PUT', data, {
      successMessage: 'Appointment updated successfully',
      errorMessage: 'Failed to update appointment',
    })
  }

  const deleteAppointment = async (id: string) => {
    return callApi(`/api/appointments/${id}`, 'DELETE', undefined, {
      successMessage: 'Appointment cancelled successfully',
      errorMessage: 'Failed to cancel appointment',
    })
  }

  const getAppointment = async (id: string) => {
    return callApi<Appointment>(`/api/appointments/${id}`, 'GET', undefined, {
      successMessage: 'Appointment fetched successfully',
      errorMessage: 'Failed to fetch appointment',
    })
  }

  const getAppointments = async () => {
    return callApi<Appointment[]>('/api/appointments', 'GET', undefined, {
      successMessage: 'Appointments fetched successfully',
      errorMessage: 'Failed to fetch appointments',
    })
  }

  const getAppointmentsByDate = async (date: string) => {
    return callApi<Appointment[]>(`/api/appointments/date/${date}`, 'GET', undefined, {
      successMessage: 'Appointments fetched successfully',
      errorMessage: 'Failed to fetch appointments',
    })
  }

  return {
    loading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointment,
    getAppointments,
    getAppointmentsByDate,
  }
} 