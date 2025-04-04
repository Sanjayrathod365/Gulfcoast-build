import { useApi } from './use-api'
import { Patient } from '@/types/patient'

export function usePatient() {
  const { loading, callApi } = useApi<Patient>({
    successMessage: 'Patient operation completed successfully',
    errorMessage: 'Failed to complete patient operation',
  })

  const createPatient = async (data: Omit<Patient, 'id'>) => {
    return callApi('/api/patients', 'POST', data, {
      successMessage: 'Patient created successfully',
      errorMessage: 'Failed to create patient',
    })
  }

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    return callApi(`/api/patients/${id}`, 'PUT', data, {
      successMessage: 'Patient updated successfully',
      errorMessage: 'Failed to update patient',
    })
  }

  const deletePatient = async (id: string) => {
    return callApi(`/api/patients/${id}`, 'DELETE', undefined, {
      successMessage: 'Patient deleted successfully',
      errorMessage: 'Failed to delete patient',
    })
  }

  const getPatient = async (id: string) => {
    return callApi<Patient>(`/api/patients/${id}`, 'GET', undefined, {
      successMessage: 'Patient fetched successfully',
      errorMessage: 'Failed to fetch patient',
    })
  }

  const getPatients = async () => {
    return callApi<Patient[]>('/api/patients', 'GET', undefined, {
      successMessage: 'Patients fetched successfully',
      errorMessage: 'Failed to fetch patients',
    })
  }

  return {
    loading,
    createPatient,
    updatePatient,
    deletePatient,
    getPatient,
    getPatients,
  }
} 