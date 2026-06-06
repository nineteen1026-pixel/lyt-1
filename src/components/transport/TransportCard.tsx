import {
  MapPin,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  User,
  Phone,
  Calendar,
  Play,
  CheckSquare,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { TransportTask, TransitNode, ExceptionReport, TransportStatus } from '@/types'
import { TRANSPORT_BADGE } from '@/constants/transport'
import TransitNodesView from './TransitNodesView'
import ExceptionCard from './ExceptionCard'
import ExceptionForm from './ExceptionForm'
import type { ExceptionFormState, SubmitExceptionData } from '@/hooks/useExceptionHandler'

interface TransportCardProps {
  task: TransportTask
  transitNodes: TransitNode[]
  exceptions: ExceptionReport[]
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onStatusUpdate: (task: TransportTask, newStatus: TransportStatus) => void
  showAddException: string | null
  onToggleAddException: (taskId: string) => void
  exceptionFormState: ExceptionFormState
  onUpdateExceptionField: <K extends keyof ExceptionFormState>(
    field: K,
    value: ExceptionFormState[K]
  ) => void
  onSubmitException: (data: SubmitExceptionData) => void
  onCancelException: () => void
  onProcessException: (exceptionId: string) => void
  onResolveException: (exceptionId: string) => void
}

export default function TransportCard({
  task,
  transitNodes,
  exceptions,
  isExpanded,
  onToggleExpand,
  onStatusUpdate,
  showAddException,
  onToggleAddException,
  exceptionFormState,
  onUpdateExceptionField,
  onSubmitException,
  onCancelException,
  onProcessException,
  onResolveException,
}: TransportCardProps) {
  const taskNodes = [...transitNodes]
    .filter((n) => n.transportId === task.id)
    .sort((a, b) => a.order - b.order)
  const taskExceptions = exceptions.filter((e) => e.transportId === task.id)

  const renderActionButtons = (isExpandedView: boolean) => {
    const buttonClass = isExpandedView
      ? 'flex-1 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-1.5'
      : 'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5'

    return (
      <>
        {task.status === '待执行' && (
          <button
            onClick={() => onStatusUpdate(task, '运输中')}
            className={`${buttonClass} bg-blue-500 hover:bg-blue-600 text-white`}
          >
            <Play className="w-4 h-4" /> 开始运输
          </button>
        )}
        {task.status === '运输中' && (
          <>
            <button
              onClick={() => onStatusUpdate(task, '已完成')}
              className={`${buttonClass} bg-emerald-500 hover:bg-emerald-600 text-white`}
            >
              <CheckSquare className="w-4 h-4" /> 完成运输
            </button>
            <button
              onClick={() => onToggleAddException(task.id)}
              className={`${buttonClass} bg-orange-500 hover:bg-orange-600 text-white`}
            >
              <AlertTriangle className="w-4 h-4" /> 上报异常
            </button>
          </>
        )}
        {task.status === '已完成' && isExpandedView && (
          <div className="flex-1 py-2 rounded-lg bg-emerald-100 text-emerald-600 font-medium text-sm flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> 运输已完成
          </div>
        )}
      </>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-surface-500">{task.id}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${TRANSPORT_BADGE[task.status].bg} ${TRANSPORT_BADGE[task.status].text}`}
            >
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
            onClick={() => onToggleExpand(task.id)}
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
              {task.cargoType} · {task.quantity}
              {task.unit}
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
          <div className="mt-4 flex gap-2">{renderActionButtons(false)}</div>
        )}

        {showAddException === task.id && !isExpanded && (
          <div className="mt-4">
            <ExceptionForm
              formState={exceptionFormState}
              onUpdateField={onUpdateExceptionField}
              onSubmit={() =>
                onSubmitException({
                  transportId: task.id,
                  type: exceptionFormState.type,
                  severity: exceptionFormState.severity,
                  description: exceptionFormState.description,
                  lossAmount: exceptionFormState.lossAmount
                    ? parseFloat(exceptionFormState.lossAmount)
                    : undefined,
                  delayHours: exceptionFormState.delayHours
                    ? parseInt(exceptionFormState.delayHours, 10)
                    : undefined,
                })
              }
              onCancel={onCancelException}
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="border-t border-surface-100 bg-surface-50/50 p-5 space-y-6">
          <TransitNodesView nodes={taskNodes} />

          {taskExceptions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                异常上报记录
              </h3>
              <div className="space-y-3">
                {taskExceptions.map((ex) => (
                  <ExceptionCard
                    key={ex.id}
                    exception={ex}
                    showTaskLink={false}
                    onProcess={onProcessException}
                    onResolve={onResolveException}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-surface-100">
            {renderActionButtons(true)}
          </div>

          {showAddException === task.id && (
            <ExceptionForm
              formState={exceptionFormState}
              onUpdateField={onUpdateExceptionField}
              onSubmit={() =>
                onSubmitException({
                  transportId: task.id,
                  type: exceptionFormState.type,
                  severity: exceptionFormState.severity,
                  description: exceptionFormState.description,
                  lossAmount: exceptionFormState.lossAmount
                    ? parseFloat(exceptionFormState.lossAmount)
                    : undefined,
                  delayHours: exceptionFormState.delayHours
                    ? parseInt(exceptionFormState.delayHours, 10)
                    : undefined,
                })
              }
              onCancel={onCancelException}
            />
          )}
        </div>
      )}
    </div>
  )
}
