'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'

const helpTopics = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using the Gulf Coast Medical system.',
    items: [
      'How to navigate the dashboard',
      'Setting up your profile',
      'Understanding the main features',
    ],
  },
  {
    title: 'Patient Management',
    description: 'Everything you need to know about managing patients.',
    items: [
      'Adding new patients',
      'Updating patient information',
      'Managing patient records',
    ],
  },
  {
    title: 'Appointments',
    description: 'Learn how to manage appointments effectively.',
    items: [
      'Scheduling appointments',
      'Managing the calendar',
      'Handling cancellations',
    ],
  },
  {
    title: 'Cases',
    description: 'Understanding case management in the system.',
    items: [
      'Creating new cases',
      'Tracking case progress',
      'Managing case documents',
    ],
  },
  {
    title: 'Reports',
    description: 'Generate and understand various reports.',
    items: [
      'Creating custom reports',
      'Understanding report types',
      'Exporting report data',
    ],
  },
  {
    title: 'Settings',
    description: 'Configure your system preferences.',
    items: [
      'Account settings',
      'Notification preferences',
      'System configuration',
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <QuestionMarkCircleIcon className="h-8 w-8 text-gray-500 mr-2" />
        <h1 className="text-3xl font-bold">Help Center</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {helpTopics.map((topic) => (
          <Card key={topic.title}>
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{topic.description}</p>
              <ul className="space-y-2">
                {topic.items.map((item) => (
                  <li key={item} className="flex items-center text-sm">
                    <span className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="ghost" className="mt-4">
                Learn More
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 mb-4">
              If you need additional assistance, please contact our support team.
            </p>
            <Button>Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 