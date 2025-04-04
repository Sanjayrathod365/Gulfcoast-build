'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg max-w-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white"
              >
                Exams
              </motion.h1>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/tools/exams/add"
                  className="inline-flex items-center px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-indigo-600"
                  role="button"
                  aria-label="Add new exam"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Exam
                </Link>
              </motion.div>
            </div>
          </div>

          <div className="px-8 py-6">
            {(!Array.isArray(exams) || exams.length === 0) ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.svg 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="h-12 w-12 text-gray-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </motion.svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No exams found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new exam.</p>
                <motion.div 
                  className="mt-6"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/tools/exams/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    role="button"
                    aria-label="Add your first exam"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Exam
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {exams.map((exam, index) => (
                  <motion.div
                    key={exam.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {exam.name || 'Unnamed Exam'}
                          </h3>
                          <div className="mt-1 space-x-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {exam.category || 'No Category'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {exam.status || 'No Status'}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                              href={`/tools/exams/${exam.id}/edit`}
                              className="inline-flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
                              role="button"
                              aria-label={`Edit ${exam.name || 'exam'}`}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </Link>
                          </motion.div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(exam.id)}
                            className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded"
                            aria-label={`Delete ${exam.name || 'exam'}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </motion.button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Sub-Exams:</h4>
                        <div className="bg-gray-50 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200" role="table">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Name
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                              {Array.isArray(exam.subExams) && exam.subExams.length > 0 ? (
                                exam.subExams.map((subExam) => (
                                  <motion.tr
                                    key={subExam.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ backgroundColor: 'rgb(249, 250, 251)' }}
                                    className="transition-colors duration-200"
                                  >
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      {subExam.name || 'Unnamed Sub-Exam'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                      ${typeof subExam.price === 'number' ? subExam.price.toFixed(2) : '0.00'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right">
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Link
                                          href={`/tools/exams/${exam.id}/sub-exams/${subExam.id}/edit`}
                                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded"
                                          role="button"
                                          aria-label={`Edit ${subExam.name || 'sub-exam'}`}
                                        >
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          Edit
                                        </Link>
                                      </motion.div>
                                    </td>
                                  </motion.tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-4 py-3 text-sm text-gray-500 text-center">
                                    No sub-exams found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 