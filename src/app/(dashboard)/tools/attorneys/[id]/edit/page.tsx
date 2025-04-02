'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { formatPhoneNumber, lookupZipCode } from '@/utils/formatters'

interface CaseManagerData {
  name: string
  email: string
  phone: string
  phoneExt: string
  faxNumber: string
}

interface Attorney {
  id: string
  user: {
    name: string | null
    email: string
  } | null
  phone: string
  faxNumber: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  caseManagers: CaseManagerData[]
}

interface FormData {
  attorneyName: string
  email: string
  phone: string
  faxNumber: string
  address: string
  city: string
  state: string
  zip: string
  notes: string
  hasLogin: boolean
  password: string
}

export default function EditAttorneyPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showCaseManagerDeleteConfirm, setShowCaseManagerDeleteConfirm] = useState(false)
  const [caseManagerToDelete, setCaseManagerToDelete] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    attorneyName: '',
    email: '',
    phone: '',
    faxNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    notes: '',
    hasLogin: false,
    password: '',
  })
  const [caseManagers, setCaseManagers] = useState<CaseManagerData[]>([])

  useEffect(() => {
    fetchAttorney()
  }, [resolvedParams.id])

  const fetchAttorney = async () => {
    try {
      const response = await fetch(`/api/attorneys?id=${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch attorney')
      }
      const data = await response.json()
      
      // Check if data is an array and get the first item
      const attorney = Array.isArray(data) ? data[0] : data
      
      if (!attorney) {
        throw new Error('Attorney not found')
      }

      // Initialize form data with attorney data, ensuring no undefined values
      setFormData({
        attorneyName: attorney.user?.name ?? '',
        email: attorney.user?.email ?? '',
        phone: attorney.phone ?? '',
        faxNumber: attorney.faxNumber ?? '',
        address: attorney.address ?? '',
        city: attorney.city ?? '',
        state: attorney.state ?? '',
        zip: attorney.zip ?? '',
        notes: attorney.notes ?? '',
        hasLogin: false,
        password: '',
      })
      
      // Initialize case managers with empty array if undefined
      setCaseManagers(attorney.caseManagers?.map((manager: any) => ({
        name: `${manager.firstName} ${manager.lastName}`.trim(),
        email: manager.email || '',
        phone: manager.phone || '',
        phoneExt: manager.phoneExt || '',
        faxNumber: manager.faxNumber || ''
      })) ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Handle phone number formatting
    if (name === 'phone' || name === 'faxNumber') {
      const formattedValue = formatPhoneNumber(value)
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
      return
    }

    // Handle ZIP code lookup
    if (name === 'zip' && value.length === 5) {
      const location = await lookupZipCode(value)
      if (location) {
        setFormData(prev => ({
          ...prev,
          zip: value,
          city: location.city,
          state: location.state
        }))
        return
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCaseManagerChange = (index: number, field: keyof CaseManagerData, value: string) => {
    const newCaseManagers = [...caseManagers]
    
    // Format phone and fax numbers
    if (field === 'phone' || field === 'faxNumber') {
      const formattedValue = formatPhoneNumber(value)
      newCaseManagers[index] = {
        ...newCaseManagers[index],
        [field]: formattedValue
      }
    } else {
      newCaseManagers[index] = {
        ...newCaseManagers[index],
        [field]: value
      }
    }
    
    setCaseManagers(newCaseManagers)
  }

  const addCaseManager = () => {
    setCaseManagers([...caseManagers, {
      name: '',
      email: '',
      phone: '',
      phoneExt: '',
      faxNumber: ''
    }])
  }

  const removeCaseManager = (index: number) => {
    setCaseManagerToDelete(index)
    setShowCaseManagerDeleteConfirm(true)
  }

  const confirmRemoveCaseManager = () => {
    if (caseManagerToDelete !== null) {
      const newCaseManagers = [...caseManagers]
      newCaseManagers.splice(caseManagerToDelete, 1)
      setCaseManagers(newCaseManagers)
      setShowCaseManagerDeleteConfirm(false)
      setCaseManagerToDelete(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Filter out case managers with missing required fields
      const validCaseManagers = caseManagers.filter(manager => 
        manager.name && manager.email && manager.phone
      )

      const requestData = {
        name: formData.attorneyName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        hasLogin: formData.hasLogin,
        password: formData.password || undefined,
        caseManagers: validCaseManagers.map(manager => ({
          name: manager.name,
          email: manager.email,
          phone: manager.phone,
          phoneExt: manager.phoneExt,
          faxNumber: manager.faxNumber
        }))
      }

      console.log('Form Data:', formData)
      console.log('Request Data:', requestData)

      const response = await fetch(`/api/attorneys/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()
      console.log('Response Data:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update attorney')
      }

      router.push('/tools/attorneys')
    } catch (err) {
      console.error('Error updating attorney:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/attorneys?id=${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete attorney')
      }

      router.push('/tools/attorneys')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Edit Attorney</h1>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Delete Attorney
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="attorneyName" className="block text-sm font-medium text-gray-700">
              Attorney Name *
            </label>
            <input
              type="text"
              id="attorneyName"
              name="attorneyName"
              required
              value={formData.attorneyName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone * (XXX) XXX-XXXX
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 555-5555"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="faxNumber" className="block text-sm font-medium text-gray-700">
              Fax Number (XXX) XXX-XXXX
            </label>
            <input
              type="tel"
              id="faxNumber"
              name="faxNumber"
              value={formData.faxNumber}
              onChange={handleChange}
              placeholder="(555) 555-5555"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="City"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="State"
              />
            </div>
          </div>

          <div>
            <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              id="zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="12345"
              pattern="[0-9]{5}"
              maxLength={5}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasLogin"
              name="hasLogin"
              checked={formData.hasLogin}
              onChange={(e) => setFormData({ ...formData, hasLogin: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="hasLogin" className="ml-2 block text-sm text-gray-900">
              Enable Login Access
            </label>
          </div>

          {formData.hasLogin && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Leave blank to keep current password"
              />
            </div>
          )}

          <div className="border-t pt-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Case Managers</h2>
              <button
                type="button"
                onClick={addCaseManager}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Case Manager
              </button>
            </div>

            <div className="space-y-4">
              {caseManagers.map((manager, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow relative">
                  <button
                    type="button"
                    onClick={() => removeCaseManager(index)}
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Case Manager {index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={manager.name}
                        onChange={(e) => handleCaseManagerChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={manager.email}
                        onChange={(e) => handleCaseManagerChange(index, 'email', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={manager.phone}
                        onChange={(e) => handleCaseManagerChange(index, 'phone', e.target.value)}
                        placeholder="(555) 555-5555"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Extension</label>
                      <input
                        type="text"
                        name="phoneExt"
                        value={manager.phoneExt}
                        onChange={(e) => handleCaseManagerChange(index, 'phoneExt', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fax Number</label>
                      <input
                        type="tel"
                        name="faxNumber"
                        value={manager.faxNumber}
                        onChange={(e) => handleCaseManagerChange(index, 'faxNumber', e.target.value)}
                        placeholder="(555) 555-5555"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/tools/attorneys')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Attorney'}
            </button>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Attorney</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this attorney? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Case Manager Delete Confirmation Modal */}
        {showCaseManagerDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Case Manager</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this case manager? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowCaseManagerDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmRemoveCaseManager}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 