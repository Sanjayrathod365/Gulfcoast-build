'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddExamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Injection',
    subExams: [{ name: '', price: '' }]
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index?: number) => {
    const { name, value } = e.target
    
    if (index !== undefined) {
      // Handle sub-exam fields
      const newSubExams = [...formData.subExams]
      newSubExams[index] = {
        ...newSubExams[index],
        [name]: value
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
      subExams: [...prev.subExams, { name: '', price: '' }]
    }))
  }

  const removeSubExam = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subExams: prev.subExams.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subExams: formData.subExams.map(subExam => ({
            ...subExam,
            price: parseFloat(subExam.price)
          }))
        }),
      })

      if (!response.ok) throw new Error('Failed to create exam')

      router.push('/tools/exams')
      router.refresh()
    } catch (error) {
      console.error('Error creating exam:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Exam</h1>
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
              className="px-3 py-1 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add Sub-Exam
            </button>
          </div>

          {formData.subExams.map((subExam, index) => (
            <div key={index} className="p-4 border rounded-lg dark:border-gray-600">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sub-Exam Name/CPT Code *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={subExam.name}
                    onChange={(e) => handleChange(e, index)}
                    required
                    placeholder="e.g., 27096 - SACROILIAC JOINT INJECTION"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price ($) *
                  </label>
                  <div className="flex items-center space-x-2">
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
                    {formData.subExams.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubExam(index)}
                        className="mt-1 p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.push('/tools/exams')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </div>
  )
} 