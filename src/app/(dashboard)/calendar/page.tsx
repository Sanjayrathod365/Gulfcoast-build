"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useForm } from "react-hook-form"

interface Event {
  id: string
  title: string
  start: Date
  end: Date
  description?: string
  type?: string
  assignedToId?: string
  examTypeId?: string
  patientId?: string
  facilityId?: string
  status: string
  examType?: {
    id: string
    name: string
    duration: number
  }
  patient?: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  facility?: {
    id: string
    name: string
  }
}

interface User {
  id: string
  name: string
  email: string
}

interface ExamType {
  id: string
  name: string
  duration: number
}

interface Facility {
  id: string
  name: string
}

interface Patient {
  id: string
  firstName: string
  lastName: string
  examTypeId?: string
  examName?: string
  status: 'scheduled' | 'ready_to_schedule'
  scheduledDate?: Date
}

interface EventDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedEvent?: Event
  selectedRange?: { start: Date; end: Date }
  onSubmit: (data: EventFormData) => void
}

interface EventFormData {
  patientId: string
  examTypeId: string
  facilityId: string
  description: string
  start: Date
  end: Date
}

export default function CalendarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ start: Date; end: Date } | undefined>(undefined)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [eventsResponse, usersResponse, examTypesResponse, patientsResponse, facilitiesResponse] = await Promise.all([
        fetch("/api/events"),
        fetch("/api/users"),
        fetch("/api/exam-types"),
        fetch("/api/patients"),
        fetch("/api/facilities")
      ])

      if (!eventsResponse.ok || !usersResponse.ok || !examTypesResponse.ok || !patientsResponse.ok || !facilitiesResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [eventsData, usersData, examTypesData, patientsData, facilitiesData] = await Promise.all([
        eventsResponse.json(),
        usersResponse.json(),
        examTypesResponse.json(),
        patientsResponse.json(),
        facilitiesResponse.json()
      ])

      setEvents(eventsData.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      })))
      setUsers(usersData)
      setExamTypes(examTypesData)
      setPatients(patientsData)
      setFacilities(facilitiesData)
    } catch (error) {
      setError("Failed to fetch calendar data")
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch calendar data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (selectInfo: any) => {
    setSelectedEvent(undefined)
    setSelectedRange({ start: selectInfo.start, end: selectInfo.end })
    setIsDialogOpen(true)
  }

  const handleEventClick = (clickInfo: any) => {
    const event = events.find(e => e.id === clickInfo.event.id)
    if (event) {
      setSelectedEvent(event)
      setSelectedRange({ start: event.start, end: event.end })
      setIsDialogOpen(true)
    }
  }

  const handleSubmit = async (data: EventFormData) => {
    setLoading(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save event")
      }

      const savedEvent = await response.json()
      setEvents([...events, savedEvent])
      setIsDialogOpen(false)
      setSelectedEvent(undefined)
      setSelectedRange(undefined)
      toast({
        title: "Success",
        description: "Event scheduled successfully",
      })
    } catch (error) {
      setError("Failed to save event")
      console.error("Error saving event:", error)
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedEvent) return

    if (!confirm("Are you sure you want to delete this event?")) return

    setLoading(true)
    try {
      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete event")
      }

      setEvents(events.filter(event => event.id !== selectedEvent.id))
      setIsDialogOpen(false)
      setSelectedEvent(undefined)
      setSelectedRange(undefined)
      toast({
        title: "Success",
        description: "Event deleted successfully",
      })
    } catch (error) {
      setError("Failed to delete event")
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exam Schedule</h1>
        <Button onClick={() => {
          setSelectedEvent(undefined)
          setSelectedRange(undefined)
          setIsDialogOpen(true)
        }}>
          Schedule Exam
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      <EventDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setSelectedEvent(undefined)
          setSelectedRange(undefined)
        }}
        selectedEvent={selectedEvent}
        selectedRange={selectedRange}
        examTypes={examTypes}
        patients={patients.filter(p => p.status === 'ready_to_schedule')}
        facilities={facilities}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

function EventDialog({ 
  isOpen, 
  onClose, 
  selectedEvent, 
  selectedRange, 
  onSubmit,
  examTypes,
  patients,
  facilities
}: EventDialogProps & { 
  examTypes: ExamType[]
  patients: Patient[]
  facilities: Facility[]
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(undefined)

  const form = useForm<EventFormData>({
    defaultValues: {
      examTypeId: selectedEvent?.examTypeId || selectedPatient?.examTypeId || "",
      patientId: selectedEvent?.patientId || "",
      facilityId: selectedEvent?.facilityId || "",
      description: selectedEvent?.description || "",
      start: selectedEvent?.start || selectedRange?.start || new Date(),
      end: selectedEvent?.end || selectedRange?.end || new Date(),
    }
  })

  const updateEndTime = (startDate: Date, examId: string) => {
    const examType = examTypes.find(et => et.id === examId)
    if (examType) {
      const endDate = new Date(startDate)
      endDate.setMinutes(endDate.getMinutes() + examType.duration)
      form.setValue("end", endDate)
    }
  }

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatient(patient)
    form.setValue("patientId", patientId)
    
    if (patient?.examTypeId) {
      form.setValue("examTypeId", patient.examTypeId)
      updateEndTime(form.getValues("start"), patient.examTypeId)
    }
  }

  const handleExamChange = (examId: string) => {
    form.setValue("examTypeId", examId)
    updateEndTime(form.getValues("start"), examId)
  }

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value)
    form.setValue("start", startDate)
    const examId = form.getValues("examTypeId")
    if (examId) {
      updateEndTime(startDate, examId)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Patient Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                {...form.register("patientId", { required: true })}
                onValueChange={handlePatientChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {`${patient.lastName}, ${patient.firstName}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="exam">Exam Type</Label>
              <Select
                {...form.register("examTypeId", { required: true })}
                onValueChange={handleExamChange}
                value={form.getValues("examTypeId")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select exam type" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map((examType) => (
                    <SelectItem key={examType.id} value={examType.id}>
                      {examType.name} ({examType.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="facility">Facility</Label>
              <Select
                {...form.register("facilityId", { required: true })}
                onValueChange={(value) => form.setValue("facilityId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dateTime">Date and Time</Label>
              <Input
                type="datetime-local"
                {...form.register("start", { required: true })}
                onChange={handleDateTimeChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Notes</Label>
              <Textarea
                {...form.register("description")}
                placeholder="Add any additional notes..."
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 