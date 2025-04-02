'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { use } from 'react'

interface Case {
  id: string
  caseNumber: string
  status: string
  filingDate: string
  notes: string
  patient: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [case_, setCase] = useState<Case | null>(null)
  const [formData, setFormData] = useState({
    caseNumber: '',
    status: '',
    filingDate: '',
    notes: '',
  })

  useEffect(() => {
    fetchCase()
  }, [resolvedParams.id])

  const fetchCase = async () => {
    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch case')
      }
      const data = await response.json()
      setCase(data)
      // Format the date for the input field (YYYY-MM-DD)
      const formattedDate = new Date(data.filingDate).toISOString().split('T')[0]
      setFormData({
        caseNumber: data.caseNumber,
        status: data.status,
        filingDate: formattedDate,
        notes: data.notes,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Convert the date to ISO string for the API
      const formattedDate = new Date(formData.filingDate).toISOString()
      const response = await fetch(`/api/cases/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          filingDate: formattedDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update case')
      }

      router.push('/cases')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this case?')) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete case')
      }

      router.push('/cases')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Case not found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Case Details</h1>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={saving}
        >
          Delete Case
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Patient Information
          </h2>
          <p className="text-gray-600">
            {case_.patient.firstName} {case_.patient.lastName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="caseNumber">Case Number</Label>
            <Input
              id="caseNumber"
              name="caseNumber"
              value={formData.caseNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="filingDate">Filing Date</Label>
            <Input
              id="filingDate"
              name="filingDate"
              type="date"
              value={formData.filingDate}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/cases')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 