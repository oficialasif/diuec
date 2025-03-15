'use client'

import { Button } from '@/components/ui/button'
import { Users, Image as ImageIcon, FileText, Trophy, Settings } from 'lucide-react'
import Link from 'next/link'

export function AdminControls() {
  const adminActions = [
    {
      title: 'Manage Users',
      icon: Users,
      description: 'View and manage user accounts',
      href: '/dashboard/users'
    },
    {
      title: 'Photo Gallery',
      icon: ImageIcon,
      description: 'Add and manage gallery photos',
      href: '/dashboard/gallery'
    },
    {
      title: 'Manage Posts',
      icon: FileText,
      description: 'Create and edit posts',
      href: '/dashboard/posts'
    },
    {
      title: 'Tournaments',
      icon: Trophy,
      description: 'Manage tournaments',
      href: '/dashboard/tournaments'
    },
    {
      title: 'Settings',
      icon: Settings,
      description: 'Configure system settings',
      href: '/dashboard/settings'
    }
  ]

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Admin Controls</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="block"
          >
            <div className="p-4 bg-violet-950/50 rounded-lg hover:bg-violet-900/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <action.icon className="w-5 h-5 text-violet-400" />
                <h3 className="font-medium text-white">{action.title}</h3>
              </div>
              <p className="text-sm text-gray-300">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 