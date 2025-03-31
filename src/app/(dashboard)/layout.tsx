'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Patients', href: '/patients' },
  { name: 'Appointments', href: '/appointments' },
  { name: 'Cases', href: '/cases' },
  { name: 'Tasks', href: '/tasks' },
  { name: 'Calendar', href: '/calendar' },
  { name: 'Reports', href: '/reports' },
]

const toolsNavigation = [
  { name: 'Doctors', href: '/tools/doctors' },
  { name: 'Attorneys', href: '/tools/attorneys' },
  { name: 'Facilities', href: '/tools/facilities' },
  { name: 'Exams', href: '/tools/exams' },
  { name: 'Payers', href: '/tools/payers' },
  { name: 'Statuses', href: '/tools/statuses' },
  { name: 'Physicians', href: '/tools/physicians' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm fixed w-full z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                Gulf Coast Medical
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? 'border-indigo-500 text-gray-900 dark:text-white'
                        : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
                      'inline-flex items-center h-16 px-3 border-b-2 text-sm font-medium transition-colors'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Menu as="div" className="relative">
                <Menu.Button 
                  className={cn(
                    pathname.startsWith('/tools')
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
                    'inline-flex items-center h-16 px-3 border-b-2 text-sm font-medium transition-colors'
                  )}
                >
                  Admin Tools
                  <ChevronDownIcon className="ml-1 h-4 w-4" aria-hidden="true" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 top-full z-50 mt-1 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {toolsNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={cn(
                                active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300',
                                pathname === item.href ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block px-4 py-2 text-sm transition-colors'
                              )}
                            >
                              {item.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
              <Link
                href="/settings"
                className={cn(
                  pathname === '/settings'
                    ? 'border-indigo-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
                  'inline-flex items-center h-16 px-3 border-b-2 text-sm font-medium transition-colors'
                )}
              >
                Settings
              </Link>
              <Link
                href="/help"
                className={cn(
                  pathname === '/help'
                    ? 'border-indigo-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-white',
                  'inline-flex items-center h-16 px-3 border-b-2 text-sm font-medium transition-colors'
                )}
              >
                Help
              </Link>
              <div className="px-3">
                <ThemeSwitcher />
              </div>
              <div className="flex items-center space-x-3 border-l pl-3 border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="text-sm text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16 pb-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
} 