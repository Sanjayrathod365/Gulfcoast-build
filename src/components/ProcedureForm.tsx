'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Status {
  id: string
  name: string
  color: string
}

interface Facility {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  fax: string | null
  email: string | null
  mapLink: string | null
}

interface Physician {
  id: string
  prefix: string
  name: string
  suffix: string | null
  phoneNumber: string
  email: string
  npiNumber: string | null
}

interface Exam {
  id: string
  name: string
}

interface Procedure {
  id?: string
  isCompleted: boolean
  exam: string
  scheduleDate: string
  scheduleTime: string
  statusId: string
  facilityId: string
  physicianId: string
  lop: string
}

interface ProcedureFormProps {
  procedures: Procedure[]
  onProceduresChange: (procedures: Procedure[]) => void
}

export default function ProcedureForm({ procedures, onProceduresChange }: ProcedureFormProps) {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [physicians, setPhysicians] = useState<Physician[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesRes, facilitiesRes, physiciansRes] = await Promise.all([
          fetch('/api/statuses'),
          fetch('/api/facilities'),
          fetch('/api/physicians')
        ])

        if (!statusesRes.ok || !facilitiesRes.ok || !physiciansRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [statusesData, facilitiesData, physiciansData] = await Promise.all([
          statusesRes.json(),
          facilitiesRes.json(),
          physiciansRes.json()
        ])

        setStatuses(statusesData)
        setFacilities(facilitiesData)
        setPhysicians(physiciansData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load form data')
      }
    }

    fetchData()
  }, [])

  const addProcedure = () => {
    onProceduresChange([
      ...procedures,
      {
        isCompleted: false,
        exam: '',
        scheduleDate: '',
        scheduleTime: '',
        statusId: '',
        facilityId: '',
        physicianId: '',
        lop: ''
      }
    ])
  }

  const removeProcedure = (index: number) => {
    onProceduresChange(procedures.filter((_, i) => i !== index))
  }

  const updateProcedure = (index: number, field: keyof Procedure, value: string | boolean) => {
    const updatedProcedures = procedures.map((proc, i) =>
      i === index ? { ...proc, [field]: value } : proc
    )
    onProceduresChange(updatedProcedures)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Procedures</h2>
        <button
          type="button"
          onClick={addProcedure}
          className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Procedure
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {procedures.map((procedure, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-md font-medium text-gray-900">Procedure {index + 1}</h3>
            <button
              type="button"
              onClick={() => removeProcedure(index)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Exam</label>
              <input
                type="text"
                value={procedure.exam}
                onChange={(e) => updateProcedure(index, 'exam', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Date</label>
              <input
                type="date"
                value={procedure.scheduleDate}
                onChange={(e) => updateProcedure(index, 'scheduleDate', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule Time</label>
              <input
                type="time"
                value={procedure.scheduleTime}
                onChange={(e) => updateProcedure(index, 'scheduleTime', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={procedure.statusId}
                onChange={(e) => updateProcedure(index, 'statusId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
              <label className="block text-sm font-medium text-gray-700">Facility</label>
              <select
                value={procedure.facilityId}
                onChange={(e) => updateProcedure(index, 'facilityId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Facility</option>
                {facilities.map((facility) => (
                  <option key={facility.id} value={facility.id}>
                    {facility.name} - {facility.city}, {facility.state}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Physician</label>
              <select
                value={procedure.physicianId}
                onChange={(e) => updateProcedure(index, 'physicianId', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Physician</option>
                {physicians.map((physician) => (
                  <option key={physician.id} value={physician.id}>
                    {physician.prefix} {physician.name}
                    {physician.suffix && `, ${physician.suffix}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">LOP</label>
              <select
                value={procedure.lop}
                onChange={(e) => updateProcedure(index, 'lop', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select LOP Status</option>
                <option value="Approved">Approved</option>
                <option value="Denied">Denied</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={procedure.isCompleted}
                onChange={(e) => updateProcedure(index, 'isCompleted', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">Completed</label>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 