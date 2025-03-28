'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { getCityStateFromZip } from '@/lib/zipcode'

interface Facility {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax?: string | null
  email?: string | null
  mapLink?: string | null
  status: string
}

interface FacilityFormData {
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax: string
  email: string
  mapLink: string
}

export default function EditFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FacilityFormData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    fax: '',
    email: '',
    mapLink: '',
  })

  useEffect(() => {
    fetchFacility()
  }, [])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')
    
    // Format the number as (XXX) XXX-XXXX
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    } else {
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
    }
  }

  const fetchFacility = async () => {
    try {
      const response = await fetch(`/api/facilities/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch facility')
      }
      const facility = await response.json()
      setFormData({
        name: facility.name,
        address: facility.address,
        city: facility.city,
        state: facility.state,
        zip: facility.zip,
        phone: formatPhoneNumber(facility.phone),
        fax: facility.fax ? formatPhoneNumber(facility.fax) : '',
        email: facility.email || '',
        mapLink: facility.mapLink || '',
      })
    } catch (error) {
      setError('Failed to fetch facility')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format phone and fax numbers
    if (name === 'phone' || name === 'fax') {
      formattedValue = formatPhoneNumber(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue,
    }))

    // If ZIP code is entered and has 5 digits, fetch city and state
    if (name === 'zip' && value.length === 5) {
      try {
        const locationData = await getCityStateFromZip(value)
        if (locationData) {
          setFormData(prev => ({
            ...prev,
            city: locationData.city,
            state: locationData.state,
          }))
        }
      } catch (error) {
        console.error('Error fetching location data:', error)
        setError('Failed to fetch city and state from ZIP code')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    // Validate phone number format
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number in the format (XXX) XXX-XXXX')
      setSaving(false)
      return
    }

    // Validate fax number format if provided
    if (formData.fax && !phoneRegex.test(formData.fax)) {
      setError('Please enter a valid fax number in the format (XXX) XXX-XXXX')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(`/api/facilities/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update facility')
      }

      router.push('/tools/facilities')
    } catch (error) {
      setError('Failed to update facility')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Facility</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              required
              value={formData.city}
              onChange={handleChange}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              required
              value={formData.zip}
              onChange={handleChange}
              maxLength={5}
              pattern="[0-9]{5}"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter 5-digit ZIP code to auto-fill city and state
            </p>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Format: (XXX) XXX-XXXX
            </p>
          </div>
        </div>
        <div>
          <label htmlFor="fax" className="block text-sm font-medium text-gray-700">
            Fax
          </label>
          <input
            type="tel"
            id="fax"
            name="fax"
            value={formData.fax}
            onChange={handleChange}
            placeholder="(XXX) XXX-XXXX"
            maxLength={14}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Format: (XXX) XXX-XXXX
          </p>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700">
            Map Link
          </label>
          <input
            type="url"
            id="mapLink"
            name="mapLink"
            value={formData.mapLink}
            onChange={handleChange}
            placeholder="https://maps.google.com/..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Enter a Google Maps or other mapping service URL for this facility
          </p>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/tools/facilities')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 