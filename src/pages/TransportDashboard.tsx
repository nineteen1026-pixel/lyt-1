import { useState, useMemo } from 'react'
import {
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  User,
  Phone,
  Calendar,
  Package,
  Play,
  CheckSquare,
  XCircle,
  MessageSquare,
  Send,
} from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { TransportTask, TransportStatus, ExceptionStatus, ExceptionType, ExceptionSeverity } from '@/types'

const statusFilters: ('全部' | TransportStatus)[] = ['全部', '待执行', '运输中', '已完成']
const exceptionStatusFilters: ('全部' | ExceptionStatus)[] = ['全部', '待处理', '处理中', '已解决']

const transportBadge: Record<TransportStatus, { bg: string; text: string }> = {
  待执行: { bg: 'bg-gray-100', text: 'text-gray-600' },
  运输中: { bg: 'bg-blue-100', text: 'text-blue-600' },
  已完成: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  已取消: { bg: 'bg-red-100', text: 'text-red-600' },
}

const nodeBadge: Record<string, { bg: string; text: string }> = {
  未到达: { bg: 'bg-gray-100', text: 'text-gray-500' },
  已到达: { bg: 'bg-blue-100', text: 'text-blue-600' },
  已出发: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

const exceptionBadge: Record<ExceptionStatus, { bg: string; text: string }> = {
  待处理: { bg: 'bg-red-100', text: 'text-red-600' },
  处理中: { bg: 'bg-orange-100', text: 'text-orange-600' },
  已解决: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
}

const exceptionTypeBadge: Record<ExceptionType, { bg: string; text: string }> = {
  车辆故障: { bg: 'bg-red-100', text: 'text-red-600' },
  交通拥堵: { bg: 'bg-orange-100', text: 'text-orange-600' },
  天气原因: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  货物损坏: { bg: 'bg-purple-100', text: 'text-purple-600' },
  延误: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  破损: { bg: 'bg-rose-100', text: 'text-rose-600' },
  改派: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  其他: { bg: 'bg-gray-100', text: 'text-gray-600' },
}

const severityBadge: Record<ExceptionSeverity, { bg: string; text: string }> = {
  轻微: { bg: 'bg-green-100', text: 'text-green-600' },
  一般: { bg: 'bg-blue-100', text: 'text-blue-600' },
  严重: { bg: 'bg-orange-100', text: 'text-orange-600' },
  重大: { bg: 'bg-red-100', text: 'text-red-600' },
}

export default function TransportDashboard() {
  const {
    approvals,
    transportTasks,
    transitNodes,
    exceptionReports,
    updateTransportStatus,
    updateExceptionStatus,
    addExceptionReport,
  } = useStore()

  const [transportFilter, setTransportFilter] = useState<'全部' | TransportStatus>('全部')
  const [exceptionFilter, setExceptionFilter] = useState<'全部' | ExceptionStatus>('全部')
  const [expandedTransportId, setExpandedTransportId] = useState<string | null>(null)
  const [showApprovedList, setShowApprovedList] = useState(true)
  const [showAddException, setShowAddException] = useState<string | null>(null)
  const [newExceptionType, setNewExceptionType] = useState<ExceptionType>('其他')
  const [newExceptionSeverity, setNewExceptionSeverity] = useState<ExceptionSeverity>('一般')
  const [newExceptionDesc, setNewExceptionDesc] = useState('')
  const [newExceptionLoss, setNewExceptionLoss] = useState<string>('')
  const [newExceptionDelay, setNewExceptionDelay] = useState<string>('')

  const approvedApprovals = useMemo(() => approvals.filter((a) => a.status === '已通过'), [approvals])

  const filteredTransports = useMemo(
    () => (transportFilter === '全部' ? transportTasks : transportTasks.filter((t) => t.status === transportFilter)),
    [transportTasks, transportFilter],
  )

  const filteredExceptions = useMemo(
    () => (exceptionFilter === '全部' ? exceptionReports : exceptionReports.filter((e) => e.status === exceptionFilter)),
    [exceptionReports, exceptionFilter],
  )

  const stats = useMemo(() => ({
    total: transportTasks.length,
    pending: transportTasks.filter((t) => t.status === '待执行').length,
    inTransit: transportTasks.filter((t) => t.status === '运输中').length,
    completed: transportTasks.filter((t) => t.status === '已完成').length,
    exceptions: exceptionReports.filter((e) => e.status !== '已解决').length,
    approved: approvedApprovals.length,
  }), [transportTasks, exceptionReports, approvedApprovals])

  const toggleTransportExpand = (id: string) =>
    setExpandedTransportId((prev) => (prev === id ? null : id))

  const handleStatusUpdate = (task: TransportTask, newStatus: TransportStatus) => {
    updateTransportStatus(task.id, newStatus)
  }

  const handleExceptionResolve = (exceptionId: string) => {
    const solution = prompt('请输入解决方案：')
    if (solution) {
      updateExceptionStatus(exceptionId, '已解决', solution)
    }
  }

  const handleExceptionProcess = (exceptionId: string) => {
    updateExceptionStatus(exceptionId, '处理中')
  }

  const handleAddException = (transportId: string) => {
    if (newExceptionDesc.trim()) {
      addExceptionReport({
        transportId,
        type: newExceptionType,
        severity: newExceptionSeverity,
        description: newExceptionDesc,
        status: '待处理',
        reporter: '当前用户',
        lossAmount: newExceptionLoss ? parseFloat(newExceptionLoss) : undefined,
        delayHours: newExceptionDelay ? parseInt(newExceptionDelay) : undefined,
      })
      setNewExceptionDesc('')
      setNewExceptionType('其他')
      setNewExceptionSeverity('一般')
      setNewExceptionLoss('')
      setNewExceptionDelay('')
      setShowAddException(null)
    }
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-800">运输执行看板</h1>
      </div>

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
                      <td className="px-4 py-3 font-semibold text-brand-500">¥{approval.totalPrice.toLocaleString()}</td>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-semibold text-surface-700">承运任务</h2>
          </div>
          <div className="flex gap-2">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setTransportFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  transportFilter === s
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTransports.map((task) => {
            const isExpanded = expandedTransportId === task.id
            const taskNodes = transitNodes
              .filter((n) => n.transportId === task.id)
              .sort((a, b) => a.order - b.order)
            const taskExceptions = exceptionReports.filter((e) => e.transportId === task.id)

            return (
              <div key={task.id} className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-surface-500">{task.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${transportBadge[task.status].bg} ${transportBadge[task.status].text}`}>
                        {task.status}
                      </span>
                      {taskExceptions.length > 0 && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {taskExceptions.length} 个异常
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleTransportExpand(task.id)}
                      className="flex items-center gap-1 text-brand-500 hover:text-brand-600 text-sm font-medium transition-colors"
                    >
                      查看详情
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-surface-400">需求标题</p>
                      <p className="text-surface-700 font-medium mt-0.5 truncate">{task.demandTitle}</p>
                    </div>
                    <div>
                      <p className="text-surface-400">运输路线</p>
                      <p className="text-surface-700 font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        {task.origin}
                        <ArrowRight className="w-3.5 h-3.5 text-surface-300" />
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {task.destination}
                      </p>
                    </div>
                    <div>
                      <p className="text-surface-400">货物信息</p>
                      <p className="text-surface-700 font-medium mt-0.5">
                        {task.cargoType} · {task.quantity}{task.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-surface-400">承运方</p>
                      <p className="text-surface-700 font-medium mt-0.5">{task.supplierName}</p>
                    </div>
                    <div>
                      <p className="text-surface-400">司机信息</p>
                      <p className="text-surface-700 font-medium mt-0.5 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-surface-400" />
                        {task.driverName}
                        <span className="text-surface-400">·</span>
                        {task.plateNumber}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-6 text-xs text-surface-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      预计出发: {task.estimatedDeparture}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      预计到达: {task.estimatedArrival}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {task.driverPhone}
                    </span>
                  </div>

                  {!isExpanded && (
                    <div className="mt-4 flex gap-2">
                      {task.status === '待执行' && (
                        <button
                          onClick={() => handleStatusUpdate(task, '运输中')}
                          className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Play className="w-4 h-4" /> 开始运输
                        </button>
                      )}
                      {task.status === '运输中' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(task, '已完成')}
                            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                          >
                            <CheckSquare className="w-4 h-4" /> 完成运输
                          </button>
                          <button
                            onClick={() => setShowAddException(showAddException === task.id ? null : task.id)}
                            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-4 h-4" /> 上报异常
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {showAddException === task.id && (
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100 space-y-3">
                      <h4 className="text-sm font-semibold text-orange-700">上报异常</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={newExceptionType}
                          onChange={(e) => setNewExceptionType(e.target.value as ExceptionType)}
                          className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="延误">延误</option>
                          <option value="破损">破损</option>
                          <option value="改派">改派</option>
                          <option value="车辆故障">车辆故障</option>
                          <option value="交通拥堵">交通拥堵</option>
                          <option value="天气原因">天气原因</option>
                          <option value="货物损坏">货物损坏</option>
                          <option value="其他">其他</option>
                        </select>
                        <select
                          value={newExceptionSeverity}
                          onChange={(e) => setNewExceptionSeverity(e.target.value as ExceptionSeverity)}
                          className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="轻微">轻微</option>
                          <option value="一般">一般</option>
                          <option value="严重">严重</option>
                          <option value="重大">重大</option>
                        </select>
                        <input
                          type="text"
                          value={newExceptionDesc}
                          onChange={(e) => setNewExceptionDesc(e.target.value)}
                          placeholder="请输入异常描述..."
                          className="col-span-2 px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          value={newExceptionLoss}
                          onChange={(e) => setNewExceptionLoss(e.target.value)}
                          placeholder="损失金额（元，可选）"
                          className="px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          value={newExceptionDelay}
                          onChange={(e) => setNewExceptionDelay(e.target.value)}
                          placeholder="延误时长（小时，可选）"
                          className="px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowAddException(null)}
                          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-medium transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleAddException(task.id)}
                          className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                        >
                          <Send className="w-4 h-4" /> 提交
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {isExpanded && (
                  <div className="border-t border-surface-100 bg-surface-50/50 p-5 space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-500" />
                        在途节点
                      </h3>
                      <div className="flex items-start gap-0">
                        {taskNodes.map((node, i) => {
                          const isLast = i === taskNodes.length - 1
                          return (
                            <div key={node.id} className="flex items-start flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                                    node.status === '已出发'
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : node.status === '已到达'
                                      ? 'bg-blue-500 border-blue-500 text-white'
                                      : 'bg-white border-gray-300 text-gray-400'
                                  }`}
                                >
                                  {node.status === '已出发' ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : node.status === '已到达' ? (
                                    <MapPin className="w-4 h-4" />
                                  ) : (
                                    node.order
                                  )}
                                </div>
                                <span className={`mt-1.5 text-xs font-medium ${
                                  node.status === '已出发'
                                    ? 'text-emerald-600'
                                    : node.status === '已到达'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                }`}>
                                  {node.name}
                                </span>
                                <span className="text-[10px] text-surface-400 mt-0.5">{node.location}</span>
                                <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded ${nodeBadge[node.status].bg} ${nodeBadge[node.status].text}`}>
                                  {node.status}
                                </span>
                                {node.actualTime && (
                                  <span className="text-[10px] text-surface-500 mt-1">{node.actualTime}</span>
                                )}
                              </div>
                              {!isLast && (
                                <div className={`h-0.5 flex-1 mt-4 mx-1 rounded ${
                                  taskNodes[i + 1]?.status !== '未到达' || node.status === '已出发'
                                    ? 'bg-emerald-300'
                                    : 'bg-gray-200'
                                }`} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {taskExceptions.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          异常上报记录
                        </h3>
                        <div className="space-y-3">
                          {taskExceptions.map((ex) => (
                            <div key={ex.id} className="bg-white rounded-lg p-4 border border-surface-100">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${exceptionTypeBadge[ex.type].bg} ${exceptionTypeBadge[ex.type].text}`}>
                                    {ex.type}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${exceptionBadge[ex.status].bg} ${exceptionBadge[ex.status].text}`}>
                                    {ex.status}
                                  </span>
                                  {ex.severity && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityBadge[ex.severity].bg} ${severityBadge[ex.severity].text}`}>
                                      {ex.severity}
                                    </span>
                                  )}
                                  {ex.scoreImpact !== undefined && ex.scoreImpact > 0 && (
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                                      评分 -{ex.scoreImpact}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-surface-400">{ex.reportedAt}</span>
                              </div>
                              <p className="text-sm text-surface-700 mt-2">{ex.description}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-surface-500">
                                <span>上报人: {ex.reporter}</span>
                                {ex.handledBy && <span>处理人: {ex.handledBy}</span>}
                                {ex.lossAmount !== undefined && <span>损失金额: ¥{ex.lossAmount.toLocaleString()}</span>}
                                {ex.delayHours !== undefined && <span>延误时长: {ex.delayHours}小时</span>}
                              </div>
                              {ex.solution && (
                                <div className="mt-2 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
                                  <span className="font-medium">解决方案:</span> {ex.solution}
                                </div>
                              )}
                              {ex.status === '待处理' && (
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => handleExceptionProcess(ex.id)}
                                    className="px-3 py-1.5 rounded bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs font-medium transition-colors"
                                  >
                                    开始处理
                                  </button>
                                  <button
                                    onClick={() => handleExceptionResolve(ex.id)}
                                    className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-600 text-xs font-medium transition-colors"
                                  >
                                    标记解决
                                  </button>
                                </div>
                              )}
                              {ex.status === '处理中' && (
                                <div className="mt-3">
                                  <button
                                    onClick={() => handleExceptionResolve(ex.id)}
                                    className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-600 text-xs font-medium transition-colors"
                                  >
                                    标记解决
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-surface-100">
                      {task.status === '待执行' && (
                        <button
                          onClick={() => handleStatusUpdate(task, '运输中')}
                          className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-4 h-4" /> 开始运输
                        </button>
                      )}
                      {task.status === '运输中' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(task, '已完成')}
                            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <CheckSquare className="w-4 h-4" /> 完成运输
                          </button>
                          <button
                            onClick={() => setShowAddException(showAddException === task.id ? null : task.id)}
                            className="flex-1 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
                          >
                            <AlertTriangle className="w-4 h-4" /> 上报异常
                          </button>
                        </>
                      )}
                      {task.status === '已完成' && (
                        <div className="flex-1 py-2 rounded-lg bg-emerald-100 text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> 运输已完成
                        </div>
                      )}
                    </div>

                    {showAddException === task.id && (
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 space-y-3">
                        <h4 className="text-sm font-semibold text-orange-700">上报异常</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <select
                            value={newExceptionType}
                            onChange={(e) => setNewExceptionType(e.target.value as ExceptionType)}
                            className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="延误">延误</option>
                            <option value="破损">破损</option>
                            <option value="改派">改派</option>
                            <option value="车辆故障">车辆故障</option>
                            <option value="交通拥堵">交通拥堵</option>
                            <option value="天气原因">天气原因</option>
                            <option value="货物损坏">货物损坏</option>
                            <option value="其他">其他</option>
                          </select>
                          <select
                            value={newExceptionSeverity}
                            onChange={(e) => setNewExceptionSeverity(e.target.value as ExceptionSeverity)}
                            className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="轻微">轻微</option>
                            <option value="一般">一般</option>
                            <option value="严重">严重</option>
                            <option value="重大">重大</option>
                          </select>
                          <input
                            type="text"
                            value={newExceptionDesc}
                            onChange={(e) => setNewExceptionDesc(e.target.value)}
                            placeholder="请输入异常描述..."
                            className="col-span-2 px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <input
                            type="number"
                            value={newExceptionLoss}
                            onChange={(e) => setNewExceptionLoss(e.target.value)}
                            placeholder="损失金额（元，可选）"
                            className="px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <input
                            type="number"
                            value={newExceptionDelay}
                            onChange={(e) => setNewExceptionDelay(e.target.value)}
                            placeholder="延误时长（小时，可选）"
                            className="px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setShowAddException(null)}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-medium transition-colors"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleAddException(task.id)}
                            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-4 h-4" /> 提交
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filteredTransports.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center text-surface-400 border border-surface-100">
              暂无承运任务数据
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-surface-700">异常上报汇总</h2>
          </div>
          <div className="flex gap-2">
            {exceptionStatusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setExceptionFilter(s)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  exceptionFilter === s
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredExceptions.map((ex) => {
            const task = transportTasks.find((t) => t.id === ex.transportId)
            return (
              <div key={ex.id} className="bg-white rounded-xl p-4 shadow-sm border border-surface-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${exceptionTypeBadge[ex.type].bg} ${exceptionTypeBadge[ex.type].text}`}>
                      {ex.type}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${exceptionBadge[ex.status].bg} ${exceptionBadge[ex.status].text}`}>
                      {ex.status}
                    </span>
                    {ex.severity && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityBadge[ex.severity].bg} ${severityBadge[ex.severity].text}`}>
                        {ex.severity}
                      </span>
                    )}
                    {ex.scoreImpact !== undefined && ex.scoreImpact > 0 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                        评分 -{ex.scoreImpact}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-surface-400">{ex.reportedAt}</span>
                </div>
                <p className="text-sm font-medium text-surface-700 mt-3">{ex.description}</p>
                {task && (
                  <p className="text-xs text-surface-500 mt-2">
                    关联运输: <span className="font-mono">{task.id}</span> · {task.demandTitle}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-surface-500">
                  <span>上报人: {ex.reporter}</span>
                  {ex.handledBy && <span>处理人: {ex.handledBy}</span>}
                  {ex.lossAmount !== undefined && <span>损失金额: ¥{ex.lossAmount.toLocaleString()}</span>}
                  {ex.delayHours !== undefined && <span>延误时长: {ex.delayHours}小时</span>}
                </div>
                {ex.solution && (
                  <div className="mt-2 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
                    <span className="font-medium">解决方案:</span> {ex.solution}
                  </div>
                )}
                {ex.status === '待处理' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleExceptionProcess(ex.id)}
                      className="px-3 py-1.5 rounded bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs font-medium transition-colors"
                    >
                      开始处理
                    </button>
                    <button
                      onClick={() => handleExceptionResolve(ex.id)}
                      className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-600 text-xs font-medium transition-colors"
                    >
                      标记解决
                    </button>
                  </div>
                )}
                {ex.status === '处理中' && (
                  <div className="mt-3">
                    <button
                      onClick={() => handleExceptionResolve(ex.id)}
                      className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-600 text-xs font-medium transition-colors"
                    >
                      标记解决
                    </button>
                  </div>
                )}
              </div>
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
