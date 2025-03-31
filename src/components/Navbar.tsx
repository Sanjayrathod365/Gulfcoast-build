"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Patients", href: "/patients" },
  { name: "Tools", href: "/tools" },
  { name: "Calendar", href: "/calendar" },
  { name: "Reports", href: "/reports" },
  { name: "Settings", href: "/settings" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="text-xl font-bold">
          GulfCoast
        </Link>
        <div className="hidden md:flex space-x-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
      </div>
    </nav>
  )
} 