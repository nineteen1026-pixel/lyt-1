import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, ChevronUp, ArrowRight, Send } from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { Approval, ApprovalRecord } from '@/types'

const statusFilters: ('全部' | Approval['status'])[] = ['全部', '待审批', '审批中', '已通过', '已驳回']

const statusBadge: Record<Approval['status'], { bg: string; text: string }> = {
  待审批: { bg: 'bg-gray-100', text: 'text-gray-600' },
  审批中: { bg: 'bg-orange-100', text: 'text-orange-600' },
  已通过: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  已驳回: { bg: 'bg-red-100', text: 'text-red-600' },
}

const statusIcon: Record<Approval['status'], typeof Clock> = {
  待审批: Clock,
  审批中: AlertCircle,
  已通过: CheckCircle,
  已驳回: XCircle,
}

const actionColor: Record<string, string> = {
  提交: 'bg-blue-500',
  通过: 'bg-emerald-500',
  驳回: 'bg-red-500',
}

const actionText: Record<string, string> = {
  提交: 'text-blue-600',
  通过: 'text-emerald-600',
  驳回: 'text-red-600',
}

const steps = ['提交', '初审', '终审']

function getStepIndex(a: Approval, records: ApprovalRecord[]) {
  const approvalRecords = records.filter((r) => r.approvalId === a.id)
  const passCount = approvalRecords.filter((r) => r.action === '通过').length
  if (a.status === '已通过') return 3
  if (passCount >= 2) return 3
  if (passCount >= 1) return 2
  return 1
}

export default function Approvals() {
  const { approvals, approvalRecords, approveApproval, rejectApproval } = useStore()
  const [filter, setFilter] = useState<'全部' | Approval['status']>('全部')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = useMemo(
    () => (filter === '全部' ? approvals : approvals.filter((a) => a.status === filter)),
    [approvals, filter],
  )

  const stats = useMemo(() => ({
    total: approvals.length,
    pending: approvals.filter((a) => a.status === '待审批').length,
    approved: approvals.filter((a) => a.status === '已通过').length,
    rejected: approvals.filter((a) => a.status === '已驳回').length,
  }), [approvals])

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  const handleAction = (approval: Approval, action: '通过' | '驳回') => {
    const stepLabel = action === '通过' ? (getStepIndex(approval, approvalRecords) === 1 ? '初审' : '终审') : ''
    const comment = prompt(`请输入${action}意见${stepLabel ? `（${stepLabel}）` : ''}：`) || (action === '通过' ? '同意' : '不通过')
    if (action === '通过') {
      approveApproval(approval.id, comment)
    } else {
      rejectApproval(approval.id, comment)
    }
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-800">审批状态</h1>
        <div className="flex gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === s
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="总审批数" value={stats.total} icon={Send} color="blue" />
        <StatsCard label="待审批" value={stats.pending} icon={Clock} color="orange" />
        <StatsCard label="已通过" value={stats.approved} icon={CheckCircle} color="green" />
        <StatsCard label="已驳回" value={stats.rejected} icon={XCircle} color="red" />
      </div>

      <div className="space-y-4">
        {filtered.map((approval) => {
          const isExpanded = expandedId === approval.id
          const records = approvalRecords.filter((r) => r.approvalId === approval.id)
          const currentStep = getStepIndex(approval, records)
          const StatusIcon = statusIcon[approval.status]

          return (
            <div key={approval.id} className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="w-5 h-5 text-surface-400" />
                    <span className="font-mono text-sm text-surface-500">{approval.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge[approval.status].bg} ${statusBadge[approval.status].text}`}>
                      {approval.status}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleExpand(approval.id)}
                    className="flex items-center gap-1 text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors"
                  >
                    查看详情
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-surface-400">需求标题</p>
                    <p className="text-surface-700 font-medium mt-0.5">{approval.demandTitle}</p>
                  </div>
                  <div>
                    <p className="text-surface-400">供应商</p>
                    <p className="text-surface-700 font-medium mt-0.5">{approval.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-surface-400">总价</p>
                    <p className="text-surface-700 font-bold mt-0.5">¥{approval.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <p className="mt-2 text-xs text-surface-400">创建时间：{approval.createdAt}</p>
              </div>

              {isExpanded && (
                <div className="border-t border-surface-100 bg-surface-50/50 p-5 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-surface-700 mb-3">审批流程</h3>
                    <div className="flex items-center gap-0">
                      {steps.map((step, i) => {
                        const stepNum = i + 1
                        const isCompleted = stepNum < currentStep
                        const isCurrent = stepNum === currentStep
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : isCurrent
                                    ? 'bg-orange-500 border-orange-500 text-white animate-pulse'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}
                              >
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
                              </div>
                              <span className={`mt-1.5 text-xs font-medium ${isCompleted ? 'text-emerald-600' : isCurrent ? 'text-orange-600' : 'text-gray-400'}`}>
                                {step}
                              </span>
                            </div>
                            {i < steps.length - 1 && (
                              <ArrowRight className={`w-5 h-5 -mx-1 flex-shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-gray-300'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-surface-700 mb-3">审批记录</h3>
                    <div className="relative pl-6">
                      <div className="absolute left-2.5 top-0 bottom-0 w-px bg-surface-200" />
                      {[...records].reverse().map((record) => (
                        <div key={record.id} className="relative pb-4 last:pb-0">
                          <div className={`absolute left-[-14px] top-1 w-3 h-3 rounded-full ${actionColor[record.action]} ring-2 ring-white`} />
                          <div className="bg-white rounded-lg p-3 border border-surface-100 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-surface-700">{record.approver}</span>
                              <span className={`text-xs font-semibold ${actionText[record.action]}`}>{record.action}</span>
                            </div>
                            <p className="text-xs text-surface-500 mt-1">{record.comment}</p>
                            <p className="text-xs text-surface-400 mt-1">{record.timestamp}</p>
                          </div>
                        </div>
                      ))}
                      {records.length === 0 && (
                        <p className="text-sm text-surface-400 py-2">暂无审批记录</p>
                      )}
                    </div>
                  </div>

                  {(approval.status === '待审批' || approval.status === '审批中') && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleAction(approval, '通过')}
                        className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" /> 通过
                      </button>
                      <button
                        onClick={() => handleAction(approval, '驳回')}
                        className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" /> 驳回
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-surface-400">暂无审批数据</div>
        )}
      </div>
    </div>
  )
}
