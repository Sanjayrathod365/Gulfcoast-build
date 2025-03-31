'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddDoctorPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [faxNumber, setFaxNumber] = useState('')

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

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handleFaxNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFaxNumber(formatted)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validate phone number format
    const phonePattern = /^\(\d{3}\) \d{3}-\d{4}$/
    if (!phonePattern.test(phoneNumber)) {
      setError('Phone number must be in format (XXX) XXX-XXXX')
      setIsLoading(false)
      return
    }

    // Validate fax number format if provided
    if (faxNumber && !phonePattern.test(faxNumber)) {
      setError('Fax number must be in format (XXX) XXX-XXXX')
      setIsLoading(false)
      return
    }

    const form = e.currentTarget
    if (!form) {
      setError('Form not found')
      setIsLoading(false)
      return
    }

    const formData = new FormData(form)
    const data = {
      prefix: formData.get('prefix')?.toString() || '',
      name: formData.get('name')?.toString() || '',
      phoneNumber: phoneNumber || undefined,
      faxNumber: faxNumber || undefined,
      email: formData.get('email')?.toString() || '',
      clinicName: formData.get('clinicName')?.toString() || undefined,
      address: formData.get('address')?.toString() || undefined,
      mapLink: formData.get('mapLink')?.toString() || undefined,
      status: (formData.get('status')?.toString() || 'Active') as 'Active' | 'Inactive',
      hasLogin: false
    }

    console.log('Sending data to API:', data)

    try {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      let responseData: { success: boolean; data?: any; error?: string } | undefined
      try {
        responseData = await response.json()
      } catch (e) {
        console.error('Failed to parse API response:', e)
        throw new Error('Invalid response from server')
      }

      if (!response.ok || !responseData?.success) {
        const errorMessage = responseData?.error || `Failed to create doctor: ${response.status}`
        throw new Error(errorMessage)
      }

      router.push('/tools/doctors')
      router.refresh()
    } catch (error) {
      console.error('Error creating doctor:', error)
      setError(error instanceof Error ? error.message : 'Failed to create doctor. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Doctor</h1>
          <p className="mt-2 text-sm text-gray-700">
            Fill in the form below to add a new doctor to the system.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-1">
              <label htmlFor="prefix" className="block text-sm font-medium text-gray-700">
                Prefix
              </label>
              <select
                id="prefix"
                name="prefix"
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                id="phoneNumber"
                required
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="(XXX) XXX-XXXX"
                maxLength={14}
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="faxNumber" className="block text-sm font-medium text-gray-700">
                Fax Number
              </label>
              <input
                type="tel"
                name="faxNumber"
                id="faxNumber"
                required
                value={faxNumber}
                onChange={handleFaxNumberChange}
                placeholder="(XXX) XXX-XXXX"
                maxLength={14}
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">
                Clinic Name
              </label>
              <input
                type="text"
                name="clinicName"
                id="clinicName"
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                id="address"
                required
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700">
                Map Link (optional)
              </label>
              <input
                type="url"
                name="mapLink"
                id="mapLink"
                className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  )
} 