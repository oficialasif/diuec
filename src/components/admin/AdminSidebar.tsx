'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    Trophy,
    Shield,
    FileText,
    Bell,
    Settings,
    ChevronLeft,
    ChevronRight,
    Menu,
    X,
    Gamepad2,
    Headphones
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/diuec/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/diuec/dashboard/users', label: 'User Management', icon: Users },
    { href: '/diuec/dashboard/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/diuec/dashboard/matches', label: 'Match Verification', icon: Shield },
    { href: '/diuec/dashboard/teams', label: 'Teams', icon: Users },
    { href: '/diuec/dashboard/games', label: 'Games', icon: Gamepad2 },
    { href: '/diuec/dashboard/support', label: 'Support', icon: Headphones },
    { href: '/diuec/dashboard/content', label: 'Content', icon: FileText },
    { href: '/diuec/dashboard/announcements', label: 'Announcements', icon: Bell },
    { href: '/diuec/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
    const pathname = usePathname()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const isActive = (href: string) => {
        if (href === '/diuec/dashboard') {
            return pathname === href
        }
        return pathname?.startsWith(href)
    }

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white"
            >
                {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/80 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:relative inset-y-0 left-0 z-40 flex flex-col bg-zinc-900/95 backdrop-blur-xl border-r border-zinc-800 transition-all duration-300",
                    isCollapsed ? "w-20" : "w-72",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
                    {!isCollapsed && (
                        <Link href="/diuec/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 to-violet-200 bg-clip-text text-transparent">
                                    Admin Panel
                                </h1>
                                <p className="text-[10px] text-gray-500">DIUEC Management</p>
                            </div>
                        </Link>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex p-1.5 hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const active = isActive(item.href)

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                                        active
                                            ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                            : "text-gray-400 hover:bg-violet-600/20 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 flex-shrink-0", active && "animate-pulse")} />
                                    {!isCollapsed && (
                                        <span className="font-medium text-sm">{item.label}</span>
                                    )}
                                    {active && !isCollapsed && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-800">
                    {!isCollapsed && (
                        <div className="bg-violet-600/10 border border-violet-600/20 rounded-lg p-3">
                            <p className="text-xs font-medium text-violet-300">System Status</p>
                            <p className="text-[10px] text-gray-400 mt-1">All systems operational</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    )
}
