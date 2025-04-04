import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select'
import { Appointment } from '@/types/appointment'
import { Patient } from '@/types/patient'
import { Doctor } from '@/types/doctor'
import { Exam } from '@/types'
import { useEffect, useState } from 'react'
import { usePatient } from '@/hooks/use-patient'
import { useDoctor } from '@/hooks/use-doctor'
import { Textarea } from '@/components/ui/textarea'
import { Phone, Mail, MapPin } from 'lucide-react'

const appointmentSchema = z.object({
  patientId: z.string().refine(value => {
    return value !== 'loading' && value !== 'error' && value !== 'empty'
  }, 'Please select a valid patient'),
  doctorId: z.string().refine(value => {
    return value !== 'loading' && value !== 'error' && value !== 'empty'
  }, 'Please select a valid doctor'),
  examId: z.string().refine(value => {
    return value !== 'loading' && value !== 'error' && value !== 'no-patient' && value !== 'no-exams'
  }, 'Please select a valid exam type'),
  date: z.string().refine((date) => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  }, 'Invalid date'),
  time: z.string().min(1, 'Time is required'),
  type: z.enum(['checkup', 'consultation', 'follow-up', 'emergency']),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']),
  notes: z.string().optional(),
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentFormProps {
  appointment?: Appointment | null
  onSubmit: (data: Omit<Appointment, 'id'> | Partial<Appointment>) => void
  onCancel: () => void
  patients: Patient[]
  allExams: Exam[]
}

export function AppointmentForm({ appointment, onSubmit, onCancel, patients, allExams }: AppointmentFormProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredExams, setFilteredExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { getPatients } = usePatient()
  const { getDoctors } = useDoctor()
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // For testing, use mock data
        // In production, uncomment the API calls
        // const patientsResult = await getPatients()
        // const doctorsResult = await getDoctors()
        // const examsResponse = await fetch('/api/exams')
        // const examsData = await examsResponse.json()
        // if (patientsResult?.data) {
        //   setPatients(patientsResult.data)
        // }
        // if (doctorsResult?.data) {
        //   setDoctors(doctorsResult.data)
        // }
        // if (examsData) {
        //   setAllExams(examsData)
        // }
        
        // Mock data for testing
        // setPatients(mockPatients)
        // setDoctors(mockDoctors)
        // setAllExams(mockExams)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [getPatients, getDoctors])

  // Fetch doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/doctors')
        if (!response.ok) {
          throw new Error('Failed to fetch doctors')
        }
        const data = await response.json()
        setDoctors(data)
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    fetchDoctors()
  }, [])

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: appointment ? {
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      examId: appointment.examId,
      date: appointment.date,
      time: appointment.time,
      type: appointment.type,
      status: appointment.status,
      notes: appointment.notes || '',
    } : {
      patientId: 'empty',
      doctorId: 'empty',
      examId: 'no-patient',
      date: '',
      time: '',
      type: 'checkup',
      status: 'scheduled',
      notes: '',
    },
  })

  const selectedPatientId = form.watch('patientId')

  // Update filtered exams when the selected patient changes
  useEffect(() => {
    console.log('useEffect triggered with selectedPatientId:', selectedPatientId)
    
    if (!selectedPatientId || 
        selectedPatientId === 'loading' || 
        selectedPatientId === 'error' || 
        selectedPatientId === 'empty') {
      console.log('Clearing filtered exams due to invalid selectedPatientId')
      setFilteredExams([])
      return
    }

    // Fetch procedures for the selected patient
    const fetchPatientProcedures = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/procedures?patientId=${selectedPatientId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch procedures')
        }
        const procedures = await response.json()
        console.log('Fetched procedures:', procedures)

        // Extract unique exams from procedures
        const uniqueExams = procedures.reduce((exams: Exam[], procedure: any) => {
          if (procedure.exam && !exams.some(e => e.id === procedure.exam.id)) {
            exams.push(procedure.exam)
          }
          return exams
        }, [])

        console.log('Unique exams from procedures:', uniqueExams)
        setFilteredExams(uniqueExams)
      } catch (err) {
        console.error('Error fetching procedures:', err)
        setError('Failed to load procedures')
      } finally {
        setLoading(false)
      }
    }

    fetchPatientProcedures()
  }, [selectedPatientId])

  const handleSubmit = (data: AppointmentFormData) => {
    onSubmit({
      ...data,
      date: new Date(data.date).toISOString(),
      createdAt: appointment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(appointment?.id && { id: appointment.id }),
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Patient</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                  ) : error ? (
                    <SelectItem value="error" disabled>Error loading patients</SelectItem>
                  ) : patients.length === 0 ? (
                    <SelectItem value="empty" disabled>No patients available</SelectItem>
                  ) : (
                    patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                  ) : error ? (
                    <SelectItem value="error" disabled>Error loading doctors</SelectItem>
                  ) : doctors.length === 0 ? (
                    <SelectItem value="empty" disabled>No doctors available</SelectItem>
                  ) : (
                    doctors.map((doctor) => (
                      <SelectGroup key={doctor.id}>
                        <SelectItem value={doctor.id}>
                          {doctor.prefix} {doctor.name}
                        </SelectItem>
                        <div className="px-2 py-1 space-x-2">
                          {doctor.phoneNumber && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={(e) => {
                                e.preventDefault()
                                window.location.href = `tel:${doctor.phoneNumber}`
                              }}
                            >
                              <Phone className="h-4 w-4 mr-1" />
                              Call
                            </Button>
                          )}
                          {doctor.email && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={(e) => {
                                e.preventDefault()
                                window.location.href = `mailto:${doctor.email}`
                              }}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          )}
                          {doctor.mapLink && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={(e) => {
                                e.preventDefault()
                                window.open(doctor.mapLink, '_blank')
                              }}
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              Map
                            </Button>
                          )}
                        </div>
                      </SelectGroup>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="examId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exam Type</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!selectedPatientId || selectedPatientId === 'loading' || selectedPatientId === 'error' || selectedPatientId === 'empty'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={selectedPatientId && !(selectedPatientId === 'loading' || selectedPatientId === 'error' || selectedPatientId === 'empty') ? "Select an exam type" : "Select a patient first"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="loading" disabled>Loading exams...</SelectItem>
                  ) : error ? (
                    <SelectItem value="error" disabled>Error loading exams</SelectItem>
                  ) : !selectedPatientId || selectedPatientId === 'loading' || selectedPatientId === 'error' || selectedPatientId === 'empty' ? (
                    <SelectItem value="no-patient" disabled>Select a patient first</SelectItem>
                  ) : filteredExams.length === 0 ? (
                    <SelectItem value="no-exams" disabled>No exams available for this patient</SelectItem>
                  ) : (
                    filteredExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time</FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="checkup">Checkup</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select appointment status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {appointment ? 'Update' : 'Create'} Appointment
          </Button>
        </div>
      </form>
    </Form>
  )
} 