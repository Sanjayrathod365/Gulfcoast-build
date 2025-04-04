import { useState } from 'react'
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
  const [loading, setLoading] = useState(false)

  const getAppointments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments')
      const data = await response.json()
      
      console.log('API Response:', data)
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointments')
      }
      
      return {
        success: true,
        data: data,
        status: response.status
      }
    } catch (error) {
      console.error('Error in getAppointments:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch appointments',
        status: 500
      }
    } finally {
      setLoading(false)
    }
  }

  const getAppointment = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments/${id}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointment')
      }
      
      return {
        success: true,
        data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch appointment',
        status: 500
      }
    } finally {
      setLoading(false)
    }
  }

  const createAppointment = async (appointment: Omit<Appointment, 'id'>) => {
    try {
      setLoading(true)
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create appointment')
      }
      
      return {
        success: true,
        data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create appointment',
        status: 500
      }
    } finally {
      setLoading(false)
    }
  }

  const updateAppointment = async (id: string, appointment: Partial<Appointment>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointment),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update appointment')
      }
      
      return {
        success: true,
        data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update appointment',
        status: 500
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete appointment')
      }
      
      return {
        success: true,
        data,
        status: response.status
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete appointment',
        status: 500
      }
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentsByDate = async (date: string) => {
    return callApi<Appointment[]>(`/api/appointments/date/${date}`, 'GET', undefined, {
      successMessage: 'Appointments fetched successfully',
      errorMessage: 'Failed to fetch appointments',
    })
  }

  return {
    loading,
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
  }
} 