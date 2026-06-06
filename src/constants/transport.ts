import type { TransportStatus, ExceptionStatus, ExceptionType, ExceptionSeverity, TransitNodeStatus, WarningLevel } from '@/types'

export interface BadgeStyle {
  bg: string
  text: string
}

export const STATUS_FILTERS: ('全部' | TransportStatus)[] = ['全部', '待执行', '运输中', '已完成']
export const EXCEPTION_STATUS_FILTERS: ('全部' | ExceptionStatus)[] = ['全部', '待处理', '处理中', '已解决']

export const TRANSPORT_BADGE: Record<TransportStatus, BadgeStyle> = {
  待执行: { bg: 'bg-gray-100', text: 'text-gray-600' },
  运输中: { bg: 'bg-blue-100', text: 'text-blue-600' },
  已完成: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  已取消: { bg: 'bg-red-100', text: 'text-red-600' },
}

export const NODE_BADGE: Record<TransitNodeStatus, BadgeStyle> = {
  未到达: { bg: 'bg-gray-100', text: 'text-gray-500' },
  已到达: { bg: 'bg-blue-100', text: 'text-blue-600' },
  已出发: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

export const EXCEPTION_BADGE: Record<ExceptionStatus, BadgeStyle> = {
  待处理: { bg: 'bg-red-100', text: 'text-red-600' },
  处理中: { bg: 'bg-orange-100', text: 'text-orange-600' },
  已解决: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

export const EXCEPTION_TYPE_BADGE: Record<ExceptionType, BadgeStyle> = {
  车辆故障: { bg: 'bg-red-100', text: 'text-red-600' },
  交通拥堵: { bg: 'bg-orange-100', text: 'text-orange-600' },
  天气原因: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  货物损坏: { bg: 'bg-purple-100', text: 'text-purple-600' },
  延误: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  破损: { bg: 'bg-rose-100', text: 'text-rose-600' },
  改派: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  其他: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

export const SEVERITY_BADGE: Record<ExceptionSeverity, BadgeStyle> = {
  轻微: { bg: 'bg-green-100', text: 'text-green-600' },
  一般: { bg: 'bg-blue-100', text: 'text-blue-600' },
  严重: { bg: 'bg-orange-100', text: 'text-orange-600' },
  重大: { bg: 'bg-red-100', text: 'text-red-600' },
}

export interface WarningLevelStyle {
  bg: string
  border: string
  icon: string
}

export const WARNING_LEVEL_COLORS: Record<WarningLevel, WarningLevelStyle> = {
  danger: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' },
  warning: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' },
}

export const EXCEPTION_TYPES: ExceptionType[] = ['延误', '破损', '改派', '车辆故障', '交通拥堵', '天气原因', '货物损坏', '其他']
export const EXCEPTION_SEVERITIES: ExceptionSeverity[] = ['轻微', '一般', '严重', '重大']
