'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useApi } from '@/hooks/use-api'

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">System Monitoring</h1>
        <Button onClick={clearData} variant="destructive">
          Clear Data
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Metrics: {data?.metrics.total || 0}</p>
              <div>
                <h3 className="font-semibold mb-2">By Name:</h3>
                <ul className="list-disc list-inside">
                  {Object.entries(data?.metrics.byName || {}).map(([name, count]) => (
                    <li key={name}>
                      {name}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Errors: {data?.errors.total || 0}</p>
              <div>
                <h3 className="font-semibold mb-2">By Name:</h3>
                <ul className="list-disc list-inside">
                  {Array.from(data?.errors.byName.entries() || []).map(([name, count]) => (
                    <li key={name}>
                      {name}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Total Requests: {data?.requests.total || 0}</p>
              <div>
                <h3 className="font-semibold mb-2">By Endpoint:</h3>
                <ul className="list-disc list-inside">
                  {Object.entries(data?.requests.byEndpoint || {}).map(([endpoint, count]) => (
                    <li key={endpoint}>
                      {endpoint}: {count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 