'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface SubExam {
  id?: string
  name: string
  price: number
}

interface Exam {
  id: string
  name: string
  category: string
  subExams: SubExam[]
  status: string
}

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Exam>({
    id: '',
    name: '',
    category: 'Injection',
    subExams: [],
    status: 'active'
  })

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch exam')
        }
        const data = await response.json()
        setFormData({
          ...data,
          subExams: data.subExams || []
        })
      } catch (err) {
        setError('Failed to load exam data')
        console.error('Error fetching exam:', err)
      }
    }

    fetchExam()
  }, [resolvedParams.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
    const { name, value } = e.target
    
    if (index !== undefined) {
      // Handle sub-exam fields
      const newSubExams = [...formData.subExams]
      newSubExams[index] = {
        ...newSubExams[index],
        [name]: name === 'price' ? parseFloat(value) : value
      }
      setFormData(prev => ({
        ...prev,
        subExams: newSubExams
      }))
    } else {
      // Handle main exam fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const addSubExam = () => {
    setFormData(prev => ({
      ...prev,
      subExams: [...prev.subExams, { name: '', price: 0 }]
    }))
  }

  const removeSubExam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subExams: prev.subExams.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/exams/${resolvedParams.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update exam')
      }

      router.push('/tools/exams')
      router.refresh()
    } catch (err) {
      setError('Failed to update exam')
      console.error('Error updating exam:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4">Loading...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Exam</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Exam Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
            >
              <option value="Injection">Injection</option>
              <option value="Consultation">Consultation</option>
              <option value="Procedure">Procedure</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Sub-Exams</h2>
            <button
              type="button"
              onClick={addSubExam}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add Sub-Exam
            </button>
          </div>

          {formData.subExams.map((subExam, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sub-Exam Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={subExam.name}
                  onChange={(e) => handleChange(e, index)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Price *
                </label>
                <input
                  type="number"
                  name="price"
                  value={subExam.price}
                  onChange={(e) => handleChange(e, index)}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                />
              </div>
              {formData.subExams.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubExam(index)}
                  className="col-span-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Remove Sub-Exam
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => router.push('/tools/exams')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
} 