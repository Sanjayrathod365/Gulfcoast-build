'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle, Activity, Server } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { motion } from 'framer-motion'

interface MonitoringData {
  timestamp: string
  metrics: {
    total: number
    byName: Record<string, number>
  }
  errors: {
    total: number
    byName: Map<string, number>
  }
  requests: {
    total: number
    byEndpoint: Record<string, number>
  }
}

export default function MonitoringPage() {
  const [data, setData] = useState<MonitoringData | null>(null)
  const { loading, callApi } = useApi<MonitoringData>({
    successMessage: 'Monitoring data fetched successfully',
    errorMessage: 'Failed to fetch monitoring data',
  })

  const fetchData = async () => {
    const result = await callApi('/api/monitoring')
    if (result?.data) {
      setData(result.data)
    }
  }

  const clearData = async () => {
    const result = await callApi('/api/monitoring', 'DELETE', undefined, {
      successMessage: 'Monitoring data cleared successfully',
      errorMessage: 'Failed to clear monitoring data',
    })
    if (result?.success) {
      fetchData()
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden p-6"
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-gray-900"
            >
              System Monitoring
            </motion.h1>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={clearData} 
                variant="destructive"
                className="flex items-center gap-2"
                aria-label="Clear monitoring data"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Data
              </Button>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <CardTitle>Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Total Metrics:</p>
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-indigo-600"
                      >
                        {data?.metrics.total || 0}
                      </motion.span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">By Name:</h3>
                      <ul className="space-y-2">
                        {Object.entries(data?.metrics.byName || {}).map(([name, count], index) => (
                          <motion.li 
                            key={name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50"
                          >
                            <span className="text-gray-600">{name}</span>
                            <span className="font-medium text-indigo-600">{count}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    <CardTitle>Errors</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Total Errors:</p>
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-red-600"
                      >
                        {data?.errors.total || 0}
                      </motion.span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">By Name:</h3>
                      <ul className="space-y-2">
                        {Array.from(data?.errors.byName.entries() || []).map(([name, count], index) => (
                          <motion.li 
                            key={name}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50"
                          >
                            <span className="text-gray-600">{name}</span>
                            <span className="font-medium text-red-600">{count}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    <CardTitle>Requests</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Total Requests:</p>
                      <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl font-bold text-green-600"
                      >
                        {data?.requests.total || 0}
                      </motion.span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">By Endpoint:</h3>
                      <ul className="space-y-2">
                        {Object.entries(data?.requests.byEndpoint || {}).map(([endpoint, count], index) => (
                          <motion.li 
                            key={endpoint}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex justify-between items-center p-2 rounded-md hover:bg-gray-50"
                          >
                            <span className="text-gray-600 truncate max-w-[70%]">{endpoint}</span>
                            <span className="font-medium text-green-600">{count}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 