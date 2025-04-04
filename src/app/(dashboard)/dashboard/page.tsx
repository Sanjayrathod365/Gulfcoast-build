'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, Calendar, Users, BarChart2, Settings, CheckSquare, ClipboardList, AlertTriangle, Bell, MessageSquare, CheckCircle, Clock, FileText } from 'lucide-react'
import { Appointment } from '@/types/appointment'
import { useApi } from '@/hooks/use-api'
import { format } from 'date-fns'

// Define Task and Case types directly in this file
interface Task {
  id: string
  title: string
  status: string
}

interface Case {
  id: string
  title: string
  status: string
}

interface DashboardData {
  totalPatients: number
  todayAppointments: number
  activeCases: number
  tasks: {
    total: number
    completed: number
    inProgress: number
  }
  cases: {
    total: number
    completed: number
    inProgress: number
    closed: number
  }
}

interface FetchError {
  patients?: string
  appointments?: string
  cases?: string
  tasks?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData>({
    totalPatients: 0,
    todayAppointments: 0,
    activeCases: 0,
    tasks: {
      total: 0,
      completed: 0,
      inProgress: 0
    },
    cases: {
      total: 0,
      completed: 0,
      inProgress: 0,
      closed: 0
    }
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
        const todayAppointments = appointments.filter((app: Appointment) => {
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
        const activeCases = cases.filter((case_: Case) => case_.status !== 'closed').length
        
        // Count cases by status
        const completedCases = cases.filter((case_: Case) => case_.status === 'completed').length
        const inProgressCases = cases.filter((case_: Case) => case_.status === 'in progress').length
        const closedCases = cases.filter((case_: Case) => case_.status === 'closed').length
        
        setData(prev => ({ 
          ...prev, 
          activeCases,
          cases: {
            total: cases.length,
            completed: completedCases,
            inProgress: inProgressCases,
            closed: closedCases
          }
        }))
      }
      
      // Fetch tasks
      const tasksRes = await fetch('/api/tasks')
      if (!tasksRes.ok) {
        setErrors(prev => ({ ...prev, tasks: 'Failed to fetch tasks' }))
      } else {
        const tasks = await tasksRes.json()
        
        // Count tasks by status
        const completedTasks = tasks.filter((task: Task) => task.status === 'completed').length
        const inProgressTasks = tasks.filter((task: Task) => task.status === 'in progress').length
        
        setData(prev => ({ 
          ...prev, 
          tasks: {
            total: tasks.length,
            completed: completedTasks,
            inProgress: inProgressTasks
          }
        }))
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setErrors(prev => ({ ...prev, patients: 'Failed to fetch patients' }))
    } finally {
      setLoading(false)
    }
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <h1 className="text-2xl font-bold text-white">Welcome, {session.user?.name}</h1>
          </div>
          
          {Object.keys(errors).length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-8 py-4 bg-red-50 border-l-4 border-red-500"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  {errors.patients && (
                    <p className="text-sm text-red-800 mb-2">{errors.patients}</p>
                  )}
                  {errors.appointments && (
                    <p className="text-sm text-red-800 mb-2">{errors.appointments}</p>
                  )}
                  {errors.cases && (
                    <p className="text-sm text-red-800 mb-2">{errors.cases}</p>
                  )}
                  {errors.tasks && (
                    <p className="text-sm text-red-800">{errors.tasks}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('/patients')}
                className="cursor-pointer"
              >
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2 text-indigo-600" />
                      <CardTitle className="text-indigo-700">Patients</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-gray-900">{data.totalPatients}</p>
                    <p className="text-sm text-gray-500 mt-2">Total patients in the system</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('/appointments')}
                className="cursor-pointer"
              >
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-green-600" />
                      <CardTitle className="text-green-700">Appointments</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-gray-900">{data.todayAppointments}</p>
                    <p className="text-sm text-gray-500 mt-2">Today's scheduled appointments</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('/cases')}
                className="cursor-pointer"
              >
                <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      <CardTitle className="text-blue-700">Cases</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold text-gray-900">{data.activeCases}</p>
                    <p className="text-sm text-gray-500 mt-2">Active cases requiring attention</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            {/* Tasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mb-8"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <ClipboardList className="h-5 w-5 mr-2 text-indigo-600" />
                Tasks Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/tasks?status=completed')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        <CardTitle className="text-green-700">Completed</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.tasks.completed}</p>
                      <p className="text-sm text-gray-500 mt-2">Tasks completed</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/tasks?status=in-progress')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                        <CardTitle className="text-yellow-700">In Progress</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.tasks.inProgress}</p>
                      <p className="text-sm text-gray-500 mt-2">Tasks in progress</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/tasks')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                      <div className="flex items-center">
                        <ClipboardList className="h-5 w-5 mr-2 text-indigo-600" />
                        <CardTitle className="text-indigo-700">Total</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.tasks.total}</p>
                      <p className="text-sm text-gray-500 mt-2">Total tasks</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Cases Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Cases Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/cases?status=completed')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        <CardTitle className="text-green-700">Completed</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.cases.completed}</p>
                      <p className="text-sm text-gray-500 mt-2">Cases completed</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/cases?status=in-progress')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-yellow-600" />
                        <CardTitle className="text-yellow-700">In Progress</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.cases.inProgress}</p>
                      <p className="text-sm text-gray-500 mt-2">Cases in progress</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/cases?status=closed')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <div className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-gray-600" />
                        <CardTitle className="text-gray-700">Closed</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.cases.closed}</p>
                      <p className="text-sm text-gray-500 mt-2">Cases closed</p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo('/cases')}
                  className="cursor-pointer"
                >
                  <Card className="bg-white shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-600" />
                        <CardTitle className="text-blue-700">Total</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-3xl font-bold text-gray-900">{data.cases.total}</p>
                      <p className="text-sm text-gray-500 mt-2">Total cases</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 