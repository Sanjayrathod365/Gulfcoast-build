import { useState } from 'react'
import { Appointment } from '@/types/appointment'

export function usePatientAppointments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncAppointments = async (appointments: Appointment[]) => {
    try {
      setLoading(true)
      setError(null)

      console.log('Syncing appointments:', appointments)

      const response = await fetch('/api/appointments/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appointments }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync appointments')
      }

      console.log('Sync result:', result)

      return {
        success: true,
        data: result,
      }
    } catch (_error) {
      console.error('Error syncing appointments:', _error)
      const message = _error instanceof Error ? _error.message : 'Failed to sync appointments'
      setError(message)
      return {
        success: false,
        error: message,
      }
    } finally {
      setLoading(false)
    }
  }

  const getPatientAppointments = async (patientId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/appointments?patientId=${patientId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch patient appointments')
      }

      return {
        success: true,
        data,
      }
    } catch (_error) {
      console.error('Error fetching patient appointments:', _error)
      const message = _error instanceof Error ? _error.message : 'Failed to fetch patient appointments'
      setError(message)
      return {
        success: false,
        error: message,
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    syncAppointments,
    getPatientAppointments,
  }
} 