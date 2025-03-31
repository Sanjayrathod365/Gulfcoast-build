'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

interface Patient {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  dateOfBirth: string
  phone: string
  altNumber?: string
  email?: string
  doidol?: string
  gender: string
  address: string
  city: string
  zip: string
  status: {
    id: string
    name: string
    color: string
  }
  payer: {
    id: string
    name: string
  }
  lawyer?: string
  orderDate?: string
  orderFor?: string
  referringDoctor?: {
    id: string
    name: string
  }
  procedures: Array<{
    id: string
    exam: string
    scheduleDate: string
    scheduleTime: string
    facility: {
      id: string
      name: string
    }
    physician: {
      id: string
      name: string
    }
    status: {
      id: string
      name: string
      color: string
    }
    isCompleted: boolean
  }>
}

export default function PatientPage() {
  const params = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(`/api/patients/${params.id}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Patient not found')
            return
          }
          throw new Error('Failed to fetch patient data')
        }
        const data = await response.json()
        setPatient(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchPatient()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-xl">No patient data available</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {patient.firstName} {patient.middleName} {patient.lastName}
          </h1>
          <div className="flex items-center">
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: patient.status.color + '20', color: patient.status.color }}
            >
              {patient.status.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="mt-1 text-sm text-gray-900">
                  {format(new Date(patient.dateOfBirth), 'MM/dd/yyyy')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Gender</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{patient.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{patient.phone}</p>
              </div>
              {patient.altNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Alternative Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.altNumber}</p>
                </div>
              )}
              {patient.email && (
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            <div>
              <p className="text-sm text-gray-900">{patient.address}</p>
              <p className="text-sm text-gray-900">
                {patient.city}, {patient.zip}
              </p>
            </div>
          </div>

          {/* Insurance and Order Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Insurance & Order Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Payer</label>
                <p className="mt-1 text-sm text-gray-900">{patient.payer.name}</p>
              </div>
              {patient.lawyer && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Lawyer</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.lawyer}</p>
                </div>
              )}
              {patient.orderDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Order Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(patient.orderDate), 'MM/dd/yyyy')}
                  </p>
                </div>
              )}
              {patient.orderFor && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Order For</label>
                  <p className="mt-1 text-sm text-gray-900">{patient.orderFor}</p>
                </div>
              )}
            </div>
          </div>

          {/* Referring Doctor */}
          {patient.referringDoctor && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Referring Doctor</h2>
              <div>
                <p className="text-sm text-gray-900">{patient.referringDoctor.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Procedures Section */}
        {patient.procedures && patient.procedures.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Procedures</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Physician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patient.procedures.map((procedure) => (
                    <tr key={procedure.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {procedure.exam}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {procedure.facility.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {procedure.physician.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(procedure.scheduleDate), 'MM/dd/yyyy')} {procedure.scheduleTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{ backgroundColor: procedure.status.color + '20', color: procedure.status.color }}
                        >
                          {procedure.status.name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 