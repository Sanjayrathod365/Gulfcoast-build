'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Settings {
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    showEmail: boolean
    showPhone: boolean
  }
  theme: 'light' | 'dark' | 'system'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      showEmail: true,
      showPhone: false,
    },
    theme: 'system',
  })

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', settings)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked: boolean) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      email: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive push notifications</p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked: boolean) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      push: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via SMS</p>
              </div>
              <Switch
                id="sms-notifications"
                checked={settings.notifications.sms}
                onCheckedChange={(checked: boolean) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      sms: checked,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-email">Show Email Address</Label>
                <p className="text-sm text-gray-500">Display your email address to other users</p>
              </div>
              <Switch
                id="show-email"
                checked={settings.privacy.showEmail}
                onCheckedChange={(checked: boolean) =>
                  setSettings({
                    ...settings,
                    privacy: {
                      ...settings.privacy,
                      showEmail: checked,
                    },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-phone">Show Phone Number</Label>
                <p className="text-sm text-gray-500">Display your phone number to other users</p>
              </div>
              <Switch
                id="show-phone"
                checked={settings.privacy.showPhone}
                onCheckedChange={(checked: boolean) =>
                  setSettings({
                    ...settings,
                    privacy: {
                      ...settings.privacy,
                      showPhone: checked,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      theme: e.target.value as 'light' | 'dark' | 'system',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
} 