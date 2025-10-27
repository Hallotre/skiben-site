'use client'

import { ReactNode, useState } from 'react'
import { usePathname } from 'next/navigation'

interface DashboardNavItem {
  id: string
  label: string
  icon: string
  path: string
  description: string
}

const navItems: DashboardNavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: '📊',
    path: '/moderation',
    description: 'Dashboard statistics and overview'
  },
  {
    id: 'contests',
    label: 'Contests',
    icon: '🎯',
    path: '/moderation/contests',
    description: 'Create and manage contests'
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: '📹',
    path: '/moderation/submissions',
    description: 'Review and moderate video submissions'
  },
  {
    id: 'winners',
    label: 'Winners',
    icon: '🏆',
    path: '/moderation/winners',
    description: 'View and manage winner submissions'
  },
  {
    id: 'users',
    label: 'Users',
    icon: '👥',
    path: '/moderation/users',
    description: 'Manage user accounts and permissions'
  }
]

interface DashboardLayoutProps {
  children: ReactNode
}

function NavItem({ item }: { item: DashboardNavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.path
  
  return (
    <a
      href={item.path}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-300 hover:bg-dark-700 hover:text-white'
      }`}
    >
      <span className="text-xl">{item.icon}</span>
      <div className="flex-1">
        <div className="font-medium">{item.label}</div>
        <div className="text-xs opacity-80">{item.description}</div>
      </div>
    </a>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-white lg:hidden"
            >
              ☰
            </button>
            <h1 className="text-xl font-bold text-white">Moderation Dashboard</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed lg:static inset-y-0 left-0 z-40 w-64 bg-dark-800 border-r border-dark-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0`}
        >
          <div className="h-full overflow-y-auto py-8">
            <nav className="space-y-2 px-4">
              {navItems.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </nav>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

