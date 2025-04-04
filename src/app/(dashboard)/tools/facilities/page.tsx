'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Facility {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax?: string
  email?: string
  mapLink?: string
  status: string
}

export default function FacilitiesPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch('/api/facilities')
        if (!response.ok) throw new Error('Failed to fetch facilities')
        const data = await response.json()
        setFacilities(data)
      } catch (error) {
        console.error('Error fetching facilities:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch facilities')
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return

    try {
      const response = await fetch(`/api/facilities/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete facility')

      setFacilities((prev) => prev.filter((facility) => facility.id !== id))
    } catch (error) {
      console.error('Error deleting facility:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete facility')
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white"
              >
                Facilities
              </motion.h1>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => router.push('/tools/facilities/add')}
                  className="inline-flex items-center px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600"
                  role="button"
                  aria-label="Add new facility"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Facility
                </button>
              </motion.div>
            </div>
          </div>

          <div className="px-8 py-6">
            {facilities.length === 0 && !loading ? (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </motion.svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No facilities found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new facility.</p>
                <motion.div 
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => router.push('/tools/facilities/add')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    role="button"
                    aria-label="Add your first facility"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Facility
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              >
                {facilities.map((facility, index) => (
                  <motion.div
                    key={facility.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <h2 className="text-xl font-semibold text-gray-900">{facility.name}</h2>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/tools/facilities/${facility.id}/edit`)}
                            className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
                            aria-label={`Edit ${facility.name}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(facility.id)}
                            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
                            aria-label={`Delete ${facility.name}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </motion.button>
                        </div>
                      </div>

                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-2 text-gray-600"
                      >
                        <div className="flex items-start">
                          <svg className="h-5 w-5 text-gray-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <div>
                            <p>{facility.address}</p>
                            <p>{facility.city}, {facility.state} {facility.zip}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <p>Phone: {facility.phone}</p>
                        </div>
                        
                        {facility.fax && (
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            <p>Fax: {facility.fax}</p>
                          </div>
                        )}
                        
                        {facility.email && (
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center"
                          >
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <a
                              href={`mailto:${facility.email}`}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
                              aria-label={`Send email to ${facility.name}`}
                            >
                              {facility.email}
                            </a>
                          </motion.div>
                        )}
                        
                        {facility.mapLink && (
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center"
                          >
                            <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            <a
                              href={facility.mapLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded flex items-center"
                              aria-label={`View ${facility.name} on map (opens in new tab)`}
                            >
                              <span>View on Map</span>
                              <svg
                                className="w-4 h-4 ml-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 