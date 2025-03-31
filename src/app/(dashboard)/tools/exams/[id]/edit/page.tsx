'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

// Common pain management CPT codes and their descriptions
const CPT_CODES = [
  // Epidural Injections
  { code: '62320', description: 'Injection(s), of diagnostic or therapeutic substance(s) (including anesthetic, antispasmodic, opioid, steroid, other solution), not including neurolytic substances, including needle or catheter placement, interlaminar epidural or subarachnoid, cervical or thoracic' },
  { code: '62321', description: 'Injection(s), of diagnostic or therapeutic substance(s) (including anesthetic, antispasmodic, opioid, steroid, other solution), not including neurolytic substances, including needle or catheter placement, interlaminar epidural or subarachnoid, lumbar or sacral (caudal)' },
  { code: '62322', description: 'Injection(s), of diagnostic or therapeutic substance(s) (including anesthetic, antispasmodic, opioid, steroid, other solution), not including neurolytic substances, including needle or catheter placement, interlaminar epidural or subarachnoid, lumbar or sacral (caudal); with imaging guidance (i.e., fluoroscopy or CT)' },
  { code: '62323', description: 'Injection(s), of diagnostic or therapeutic substance(s) (including anesthetic, antispasmodic, opioid, steroid, other solution), not including neurolytic substances, including needle or catheter placement, interlaminar epidural or subarachnoid, cervical or thoracic; with imaging guidance (i.e., fluoroscopy or CT)' },
  
  // Transforaminal Epidural Injections
  { code: '64483', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); lumbar or sacral, single level' },
  { code: '64484', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); lumbar or sacral, each additional level' },
  { code: '64490', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); cervical or thoracic, single level' },
  { code: '64491', description: 'Injection, anesthetic agent and/or steroid, transforaminal epidural, with imaging guidance (fluoroscopy or CT); cervical or thoracic, each additional level' },
  
  // Facet Joint Injections
  { code: '64493', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), cervical or thoracic; single level' },
  { code: '64494', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), cervical or thoracic; second level' },
  { code: '64495', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), cervical or thoracic; third and any additional level(s)' },
  { code: '64496', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), lumbar or sacral; single level' },
  { code: '64497', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), lumbar or sacral; second level' },
  { code: '64498', description: 'Injection(s), diagnostic or therapeutic agent(s), paravertebral facet (zygapophyseal) joint (or nerves innervating that joint) with image guidance (fluoroscopy or CT), lumbar or sacral; third and any additional level(s)' },
  
  // Radiofrequency Ablation
  { code: '64633', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); cervical or thoracic, single level' },
  { code: '64634', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); cervical or thoracic, each additional level' },
  { code: '64635', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); lumbar or sacral, single level' },
  { code: '64636', description: 'Destruction by neurolytic agent, paravertebral facet joint nerve(s), with imaging guidance (fluoroscopy or CT); lumbar or sacral, each additional level' },
  
  // Spinal Cord Stimulation
  { code: '63650', description: 'Percutaneous implantation of neurostimulator electrode array, epidural' },
  { code: '63655', description: 'Laminectomy for implantation of neurostimulator electrodes, plate/paddle, epidural' },
  { code: '63685', description: 'Insertion or replacement of spinal neurostimulator pulse generator or receiver, direct or inductive coupling' },
  { code: '63688', description: 'Revision or removal of implanted spinal neurostimulator electrode array' },
  
  // Intrathecal Pump
  { code: '62360', description: 'Implantation or replacement of device for intrathecal or epidural drug infusion; subcutaneous reservoir' },
  { code: '62361', description: 'Implantation or replacement of device for intrathecal or epidural drug infusion; programmable pump' },
  { code: '62362', description: 'Implantation or replacement of device for intrathecal or epidural drug infusion; non-programmable pump' },
  { code: '62367', description: 'Removal of subcutaneous reservoir or pump, previously placed for intrathecal or epidural infusion' },
]

// Common pain-related ICD-10 codes
const ICD10_CODES = [
  // Back Pain
  { code: 'M54.5', description: 'Low back pain' },
  { code: 'M54.6', description: 'Pain in thoracic spine' },
  { code: 'M54.2', description: 'Cervicalgia' },
  { code: 'M54.16', description: 'Radiculopathy, lumbar region' },
  { code: 'M54.15', description: 'Radiculopathy, thoracic region' },
  { code: 'M54.14', description: 'Radiculopathy, cervical region' },
  
  // Spinal Stenosis
  { code: 'M48.06', description: 'Spinal stenosis, lumbar region' },
  { code: 'M48.05', description: 'Spinal stenosis, thoracic region' },
  { code: 'M48.04', description: 'Spinal stenosis, cervical region' },
  
  // Disc Disorders
  { code: 'M51.16', description: 'Intervertebral disc disorders with radiculopathy, lumbar region' },
  { code: 'M51.15', description: 'Intervertebral disc disorders with radiculopathy, thoracic region' },
  { code: 'M51.14', description: 'Intervertebral disc disorders with radiculopathy, cervical region' },
  
  // Facet Joint Disorders
  { code: 'M47.816', description: 'Spondylosis without myelopathy or radiculopathy, lumbar region' },
  { code: 'M47.815', description: 'Spondylosis without myelopathy or radiculopathy, thoracic region' },
  { code: 'M47.814', description: 'Spondylosis without myelopathy or radiculopathy, cervical region' },
  
  // Post-Surgical Pain
  { code: 'M96.1', description: 'Postlaminectomy syndrome, not elsewhere classified' },
  { code: 'M96.2', description: 'Postradiation kyphosis' },
  { code: 'M96.3', description: 'Postlaminectomy kyphosis' },
  
  // Chronic Pain
  { code: 'G89.4', description: 'Chronic pain syndrome' },
  { code: 'F45.41', description: 'Pain disorder exclusively related to psychological factors' },
  { code: 'F45.42', description: 'Pain disorder with related psychological factors' },
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