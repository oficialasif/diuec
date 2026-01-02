import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
    title: string
    value: number | string
    icon: LucideIcon
    color: 'violet' | 'yellow' | 'blue' | 'green' | 'emerald' | 'orange' | 'red'
    trend?: string
}

const colorClasses = {
    violet: 'bg-violet-600/10 border-violet-600/20 text-violet-400',
    yellow: 'bg-yellow-600/10 border-yellow-600/20 text-yellow-400',
    blue: 'bg-blue-600/10 border-blue-600/20 text-blue-400',
    green: 'bg-green-600/10 border-green-600/20 text-green-400',
    emerald: 'bg-emerald-600/10 border-emerald-600/20 text-emerald-400',
    orange: 'bg-orange-600/10 border-orange-600/20 text-orange-400',
    red: 'bg-red-600/10 border-red-600/20 text-red-400',
}

export default function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-lg", colorClasses[color])}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
                <p className="text-sm text-gray-400">{title}</p>
            </div>
        </div>
    )
}
