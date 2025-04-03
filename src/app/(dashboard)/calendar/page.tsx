"use client"

import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parse, setHours, setMinutes, addMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Pencil, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

type ViewType = 'day' | 'week' | 'month';

interface ScheduledProcedure {
  id: string;
  scheduleDate: string;
  scheduleTime: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
  };
  exam: {
    id: string;
    name: string;
  };
  facility: {
    id: string;
    name: string;
  };
  physician: {
    id: string;
    name: string;
  };
  status?: {
    name: string;
    color: string;
  };
}

interface Facility {
  id: string;
  name: string;
}

interface Physician {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
}

interface Exam {
  id: string;
  name: string;
}

interface EditProcedureData {
  id: string;
  patientId: string;
  examId: string;
  facilityId: string;
  physicianId: string;
  scheduleDate: string;
  scheduleTime: string;
  statusId: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledProcedures, setScheduledProcedures] = useState<ScheduledProcedure[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedPhysicians, setSelectedPhysicians] = useState<string[]>([]);
  const [view, setView] = useState<ViewType>('day');
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [editingProcedure, setEditingProcedure] = useState<ScheduledProcedure | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Generate time slots from 7:20 AM to 11:20 PM in 20-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    let currentTime = setMinutes(setHours(new Date(), 7), 20); // Start at 7:20 AM
    const endTime = setMinutes(setHours(new Date(), 23), 20); // End at 11:20 PM

    while (currentTime <= endTime) {
      slots.push(new Date(currentTime));
      currentTime = addMinutes(currentTime, 20);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const fetchScheduledProcedures = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/procedures/scheduled', {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch scheduled procedures');
      }
      const data = await response.json();
      console.log('Fetched procedures:', data);
      
      if (JSON.stringify(data) !== JSON.stringify(scheduledProcedures)) {
        setScheduledProcedures(data);
        console.log('Updated procedures with new data');
      }
    } catch (err) {
      console.error('Error fetching procedures:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRefreshing(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      await fetchScheduledProcedures();
      await Promise.all([
        fetchFacilities(),
        fetchPhysicians(),
        fetchPatients(),
        fetchExams()
      ]);
      setInitialLoading(false);
    };
    
    loadData();
    
    // Set up polling for real-time updates
    const procedureUpdateInterval = setInterval(fetchScheduledProcedures, 5000);
    const dataUpdateInterval = setInterval(async () => {
      await Promise.all([
        fetchFacilities(),
        fetchPhysicians(),
        fetchPatients(),
        fetchExams()
      ]);
    }, 30000);
    
    return () => {
      clearInterval(procedureUpdateInterval);
      clearInterval(dataUpdateInterval);
    };
  }, [currentDate]);

  const fetchFacilities = async () => {
    try {
      const response = await fetch('/api/facilities');
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      const data = await response.json();
      setFacilities(data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
    }
  };

  const fetchPhysicians = async () => {
    try {
      const response = await fetch('/api/physicians');
      if (!response.ok) {
        throw new Error('Failed to fetch physicians');
      }
      const data = await response.json();
      setPhysicians(data);
    } catch (err) {
      console.error('Error fetching physicians:', err);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch('/api/patients');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const data = await response.json();
      setExams(data);
    } catch (err) {
      console.error('Error fetching exams:', err);
    }
  };

  const filteredProcedures = scheduledProcedures.filter(procedure => {
    const matchesFacility = selectedFacility === 'all' || procedure.facility.id === selectedFacility;
    const matchesPhysician = selectedPhysicians.length === 0 || selectedPhysicians.includes(procedure.physician.id);
    return matchesFacility && matchesPhysician;
  });

  const getProceduresForTimeSlot = (date: Date, timeSlot: Date) => {
    // Debug log for input parameters
    console.log('Getting procedures for:', {
      date: format(date, 'yyyy-MM-dd'),
      timeSlot: format(timeSlot, 'HH:mm'),
      totalProcedures: scheduledProcedures.length
    });

    return filteredProcedures
      .filter(procedure => {
        if (!procedure.scheduleDate || !procedure.scheduleTime) {
          console.log('Procedure missing date or time:', procedure);
          return false;
        }

        try {
          // Parse the procedure date
          const procedureDate = parse(procedure.scheduleDate, 'yyyy-MM-dd', new Date());
          
          // Parse the procedure time (handle both HH:mm and HH:mm:ss formats)
          const timeMatch = procedure.scheduleTime.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
          if (!timeMatch) {
            console.error('Invalid time format:', procedure.scheduleTime);
            return false;
          }

          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);

          if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.error('Invalid time values:', { hours, minutes });
            return false;
          }

          // Debug log for each procedure being checked
          console.log('Checking procedure:', {
            id: procedure.id,
            patientName: `${procedure.patient.firstName} ${procedure.patient.lastName}`,
            procedureDate: format(procedureDate, 'yyyy-MM-dd'),
            procedureTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
            currentDate: format(date, 'yyyy-MM-dd'),
            currentTimeSlot: format(timeSlot, 'HH:mm')
          });

          // Check if dates match using string comparison
          const datesMatch = format(procedureDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          
          // Check if time matches (within 20 minutes)
          const slotHours = timeSlot.getHours();
          const slotMinutes = timeSlot.getMinutes();
          
          const procedureTotalMinutes = hours * 60 + minutes;
          const slotTotalMinutes = slotHours * 60 + slotMinutes;
          const diffInMinutes = Math.abs(procedureTotalMinutes - slotTotalMinutes);

          // Debug log for time comparison
          console.log('Time comparison:', {
            procedureTotalMinutes,
            slotTotalMinutes,
            diffInMinutes,
            datesMatch,
            isInTimeSlot: diffInMinutes < 20
          });

          return datesMatch && diffInMinutes < 20;
        } catch (error) {
          console.error('Error processing procedure:', {
            procedureId: procedure.id,
            scheduleDate: procedure.scheduleDate,
            scheduleTime: procedure.scheduleTime,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          return false;
        }
      })
      .sort((a, b) => {
        try {
          // Sort by time (handle both HH:mm and HH:mm:ss formats)
          const getMinutes = (timeStr: string) => {
            const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
            if (!match) return 0;
            return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
          };

          const aMinutes = getMinutes(a.scheduleTime);
          const bMinutes = getMinutes(b.scheduleTime);
          return aMinutes - bMinutes;
        } catch (error) {
          console.error('Error sorting procedures:', error);
          return 0;
        }
      });
  };

  const formatTime = (timeString: string) => {
    try {
      let time;
      if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        time = parse(timeString, 'HH:mm', new Date());
      } else if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        time = parse(timeString, 'HH:mm:ss', new Date());
      } else if (timeString.includes('T')) {
        time = new Date(timeString);
      } else {
        time = new Date(`2000-01-01T${timeString}`);
      }
      
      if (isNaN(time.getTime())) {
        return timeString;
      }
      
      return format(time, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return addDays(prev, direction === 'prev' ? -1 : 1);
        case 'week':
          return addDays(prev, direction === 'prev' ? -7 : 7);
        case 'month':
          return addDays(prev, direction === 'prev' ? -30 : 30);
        default:
          return prev;
      }
    });
  };

  const handleScheduleClick = (timeSlot: Date) => {
    setSelectedTimeSlot(timeSlot);
    setIsScheduleDialogOpen(true);
  };

  const handleScheduleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      const patientId = formData.get('patientId');
      const examId = formData.get('examId');
      const facilityId = formData.get('facilityId');
      const physicianId = formData.get('physicianId');
      const scheduleDate = formData.get('scheduleDate');
      const scheduleTime = formData.get('scheduleTime');

      if (!patientId || !examId || !facilityId || !physicianId || !scheduleDate || !scheduleTime) {
        throw new Error('Please fill in all required fields');
      }

      // Debug log for form submission
      console.log('Submitting procedure:', {
        patientId,
        examId,
        facilityId,
        physicianId,
        scheduleDate,
        scheduleTime
      });

      const scheduleData = {
        patientId: patientId.toString(),
        examId: examId.toString(),
        facilityId: facilityId.toString(),
        physicianId: physicianId.toString(),
        scheduleDate: scheduleDate.toString(),
        scheduleTime: scheduleTime.toString() + ':00', // Add seconds for API format
        statusId: '67ed260cc52a7fd85d24a7a0', // Default status for new procedures
      };

      const response = await fetch('/api/procedures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule procedure');
      }

      const result = await response.json();
      console.log('Procedure scheduled successfully:', result);

      toast({
        title: "Success",
        description: "Procedure scheduled successfully",
      });
      setIsScheduleDialogOpen(false);
      
      // Refresh the procedures immediately and set the current date to the scheduled date
      await fetchScheduledProcedures();
      setCurrentDate(parse(scheduleDate.toString(), 'yyyy-MM-dd', new Date()));
    } catch (error) {
      console.error('Error scheduling procedure:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule procedure",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (procedure: ScheduledProcedure, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProcedure(procedure);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      if (!editingProcedure) {
        throw new Error('No procedure selected for editing');
      }

      const patientId = formData.get('patientId');
      const examId = formData.get('examId');
      const facilityId = formData.get('facilityId');
      const physicianId = formData.get('physicianId');

      if (!patientId || !examId || !facilityId || !physicianId) {
        throw new Error('Please fill in all required fields');
      }

      const editData = {
        patientId: patientId.toString(),
        examId: examId.toString(),
        facilityId: facilityId.toString(),
        physicianId: physicianId.toString(),
        scheduleDate: editingProcedure.scheduleDate,
        scheduleTime: editingProcedure.scheduleTime,
        statusId: '67ed260cc52a7fd85d24a7a0', // Default status
      };

      const response = await fetch(`/api/procedures/${editingProcedure.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update procedure');
      }

      toast({
        title: "Success",
        description: "Procedure updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingProcedure(null);
      fetchScheduledProcedures();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update procedure",
        variant: "destructive",
      });
    }
  };

  const ProcedureCard = ({ procedure }: { procedure: ScheduledProcedure }) => {
    return (
      <div 
        className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 relative group"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => handleEditClick(procedure, e)}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-100 dark:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {procedure.patient.firstName} {procedure.patient.lastName}
          </div>
          <span
            className="px-2 py-1 text-xs rounded-full"
            style={{ 
              backgroundColor: procedure.status?.color + '20' || '#E5E7EB',
              color: procedure.status?.color || '#374151'
            }}
          >
            {procedure.status?.name || 'Pending'}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {procedure.exam.name}
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <div>{procedure.facility.name}</div>
          <div>Dr. {procedure.physician.name}</div>
        </div>
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {refreshing && (
        <div className="fixed top-4 right-4 z-50">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={selectedFacility} onValueChange={setSelectedFacility}>
            <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
              <SelectValue 
                className="text-gray-900 dark:text-gray-100" 
                placeholder="Select Facility" 
              />
            </SelectTrigger>
            <SelectContent 
              className="w-[200px] p-0 bg-white dark:bg-gray-800"
              position="popper"
              sideOffset={5}
            >
              <div className="py-2">
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedFacility('all');
                  }}
                >
                  <div className="flex items-center flex-1 space-x-3">
                    <div className={`
                      w-4 h-4 border-2 rounded flex items-center justify-center
                      ${selectedFacility === 'all'
                        ? 'bg-primary border-primary'
                        : 'border-gray-400 dark:border-gray-500'}
                    `}>
                      {selectedFacility === 'all' && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      All Facilities
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                {facilities.map((facility) => (
                  <div
                    key={facility.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedFacility(facility.id);
                    }}
                  >
                    <div className="flex items-center flex-1 space-x-3">
                      <div className={`
                        w-4 h-4 border-2 rounded flex items-center justify-center
                        ${selectedFacility === facility.id
                          ? 'bg-primary border-primary'
                          : 'border-gray-400 dark:border-gray-500'}
                      `}>
                        {selectedFacility === facility.id && (
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {facility.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SelectContent>
          </Select>

          <Select
            value="physicians"
            onValueChange={() => {}}
          >
            <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
              <SelectValue 
                className="text-gray-900 dark:text-gray-100"
                placeholder={
                  selectedPhysicians.length === 0
                    ? "Select Physicians"
                    : `${selectedPhysicians.length} selected`
                } 
              />
            </SelectTrigger>
            <SelectContent className="w-[200px] p-0 bg-white dark:bg-gray-800">
              <div className="py-2">
                <div 
                  className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    if (selectedPhysicians.length === physicians.length) {
                      setSelectedPhysicians([]);
                    } else {
                      setSelectedPhysicians(physicians.map(p => p.id));
                    }
                  }}
                >
                  <div className="flex items-center flex-1 space-x-3">
                    <div className={`
                      w-4 h-4 border-2 rounded flex items-center justify-center
                      ${selectedPhysicians.length === physicians.length
                        ? 'bg-primary border-primary'
                        : 'border-gray-400 dark:border-gray-500'}
                    `}>
                      {selectedPhysicians.length === physicians.length && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Select All
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
                {physicians.map((physician) => (
                  <div
                    key={physician.id}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedPhysicians(prev =>
                        prev.includes(physician.id)
                          ? prev.filter(id => id !== physician.id)
                          : [...prev, physician.id]
                      );
                    }}
                  >
                    <div className="flex items-center flex-1 space-x-3">
                      <div className={`
                        w-4 h-4 border-2 rounded flex items-center justify-center
                        ${selectedPhysicians.includes(physician.id)
                          ? 'bg-primary border-primary'
                          : 'border-gray-400 dark:border-gray-500'}
                      `}>
                        {selectedPhysicians.includes(physician.id) && (
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {physician.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 text-sm font-medium border ${
                view === 'month' ? 'bg-primary text-white' : 'bg-white text-gray-700'
              } border-gray-300 rounded-l-md hover:bg-gray-50`}
            >
              Month
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                view === 'week' ? 'bg-primary text-white' : 'bg-white text-gray-700'
              } border-gray-300 hover:bg-gray-50`}
            >
              Week
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 text-sm font-medium border ${
                view === 'day' ? 'bg-primary text-white' : 'bg-white text-gray-700'
              } border-gray-300 rounded-r-md hover:bg-gray-50`}
            >
              Day
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="text-lg font-semibold">
              {format(currentDate, 'MMMM d, yyyy')}
            </span>
            <button
              onClick={() => navigate('next')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {view === 'day' && (
        <div className="border dark:border-gray-700 rounded-lg">
          <div className="grid grid-cols-[100px_1fr] divide-x divide-gray-200 dark:divide-gray-700">
            <div className="font-semibold p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              Time
            </div>
            <div className="font-semibold p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
              {format(currentDate, 'EEEE, MMMM d')}
            </div>
          </div>
          {timeSlots.map((timeSlot) => {
            const slotProcedures = getProceduresForTimeSlot(currentDate, timeSlot);

            return (
              <div 
                key={timeSlot.toISOString()} 
                className="grid grid-cols-[100px_1fr] divide-x divide-gray-200 dark:divide-gray-700 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => handleScheduleClick(timeSlot)}
              >
                <div className="p-4 text-gray-500 dark:text-gray-400">
                  {format(timeSlot, 'h:mm a')}
                </div>
                <div className="p-4 min-h-[100px] space-y-2">
                  {slotProcedures.map((procedure) => (
                    <ProcedureCard key={procedure.id} procedure={procedure} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'week' && (
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`border rounded-lg p-4 ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-sm text-gray-500">
                  {format(day, 'EEE')}
                </div>
                <div className="text-lg font-semibold">
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-2">
                {getProceduresForTimeSlot(day, new Date()).map((procedure) => (
                  <div
                    key={procedure.id}
                    className="bg-white p-2 rounded border text-sm"
                  >
                    <div className="font-medium">
                      {formatTime(procedure.scheduleTime)}
                    </div>
                    <div className="text-gray-600">
                      {procedure.patient.firstName} {procedure.patient.lastName}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {procedure.exam.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {procedure.facility.name}
                    </div>
                    <div className="text-gray-500 text-xs">
                      Dr. {procedure.physician.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'month' && (
        <div className="grid grid-cols-7 gap-4">
          {/* Month view implementation will go here */}
          <div className="col-span-7 text-center text-gray-500">
            Month view coming soon...
          </div>
        </div>
      )}

      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule Procedure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient</Label>
              <Select name="patientId">
                <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                  <SelectValue className="text-gray-900 dark:text-gray-100" placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 z-50"
                  position="popper"
                  sideOffset={5}
                >
                  {patients.map((patient) => (
                    <SelectItem 
                      key={patient.id} 
                      value={patient.id}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="examId">Exam</Label>
              <Select name="examId">
                <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                  <SelectValue className="text-gray-900 dark:text-gray-100" placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 z-50"
                  position="popper"
                  sideOffset={5}
                >
                  {exams.map((exam) => (
                    <SelectItem 
                      key={exam.id} 
                      value={exam.id}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facilityId">Facility</Label>
              <Select name="facilityId">
                <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                  <SelectValue className="text-gray-900 dark:text-gray-100" placeholder="Select Facility" />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 z-50"
                  position="popper"
                  sideOffset={5}
                >
                  {facilities.map((facility) => (
                    <SelectItem 
                      key={facility.id} 
                      value={facility.id}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="physicianId">Physician</Label>
              <Select name="physicianId">
                <SelectTrigger className="w-full bg-white dark:bg-gray-800">
                  <SelectValue className="text-gray-900 dark:text-gray-100" placeholder="Select Physician" />
                </SelectTrigger>
                <SelectContent 
                  className="max-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 z-50"
                  position="popper"
                  sideOffset={5}
                >
                  {physicians.map((physician) => (
                    <SelectItem 
                      key={physician.id} 
                      value={physician.id}
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      {physician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleDate">Date</Label>
              <Input
                type="date"
                id="scheduleDate"
                name="scheduleDate"
                defaultValue={selectedTimeSlot ? format(selectedTimeSlot, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                className="w-full bg-white dark:bg-gray-800"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Time</Label>
              <Input
                type="time"
                id="scheduleTime"
                name="scheduleTime"
                defaultValue={selectedTimeSlot ? format(selectedTimeSlot, 'HH:mm') : '07:20'}
                min="07:20"
                max="23:20"
                step="1200"
                className="w-full bg-white dark:bg-gray-800"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsScheduleDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Procedure</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patientId">Patient</Label>
              <Select name="patientId" defaultValue={editingProcedure?.patient?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="examId">Exam</Label>
              <Select name="examId" defaultValue={editingProcedure?.exam?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="facilityId">Facility</Label>
              <Select name="facilityId" defaultValue={editingProcedure?.facility?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Facility" />
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

            <div>
              <Label htmlFor="physicianId">Physician</Label>
              <Select name="physicianId" defaultValue={editingProcedure?.physician?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Physician" />
                </SelectTrigger>
                <SelectContent>
                  {physicians.map((physician) => (
                    <SelectItem key={physician.id} value={physician.id}>
                      {physician.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingProcedure(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 