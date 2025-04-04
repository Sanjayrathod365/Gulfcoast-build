'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parse } from 'date-fns'
import { Loader2, Plus, X, ArrowLeft, CheckCircle2 } from 'lucide-react'

interface Payer {
  id: string
  name: string
  isActive: boolean
}

interface Status {
  id: string
  name: string
  color: string
}

interface Facility {
  id: string
  name: string
}

interface Physician {
  id: string
  prefix: string
  name: string
  suffix: string | null
}

interface Exam {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

interface Procedure {
  examId: string
  statusId: string
  scheduleDate?: string
  scheduleTime?: string
  facilityId?: string
  physicianId?: string
  lop?: string
  isCompleted?: boolean
}

interface Attorney {
  id: string
  user: {
    name: string
    email: string
  }
  phone: string | null
  faxNumber: string | null
  address: string | null
  city: string | null
  state: string | null
  zipcode: string | null
  notes: string | null
}

export default function AddPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [payers, setPayers] = useState<Payer[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [attorneys, setAttorneys] = useState<Attorney[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    altNumber: '',
    email: '',
    doidol: '',
    gender: 'unknown',
    address: '',
    city: '',
    zip: '',
    statusId: '',
    payerId: '',
    lawyer: '',
    attorneyId: '',
    orderDate: new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    }),
    orderFor: '',
    referringDoctorId: '',
    procedures: [] as Procedure[]
  })

  useEffect(() => {
    fetchPayers()
    fetchStatuses()
    fetchFacilities()
    fetchPhysicians()
    fetchExams()
    fetchAttorneys()
  }, [])

  const fetchPayers = async () => {
    try {
      const response = await fetch('/api/payers')
      if (!response.ok) {
        throw new Error('Failed to fetch payers')
      }
      const data = await response.json()
      setPayers(data || [])
    } catch (err) {
      console.error('Error fetching payers:', err)
      setError('Failed to load payers')
    }
  }

  const fetchStatuses = async () => {
    try {
      const response = await fetch('/api/statuses')
      if (!response.ok) {
        throw new Error('Failed to fetch statuses')
      }
      const data = await response.json()
      setStatuses(data)
    } catch (err) {
      console.error('Error fetching statuses:', err)
    }
  }

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities')
      if (!response.ok) {
        throw new Error('Failed to fetch facilities')
      }
      const data = await response.json()
      setFacilities(data)
    } catch (err) {
      console.error('Error fetching facilities:', err)
    }
  }

  const fetchPhysicians = async () => {
    try {
      const response = await fetch('/api/physicians')
      if (!response.ok) {
        throw new Error('Failed to fetch physicians')
      }
      const data = await response.json()
      setPhysicians(data)
    } catch (err) {
      console.error('Error fetching physicians:', err)
    }
  }

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      if (!response.ok) {
        throw new Error('Failed to fetch exams')
      }
      const data = await response.json()
      setExams(data)
    } catch (err) {
      console.error('Error fetching exams:', err)
    }
  }

  const fetchAttorneys = async () => {
    try {
      const response = await fetch('/api/attorneys')
      if (!response.ok) {
        throw new Error('Failed to fetch attorneys')
      }
      const data = await response.json()
      setAttorneys(data || [])
    } catch (err) {
      console.error('Error fetching attorneys:', err)
      setError('Failed to load attorneys')
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '')
    // Format as (XXX) XXX-XXXX
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return ''
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${month}/${day}/${year}`
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    let formattedValue = value

    // Format phone numbers
    if (name === 'phone' || name === 'altNumber') {
      formattedValue = formatPhoneNumber(value)
    }

    // Format dates
    if (name === 'dateOfBirth' || name === 'doidol' || name === 'orderDate') {
      formattedValue = formatDate(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  const addProcedure = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [
        ...prev.procedures,
        {
          examId: '',
          statusId: '',
          scheduleDate: '',
          scheduleTime: '',
          facilityId: '',
          physicianId: '',
          lop: '',
          isCompleted: false
        }
      ]
    }))
  }

  const removeProcedure = (index: number) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.filter((_, i) => i !== index)
    }))
  }

  const updateProcedure = (index: number, field: keyof Procedure, value: any) => {
    setFormData(prev => ({
      ...prev,
      procedures: prev.procedures.map((proc, i) => {
        if (i !== index) return proc
        
        // Special handling for scheduleDate
        if (field === 'scheduleDate') {
          // If the value is coming from the date picker, it's already in YYYY-MM-DD format
          if (value.includes('-')) {
            const [year, month, day] = value.split('-')
            return { ...proc, [field]: `${month}/${day}/${year}` }
          }
          
          // Otherwise, handle manual input
          const numbers = value.replace(/\D/g, '').slice(0, 8)
          
          // Format as MM/DD/YYYY
          let formattedValue = ''
          if (numbers.length <= 2) {
            formattedValue = numbers
          } else if (numbers.length <= 4) {
            const month = numbers.slice(0, 2)
            // Validate month (01-12)
            if (parseInt(month) > 12) {
              formattedValue = '12/' + numbers.slice(2)
            } else {
              formattedValue = `${month}/${numbers.slice(2)}`
            }
          } else {
            const month = numbers.slice(0, 2)
            const day = numbers.slice(2, 4)
            const year = numbers.slice(4, 8)
            
            // Validate month (01-12)
            if (parseInt(month) > 12) {
              formattedValue = '12'
            } else {
              formattedValue = month
            }
            
            // Validate day (01-31)
            if (parseInt(day) > 31) {
              formattedValue += '/31'
            } else {
              formattedValue += `/${day}`
            }
            
            // Add year if exists
            if (year) {
              formattedValue += `/${year}`
            }
          }
          return { ...proc, [field]: formattedValue }
        }
        
        return { ...proc, [field]: value }
      })
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        setError('First name and last name are required')
        setLoading(false)
        return
      }

      if (!formData.procedures || formData.procedures.length === 0) {
        setError('At least one procedure is required')
        setLoading(false)
        return
      }

      // Validate each procedure
      for (const proc of formData.procedures) {
        if (!proc.examId || !proc.statusId) {
          setError('Exam and status are required for each procedure')
          setLoading(false)
          return
        }
      }

      // Parse dates before sending
      const submissionData = {
        ...formData,
        phone: formData.phone?.trim() || '', // Ensure phone is never null
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : new Date().toISOString(),
        doidol: formData.doidol ? new Date(formData.doidol).toISOString() : null,
        orderDate: formData.orderDate ? new Date(formData.orderDate).toISOString() : null,
        lawyer: formData.attorneyId ? attorneys.find(a => a.id === formData.attorneyId)?.user.name || '' : '',
        attorneyId: undefined,
        referringDoctorId: undefined,
        referringDoctor: undefined,
        procedures: formData.procedures.map(proc => ({
          ...proc,
          scheduleDate: proc.scheduleDate ? new Date(proc.scheduleDate).toISOString() : new Date().toISOString(),
          scheduleTime: proc.scheduleTime || '00:00',
          facilityId: proc.facilityId || undefined,
          physicianId: proc.physicianId || undefined,
          lop: proc.lop || '',
          isCompleted: proc.isCompleted || false
        }))
      }

      console.log('Submitting patient data:', JSON.stringify(submissionData, null, 2))

      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const data = await response.json()
      console.log('API Response:', {
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create patient')
      }

      router.push('/patients')
    } catch (error) {
      console.error('Error creating patient:', error)
      setError(error instanceof Error ? error.message : 'Failed to create patient')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16"
        >
          <Loader2 className="h-16 w-16 text-indigo-600" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
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
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl font-bold text-white"
              >
                Add New Patient
              </motion.h1>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/patients')}
                className="inline-flex items-center px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patients
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="px-8 py-6"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Patient Information Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Patient Information
                  </h3>
                </div>
                
                <div className="px-6 py-5 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className="sm:col-span-2"
                  >
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="sm:col-span-2"
                  >
                    <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      id="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.9 }}
                    className="sm:col-span-2"
                  >
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth *
                    </label>
                    <input
                      type="text"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      placeholder="MM/DD/YYYY"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.1 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.2 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="altNumber" className="block text-sm font-medium text-gray-700">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="altNumber"
                      id="altNumber"
                      value={formData.altNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.3 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.4 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="doidol" className="block text-sm font-medium text-gray-700">
                      DOIDOL
                    </label>
                    <input
                      type="text"
                      name="doidol"
                      id="doidol"
                      value={formData.doidol}
                      onChange={handleChange}
                      placeholder="MM/DD/YYYY"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.5 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="unknown">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.6 }}
                    className="sm:col-span-6"
                  >
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.7 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.8 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip"
                      id="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 1.9 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="statusId" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="statusId"
                      id="statusId"
                      value={formData.statusId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Status</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 2 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="payerId" className="block text-sm font-medium text-gray-700">
                      Payer
                    </label>
                    <select
                      name="payerId"
                      id="payerId"
                      value={formData.payerId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Payer</option>
                      {payers.map((payer) => (
                        <option key={payer.id} value={payer.id}>
                          {payer.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 2.1 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="lawyer" className="block text-sm font-medium text-gray-700">
                      Lawyer
                    </label>
                    <input
                      type="text"
                      name="lawyer"
                      id="lawyer"
                      value={formData.lawyer}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 2.2 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="attorneyId" className="block text-sm font-medium text-gray-700">
                      Attorney
                    </label>
                    <select
                      name="attorneyId"
                      id="attorneyId"
                      value={formData.attorneyId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Attorney</option>
                      {attorneys.map((attorney) => (
                        <option key={attorney.id} value={attorney.id}>
                          {attorney.user.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 2.3 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">
                      Order Date
                    </label>
                    <input
                      type="text"
                      name="orderDate"
                      id="orderDate"
                      value={formData.orderDate}
                      onChange={handleChange}
                      placeholder="MM/DD/YYYY"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 2.4 }}
                    className="sm:col-span-3"
                  >
                    <label htmlFor="orderFor" className="block text-sm font-medium text-gray-700">
                      Order For
                    </label>
                    <input
                      type="text"
                      name="orderFor"
                      id="orderFor"
                      value={formData.orderFor}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Procedures Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200"
              >
                <div className="px-6 py-5 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">
                      Procedures
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={addProcedure}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Procedure
                    </motion.button>
                  </div>
                </div>

                <div className="px-6 py-5 space-y-6">
                  <AnimatePresence>
                    {formData.procedures.map((procedure, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-6 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="text-md font-medium text-gray-900">
                            Procedure {index + 1}
                          </h4>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => removeProcedure(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </motion.button>
                        </div>

                        <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Exam *
                            </label>
                            <select
                              id={`procedures.${index}.examId`}
                              name={`procedures.${index}.examId`}
                              value={procedure.examId}
                              onChange={(e) => updateProcedure(index, 'examId', e.target.value)}
                              required
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Exam</option>
                              {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                  {exam.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Schedule Date *
                            </label>
                            <input
                              type="text"
                              id={`procedures.${index}.scheduleDate`}
                              name={`procedures.${index}.scheduleDate`}
                              value={procedure.scheduleDate}
                              onChange={(e) => updateProcedure(index, 'scheduleDate', e.target.value)}
                              required
                              placeholder="MM/DD/YYYY"
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Schedule Time *
                            </label>
                            <input
                              type="time"
                              id={`procedures.${index}.scheduleTime`}
                              name={`procedures.${index}.scheduleTime`}
                              value={procedure.scheduleTime}
                              onChange={(e) => updateProcedure(index, 'scheduleTime', e.target.value)}
                              required
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Facility *
                            </label>
                            <select
                              id={`procedures.${index}.facilityId`}
                              name={`procedures.${index}.facilityId`}
                              value={procedure.facilityId}
                              onChange={(e) => updateProcedure(index, 'facilityId', e.target.value)}
                              required
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Facility</option>
                              {facilities.map((facility) => (
                                <option key={facility.id} value={facility.id}>
                                  {facility.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Physician *
                            </label>
                            <select
                              id={`procedures.${index}.physicianId`}
                              name={`procedures.${index}.physicianId`}
                              value={procedure.physicianId}
                              onChange={(e) => updateProcedure(index, 'physicianId', e.target.value)}
                              required
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Physician</option>
                              {physicians.map((physician) => (
                                <option key={physician.id} value={physician.id}>
                                  {physician.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Status *
                            </label>
                            <select
                              id={`procedures.${index}.statusId`}
                              name={`procedures.${index}.statusId`}
                              value={procedure.statusId}
                              onChange={(e) => updateProcedure(index, 'statusId', e.target.value)}
                              required
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Status</option>
                              {statuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                  {status.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="sm:col-span-2">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={procedure.isCompleted}
                                onChange={(e) => updateProcedure(index, 'isCompleted', e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <label className="ml-2 block text-sm text-gray-900">
                                Completed
                              </label>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex justify-end gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => router.push('/patients')}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Create Patient
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
} 