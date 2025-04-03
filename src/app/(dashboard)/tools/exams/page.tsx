'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SubExam {
  id: string;
  name: string;
  price: number;
  examId: string;
  createdAt: string;
  updatedAt: string;
}

interface Exam {
  id: string;
  name: string;
  category: string;
  status: string;
  subExams: SubExam[];
  createdAt: string;
  updatedAt: string;
}

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams')
      if (!response.ok) throw new Error('Failed to fetch exams')
      const data = await response.json()
      setExams(data)
    } catch (error) {
      console.error('Error fetching exams:', error)
      setError('Failed to load exams')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return

    try {
      const response = await fetch(`/api/exams?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete exam')

      setExams(exams.filter(exam => exam.id !== id))
    } catch (error) {
      console.error('Error deleting exam:', error)
      alert('Failed to delete exam')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center items-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Exams</h1>
        <Link
          href="/tools/exams/add"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Exam
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.isArray(exams) && exams.map((exam) => (
            <li key={exam.id} className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                      {exam.name || 'Unnamed Exam'}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Category: {exam.category || 'No Category'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status: {exam.status || 'No Status'}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/tools/exams/${exam.id}/edit`}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sub-Exams:</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                      <thead className="bg-gray-100 dark:bg-gray-600">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                        {Array.isArray(exam.subExams) && exam.subExams.map((subExam) => (
                          <tr key={subExam.id}>
                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                              {subExam.name || 'Unnamed Sub-Exam'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                              ${typeof subExam.price === 'number' ? subExam.price.toFixed(2) : '0.00'}
                            </td>
                            <td className="px-4 py-2 text-sm text-right space-x-2">
                              <Link
                                href={`/tools/exams/${exam.id}/sub-exams/${subExam.id}/edit`}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        ))}
                        {(!Array.isArray(exam.subExams) || exam.subExams.length === 0) && (
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                              No sub-exams found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {(!Array.isArray(exams) || exams.length === 0) && (
            <li className="p-4 text-center text-gray-500 dark:text-gray-400">
              No exams found
            </li>
          )}
        </ul>
      </div>
    </div>
  )
} 