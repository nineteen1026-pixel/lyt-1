import type { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  color?: 'blue' | 'orange' | 'green' | 'red' | 'purple' | 'cyan'
}

const colorMap = {
  blue: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  red: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  purple: { bg: 'bg-purple-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
  cyan: { bg: 'bg-cyan-50', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
}

export default function StatsCard({ label, value, icon: Icon, trend, color = 'blue' }: StatsCardProps) {
  const c = colorMap[color]

  return (
    <div className={`${c.bg} rounded-xl p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md`}>
      <div className={`${c.iconBg} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-surface-500 text-xs font-medium">{label}</p>
        <p className="text-brand-500 text-xl font-bold mt-0.5">{value}</p>
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          {trend}
        </span>
      )}
    </div>
  )
}
