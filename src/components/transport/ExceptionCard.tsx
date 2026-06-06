import type { ExceptionReport, TransportTask } from '@/types'
import { EXCEPTION_TYPE_BADGE, EXCEPTION_BADGE, SEVERITY_BADGE } from '@/constants/transport'

interface ExceptionCardProps {
  exception: ExceptionReport
  transportTask?: TransportTask
  onProcess?: (exceptionId: string) => void
  onResolve?: (exceptionId: string) => void
  showTaskLink?: boolean
}

export default function ExceptionCard({
  exception,
  transportTask,
  onProcess,
  onResolve,
  showTaskLink = true,
}: ExceptionCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 border border-surface-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${EXCEPTION_TYPE_BADGE[exception.type].bg} ${EXCEPTION_TYPE_BADGE[exception.type].text}`}
          >
            {exception.type}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${EXCEPTION_BADGE[exception.status].bg} ${EXCEPTION_BADGE[exception.status].text}`}
          >
            {exception.status}
          </span>
          {exception.severity && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${SEVERITY_BADGE[exception.severity].bg} ${SEVERITY_BADGE[exception.severity].text}`}
            >
              {exception.severity}
            </span>
          )}
          {exception.scoreImpact !== undefined && exception.scoreImpact > 0 && (
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
              评分 -{exception.scoreImpact}
            </span>
          )}
        </div>
        <span className="text-xs text-surface-400">{exception.reportedAt}</span>
      </div>
      <p className="text-sm text-surface-700 mt-2">{exception.description}</p>
      {showTaskLink && transportTask && (
        <p className="text-xs text-surface-500 mt-2">
          关联运输: <span className="font-mono">{transportTask.id}</span> · {transportTask.demandTitle}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-surface-500">
        <span>上报人: {exception.reporter}</span>
        {exception.handledBy && <span>处理人: {exception.handledBy}</span>}
        {exception.lossAmount !== undefined && (
          <span>损失金额: ¥{exception.lossAmount.toLocaleString()}</span>
        )}
        {exception.delayHours !== undefined && <span>延误时长: {exception.delayHours}小时</span>}
      </div>
      {exception.solution && (
        <div className="mt-2 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
          <span className="font-medium">解决方案:</span> {exception.solution}
        </div>
      )}
      {exception.status === '待处理' && onProcess && onResolve && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onProcess(exception.id)}
            className="px-3 py-1.5 rounded bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs font-medium transition-colors"
          >
            开始处理
          </button>
          <button
            onClick={() => onResolve(exception.id)}
            className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-600 text-xs font-medium transition-colors"
          >
            标记解决
          </button>
        </div>
      )}
      {exception.status === '处理中' && onResolve && (
        <div className="mt-3">
          <button
            onClick={() => onResolve(exception.id)}
            className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-600 text-xs font-medium transition-colors"
          >
            标记解决
          </button>
        </div>
      )}
    </div>
  )
}
