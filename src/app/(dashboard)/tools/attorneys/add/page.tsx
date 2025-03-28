'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatPhoneNumber, lookupZipCode } from '@/utils/formatters'

interface CaseManagerData {
  name: string
  email: string
  phone: string
  phoneExt: string
  faxNumber: string
}

interface FormData {
  name: string
  email: string
  password: string
  phone: string
  faxNumber: string
  address: string
  city: string
  state: string
  zipcode: string
  notes: string
  hasLogin: boolean
}

export default function AddAttorneyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    faxNumber: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    notes: '',
    hasLogin: false
  })
  const [caseManagers, setCaseManagers] = useState<CaseManagerData[]>([])

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
    if (name === 'zipcode' && value.length === 5) {
      const location = await lookupZipCode(value)
      if (location) {
        setFormData(prev => ({
          ...prev,
          zipcode: value,
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

  const handleCaseManagerChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    
    // Handle phone number formatting for case managers
    if (name === 'phone' || name === 'faxNumber') {
      const formattedValue = formatPhoneNumber(value)
      setCaseManagers(prev => {
        const newManagers = [...prev]
        newManagers[index] = {
          ...newManagers[index],
          [name]: formattedValue
        }
        return newManagers
      })
      return
    }

    setCaseManagers(prev => {
      const newManagers = [...prev]
      newManagers[index] = {
        ...newManagers[index],
        [name]: value
      }
      return newManagers
    })
  }

  const addCaseManager = () => {
    setCaseManagers(prev => [...prev, {
      name: '',
      email: '',
      phone: '',
      phoneExt: '',
      faxNumber: ''
    }])
  }

  const removeCaseManager = (index: number) => {
    setCaseManagers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Submitting attorney data:', {
        ...formData,
        caseManagers: caseManagers.filter(manager => 
          manager.name && manager.email && manager.phone
        )
      })

      const response = await fetch('/api/attorneys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          caseManagers: caseManagers.filter(manager => 
            manager.name && manager.email && manager.phone
          )
        }),
      })

      const data = await response.json()
      console.log('Response:', data)

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create attorney')
      }

      router.push('/tools/attorneys')
    } catch (err) {
      console.error('Error creating attorney:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Attorney</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hasLogin"
              name="hasLogin"
              checked={formData.hasLogin}
              onChange={(e) => setFormData(prev => ({ ...prev, hasLogin: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="hasLogin" className="text-sm font-medium text-gray-700">
              Enable Login Access
            </label>
          </div>

          {formData.hasLogin && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required={formData.hasLogin}
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="faxNumber" className="block text-sm font-medium text-gray-700">
              Fax Number
            </label>
            <input
              type="tel"
              id="faxNumber"
              name="faxNumber"
              value={formData.faxNumber}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="(555) 123-4568"
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
            <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipcode"
              name="zipcode"
              value={formData.zipcode}
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

            {caseManagers.map((manager, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">Case Manager {index + 1}</h3>
                  {caseManagers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCaseManager(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div>
                  <label htmlFor={`caseManagerName${index}`} className="block text-sm font-medium text-gray-700">
                    Case Manager Name *
                  </label>
                  <input
                    type="text"
                    id={`caseManagerName${index}`}
                    name="name"
                    required
                    value={manager.name}
                    onChange={(e) => handleCaseManagerChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor={`caseManagerEmail${index}`} className="block text-sm font-medium text-gray-700">
                    Email ID *
                  </label>
                  <input
                    type="email"
                    id={`caseManagerEmail${index}`}
                    name="email"
                    required
                    value={manager.email}
                    onChange={(e) => handleCaseManagerChange(index, e)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`caseManagerPhone${index}`} className="block text-sm font-medium text-gray-700">
                      Phone Number * (XXX) XXX-XXXX
                    </label>
                    <input
                      type="tel"
                      id={`caseManagerPhone${index}`}
                      name="phone"
                      required
                      value={manager.phone}
                      onChange={(e) => handleCaseManagerChange(index, e)}
                      placeholder="(555) 555-5555"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor={`caseManagerPhoneExt${index}`} className="block text-sm font-medium text-gray-700">
                      Ext
                    </label>
                    <input
                      type="text"
                      id={`caseManagerPhoneExt${index}`}
                      name="phoneExt"
                      value={manager.phoneExt}
                      onChange={(e) => handleCaseManagerChange(index, e)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor={`caseManagerFax${index}`} className="block text-sm font-medium text-gray-700">
                    Fax Number (XXX) XXX-XXXX
                  </label>
                  <input
                    type="tel"
                    id={`caseManagerFax${index}`}
                    name="faxNumber"
                    value={manager.faxNumber}
                    onChange={(e) => handleCaseManagerChange(index, e)}
                    placeholder="(555) 555-5555"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ))}
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
              {isLoading ? 'Creating...' : 'Create Attorney'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 