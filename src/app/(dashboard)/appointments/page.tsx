'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Clock, User, Phone, Mail, MapPin, FileText, CheckCircle, XCircle, AlertCircle, Filter, Stethoscope, Building } from 'lucide-react'
import { useAppointment } from '@/hooks/use-appointment'
import { usePatientAppointments } from '@/hooks/use-patient-appointments'
import { Appointment } from '@/types/appointment'
import { Patient } from '@/types/patient'
import { Doctor } from '@/types/doctor'
import { Exam, Facility } from '@/types'
import { AppointmentForm } from '@/components/appointments/AppointmentForm'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, addMonths, subMonths, isSameDay } from 'date-fns'
import { Procedure } from '@/types/procedure'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Record<string, Patient>>({})
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({})
  const [exams, setExams] = useState<Record<string, Exam>>({})
  const [facilities, setFacilities] = useState<Record<string, Facility>>({})
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('today')
  const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = useAppointment()
  const { syncAppointments } = usePatientAppointments()

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Use the getAppointments hook function
      const appointmentsResult = await getAppointments()
      console.log('Appointments Result:', appointmentsResult)
      
      if (appointmentsResult?.success && appointmentsResult?.data) {
        const appointmentsData: Appointment[] = appointmentsResult.data
        console.log('Raw appointments data:', appointmentsData)
        
        // Apply filter
        let filteredAppointments = appointmentsData
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (filter === 'today') {
          filteredAppointments = appointmentsData.filter((appointment: Appointment) => {
            const appointmentDate = new Date(appointment.date)
            appointmentDate.setHours(0, 0, 0, 0)
            const isToday = appointmentDate.getTime() === today.getTime()
            console.log('Appointment date check:', {
              appointment: appointment.date,
              appointmentDate: appointmentDate,
              today: today,
              isToday: isToday
            })
            return isToday
          })
          console.log('Today\'s filtered appointments:', filteredAppointments)
        } else if (filter === 'upcoming') {
          filteredAppointments = appointmentsData.filter((appointment: Appointment) => {
            const appointmentDate = new Date(appointment.date)
            appointmentDate.setHours(0, 0, 0, 0)
            return appointmentDate.getTime() >= today.getTime()
          })
        }
        
        // Sort appointments by date and time
        const sortedAppointments = filteredAppointments.sort((a: Appointment, b: Appointment) => {
          const dateA = new Date(`${a.date}T${a.time}`)
          const dateB = new Date(`${b.date}T${b.time}`)
          return dateA.getTime() - dateB.getTime()
        })
        
        console.log('Sorted appointments:', sortedAppointments)
        setAppointments(sortedAppointments)
        
        // Extract unique IDs
        const patientIds = [...new Set(sortedAppointments.map((app: Appointment) => app.patientId))]
        const doctorIds = [...new Set(sortedAppointments.map((app: Appointment) => app.doctorId).filter(Boolean))]
        const examIds = [...new Set(sortedAppointments.map((app: Appointment) => app.examId).filter(Boolean))]
        
        const patientsData: Record<string, Patient> = {}
        const doctorsData: Record<string, Doctor> = {}
        const examsData: Record<string, Exam> = {}
        const facilitiesData: Record<string, Facility> = {}
        
        // Fetch patient data
        for (const patientId of patientIds) {
          try {
            const response = await fetch(`/api/patients/${patientId}`)
            if (response.ok) {
              const patient = await response.json()
              if (patient && typeof patient === 'object' && 'id' in patient) {
                patientsData[patientId] = patient as Patient
              }
            }
          } catch (err) {
            console.error(`Failed to fetch patient ${patientId}:`, err)
          }
        }
        
        // Fetch doctor data
        for (const doctorId of doctorIds) {
          try {
            const response = await fetch(`/api/doctors/${doctorId}`)
            if (response.ok) {
              const doctor = await response.json()
              if (doctor && typeof doctor === 'object' && 'id' in doctor) {
                doctorsData[doctorId] = doctor as Doctor
                
                // If doctor has a clinic, fetch facility data
                if (doctor.clinicName) {
                  try {
                    const facilityResponse = await fetch(`/api/facilities?name=${encodeURIComponent(doctor.clinicName)}`)
                    if (facilityResponse.ok) {
                      const facilities = await facilityResponse.json()
                      if (Array.isArray(facilities) && facilities.length > 0 && 'id' in facilities[0]) {
                        facilitiesData[facilities[0].id] = facilities[0] as Facility
                      }
                    }
                  } catch (err) {
                    console.error(`Failed to fetch facility for doctor ${doctorId}:`, err)
                  }
                }
              }
            }
          } catch (err) {
            console.error(`Failed to fetch doctor ${doctorId}:`, err)
          }
        }
        
        // Fetch exam data
        for (const examId of examIds) {
          try {
            const response = await fetch(`/api/exams/${examId}`)
            if (response.ok) {
              const exam = await response.json()
              if (exam && typeof exam === 'object' && 'id' in exam) {
                examsData[examId] = exam as Exam
              }
            }
          } catch (err) {
            console.error(`Failed to fetch exam ${examId}:`, err)
          }
        }
        
        console.log('Related data:', {
          patients: patientsData,
          doctors: doctorsData,
          exams: examsData,
          facilities: facilitiesData
        })
        
        setPatients(patientsData)
        setDoctors(doctorsData)
        setExams(examsData)
        setFacilities(facilitiesData)
      } else {
        console.error('Failed to fetch appointments:', appointmentsResult)
        setError('Failed to fetch appointments. Please try again.')
      }
    } catch (err) {
      console.error('Error in fetchAppointments:', err)
      setError('Failed to load appointments. Please try again later.')
    } finally {
      setLoading(false)
    }
  }, [getAppointments, filter, setAppointments, setPatients, setDoctors, setExams, setFacilities, setLoading, setError])

  // Sync appointments when the component mounts
  useEffect(() => {
    const syncAndFetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, fetch all patients to get their procedures
        const patientsResponse = await fetch('/api/patients')
        if (!patientsResponse.ok) {
          throw new Error('Failed to fetch patients')
        }

        const patients = await patientsResponse.json()
        console.log('Fetched patients:', patients)

        // Extract procedures from patients and convert to appointments
        const appointmentsToSync: Appointment[] = []
        patients.forEach((patient: Patient) => {
          if (patient.procedures && Array.isArray(patient.procedures)) {
            patient.procedures.forEach((procedure: Procedure) => {
              // Only create appointments for procedures with a schedule
              if (procedure.scheduleDate && procedure.scheduleTime) {
                appointmentsToSync.push({
                  id: procedure.id, // Use procedure ID as appointment ID for upsert
                  patientId: patient.id,
                  doctorId: procedure.physician?.id || '',
                  examId: procedure.exam?.id || '',
                  date: new Date(procedure.scheduleDate).toISOString(),
                  time: procedure.scheduleTime,
                  type: 'checkup', // Default to checkup
                  status: procedure.isCompleted ? 'completed' : 'scheduled',
                  notes: procedure.lop || undefined,
                  createdAt: procedure.createdAt,
                  updatedAt: procedure.updatedAt
                })
              }
            })
          }
        })

        console.log('Appointments to sync:', appointmentsToSync)

        // Sync appointments
        if (appointmentsToSync.length > 0) {
          const syncResult = await syncAppointments(appointmentsToSync)
          console.log('Sync result:', syncResult)

          if (!syncResult.success) {
            throw new Error('Failed to sync appointments')
          }
        }

        // Finally, fetch the appointments
        await fetchAppointments()
      } catch (err) {
        console.error('Error in syncAndFetchAppointments:', err)
        setError('Failed to sync appointments. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    syncAndFetchAppointments()
  }, [fetchAppointments, syncAppointments, setLoading, setError])

  // Fetch appointments when filter changes
  useEffect(() => {
    fetchAppointments()
  }, [filter, fetchAppointments])

  const handleSubmit = async (data: Omit<Appointment, 'id'> | Partial<Appointment>) => {
    try {
    if (selectedAppointment) {
        // Update appointment via API
      const result = await updateAppointment(selectedAppointment.id, data as Partial<Appointment>)
        
        if (result && result.success) {
          // Refresh appointments after update
        fetchAppointments()
        setIsFormOpen(false)
        setSelectedAppointment(null)
        } else {
          setError('Failed to update appointment. Please try again.')
      }
    } else {
        // Create new appointment via API
      const result = await createAppointment(data as Omit<Appointment, 'id'>)
        
        if (result && result.success) {
          // Refresh appointments after creation
        fetchAppointments()
        setIsFormOpen(false)
        } else {
          setError('Failed to create appointment. Please try again.')
        }
      }
    } catch (err) {
      console.error('Error submitting appointment:', err)
      setError('Failed to save appointment. Please try again.')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Delete appointment via API
    const result = await deleteAppointment(id)
      
      if (result && result.success) {
        // Refresh appointments after deletion
      fetchAppointments()
      } else {
        setError('Failed to cancel appointment. Please try again.')
      }
    } catch (err) {
      console.error('Error deleting appointment:', err)
      setError('Failed to cancel appointment. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'no-show':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'checkup':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
      case 'consultation':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100'
      case 'follow-up':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100'
      case 'emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
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
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Appointments</h1>
              <Button 
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-indigo-700 hover:bg-indigo-50"
              >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
        </Button>
            </div>
          </div>
          
          {error && (
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
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                All
              </Button>
              <Button 
                variant={filter === 'today' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('today')}
                className={filter === 'today' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                Today
              </Button>
              <Button 
                variant={filter === 'upcoming' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('upcoming')}
                className={filter === 'upcoming' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
              >
                Upcoming
              </Button>
            </div>
      </div>

      {isFormOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="px-8 py-6 border-b border-gray-200"
            >
              <Card className="overflow-hidden border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100">
                  <CardTitle className="text-indigo-700">
                    {selectedAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
                  </CardTitle>
          </CardHeader>
                <CardContent className="p-6">
            <AppointmentForm
              appointment={selectedAppointment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setSelectedAppointment(null)
              }}
              patients={Object.values(patients)}
            />
          </CardContent>
        </Card>
            </motion.div>
          )}

          <div className="px-8 py-6">
            {appointments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-500 mb-6">Schedule a new appointment to get started</p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {appointments.map((appointment, index) => {
                    const patient = patients[appointment.patientId]
                    const doctor = doctors[appointment.doctorId]
                    const exam = exams[appointment.examId]
                    const facility = doctor?.clinicName ? facilities[Object.keys(facilities).find(key => 
                      facilities[key].name === doctor.clinicName
                    ) || ''] : null
                    
                    return (
                      <motion.div
                        key={appointment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow">
                          <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-gradient-to-r from-indigo-50 to-indigo-100 p-6">
                              <div className="flex items-center mb-4">
                                <div className="p-2 bg-indigo-100 rounded-full mr-3">
                                  <Clock className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-indigo-700">
                                    {format(parseISO(appointment.date), 'MMMM d, yyyy')}
                                  </h3>
                                  <p className="text-indigo-600 font-medium">{appointment.time}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center mb-4">
                                <div className="p-2 bg-indigo-100 rounded-full mr-3">
                                  <FileText className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-indigo-700">Appointment Type</h3>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(appointment.type)}`}>
                                    {appointment.type}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <div className="p-2 bg-indigo-100 rounded-full mr-3">
                                  <AlertCircle className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-indigo-700">Status</h3>
                                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)} flex items-center`}>
                                    {getStatusIcon(appointment.status)}
                                    <span className="ml-1">{appointment.status}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="md:w-2/3 p-6">
                              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="h-5 w-5 mr-2 text-indigo-600" />
                                Patient Information
                              </h3>
                              
                              {patient ? (
                                <div className="space-y-4">
                                  <div className="flex items-start">
                                    <div className="w-1/3 text-gray-500">Name:</div>
                                    <div className="w-2/3 font-medium text-gray-900">{patient.name}</div>
                                  </div>
                                  
                                  <div className="flex items-start">
                                    <div className="w-1/3 text-gray-500">Email:</div>
                                    <div className="w-2/3 font-medium text-gray-900 flex items-center">
                                      <Mail className="h-4 w-4 mr-1 text-gray-400" />
                                      {patient.email}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start">
                                    <div className="w-1/3 text-gray-500">Phone:</div>
                                    <div className="w-2/3 font-medium text-gray-900 flex items-center">
                                      <Phone className="h-4 w-4 mr-1 text-gray-400" />
                                      {patient.phone}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start">
                                    <div className="w-1/3 text-gray-500">Address:</div>
                                    <div className="w-2/3 font-medium text-gray-900 flex items-center">
                                      <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                      {patient.address}
                                    </div>
                                  </div>
                                  
                                  {exam && (
                                    <div className="flex items-start mt-4 pt-4 border-t border-gray-200">
                                      <div className="w-1/3 text-gray-500 flex items-center">
                                        <FileText className="h-4 w-4 mr-1 text-gray-400" />
                                        Exam:
                                      </div>
                                      <div className="w-2/3 font-medium text-gray-900">
                                        {exam.name} ({exam.duration} min)
                                      </div>
                                    </div>
                                  )}
                                  
                                  {doctor && (
                                    <div className="flex items-start">
                                      <div className="w-1/3 text-gray-500 flex items-center">
                                        <Stethoscope className="h-4 w-4 mr-1 text-gray-400" />
                                        Physician:
                                      </div>
                                      <div className="w-2/3 font-medium text-gray-900">
                                        {doctor.prefix} {doctor.name}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {facility && (
                                    <div className="flex items-start">
                                      <div className="w-1/3 text-gray-500 flex items-center">
                                        <Building className="h-4 w-4 mr-1 text-gray-400" />
                                        Facility:
                                      </div>
                                      <div className="w-2/3 font-medium text-gray-900">
                                        {facility.name}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {appointment.notes && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <h4 className="text-sm font-medium text-gray-500 mb-2">Notes:</h4>
                                      <p className="text-gray-700">{appointment.notes}</p>
                                    </div>
                                  )}
              </div>
                              ) : (
                                <div className="text-gray-500 italic">Patient information not available</div>
                              )}
                              
                              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAppointment(appointment)
                    setIsFormOpen(true)
                  }}
                                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(appointment.id)}
                                  className="bg-red-600 hover:bg-red-700"
                >
                  Cancel
                </Button>
              </div>
                            </div>
                          </div>
          </Card>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
} 