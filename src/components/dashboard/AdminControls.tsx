'use client'

import { Button } from '@/components/ui/button'
import { Users, Image, FileText, Trophy, Settings, UserPlus } from 'lucide-react'
import Link from 'next/link'

const adminActions = [
  {
    title: 'User Management',
    icon: Users,
    description: 'Manage user accounts and permissions',
    href: '/dashboard/users'
  },
  {
    title: 'Photo Gallery',
    icon: Image,
    description: 'Manage photo gallery and media',
    href: '/dashboard/gallery'
  },
  {
    title: 'Post Management',
    icon: FileText,
    description: 'Create and manage blog posts',
    href: '/dashboard/posts'
  },
  {
    title: 'Tournament Management',
    icon: Trophy,
    description: 'Organize and manage tournaments',
    href: '/dashboard/tournaments'
  },
  {
    title: 'Team Management',
    icon: UserPlus,
    description: 'Manage team members and roles',
    href: '/dashboard/team'
  },
  {
    title: 'Settings',
    icon: Settings,
    description: 'Configure system settings',
    href: '/dashboard/settings'
  }
]

export default function AdminControls() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Admin Controls</h2>
        <p className="text-gray-400">Manage your esports community</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminActions.map((action) => (
          <Link key={action.title} href={action.href}>
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer">
              <action.icon className="w-8 h-8 mb-4 text-white" />
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-gray-400">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 