import { useState, useMemo } from 'react'
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  Package,
  CheckSquare,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import { useTransportFilter, STATUS_FILTERS } from '@/hooks/useTransportFilter'
import { useExceptionHandler, type SubmitExceptionData } from '@/hooks/useExceptionHandler'
import { EXCEPTION_STATUS_FILTERS } from '@/constants/transport'
import WarningBanner from '@/components/transport/WarningBanner'
import FilterBar from '@/components/transport/FilterBar'
import TransportCard from '@/components/transport/TransportCard'
import ExceptionCard from '@/components/transport/ExceptionCard'
import type { TransportStatus, ExceptionStatus, TransportTask } from '@/types'

export default function TransportDashboard() {
  const {
    approvals,
    transportTasks,
    transitNodes,
    exceptionReports,
    updateTransportStatus,
    updateExceptionStatus,
    addExceptionReport,
    warningNotifications,
    markNotificationRead,
  } = useStore()

  const [expandedTransportId, setExpandedTransportId] = useState<string | null>(null)
  const [showApprovedList, setShowApprovedList] = useState(true)

  const approvedApprovals = useMemo(
    () => approvals.filter((a) => a.status === '已通过'),
    [approvals]
  )

  const {
    transportFilter,
    setTransportFilter,
    filteredTransports,
    exceptionFilter,
    setExceptionFilter,
    filteredExceptions,
    transportStats,
  } = useTransportFilter(transportTasks, exceptionReports)

  const {
    showAddException,
    setShowAddException,
    formState: exceptionFormState,
    updateFormField: updateExceptionField,
    resetForm: resetExceptionForm,
    handleExceptionProcess,
    handleExceptionResolve,
  } = useExceptionHandler()

  const stats = useMemo(
    () => ({
      ...transportStats,
      approved: approvedApprovals.length,
    }),
    [transportStats, approvedApprovals.length]
  )

  const toggleTransportExpand = (id: string) =>
    setExpandedTransportId((prev) => (prev === id ? null : id))

  const toggleAddException = (taskId: string) => {
    setShowAddException(showAddException === taskId ? null : taskId)
  }

  const handleStatusUpdate = (task: TransportTask, newStatus: TransportStatus) => {
    updateTransportStatus(task.id, newStatus)
  }

  const handleSubmitException = (data: SubmitExceptionData) => {
    addExceptionReport({
      transportId: data.transportId,
      type: data.type,
      severity: data.severity,
      description: data.description,
      status: '待处理',
      reporter: '当前用户',
      lossAmount: data.lossAmount,
      delayHours: data.delayHours,
    })
  }

  const handleProcessException = (exceptionId: string) => {
    handleExceptionProcess(exceptionId, (id) => {
      updateExceptionStatus(id, '处理中')
    })
  }

  const handleResolveException = (exceptionId: string) => {
    handleExceptionResolve(exceptionId, (id, solution) => {
      updateExceptionStatus(id, '已解决', solution)
    })
  }

  const transportFilterOptions = STATUS_FILTERS.map((f) => ({ label: f, value: f }))
  const exceptionFilterOptions = EXCEPTION_STATUS_FILTERS.map((f) => ({ label: f, value: f }))

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-800">运输执行看板</h1>
      </div>

      <WarningBanner
        warningNotifications={warningNotifications}
        onMarkRead={markNotificationRead}
      />

      <div className="grid grid-cols-6 gap-4">
        <StatsCard label="已完成审批" value={stats.approved} icon={CheckCircle2} color="green" />
        <StatsCard label="承运任务总数" value={stats.total} icon={Package} color="blue" />
        <StatsCard label="待执行" value={stats.pending} icon={Clock} color="orange" />
        <StatsCard label="运输中" value={stats.inTransit} icon={Truck} color="cyan" />
        <StatsCard label="已完成" value={stats.completed} icon={CheckSquare} color="green" />
        <StatsCard label="待处理异常" value={stats.exceptions} icon={AlertTriangle} color="red" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-50 transition-colors"
          onClick={() => setShowApprovedList(!showApprovedList)}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-surface-700">已完成审批</h2>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-medium rounded-full">
              {approvedApprovals.length} 条
            </span>
          </div>
          {showApprovedList ? (
            <ChevronUp className="w-5 h-5 text-surface-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-surface-400" />
          )}
        </div>
        {showApprovedList && (
          <div className="border-t border-surface-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">审批编号</th>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">需求标题</th>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">供应商</th>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">金额</th>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">审批时间</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedApprovals.map((approval) => (
                    <tr key={approval.id} className="border-t border-surface-50 hover:bg-surface-50/50">
                      <td className="px-4 py-3 font-mono text-surface-500">{approval.id}</td>
                      <td className="px-4 py-3 text-surface-700">{approval.demandTitle}</td>
                      <td className="px-4 py-3 text-surface-700">{approval.supplierName}</td>
                      <td className="px-4 py-3 font-semibold text-brand-500">
                        ¥{approval.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-surface-500">{approval.createdAt}</td>
                    </tr>
                  ))}
                  {approvedApprovals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-surface-400">
                        暂无已完成审批数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div>
        <FilterBar
          icon={<Truck className="w-5 h-5 text-brand-500" />}
          title="承运任务"
          filters={transportFilterOptions}
          activeFilter={transportFilter as TransportStatus | '全部'}
          onFilterChange={(f) => setTransportFilter(f as TransportStatus | '全部')}
          activeColor="brand"
        />

        <div className="space-y-4">
          {filteredTransports.map((task) => (
            <TransportCard
              key={task.id}
              task={task}
              transitNodes={transitNodes}
              exceptions={exceptionReports}
              isExpanded={expandedTransportId === task.id}
              onToggleExpand={toggleTransportExpand}
              onStatusUpdate={handleStatusUpdate}
              showAddException={showAddException}
              onToggleAddException={toggleAddException}
              exceptionFormState={exceptionFormState}
              onUpdateExceptionField={updateExceptionField}
              onSubmitException={handleSubmitException}
              onCancelException={resetExceptionForm}
              onProcessException={handleProcessException}
              onResolveException={handleResolveException}
            />
          ))}
          {filteredTransports.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center text-surface-400 border border-surface-100">
              暂无承运任务数据
            </div>
          )}
        </div>
      </div>

      <div>
        <FilterBar
          icon={<MessageSquare className="w-5 h-5 text-red-500" />}
          title="异常上报汇总"
          filters={exceptionFilterOptions}
          activeFilter={exceptionFilter as ExceptionStatus | '全部'}
          onFilterChange={(f) => setExceptionFilter(f as ExceptionStatus | '全部')}
          activeColor="red"
        />

        <div className="grid grid-cols-2 gap-4">
          {filteredExceptions.map((ex) => {
            const task = transportTasks.find((t) => t.id === ex.transportId)
            return (
              <ExceptionCard
                key={ex.id}
                exception={ex}
                transportTask={task}
                onProcess={handleProcessException}
                onResolve={handleResolveException}
              />
            )
          })}
          {filteredExceptions.length === 0 && (
            <div className="col-span-2 bg-white rounded-xl p-8 text-center text-surface-400 border border-surface-100">
              暂无异常数据
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
