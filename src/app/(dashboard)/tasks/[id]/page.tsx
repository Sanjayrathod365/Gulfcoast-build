"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, User, Tag, ArrowLeft, Save, Trash2 } from "lucide-react"
import { Task } from "@/types/task"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface User {
  id: string
  name: string
  email: string
}

export default function TaskDetailPage() {
  const router = useRouter()
  const [task, setTask] = useState<Task | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { id } = useParams()

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [taskResponse, usersResponse] = await Promise.all([
        fetch(`/api/tasks/${id}`),
        fetch("/api/users")
      ])

      if (!taskResponse.ok || !usersResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const [taskData, usersData] = await Promise.all([
        taskResponse.json(),
        usersResponse.json()
      ])

      setTask(taskData)
      setUsers(usersData)
    } catch (error) {
      setError("Failed to fetch task details")
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      setTask(updatedTask)
      router.push("/tasks")
    } catch (error) {
      setError("Failed to update task")
      console.error("Error updating task:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      router.push("/tasks")
    } catch (error) {
      setError("Failed to delete task")
      console.error("Error deleting task:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-16 w-16"
        >
          <Loader2 className="h-16 w-16 text-indigo-600" />
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Task not found</div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-indigo-700"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-2xl font-bold text-white"
              >
                Edit Task
              </motion.h1>
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/tasks")}
                  className="inline-flex items-center px-4 py-2 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Tasks
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 bg-red-500/10 text-white border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Task
                </motion.button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="px-8 py-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={task.title}
                    onChange={(e) => setTask({ ...task, title: e.target.value })}
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={task.description}
                    onChange={(e) => setTask({ ...task, description: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={task.status}
                    onValueChange={(value) => setTask({ ...task, status: value })}
                  >
                    <SelectTrigger className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={task.priority}
                    onValueChange={(value) => setTask({ ...task, priority: value })}
                  >
                    <SelectTrigger className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="datetime-local"
                    value={task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : ""}
                    onChange={(e) => setTask({ ...task, dueDate: e.target.value })}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="assignedToId">Assign To</Label>
                  <Select
                    value={task.assignedTo?.id || "unassigned"}
                    onValueChange={(value) => setTask({ ...task, assignedToId: value === "unassigned" ? null : value })}
                  >
                    <SelectTrigger className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors">
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex justify-end gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Task
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
} 