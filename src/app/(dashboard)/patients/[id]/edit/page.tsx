'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface Doctor {
  id: string
  name: string
  prefix: string
  email: string
}

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
  id?: string
  examId: string
  scheduleDate: string
  scheduleTime: string
  facilityId: string
  physicianId: string
  statusId: string
  lop: string
  isCompleted: boolean
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

interface Patient {
  id: string
  firstName: string
  middleName: string
  lastName: string
  dateOfBirth: string
  phone: string
  altNumber: string
  email: string
  doidol: string
  gender: string
  address: string
  city: string
  zip: string
  statusId: string
  payerId: string
  lawyer: string
  attorneyId: string
  orderDate: string
  orderFor: string
  referringDoctorId: string | null
  procedures: Procedure[]
}

export default function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
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
    orderDate: '',
    orderFor: '',
    referringDoctorId: '',
    procedures: [] as Procedure[]
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [payers, setPayers] = useState<Payer[]>([])
  const [statuses, setStatuses] = useState<Status[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [attorneys, setAttorneys] = useState<Attorney[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [patientData, setPatientData] = useState<any>(null)

  useEffect(() => {
    fetchPatient()
    fetchDoctors()
    fetchPayers()
    fetchStatuses()
    fetchFacilities()
    fetchPhysicians()
    fetchExams()
    fetchAttorneys()
  }, [resolvedParams.id])

  useEffect(() => {
    if (patientData && exams.length > 0) {
      // Update procedures with correct exam IDs
      const updatedProcedures = formData.procedures.map(proc => {
        const exam = exams.find(e => e.name === proc.examId)
        return {
          ...proc,
          examId: exam?.id || proc.examId
        }
      })

      setFormData(prev => ({
        ...prev,
        procedures: updatedProcedures
      }))
    }
  }, [patientData, exams])

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

  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...')
      const response = await fetch('/api/doctors')
      if (!response.ok) {
        throw new Error('Failed to fetch doctors')
      }
      const result = await response.json()
      console.log('Fetched doctors:', result)
      if (result.data) {
        setDoctors(result.data)
      } else {
        setDoctors([])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Failed to load doctors')
      setDoctors([])
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
      setError('Failed to load statuses')
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
      setError('Failed to load facilities')
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
      setError('Failed to load physicians')
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
      setError('Failed to load exams')
    }
  }

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch patient')
      }
      const data = await response.json()
      setPatientData(data)
      
      // Format dates for the form
      const formatDate = (dateString: string | null) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toISOString().split('T')[0]
      }

      // Format procedures
      const formattedProcedures = data.procedures?.map((proc: any) => ({
        id: proc.id,
        examId: proc.exam, // Store the exam name as examId initially
        scheduleDate: formatDate(proc.scheduleDate),
        scheduleTime: proc.scheduleTime || '',
        facilityId: proc.facilityId,
        physicianId: proc.physicianId,
        statusId: proc.statusId,
        lop: proc.lop || '',
        isCompleted: proc.isCompleted || false
      })) || []

      setFormData({
        firstName: data.firstName || '',
        middleName: data.middleName || '',
        lastName: data.lastName || '',
        dateOfBirth: formatDate(data.dateOfBirth),
        phone: data.phone || '',
        altNumber: data.altNumber || '',
        email: data.email || '',
        doidol: data.doidol || '',
        gender: data.gender || 'unknown',
        address: data.address || '',
        city: data.city || '',
        zip: data.zip || '',
        statusId: data.statusId || '',
        payerId: data.payer?.id || '',
        lawyer: data.lawyer || '',
        attorneyId: data.attorney?.id || '',
        orderDate: formatDate(data.orderDate),
        orderFor: data.orderFor || '',
        referringDoctorId: data.referringDoctor?.id || '',
        procedures: formattedProcedures
      })
    } catch (error) {
      console.error('Error fetching patient:', error)
      setError('Failed to load patient')
    } finally {
      setLoading(false)
    }
  }

  const addProcedure = () => {
    setFormData(prev => ({
      ...prev,
      procedures: [
        ...prev.procedures,
        {
          examId: '',
          scheduleDate: '',
          scheduleTime: '',
          facilityId: '',
          physicianId: '',
          statusId: '',
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
      procedures: prev.procedures.map((proc, i) => 
        i === index ? { ...proc, [field]: value } : proc
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    // Validate required fields
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.payerId || !formData.statusId) {
      setError('First name, last name, payer, and status are required')
      return
    }

    // Validate procedures
    for (const proc of formData.procedures) {
      if (!proc.examId || !proc.scheduleDate || !proc.scheduleTime || !proc.facilityId || !proc.physicianId || !proc.statusId) {
        setError('All procedure fields are required')
        return
      }
    }

    try {
      setError('') // Clear any previous errors
      setLoading(true) // Set loading state

      // Find exam names for each procedure
      const proceduresWithExamNames = formData.procedures.map(proc => {
        const exam = exams.find(e => e.id === proc.examId)
        return {
          ...proc,
          examId: exam?.name || proc.examId // Use exam name if found, otherwise use the ID
        }
      })

      const response = await fetch(`/api/patients/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          procedures: proceduresWithExamNames
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update patient')
      }

      // If successful, redirect to patients list
      router.push('/patients')
    } catch (error) {
      console.error('Error updating patient:', error)
      setError(error instanceof Error ? error.message : 'Failed to update patient. Please try again.')
    } finally {
      setLoading(false) // Clear loading state
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value || '',
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            Patient not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
              <button
                type="button"
                onClick={() => router.push('/patients')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Patients
              </button>
            </div>

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
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
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
                    <input
                      type="date"
                      name="doidol"
                      value={formData.doidol || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="unknown">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status *
                    </label>
                    <select
                      name="statusId"
                      value={formData.statusId}
                      onChange={handleChange}
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
                      Payer *
                    </label>
                    <select
                      name="payerId"
                      value={formData.payerId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
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
                      value={formData.attorneyId || ''}
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
                    <input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
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
                      value={formData.referringDoctorId || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
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
                          Exam *
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
                          Schedule Date *
                        </label>
                        <input
                          type="date"
                          value={procedure.scheduleDate}
                          onChange={(e) => updateProcedure(index, 'scheduleDate', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Schedule Time *
                        </label>
                        <input
                          type="time"
                          value={procedure.scheduleTime}
                          onChange={(e) => updateProcedure(index, 'scheduleTime', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Facility *
                        </label>
                        <select
                          value={procedure.facilityId}
                          onChange={(e) => updateProcedure(index, 'facilityId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
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
                          value={procedure.physicianId}
                          onChange={(e) => updateProcedure(index, 'physicianId', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 