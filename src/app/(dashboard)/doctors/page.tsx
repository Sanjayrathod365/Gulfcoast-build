'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { useDoctor } from '@/hooks/use-doctor'
import { Doctor } from '@/types/doctor'
import { DoctorForm } from '@/components/doctors/DoctorForm'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const { loading, getDoctors, createDoctor, updateDoctor, deleteDoctor } = useDoctor()

  const fetchDoctors = async () => {
    const result = await getDoctors()
    if (result?.data) {
      setDoctors(result.data)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleSubmit = async (data: Omit<Doctor, 'id'> | Partial<Doctor>) => {
    if (selectedDoctor) {
      const result = await updateDoctor(selectedDoctor.id, data as Partial<Doctor>)
      if (result?.success) {
        fetchDoctors()
        setIsFormOpen(false)
        setSelectedDoctor(null)
      }
    } else {
      const result = await createDoctor(data as Omit<Doctor, 'id'>)
      if (result?.success) {
        fetchDoctors()
        setIsFormOpen(false)
      }
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteDoctor(id)
    if (result?.success) {
      fetchDoctors()
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
        <h1 className="text-3xl font-bold">Doctors</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Doctor
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{selectedDoctor ? 'Edit Doctor' : 'Add Doctor'}</CardTitle>
          </CardHeader>
          <CardContent>
            <DoctorForm
              doctor={selectedDoctor}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false)
                setSelectedDoctor(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle>{doctor.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Email:</strong> {doctor.email}</p>
                <p><strong>Phone:</strong> {doctor.phone}</p>
                <p><strong>Specialization:</strong> {doctor.specialization}</p>
                <p><strong>Status:</strong> {doctor.status}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDoctor(doctor)
                    setIsFormOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(doctor.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 