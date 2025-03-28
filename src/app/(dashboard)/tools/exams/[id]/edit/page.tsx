'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

// Common pain management CPT codes and their descriptions
const CPT_CODES = [
  { code: '64483', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); lumbar or sacral, single level' },
  { code: '64484', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); lumbar or sacral, each additional level' },
  { code: '64490', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); cervical or thoracic, single level' },
  { code: '64491', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); cervical or thoracic, each additional level' },
  { code: '64493', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), cervical or thoracic; single level' },
  { code: '64494', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), cervical or thoracic; second level' },
  { code: '64495', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), cervical or thoracic; third and any additional level(s)' },
  { code: '64496', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), lumbar or sacral; single level' },
  { code: '64497', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), lumbar or sacral; second level' },
  { code: '64498', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), lumbar or sacral; third and any additional level(s)' },
  { code: '64633', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); cervical or thoracic, single level' },
  { code: '64634', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); cervical or thoracic, each additional level' },
  { code: '64635', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); lumbar or sacral, single level' },
  { code: '64636', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); lumbar or sacral, each additional level' },
]

// Common pain-related ICD-10 codes
const ICD10_CODES = [
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'M54.6', description: 'Pain in thoracic spine' },
  { code: 'M54.2', description: 'Cervicalgia' },
  { code: 'M54.16', description: 'Radiculopathy, lumbar region' },
  { code: 'M54.15', description: 'Radiculopathy, thoracic region' },
  { code: 'M54.14', description: 'Radiculopathy, cervical region' },
  { code: 'M48.06', description: 'Spinal stenosis, lumbar region' },
  { code: 'M48.05', description: 'Spinal stenosis, thoracic region' },
  { code: 'M48.04', description: 'Spinal stenosis, cervical region' },
  { code: 'M51.16', description: 'Intervertebral disc disorders with radiculopathy, lumbar region' },
  { code: 'M51.15', description: 'Intervertebral disc disorders with radiculopathy, thoracic region' },
  { code: 'M51.14', description: 'Intervertebral disc disorders with radiculopathy, cervical region' },
]

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

export default function EditExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const examId = use(Promise.resolve(params.id))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<Exam>({
    id: '',
    name: '',
    category: '',
    subExams: [],
    status: 'active'
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubExamChange = (index: number, field: keyof SubExam, value: string) => {
    setFormData((prev) => {
      const newSubExams = [...prev.subExams]
      newSubExams[index] = {
        ...newSubExams[index],
        [field]: field === 'price' ? parseFloat(value) : value
      }
      return { ...prev, subExams: newSubExams }
    })
  }

  const addSubExam = () => {
    setFormData((prev) => ({
      ...prev,
      subExams: [...prev.subExams, { name: '', price: 0 }]
    }))
  }

  const removeSubExam = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subExams: prev.subExams.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/exams/${examId}`, {
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
    } catch (error) {
      console.error('Error updating exam:', error)
      setError(error instanceof Error ? error.message : 'Failed to update exam')
    } finally {
      setLoading(false)
    }
  }

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`)
      if (!response.ok) throw new Error('Failed to fetch exam')
      const data = await response.json()
      setFormData(data)
    } catch (error) {
      console.error('Error fetching exam:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch exam')
    }
  }

  useEffect(() => {
    fetchExam()
  }, [examId])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Exam</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Exam Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            <option value="Injection">Injection</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Therapy">Therapy</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Exams
          </label>
          {formData.subExams.map((subExam, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={subExam.name}
                  onChange={(e) => handleSubExamChange(index, 'name', e.target.value)}
                  placeholder="Sub-exam name"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="w-32">
                <input
                  type="number"
                  value={subExam.price}
                  onChange={(e) => handleSubExamChange(index, 'price', e.target.value)}
                  placeholder="Price"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              {formData.subExams.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubExam(index)}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addSubExam}
            className="mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Add Sub-exam
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/tools/exams')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 