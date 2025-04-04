'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { Phone, Mail, MapPin, Edit, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { ColumnDef } from '@tanstack/react-table'

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
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch doctors')
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch doctors')
        }

        setDoctors(data.data || [])
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"
        />
      </div>
    )
  }

  const columns: ColumnDef<Doctor>[] = [
    // ... column definitions ...
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-2">
      <div className="max-w-[99%] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div className="px-2 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg font-semibold text-white"
              >
                Doctors
              </motion.h1>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/tools/doctors/add"
                  className="inline-flex items-center px-2 py-1 bg-white/10 text-white text-sm border border-white/20 rounded hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-1 focus:ring-offset-indigo-600"
                >
                  <PlusIcon className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  Add Doctor
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="px-2 py-2">
            {doctors.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.svg 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </motion.svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding a new doctor.</p>
                <motion.div 
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/tools/doctors/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                    Add Doctor
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden">
                    <table className="min-w-full table-fixed divide-y divide-gray-200" role="table">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="w-36 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Doctor Name
                          </th>
                          <th scope="col" className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th scope="col" className="w-28 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fax
                          </th>
                          <th scope="col" className="w-40 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clinic
                          </th>
                          <th scope="col" className="w-40 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th scope="col" className="w-20 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="w-32 px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {doctors.map((doctor) => (
                          <tr key={doctor.id} className="hover:bg-gray-50">
                            <td className="px-2 py-1 whitespace-nowrap text-sm">
                              <div className="font-medium text-gray-900">
                                {doctor.prefix} {doctor.name}
                              </div>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {doctor.phoneNumber}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {doctor.faxNumber}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {doctor.email}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {doctor.clinicName}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-sm text-gray-900">
                              {doctor.address}
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                                doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {doctor.status}
                              </span>
                            </td>
                            <td className="px-2 py-1 whitespace-nowrap text-right">
                              <div className="inline-flex items-center justify-end -space-x-px">
                                {doctor.phoneNumber && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.location.href = `tel:${doctor.phoneNumber}`}
                                    title="Call"
                                    className="h-6 w-6 rounded-none first:rounded-l hover:bg-gray-100 hover:z-10"
                                  >
                                    <Phone className="h-3 w-3" />
                                  </Button>
                                )}
                                {doctor.email && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.location.href = `mailto:${doctor.email}`}
                                    title="Email"
                                    className="h-6 w-6 rounded-none hover:bg-gray-100 hover:z-10"
                                  >
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                )}
                                {doctor.mapLink && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => window.open(doctor.mapLink, '_blank')}
                                    title="View on Map"
                                    className="h-6 w-6 rounded-none hover:bg-gray-100 hover:z-10"
                                  >
                                    <MapPin className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  title="Edit"
                                  className="h-6 w-6 rounded-none hover:bg-gray-100 hover:z-10"
                                >
                                  <Link href={`/tools/doctors/${doctor.id}/edit`}>
                                    <Edit className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleStatus(doctor.id, doctor.status)}
                                  title={doctor.status === 'Active' ? 'Deactivate' : 'Activate'}
                                  className="h-6 w-6 rounded-none last:rounded-r hover:bg-gray-100 hover:z-10"
                                >
                                  {doctor.status === 'Active' ? (
                                    <ToggleRight className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <ToggleLeft className="h-3 w-3 text-red-600" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 