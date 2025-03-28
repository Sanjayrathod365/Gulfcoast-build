'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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