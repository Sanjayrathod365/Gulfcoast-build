'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'

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
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports
                .filter((report) => report.type === 'daily')
                .map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.date}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {report.status}
                      </span>
                      <Button variant="outline" size="icon">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports
                .filter((report) => report.type === 'weekly')
                .map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.date}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {report.status}
                      </span>
                      <Button variant="outline" size="icon">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports
                .filter((report) => report.type === 'monthly')
                .map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{report.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {report.date}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          report.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        }`}
                      >
                        {report.status}
                      </span>
                      <Button variant="outline" size="icon">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 