'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar, BarChart2, PieChart, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Report {
  id: string
  title: string
  date: string
  type: 'daily' | 'weekly' | 'monthly'
  status: 'completed' | 'pending'
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Daily Patient Report',
    date: '2024-03-31',
    type: 'daily',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Weekly Revenue Report',
    date: '2024-03-31',
    type: 'weekly',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Monthly Performance Report',
    date: '2024-03-31',
    type: 'monthly',
    status: 'completed',
  },
]

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = (reportId: string) => {
    setDownloading(reportId)
    
    // Simulate download
    setTimeout(() => {
      setDownloading(null)
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    if (status === 'completed') {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
    }
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-5 w-5 text-indigo-500" />
      case 'weekly':
        return <BarChart2 className="h-5 w-5 text-indigo-500" />
      case 'monthly':
        return <PieChart className="h-5 w-5 text-indigo-500" />
      default:
        return <Calendar className="h-5 w-5 text-indigo-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600">View and download your reports</p>
        </motion.div>

        <div className="grid gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <CardTitle>Daily Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {reports
                      .filter((report) => report.type === 'daily')
                      .map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center">
                            <div className="mr-4 p-2 bg-indigo-50 rounded-full">
                              {getReportIcon(report.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{report.title}</h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(report.date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(report.id)}
                              disabled={downloading === report.id}
                              className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloading === report.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2" />
                  <CardTitle>Weekly Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {reports
                      .filter((report) => report.type === 'weekly')
                      .map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center">
                            <div className="mr-4 p-2 bg-indigo-50 rounded-full">
                              {getReportIcon(report.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{report.title}</h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(report.date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(report.id)}
                              disabled={downloading === report.id}
                              className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloading === report.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="overflow-hidden border-0 shadow-lg rounded-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <div className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  <CardTitle>Monthly Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <AnimatePresence>
                    {reports
                      .filter((report) => report.type === 'monthly')
                      .map((report, index) => (
                        <motion.div
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center">
                            <div className="mr-4 p-2 bg-indigo-50 rounded-full">
                              {getReportIcon(report.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{report.title}</h3>
                              <p className="text-sm text-gray-500">
                                {format(new Date(report.date), 'MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                report.status
                              )}`}
                            >
                              {report.status}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownload(report.id)}
                              disabled={downloading === report.id}
                              className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloading === report.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
} 