'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'
import { useSession } from 'next-auth/react'

// Removed Status interface

interface FormData {
  name: string
  color: string
}

export default function EditStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  // Removed session from useSession destructuring
  const { status: sessionStatus } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    name: '',
    color: '#6B7280' // Default gray color
  })

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (sessionStatus === 'authenticated') {
      fetchStatus()
    }
  }, [sessionStatus, router, resolvedParams.id])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/statuses?id=${resolvedParams.id}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch status')
      }
      const data = await response.json()
      setFormData({
        name: data.name,
        color: data.color || '#6B7280'
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/statuses`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: resolvedParams.id,
          ...formData
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update status')
      }

      router.push('/tools/statuses')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Status</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Color *
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="color"
                id="color"
                name="color"
                required
                value={formData.color}
                onChange={handleChange}
                className="h-10 w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-500">{formData.color}</span>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/tools/statuses')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 