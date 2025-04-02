'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface DashboardData {
  totalPatients: number
  todayAppointments: number
  activeCases: number
}

interface FetchError {
  patients?: string
  appointments?: string
  cases?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    totalPatients: 0,
    todayAppointments: 0,
    activeCases: 0
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<FetchError>({})

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setErrors({})

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch patients
      const patientsRes = await fetch('/api/patients')
      if (!patientsRes.ok) {
        throw new Error('Failed to fetch patients')
      }
      const patients = await patientsRes.json()
      setData(prev => ({ ...prev, totalPatients: patients.length }))

      // Fetch appointments
      const appointmentsRes = await fetch('/api/appointments')
      if (!appointmentsRes.ok) {
        setErrors(prev => ({ ...prev, appointments: 'Failed to fetch appointments' }))
      } else {
        const appointments = await appointmentsRes.json()
        const todayAppointments = appointments.filter((app: any) => {
          const appointmentDate = new Date(app.date)
          appointmentDate.setHours(0, 0, 0, 0)
          return appointmentDate.getTime() === today.getTime()
        }).length
        setData(prev => ({ ...prev, todayAppointments }))
      }

      // Fetch cases
      const casesRes = await fetch('/api/cases')
      if (!casesRes.ok) {
        setErrors(prev => ({ ...prev, cases: 'Failed to fetch cases' }))
      } else {
        const cases = await casesRes.json()
        const activeCases = cases.filter((case_: any) => case_.status !== 'closed').length
        setData(prev => ({ ...prev, activeCases }))
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setErrors(prev => ({ ...prev, patients: 'Failed to fetch patients' }))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {session.user?.name}</h1>
      
      {Object.keys(errors).length > 0 && (
        <div className="mb-6">
          {errors.patients && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2">
              {errors.patients}
            </div>
          )}
          {errors.appointments && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2">
              {errors.appointments}
            </div>
          )}
          {errors.cases && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.cases}
            </div>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.totalPatients}</p>
            <p className="text-sm text-gray-500">Total patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.todayAppointments}</p>
            <p className="text-sm text-gray-500">Today's appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.activeCases}</p>
            <p className="text-sm text-gray-500">Active cases</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 