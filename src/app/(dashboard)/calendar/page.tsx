'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useAuth } from '@/hooks/useAuth'

interface Patient {
  id: string
  firstName: string
  lastName: string
}

interface Appointment {
  id: string
  title: string
  start: string
  end: string
  status: string
  notes?: string
  patient: {
    firstName: string
    lastName: string
  }
}

export default function CalendarPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [showPatientModal, setShowPatientModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null)
  const router = useRouter()

  const formatAppointmentTime = (date: string, time: string) => {
    // Ensure the time is in HH:mm format
    const formattedTime = time.length === 5 ? time : `${time}:00`
    return `${date}T${formattedTime}`
  }

  const calculateEndTime = (startDateTime: string) => {
    try {
      const date = new Date(startDateTime)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      // Add 30 minutes
      date.setMinutes(date.getMinutes() + 30)
      return date.toISOString()
    } catch (error) {
      console.error('Error calculating end time:', error)
      // Return a time 30 minutes after the start as fallback
      const [datePart, timePart] = startDateTime.split('T')
      const [hours, minutes] = timePart.split(':')
      const newMinutes = (parseInt(minutes) + 30) % 60
      const newHours = parseInt(hours) + Math.floor((parseInt(minutes) + 30) / 60)
      return `${datePart}T${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:00`
    }
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch('/api/appointments', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Failed to fetch appointments')
        }

        const data = await response.json()
        const transformedAppointments = data.map((apt: any) => {
          const startTime = formatAppointmentTime(apt.date, apt.time)
          return {
            id: apt.id,
            title: `${apt.patient.firstName} ${apt.patient.lastName}`,
            start: startTime,
            end: calculateEndTime(startTime),
            status: apt.status,
            notes: apt.notes,
          }
        })
        setAppointments(transformedAppointments)
      } catch (error) {
        console.error('Error fetching appointments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const fetchPatients = async (query: string) => {
    try {
      const response = await fetch(`/api/patients?search=${query}`)
      if (!response.ok) throw new Error('Failed to fetch patients')
      const data = await response.json()
      setPatients(data)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    setSelectedTimeSlot(selectInfo)
    setShowPatientModal(true)
  }

  const handlePatientSelect = async (patient: Patient) => {
    if (!selectedTimeSlot) return

    try {
      const startDate = selectedTimeSlot.startStr.split('T')[0]
      const startTime = selectedTimeSlot.startStr.split('T')[1].slice(0, 5)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          patientId: patient.id,
          date: startDate,
          time: startTime,
          status: 'scheduled',
          type: 'regular',
        }),
      })

      if (!response.ok) throw new Error('Failed to create appointment')

      const newAppointment = await response.json()
      const calendarApi = selectedTimeSlot.view.calendar
      calendarApi.unselect()

      const startDateTime = formatAppointmentTime(startDate, startTime)
      calendarApi.addEvent({
        id: newAppointment.id,
        title: `${patient.firstName} ${patient.lastName}`,
        start: startDateTime,
        end: calculateEndTime(startDateTime),
        status: 'scheduled',
      })

      setShowPatientModal(false)
      setSearchQuery('')
      setPatients([])
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const handleEventClick = (clickInfo: any) => {
    if (confirm(`Are you sure you want to delete the appointment '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove()
    }
  }

  const handleEventChange = (changeInfo: any) => {
    console.log('Event changed:', changeInfo)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    if (query.length >= 2) {
      fetchPatients(query)
    } else {
      setPatients([])
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Appointment Calendar</h2>
        <button
          onClick={() => router.push('/appointments/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Schedule Appointment
        </button>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={appointments}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventChange={handleEventChange}
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          height="auto"
        />
      </div>

      {/* Patient Search Modal */}
      {showPatientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Select Patient</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                >
                  {patient.firstName} {patient.lastName}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowPatientModal(false)
                  setSearchQuery('')
                  setPatients([])
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .calendar-container {
          margin-top: 20px;
        }
        .fc {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .fc-toolbar-title {
          font-size: 1.5em;
          font-weight: 600;
        }
        .fc-button {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        .fc-button:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }
        .fc-event {
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .fc-event-title {
          font-weight: 500;
        }
        .fc-timegrid-slot {
          height: 3em !important;
        }
      `}</style>
    </div>
  )
} 