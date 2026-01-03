'use client'

import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <AdminHeader />

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6 bg-zinc-950">
                    {children}

                    {/* Admin Footer */}
                    <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>System Status: All systems operational</span>
                        </div>
                        <div className="text-right">
                            Developed by <a href="https://github.com/oficialasif" target="_blank" className="font-semibold text-zinc-500 hover:text-zinc-400">oficialasif</a> • All rights reserved 2026
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
