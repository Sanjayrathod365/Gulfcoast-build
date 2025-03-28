'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    return <div className="text-center">Loading...</div>
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        <button
          onClick={() => router.push('/tools/facilities/add')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Add New Facility
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="bg-white rounded-lg shadow-sm border p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-900">{facility.name}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/tools/facilities/${facility.id}/edit`)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(facility.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="space-y-2 text-gray-600">
              <p>{facility.address}</p>
              <p>{facility.city}, {facility.state} {facility.zip}</p>
              <p>Phone: {facility.phone}</p>
              {facility.fax && <p>Fax: {facility.fax}</p>}
              {facility.email && (
                <p>
                  Email:{' '}
                  <a
                    href={`mailto:${facility.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {facility.email}
                  </a>
                </p>
              )}
              {facility.mapLink && (
                <p>
                  <a
                    href={facility.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
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
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {facilities.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-8">
          No facilities found.{' '}
          <button
            onClick={() => router.push('/tools/facilities/add')}
            className="text-blue-600 hover:text-blue-800"
          >
            Add your first facility
          </button>
        </div>
      )}
    </div>
  )
} 