'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface Doctor {
  id: string
  prefix: string
  name: string
  phoneNumber: string
  faxNumber: string
  email: string
  clinicName: string
  address: string
  mapLink: string | null
  status: 'Active' | 'Inactive'
  hasLogin: boolean
  password?: string
}

export default function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const response = await fetch(`/api/doctors/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch doctor')
        }
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch doctor')
        }
        setDoctor(data.data)
      } catch (err) {
        setError('Failed to load doctor data')
        console.error('Error fetching doctor:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctor()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctor) return

    try {
      const formData = {
        id: resolvedParams.id,
        prefix: doctor.prefix || '',
        name: doctor.name,
        phoneNumber: doctor.phoneNumber || '',
        faxNumber: doctor.faxNumber || '',
        email: doctor.email,
        clinicName: doctor.clinicName || '',
        address: doctor.address || '',
        mapLink: doctor.mapLink || null,
        status: doctor.status,
        hasLogin: doctor.hasLogin,
        password: doctor.password
      }

      const response = await fetch(`/api/doctors/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update doctor')
      }

      router.push('/tools/doctors')
      router.refresh()
    } catch (error) {
      setError('Failed to update doctor')
      console.error('Error updating doctor:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!doctor) return
    const { name, value } = e.target
    setDoctor(prev => {
      if (!prev) return null
      // Handle empty mapLink as null
      if (name === 'mapLink' && value === '') {
        return { ...prev, [name]: null }
      }
      return { ...prev, [name]: value }
    })
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!doctor) return <div className="p-4">Doctor not found</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Doctor</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white">Prefix</label>
          <input
            type="text"
            name="prefix"
            value={doctor.prefix}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Name</label>
          <input
            type="text"
            name="name"
            value={doctor.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={doctor.phoneNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Fax Number</label>
          <input
            type="text"
            name="faxNumber"
            value={doctor.faxNumber}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Email</label>
          <input
            type="email"
            name="email"
            value={doctor.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Clinic Name</label>
          <input
            type="text"
            name="clinicName"
            value={doctor.clinicName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Address</label>
          <input
            type="text"
            name="address"
            value={doctor.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Map Link</label>
          <input
            type="text"
            name="mapLink"
            value={doctor.mapLink || ''}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white">Status</label>
          <select
            name="status"
            value={doctor.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="hasLogin"
            checked={doctor.hasLogin}
            onChange={(e) => setDoctor(prev => prev ? { ...prev, hasLogin: e.target.checked, password: e.target.checked ? '' : undefined } : null)}
            className="h-4 w-4 rounded border-gray-300 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm text-white">Has Login Access</label>
        </div>
        
        {doctor.hasLogin && (
          <div>
            <label className="block text-sm font-medium text-white">Password</label>
            <input
              type="password"
              name="password"
              value={doctor.password || ''}
              onChange={handleChange}
              required={doctor.hasLogin}
              minLength={8}
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter password (minimum 8 characters)"
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push('/tools/doctors')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
} 