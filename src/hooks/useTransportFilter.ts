import { useState, useMemo } from 'react'
import type { TransportTask, TransportStatus, ExceptionReport, ExceptionStatus } from '@/types'
import { STATUS_FILTERS, EXCEPTION_STATUS_FILTERS } from '@/constants/transport'

interface UseTransportFilterReturn {
  transportFilter: '全部' | TransportStatus
  setTransportFilter: (filter: '全部' | TransportStatus) => void
  filteredTransports: TransportTask[]
  exceptionFilter: '全部' | ExceptionStatus
  setExceptionFilter: (filter: '全部' | ExceptionStatus) => void
  filteredExceptions: ExceptionReport[]
  transportStats: {
    total: number
    pending: number
    inTransit: number
    completed: number
    exceptions: number
  }
}

export function useTransportFilter(
  transportTasks: TransportTask[],
  exceptionReports: ExceptionReport[]
): UseTransportFilterReturn {
  const [transportFilter, setTransportFilter] = useState<'全部' | TransportStatus>('全部')
  const [exceptionFilter, setExceptionFilter] = useState<'全部' | ExceptionStatus>('全部')

  const filteredTransports = useMemo(
    () => (transportFilter === '全部' ? transportTasks : transportTasks.filter((t) => t.status === transportFilter)),
    [transportTasks, transportFilter]
  )

  const filteredExceptions = useMemo(
    () => (exceptionFilter === '全部' ? exceptionReports : exceptionReports.filter((e) => e.status === exceptionFilter)),
    [exceptionReports, exceptionFilter]
  )

  const transportStats = useMemo(() => ({
    total: transportTasks.length,
    pending: transportTasks.filter((t) => t.status === '待执行').length,
    inTransit: transportTasks.filter((t) => t.status === '运输中').length,
    completed: transportTasks.filter((t) => t.status === '已完成').length,
    exceptions: exceptionReports.filter((e) => e.status !== '已解决').length,
  }), [transportTasks, exceptionReports])

  return {
    transportFilter,
    setTransportFilter,
    filteredTransports,
    exceptionFilter,
    setExceptionFilter,
    filteredExceptions,
    transportStats,
  }
}

export { STATUS_FILTERS, EXCEPTION_STATUS_FILTERS }
