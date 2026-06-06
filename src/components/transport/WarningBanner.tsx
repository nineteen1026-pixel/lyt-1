import { useState, useMemo } from 'react'
import { Bell, X, AlertTriangle, Clock, Users, ArrowRight } from 'lucide-react'
import type { WarningNotification } from '@/types'
import { WARNING_LEVEL_COLORS } from '@/constants/transport'

interface WarningBannerProps {
  warningNotifications: WarningNotification[]
  onMarkRead: (id: string) => void
}

export default function WarningBanner({ warningNotifications, onMarkRead }: WarningBannerProps) {
  const [showWarningBanner, setShowWarningBanner] = useState(true)
  const [dismissedWarnings, setDismissedWarnings] = useState<string[]>([])

  const unreadWarnings = useMemo(
    () =>
      warningNotifications
        .filter((w) => w.status === '未读' && !dismissedWarnings.includes(w.id))
        .slice(0, 5),
    [warningNotifications, dismissedWarnings]
  )

  if (!showWarningBanner || unreadWarnings.length === 0) {
    return null
  }

  const handleDismiss = (warningId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDismissedWarnings((prev) => [...prev, warningId])
  }

  const handleClick = (warning: WarningNotification) => {
    onMarkRead(warning.id)
    setDismissedWarnings((prev) => [...prev, warning.id])
  }

  const getRuleIcon = (ruleType: string) => {
    switch (ruleType) {
      case 'exception':
        return <AlertTriangle className="w-4 h-4" />
      case 'eta':
        return <Clock className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  const getRuleIconBg = (ruleType: string) => {
    switch (ruleType) {
      case 'exception':
        return 'bg-red-100 text-red-500'
      case 'eta':
        return 'bg-orange-100 text-orange-500'
      default:
        return 'bg-blue-100 text-blue-500'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-surface-100">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-surface-700">最新预警通知</h2>
          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            {unreadWarnings.length} 条未读
          </span>
        </div>
        <button
          onClick={() => setShowWarningBanner(false)}
          className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-surface-50">
        {unreadWarnings.map((warning) => {
          const colors = WARNING_LEVEL_COLORS[warning.level]
          return (
            <div
              key={warning.id}
              className={`p-3 flex items-start gap-3 hover:bg-surface-50/50 transition-colors cursor-pointer ${colors.bg}`}
              onClick={() => handleClick(warning)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getRuleIconBg(warning.ruleType)}`}>
                {getRuleIcon(warning.ruleType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-surface-800">{warning.title}</span>
                </div>
                <p className="text-xs text-surface-600 mt-0.5 line-clamp-1">{warning.message}</p>
                <p className="text-xs text-surface-400 mt-1">{warning.triggeredAt}</p>
              </div>
              <button
                onClick={(e) => handleDismiss(warning.id, e)}
                className="p-1 rounded hover:bg-white/50 text-surface-400 hover:text-surface-600 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
      <div className="p-3 bg-surface-50 border-t border-surface-100">
        <a
          href="#/warning-rules"
          className="text-sm text-brand-500 hover:text-brand-600 font-medium flex items-center gap-1"
        >
          查看全部预警
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  )
}
