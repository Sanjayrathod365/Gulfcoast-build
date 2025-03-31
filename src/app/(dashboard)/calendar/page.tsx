'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'

interface Appointment {
  id: string
  title: string
  patientName: string
  date: string
  time: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <p className="text-gray-500">No appointments scheduled for today</p>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{appointment.title}</h3>
                      <p className="text-sm text-gray-500">{appointment.patientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{appointment.time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 