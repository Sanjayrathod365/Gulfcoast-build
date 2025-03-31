'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@heroicons/react/24/outline'

interface Task {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Button>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.filter(task => task.status === 'pending').length === 0 ? (
              <p className="text-gray-500">No pending tasks</p>
            ) : (
              <ul className="space-y-2">
                {tasks.filter(task => task.status === 'pending').map(task => (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.filter(task => task.status === 'in_progress').length === 0 ? (
              <p className="text-gray-500">No tasks in progress</p>
            ) : (
              <ul className="space-y-2">
                {tasks.filter(task => task.status === 'in_progress').map(task => (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.filter(task => task.status === 'completed').length === 0 ? (
              <p className="text-gray-500">No completed tasks</p>
            ) : (
              <ul className="space-y-2">
                {tasks.filter(task => task.status === 'completed').map(task => (
                  <li key={task.id} className="p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-500">{task.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 