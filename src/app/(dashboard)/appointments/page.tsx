'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { useAppointment } from '@/hooks/use-appointment'
import { Appointment } from '@/types/appointment'
import { AppointmentForm } from '@/components/appointments/AppointmentForm'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { loading, getAppointments, createAppointment, updateAppointment, deleteAppointment } = useAppointment()

  const fetchAppointments = async () => {
    const result = await getAppointments()
    if (result?.data) {
      setAppointments(result.data)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const handleSubmit = async (data: Omit<Appointment, 'id'> | Partial<Appointment>) => {
    if (selectedAppointment) {
      const result = await updateAppointment(selectedAppointment.id, data as Partial<Appointment>)
      if (result?.success) {
        fetchAppointments()
        setIsFormOpen(false)
        setSelectedAppointment(null)
      }
    } else {
      const result = await createAppointment(data as Omit<Appointment, 'id'>)
      if (result?.success) {
        fetchAppointments()
        setIsFormOpen(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteAppointment(id)
    if (result?.success) {
      fetchAppointments()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedAppointment ? 'Edit Appointment' : 'Schedule Appointment'}</CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentForm
              appointment={selectedAppointment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setSelectedAppointment(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Patient ID:</strong> {appointment.patientId}</p>
                <p><strong>Doctor ID:</strong> {appointment.doctorId}</p>
                <p><strong>Date:</strong> {new Date(appointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {appointment.time}</p>
                <p><strong>Type:</strong> {appointment.type}</p>
                <p><strong>Status:</strong> {appointment.status}</p>
                {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setIsFormOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(appointment.id)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 