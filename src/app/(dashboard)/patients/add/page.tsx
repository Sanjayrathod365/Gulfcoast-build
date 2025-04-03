'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

  const parseDate = (dateString: string) => {
    if (!dateString) return null
    
    try {
      const [month, day, year] = dateString.split('/')
      const monthNum = parseInt(month)
      const dayNum = parseInt(day)
      const yearNum = parseInt(year)

      // Validate date components
      if (isNaN(monthNum) || isNaN(dayNum) || isNaN(yearNum)) {
        return null
      }

      // Validate ranges
      if (monthNum < 1 || monthNum > 12) return null
      if (dayNum < 1 || dayNum > 31) return null
      if (yearNum < 1900 || yearNum > 2100) return null

      const date = new Date(yearNum, monthNum - 1, dayNum)
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null
      }

      // Return date in ISO format with time set to midnight UTC
      return new Date(Date.UTC(yearNum, monthNum - 1, dayNum)).toISOString()
    } catch (error) {
      console.error('Error parsing date:', error)
      return null
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
              <button
                type="button"
                onClick={() => router.push('/patients')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Patients
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Patient Information Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        placeholder="MM/DD/YYYY"
                        pattern="\d{2}/\d{2}/\d{4}"
                        maxLength={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const dateInput = document.createElement('input');
                          dateInput.type = 'date';
                          dateInput.style.display = 'none';
                          document.body.appendChild(dateInput);
                          dateInput.click();
                          dateInput.addEventListener('change', (e) => {
                            const date = new Date((e.target as HTMLInputElement).value);
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const year = date.getFullYear();
                            setFormData(prev => ({
                              ...prev,
                              dateOfBirth: `${month}/${day}/${year}`
                            }));
                            document.body.removeChild(dateInput);
                          });
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="altNumber"
                      value={formData.altNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      DOIDOL
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="doidol"
                        value={formData.doidol}
                        onChange={handleChange}
                        placeholder="MM/DD/YYYY"
                        pattern="\d{2}/\d{2}/\d{4}"
                        maxLength={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const dateInput = document.createElement('input');
                          dateInput.type = 'date';
                          dateInput.style.display = 'none';
                          document.body.appendChild(dateInput);
                          dateInput.click();
                          dateInput.addEventListener('change', (e) => {
                            const date = new Date((e.target as HTMLInputElement).value);
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const year = date.getFullYear();
                            setFormData(prev => ({
                              ...prev,
                              doidol: `${month}/${day}/${year}`
                            }));
                            document.body.removeChild(dateInput);
                          });
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="unknown">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      name="statusId"
                      value={formData.statusId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Status</option>
                      {statuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Payer
                    </label>
                    <select
                      name="payerId"
                      value={formData.payerId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Payer</option>
                      {payers.map((payer) => (
                        <option key={payer.id} value={payer.id}>
                          {payer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lawyer
                    </label>
                    <select
                      name="attorneyId"
                      value={formData.attorneyId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Lawyer</option>
                      {attorneys.map((attorney) => (
                        <option key={attorney.id} value={attorney.id}>
                          {attorney.user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order Date
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="orderDate"
                        value={formData.orderDate}
                        onChange={handleChange}
                        placeholder="MM/DD/YYYY"
                        pattern="\d{2}/\d{2}/\d{4}"
                        maxLength={10}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const dateInput = document.createElement('input');
                          dateInput.type = 'date';
                          dateInput.style.display = 'none';
                          document.body.appendChild(dateInput);
                          dateInput.click();
                          dateInput.addEventListener('change', (e) => {
                            const date = new Date((e.target as HTMLInputElement).value);
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            const year = date.getFullYear();
                            setFormData(prev => ({
                              ...prev,
                              orderDate: `${month}/${day}/${year}`
                            }));
                            document.body.removeChild(dateInput);
                          });
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                      >
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Order For
                    </label>
                    <input
                      type="text"
                      name="orderFor"
                      value={formData.orderFor}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Referring Doctor
                    </label>
                    <select
                      name="referringDoctorId"
                      value={formData.referringDoctorId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Doctor</option>
                      {physicians.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.prefix} {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Procedures Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Procedures</h2>
                  <button
                    type="button"
                    onClick={addProcedure}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Procedure
                  </button>
                </div>

                {formData.procedures.map((procedure, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-md font-medium text-gray-900">Procedure {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeProcedure(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Exam Name *
                        </label>
                        <select
                          value={procedure.examId}
                          onChange={(e) => updateProcedure(index, 'examId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
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
                          Schedule Date
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={procedure.scheduleDate}
                            onChange={(e) => updateProcedure(index, 'scheduleDate', e.target.value)}
                            placeholder="MM/DD/YYYY"
                            pattern="\d{2}/\d{2}/\d{4}"
                            maxLength={10}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const dateInput = document.createElement('input');
                              dateInput.type = 'date';
                              dateInput.style.display = 'none';
                              document.body.appendChild(dateInput);
                              dateInput.click();
                              dateInput.addEventListener('change', (e) => {
                                const date = new Date((e.target as HTMLInputElement).value);
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const year = date.getFullYear();
                                updateProcedure(index, 'scheduleDate', `${month}/${day}/${year}`);
                                document.body.removeChild(dateInput);
                              });
                            }}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Schedule Time
                        </label>
                        <input
                          type="time"
                          value={procedure.scheduleTime}
                          onChange={(e) => updateProcedure(index, 'scheduleTime', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Facility
                        </label>
                        <select
                          value={procedure.facilityId}
                          onChange={(e) => updateProcedure(index, 'facilityId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                          Physician
                        </label>
                        <select
                          value={procedure.physicianId}
                          onChange={(e) => updateProcedure(index, 'physicianId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Physician</option>
                          {physicians.map((physician) => (
                            <option key={physician.id} value={physician.id}>
                              {physician.prefix} {physician.name} {physician.suffix}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status *
                        </label>
                        <select
                          value={procedure.statusId}
                          onChange={(e) => updateProcedure(index, 'statusId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Select Status</option>
                          {statuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          LOP
                        </label>
                        <input
                          type="text"
                          value={procedure.lop}
                          onChange={(e) => updateProcedure(index, 'lop', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>

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
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/patients')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 