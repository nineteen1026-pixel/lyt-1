import { useState, useMemo } from 'react'
import {
  Bell,
  AlertTriangle,
  Clock,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertCircle,
  Info,
  XCircle,
} from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { WarningRule, WarningNotification, WarningRuleType, WarningLevel, WarningStatus, ExceptionType, ExceptionSeverity } from '@/types'

const typeLabels: Record<WarningRuleType, string> = {
  eta: '预计到达时间',
  exception: '异常类型',
  supplier_score: '供应商评分',
}

const typeIcons: Record<WarningRuleType, typeof Clock> = {
  eta: Clock,
  exception: AlertTriangle,
  supplier_score: Users,
}

const levelBadge: Record<WarningLevel, { bg: string; text: string; label: string }> = {
  info: { bg: 'bg-blue-100', text: 'text-blue-600', label: '信息' },
  warning: { bg: 'bg-orange-100', text: 'text-orange-600', label: '警告' },
  danger: { bg: 'bg-red-100', text: 'text-red-600', label: '危险' },
}

const statusBadge: Record<WarningStatus, { bg: string; text: string }> = {
  未读: { bg: 'bg-red-100', text: 'text-red-600' },
  已读: { bg: 'bg-blue-100', text: 'text-blue-600' },
  已处理: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

const exceptionTypes: ExceptionType[] = ['车辆故障', '交通拥堵', '天气原因', '货物损坏', '延误', '破损', '改派', '其他']
const exceptionSeverities: ExceptionSeverity[] = ['轻微', '一般', '严重', '重大']

export default function WarningRules() {
  const {
    warningRules,
    warningNotifications,
    addWarningRule,
    updateWarningRule,
    deleteWarningRule,
    toggleWarningRule,
    markNotificationRead,
    markNotificationHandled,
    markAllNotificationsRead,
    runWarningDetection,
  } = useStore()

  const [activeTab, setActiveTab] = useState<'notifications' | 'rules'>('notifications')
  const [showAddRule, setShowAddRule] = useState(false)
  const [editingRule, setEditingRule] = useState<WarningRule | null>(null)
  const [notificationFilter, setNotificationFilter] = useState<'全部' | WarningStatus>('全部')
  const [searchText, setSearchText] = useState('')
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'eta' as WarningRuleType,
    level: 'warning' as WarningLevel,
    enabled: true,
    etaHoursThreshold: 2,
    exceptionTypes: [] as ExceptionType[],
    exceptionSeverities: [] as ExceptionSeverity[],
    scoreThreshold: 70,
    notifyMethods: ['站内通知'] as string[],
    description: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'eta',
      level: 'warning',
      enabled: true,
      etaHoursThreshold: 2,
      exceptionTypes: [],
      exceptionSeverities: [],
      scoreThreshold: 70,
      notifyMethods: ['站内通知'],
      description: '',
    })
  }

  const handleEditRule = (rule: WarningRule) => {
    setEditingRule(rule)
    setShowAddRule(true)
    setFormData({
      name: rule.name,
      type: rule.type,
      level: rule.level,
      enabled: rule.enabled,
      etaHoursThreshold: rule.conditions.etaHoursThreshold || 2,
      exceptionTypes: rule.conditions.exceptionTypes || [],
      exceptionSeverities: rule.conditions.exceptionSeverities || [],
      scoreThreshold: rule.conditions.scoreThreshold || 70,
      notifyMethods: rule.notifyMethods,
      description: rule.description,
    })
  }

  const handleSubmitRule = () => {
    if (!formData.name.trim()) return

    const conditions: WarningRule['conditions'] = {}
    if (formData.type === 'eta') {
      conditions.etaHoursThreshold = formData.etaHoursThreshold
    } else if (formData.type === 'exception') {
      conditions.exceptionTypes = formData.exceptionTypes
      conditions.exceptionSeverities = formData.exceptionSeverities
    } else if (formData.type === 'supplier_score') {
      conditions.scoreThreshold = formData.scoreThreshold
    }

    if (editingRule) {
      updateWarningRule(editingRule.id, {
        name: formData.name,
        type: formData.type,
        level: formData.level,
        enabled: formData.enabled,
        conditions,
        notifyMethods: formData.notifyMethods,
        description: formData.description,
      })
    } else {
      addWarningRule({
        name: formData.name,
        type: formData.type,
        level: formData.level,
        enabled: formData.enabled,
        conditions,
        notifyMethods: formData.notifyMethods,
        description: formData.description,
      })
    }

    setShowAddRule(false)
    setEditingRule(null)
    resetForm()
  }

  const filteredNotifications = useMemo(() => {
    return warningNotifications.filter((n) => {
      const statusMatch = notificationFilter === '全部' || n.status === notificationFilter
      const searchMatch =
        !searchText ||
        n.title.toLowerCase().includes(searchText.toLowerCase()) ||
        n.message.toLowerCase().includes(searchText.toLowerCase()) ||
        (n.supplierName && n.supplierName.toLowerCase().includes(searchText.toLowerCase()))
      return statusMatch && searchMatch
    })
  }, [warningNotifications, notificationFilter, searchText])

  const stats = useMemo(() => ({
    total: warningNotifications.length,
    unread: warningNotifications.filter((n) => n.status === '未读').length,
    handled: warningNotifications.filter((n) => n.status === '已处理').length,
    rulesEnabled: warningRules.filter((r) => r.enabled).length,
  }), [warningNotifications, warningRules])

  const toggleExceptionType = (type: ExceptionType) => {
    setFormData((prev) => ({
      ...prev,
      exceptionTypes: prev.exceptionTypes.includes(type)
        ? prev.exceptionTypes.filter((t) => t !== type)
        : [...prev.exceptionTypes, type],
    }))
  }

  const toggleExceptionSeverity = (severity: ExceptionSeverity) => {
    setFormData((prev) => ({
      ...prev,
      exceptionSeverities: prev.exceptionSeverities.includes(severity)
        ? prev.exceptionSeverities.filter((s) => s !== severity)
        : [...prev.exceptionSeverities, severity],
    }))
  }

  const toggleNotifyMethod = (method: string) => {
    setFormData((prev) => ({
      ...prev,
      notifyMethods: prev.notifyMethods.includes(method)
        ? prev.notifyMethods.filter((m) => m !== method)
        : [...prev.notifyMethods, method],
    }))
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-800">节点预警中心</h1>
        <button
          onClick={() => runWarningDetection()}
          className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          运行预警检测
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="预警通知总数" value={stats.total} icon={Bell} color="blue" />
        <StatsCard label="未读预警" value={stats.unread} icon={AlertCircle} color="red" />
        <StatsCard label="已处理预警" value={stats.handled} icon={Check} color="green" />
        <StatsCard label="已启用规则" value={stats.rulesEnabled} icon={Settings} color="purple" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        <div className="flex border-b border-surface-100">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-brand-500 border-b-2 border-brand-500 bg-brand-50/50'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4" />
              预警通知
              {stats.unread > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {stats.unread}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'rules'
                ? 'text-brand-500 border-b-2 border-brand-500 bg-brand-50/50'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" />
              预警规则
            </div>
          </button>
        </div>

        {activeTab === 'notifications' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                  <input
                    type="text"
                    placeholder="搜索预警通知..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-72"
                  />
                </div>
                <div className="flex gap-1">
                  {(['全部', '未读', '已读', '已处理'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setNotificationFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        notificationFilter === s
                          ? 'bg-brand-500 text-white'
                          : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => markAllNotificationsRead()}
                className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                全部标记已读
              </button>
            </div>

            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const isExpanded = expandedNotifId === notif.id
                const TypeIcon = typeIcons[notif.ruleType]

                return (
                  <div
                    key={notif.id}
                    className={`border rounded-xl overflow-hidden transition-all ${
                      notif.status === '未读'
                        ? 'border-brand-200 bg-brand-50/30'
                        : 'border-surface-100 bg-white'
                    }`}
                  >
                    <div
                      className="p-4 cursor-pointer hover:bg-surface-50/50 transition-colors"
                      onClick={() => {
                        if (notif.status === '未读') markNotificationRead(notif.id)
                        setExpandedNotifId(isExpanded ? null : notif.id)
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notif.level === 'danger'
                              ? 'bg-red-100 text-red-500'
                              : notif.level === 'warning'
                              ? 'bg-orange-100 text-orange-500'
                              : 'bg-blue-100 text-blue-500'
                          }`}
                        >
                          {notif.ruleType === 'exception' ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : notif.ruleType === 'eta' ? (
                            <Clock className="w-5 h-5" />
                          ) : (
                            <Users className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-surface-800">{notif.title}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[notif.status].bg} ${statusBadge[notif.status].text}`}>
                              {notif.status}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge[notif.level].bg} ${levelBadge[notif.level].text}`}>
                              {levelBadge[notif.level].label}
                            </span>
                          </div>
                          <p className="text-sm text-surface-600 mt-1 line-clamp-1">{notif.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-surface-400">
                            <span>触发时间: {notif.triggeredAt}</span>
                            {notif.supplierName && <span>供应商: {notif.supplierName}</span>}
                            {notif.transportId && <span>运输任务: {notif.transportId}</span>}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-surface-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-surface-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-surface-100 p-4 bg-surface-50/50">
                        <div className="space-y-3">
                          <div className="text-sm text-surface-700">
                            <span className="font-medium">详细信息：</span>
                            {notif.message}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-surface-400">预警规则</p>
                              <p className="text-surface-700 font-medium">{notif.ruleName}</p>
                            </div>
                            <div>
                              <p className="text-surface-400">规则类型</p>
                              <p className="text-surface-700 font-medium">{typeLabels[notif.ruleType]}</p>
                            </div>
                            {notif.nodeName && (
                              <div>
                                <p className="text-surface-400">关联节点</p>
                                <p className="text-surface-700 font-medium">{notif.nodeName}</p>
                              </div>
                            )}
                            {notif.handledAt && (
                              <div>
                                <p className="text-surface-400">处理时间</p>
                                <p className="text-surface-700 font-medium">{notif.handledAt}</p>
                              </div>
                            )}
                            {notif.handledBy && (
                              <div>
                                <p className="text-surface-400">处理人</p>
                                <p className="text-surface-700 font-medium">{notif.handledBy}</p>
                              </div>
                            )}
                          </div>
                          {notif.status !== '已处理' && (
                            <div className="flex gap-2 pt-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markNotificationHandled(notif.id)
                                }}
                                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                              >
                                <Check className="w-4 h-4" />
                                标记已处理
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
              {filteredNotifications.length === 0 && (
                <div className="py-12 text-center text-surface-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无预警通知</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-surface-500">管理预警规则，配置触发条件和通知方式</p>
              <button
                onClick={() => {
                  setShowAddRule(true)
                  setEditingRule(null)
                  resetForm()
                }}
                className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                新增规则
              </button>
            </div>

            {showAddRule && (
              <div className="mb-6 p-5 bg-surface-50 rounded-xl border border-surface-200">
                <h3 className="text-lg font-semibold text-surface-800 mb-4">
                  {editingRule ? '编辑预警规则' : '新增预警规则'}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">规则名称</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="请输入规则名称"
                        className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">规则类型</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as WarningRuleType })}
                        className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="eta">预计到达时间</option>
                        <option value="exception">异常类型</option>
                        <option value="supplier_score">供应商评分</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">预警级别</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value as WarningLevel })}
                        className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="info">信息</option>
                        <option value="warning">警告</option>
                        <option value="danger">危险</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">是否启用</label>
                      <div className="flex items-center h-10">
                        <button
                          onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                          className="flex items-center gap-2"
                        >
                          {formData.enabled ? (
                            <ToggleRight className="w-8 h-8 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-surface-300" />
                          )}
                          <span className="text-sm text-surface-600">{formData.enabled ? '已启用' : '已禁用'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {formData.type === 'eta' && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        预计到达时间阈值（小时）
                      </label>
                      <input
                        type="number"
                        value={formData.etaHoursThreshold}
                        onChange={(e) => setFormData({ ...formData, etaHoursThreshold: parseInt(e.target.value) })}
                        min={1}
                        max={72}
                        className="w-40 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <p className="text-xs text-surface-400 mt-1">当节点预计到达时间不足该小时数时触发预警</p>
                    </div>
                  )}

                  {formData.type === 'exception' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">异常类型</label>
                        <div className="flex flex-wrap gap-2">
                          {exceptionTypes.map((type) => (
                            <button
                              key={type}
                              onClick={() => toggleExceptionType(type)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                formData.exceptionTypes.includes(type)
                                  ? 'bg-brand-500 text-white'
                                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-2">异常严重级别</label>
                        <div className="flex flex-wrap gap-2">
                          {exceptionSeverities.map((sev) => (
                            <button
                              key={sev}
                              onClick={() => toggleExceptionSeverity(sev)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                formData.exceptionSeverities.includes(sev)
                                  ? 'bg-brand-500 text-white'
                                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                              }`}
                            >
                              {sev}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.type === 'supplier_score' && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">
                        评分阈值（分）
                      </label>
                      <input
                        type="number"
                        value={formData.scoreThreshold}
                        onChange={(e) => setFormData({ ...formData, scoreThreshold: parseInt(e.target.value) })}
                        min={0}
                        max={100}
                        className="w-40 px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <p className="text-xs text-surface-400 mt-1">当供应商综合评分低于该分数时触发预警</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">通知方式</label>
                    <div className="flex flex-wrap gap-2">
                      {['站内通知', '短信', '邮件'].map((method) => (
                        <button
                          key={method}
                          onClick={() => toggleNotifyMethod(method)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            formData.notifyMethods.includes(method)
                              ? 'bg-brand-500 text-white'
                              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">规则描述</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="请输入规则描述"
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      onClick={() => {
                        setShowAddRule(false)
                        setEditingRule(null)
                        resetForm()
                      }}
                      className="px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-medium transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitRule}
                      className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      {editingRule ? '保存修改' : '创建规则'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {warningRules.map((rule) => {
                const TypeIcon = typeIcons[rule.type]

                return (
                  <div
                    key={rule.id}
                    className={`p-4 border rounded-xl transition-all ${
                      rule.enabled ? 'border-surface-100 bg-white' : 'border-surface-100 bg-surface-50/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          rule.level === 'danger'
                            ? 'bg-red-100 text-red-500'
                            : rule.level === 'warning'
                            ? 'bg-orange-100 text-orange-500'
                            : 'bg-blue-100 text-blue-500'
                        }`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-surface-800">{rule.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelBadge[rule.level].bg} ${levelBadge[rule.level].text}`}>
                              {levelBadge[rule.level].label}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-600">
                              {typeLabels[rule.type]}
                            </span>
                          </div>
                          <p className="text-sm text-surface-600 mt-1">{rule.description}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-surface-400">
                            <span>创建时间: {rule.createdAt}</span>
                            <span>通知方式: {rule.notifyMethods.join('、')}</span>
                            {rule.type === 'eta' && rule.conditions.etaHoursThreshold && (
                              <span>阈值: {rule.conditions.etaHoursThreshold}小时</span>
                            )}
                            {rule.type === 'supplier_score' && rule.conditions.scoreThreshold !== undefined && (
                              <span>阈值: {rule.conditions.scoreThreshold}分</span>
                            )}
                            {rule.type === 'exception' && rule.conditions.exceptionTypes && rule.conditions.exceptionTypes.length > 0 && (
                              <span>异常类型: {rule.conditions.exceptionTypes.join('、')}</span>
                            )}
                            {rule.type === 'exception' && rule.conditions.exceptionSeverities && rule.conditions.exceptionSeverities.length > 0 && (
                              <span>级别: {rule.conditions.exceptionSeverities.join('、')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWarningRule(rule.id)}
                          className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
                        >
                          {rule.enabled ? (
                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-surface-300" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-brand-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteWarningRule(rule.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-surface-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {warningRules.length === 0 && (
                <div className="py-12 text-center text-surface-400">
                  <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无预警规则</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
