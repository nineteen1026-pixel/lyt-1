import { Send } from 'lucide-react'
import type { ExceptionType, ExceptionSeverity } from '@/types'
import { EXCEPTION_TYPES, EXCEPTION_SEVERITIES } from '@/constants/transport'
import type { ExceptionFormState } from '@/hooks/useExceptionHandler'

interface ExceptionFormProps {
  formState: ExceptionFormState
  onUpdateField: <K extends keyof ExceptionFormState>(field: K, value: ExceptionFormState[K]) => void
  onSubmit: () => void
  onCancel: () => void
}

export default function ExceptionForm({
  formState,
  onUpdateField,
  onSubmit,
  onCancel,
}: ExceptionFormProps) {
  return (
    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 space-y-3">
      <h4 className="text-sm font-semibold text-orange-700">上报异常</h4>
      <div className="grid grid-cols-2 gap-3">
        <select
          value={formState.type}
          onChange={(e) => onUpdateField('type', e.target.value as ExceptionType)}
          className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {EXCEPTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={formState.severity}
          onChange={(e) => onUpdateField('severity', e.target.value as ExceptionSeverity)}
          className="px-3 py-2 rounded-lg border border-orange-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {EXCEPTION_SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>
              {severity}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={formState.description}
          onChange={(e) => onUpdateField('description', e.target.value)}
          placeholder="请输入异常描述..."
          className="col-span-2 px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="number"
          value={formState.lossAmount}
          onChange={(e) => onUpdateField('lossAmount', e.target.value)}
          placeholder="损失金额（元，可选）"
          className="px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="number"
          value={formState.delayHours}
          onChange={(e) => onUpdateField('delayHours', e.target.value)}
          placeholder="延误时长（小时，可选）"
          className="px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-600 text-sm font-medium transition-colors"
        >
          取消
        </button>
        <button
          onClick={onSubmit}
          className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" /> 提交
        </button>
      </div>
    </div>
  )
}
