import { useState } from 'react'
import type { ExceptionType, ExceptionSeverity } from '@/types'
import { EXCEPTION_TYPES, EXCEPTION_SEVERITIES } from '@/constants/transport'

export interface ExceptionFormState {
  type: ExceptionType
  severity: ExceptionSeverity
  description: string
  lossAmount: string
  delayHours: string
}

interface UseExceptionHandlerReturn {
  showAddException: string | null
  setShowAddException: (id: string | null) => void
  formState: ExceptionFormState
  updateFormField: <K extends keyof ExceptionFormState>(field: K, value: ExceptionFormState[K]) => void
  resetForm: () => void
  handleAddException: (transportId: string, onSubmit: (data: SubmitExceptionData) => void) => void
  handleExceptionProcess: (exceptionId: string, onProcess: (id: string) => void) => void
  handleExceptionResolve: (exceptionId: string, onResolve: (id: string, solution: string) => void) => void
}

export interface SubmitExceptionData {
  transportId: string
  type: ExceptionType
  severity: ExceptionSeverity
  description: string
  lossAmount?: number
  delayHours?: number
}

const initialFormState: ExceptionFormState = {
  type: '其他',
  severity: '一般',
  description: '',
  lossAmount: '',
  delayHours: '',
}

export function useExceptionHandler(): UseExceptionHandlerReturn {
  const [showAddException, setShowAddException] = useState<string | null>(null)
  const [formState, setFormState] = useState<ExceptionFormState>(initialFormState)

  const updateFormField = <K extends keyof ExceptionFormState>(field: K, value: ExceptionFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormState(initialFormState)
    setShowAddException(null)
  }

  const handleAddException = (
    transportId: string,
    onSubmit: (data: SubmitExceptionData) => void
  ) => {
    if (!formState.description.trim()) return

    const submitData: SubmitExceptionData = {
      transportId,
      type: formState.type,
      severity: formState.severity,
      description: formState.description,
      lossAmount: formState.lossAmount ? parseFloat(formState.lossAmount) : undefined,
      delayHours: formState.delayHours ? parseInt(formState.delayHours, 10) : undefined,
    }

    onSubmit(submitData)
    resetForm()
  }

  const handleExceptionProcess = (exceptionId: string, onProcess: (id: string) => void) => {
    onProcess(exceptionId)
  }

  const handleExceptionResolve = (
    exceptionId: string,
    onResolve: (id: string, solution: string) => void
  ) => {
    const solution = prompt('请输入解决方案：')
    if (solution) {
      onResolve(exceptionId, solution)
    }
  }

  return {
    showAddException,
    setShowAddException,
    formState,
    updateFormField,
    resetForm,
    handleAddException,
    handleExceptionProcess,
    handleExceptionResolve,
  }
}

export { EXCEPTION_TYPES, EXCEPTION_SEVERITIES }
