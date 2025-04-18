'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { getCityStateFromZip } from '@/lib/zipcode'
import { Loader2, MapPin, Phone, Mail, Building2, Save, X } from 'lucide-react'

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-700">
            <motion.h1 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-white flex items-center"
            >
              <Building2 className="h-6 w-6 mr-2" />
              Edit Facility
            </motion.h1>
          </div>

          <div className="px-8 py-6">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6"
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
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
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
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
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
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
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
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
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
                      className="mt-1 block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
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
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Enter 5-digit ZIP code to auto-fill city and state
                    </p>
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone *
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(XXX) XXX-XXXX"
                        maxLength={14}
                        className="pl-10 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Format: (XXX) XXX-XXXX
                    </p>
                  </div>
                </div>
                <div>
                  <label htmlFor="fax" className="block text-sm font-medium text-gray-700">
                    Fax
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="fax"
                      name="fax"
                      value={formData.fax}
                      onChange={handleChange}
                      placeholder="(XXX) XXX-XXXX"
                      maxLength={14}
                      className="pl-10 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Format: (XXX) XXX-XXXX
                  </p>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700">
                    Map Link
                  </label>
                  <div className="mt-1 relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      id="mapLink"
                      name="mapLink"
                      value={formData.mapLink}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/..."
                      className="pl-10 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a Google Maps or other mapping service URL for this facility
                  </p>
                </div>
              </motion.div>

              <div className="flex justify-end space-x-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => router.push('/tools/facilities')}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 flex items-center"
                >
                  {saving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 