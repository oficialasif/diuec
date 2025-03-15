'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { 
  Users, 
  Image as ImageIcon, 
  FileText, 
  Settings, 
  ChevronDown,
  LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/(protected)/admin',
  },
  {
    title: 'User Management',
    icon: Users,
    href: '/(protected)/admin/users',
  },
  {
    title: 'Photo Gallery',
    icon: ImageIcon,
    href: '/(protected)/admin/gallery',
  },
  {
    title: 'Posts',
    icon: FileText,
    href: '/(protected)/admin/posts',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/(protected)/admin/settings',
  },
]

export default function AdminDashboard() {
  const { userProfile } = useAuth()
  const [activePage, setActivePage] = useState('Dashboard')

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <header className="bg-violet-950 text-white py-4 px-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <span>{userProfile?.displayName}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Link href="/" className="w-full">
                View Site
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-violet-950/50 min-h-[calc(100vh-4rem)] p-6">
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  activePage === item.title
                    ? "bg-violet-500 text-white"
                    : "text-gray-300 hover:bg-violet-500/10 hover:text-white"
                )}
                onClick={() => setActivePage(item.title)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="bg-violet-950/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-200">Total Users</h3>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-violet-950/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-200">Total Posts</h3>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-violet-950/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-200">Gallery Photos</h3>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-violet-950/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-200">Active Users</h3>
              <p className="text-3xl font-bold text-white mt-2">0</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="bg-violet-950/50 rounded-lg p-6">
              <p className="text-gray-400">No recent activity</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 