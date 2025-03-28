'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

interface Doctor {
  id: string
  prefix: string
  name: string
  phoneNumber: string
  faxNumber: string
  email: string
  clinicName: string
  address: string
  mapLink: string
  status: 'Active' | 'Inactive'
  hasLogin: boolean
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch doctors data
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors')
        if (!response.ok) throw new Error('Failed to fetch doctors')
        const data = await response.json()
        setDoctors(data)
      } catch (error) {
        console.error('Error fetching doctors:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const toggleStatus = async (doctorId: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: currentStatus === 'Active' ? 'Inactive' : 'Active' }),
      })
      if (!response.ok) throw new Error('Failed to update status')
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, status: currentStatus === 'Active' ? 'Inactive' : 'Active' }
          : doctor
      ))
    } catch (error) {
      console.error('Error updating doctor status:', error)
    }
  }

  const toggleLogin = async (doctorId: string, currentHasLogin: boolean) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/login`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasLogin: !currentHasLogin }),
      })
      if (!response.ok) throw new Error('Failed to update login status')
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor.id === doctorId 
          ? { ...doctor, hasLogin: !currentHasLogin }
          : doctor
      ))
    } catch (error) {
      console.error('Error updating doctor login status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Doctors</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all doctors in the system including their contact information and status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/tools/doctors/add"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            Add Doctor
          </Link>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Doctor Name</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Phone Number</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Fax Number</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Clinic</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Address</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Login</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {doctor.prefix} {doctor.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.phoneNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.faxNumber}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.email}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{doctor.clinicName}</td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        <div>{doctor.address}</div>
                        {doctor.mapLink && (
                          <a href={doctor.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View Map
                          </a>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => toggleStatus(doctor.id, doctor.status)}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            doctor.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {doctor.status}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <button
                          onClick={() => toggleLogin(doctor.id, doctor.hasLogin)}
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            doctor.hasLogin
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {doctor.hasLogin ? 'Yes' : 'No'}
                        </button>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/tools/doctors/${doctor.id}/edit`} className="text-blue-600 hover:text-blue-900">
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 