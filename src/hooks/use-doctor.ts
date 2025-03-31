import { useApi } from './use-api'
import { Doctor } from '@/types/doctor'

interface DoctorResponse {
  success: boolean
  data: Doctor
  message?: string
  status: number
}

interface DoctorsResponse {
  success: boolean
  data: Doctor[]
  message?: string
  status: number
}

export function useDoctor() {
  const { loading, callApi } = useApi<Doctor>({
    successMessage: 'Doctor operation completed successfully',
    errorMessage: 'Failed to complete doctor operation',
  })

  const createDoctor = async (data: Omit<Doctor, 'id'>) => {
    return callApi('/api/doctors', 'POST', data, {
      successMessage: 'Doctor created successfully',
      errorMessage: 'Failed to create doctor',
    })
  }

  const updateDoctor = async (id: string, data: Partial<Doctor>) => {
    return callApi(`/api/doctors/${id}`, 'PUT', data, {
      successMessage: 'Doctor updated successfully',
      errorMessage: 'Failed to update doctor',
    })
  }

  const deleteDoctor = async (id: string) => {
    return callApi(`/api/doctors/${id}`, 'DELETE', undefined, {
      successMessage: 'Doctor deleted successfully',
      errorMessage: 'Failed to delete doctor',
    })
  }

  const getDoctor = async (id: string) => {
    return callApi<Doctor>(`/api/doctors/${id}`, 'GET', undefined, {
      successMessage: 'Doctor fetched successfully',
      errorMessage: 'Failed to fetch doctor',
    })
  }

  const getDoctors = async () => {
    return callApi<Doctor[]>('/api/doctors', 'GET', undefined, {
      successMessage: 'Doctors fetched successfully',
      errorMessage: 'Failed to fetch doctors',
    })
  }

  return {
    loading,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctor,
    getDoctors,
  }
} 