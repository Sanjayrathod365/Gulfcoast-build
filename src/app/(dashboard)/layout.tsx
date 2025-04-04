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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
                Gulf Coast Medical
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? 'text-indigo-600 font-medium'
                        : 'text-gray-500 hover:text-gray-700',
                      'inline-flex items-center h-16 px-3 text-sm transition-colors'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Menu as="div" className="relative">
                <Menu.Button 
                  className={cn(
                    pathname.startsWith('/tools')
                      ? 'text-indigo-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700',
                    'inline-flex items-center h-16 px-3 text-sm transition-colors'
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
                  <Menu.Items className="absolute right-0 top-full z-50 mt-1 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {toolsNavigation.map((item) => (
                        <Menu.Item key={item.name}>
                          {({ active }) => (
                            <Link
                              href={item.href}
                              className={cn(
                                active ? 'bg-gray-50 text-gray-900' : 'text-gray-700',
                                pathname === item.href ? 'bg-gray-50' : '',
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
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700',
                  'inline-flex items-center h-16 px-3 text-sm transition-colors'
                )}
              >
                Settings
              </Link>
              <Link
                href="/help"
                className={cn(
                  pathname === '/help'
                    ? 'text-indigo-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700',
                  'inline-flex items-center h-16 px-3 text-sm transition-colors'
                )}
              >
                Help
              </Link>
              <div className="px-3">
                <ThemeSwitcher />
              </div>
              <div className="flex items-center space-x-3 border-l pl-3 border-gray-200">
                <span className="text-sm text-gray-700">
                  {session.user?.name || session.user?.email}
                </span>
                <Button
                  variant="outline"
                  onClick={() => logout()}
                  className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50"
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