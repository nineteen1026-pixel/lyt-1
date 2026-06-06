import { create } from 'zustand'
import type { Demand, Quote, Supplier, Approval, ApprovalRecord, DemandStatus, Urgency, ApprovalStatus, ApprovalAction, TransportTask, TransitNode, ExceptionReport, TransportStatus, ExceptionStatus, ExceptionType, ExceptionSeverity, RouteCostAnalysis, CargoTypeCostAnalysis, SupplierCostAnalysis, QuoteComparison, CostAnalysisSummary } from '@/types'
import { generateAllData } from '@/data/mock'

interface SupplyChainStore {
  demands: Demand[]
  quotes: Quote[]
  suppliers: Supplier[]
  approvals: Approval[]
  approvalRecords: ApprovalRecord[]
  transportTasks: TransportTask[]
  transitNodes: TransitNode[]
  exceptionReports: ExceptionReport[]
  routeCostAnalysis: RouteCostAnalysis[]
  cargoTypeCostAnalysis: CargoTypeCostAnalysis[]
  supplierCostAnalysis: SupplierCostAnalysis[]
  quoteComparisons: QuoteComparison[]
  costAnalysisSummary: CostAnalysisSummary

  addDemand: (demand: Omit<Demand, 'id' | 'createdAt' | 'status'>) => void
  updateDemandStatus: (id: string, status: DemandStatus) => void
  addQuote: (quote: Omit<Quote, 'id'>) => void
  addApproval: (approval: Omit<Approval, 'id' | 'createdAt'>) => void
  updateApprovalStatus: (id: string, status: ApprovalStatus) => void
  addApprovalRecord: (record: Omit<ApprovalRecord, 'id'>) => void
  resetData: () => void
  acceptQuote: (quoteId: string, demandId: string) => void
  initiateApproval: (params: { demandId: string; supplierId: string; totalPrice: number; demandTitle: string; supplierName: string }) => void
  approveApproval: (approvalId: string, comment?: string) => void
  rejectApproval: (approvalId: string, comment?: string) => void
  selectSupplierAndInitiateApproval: (params: { demandId: string; supplierId: string }) => void
  updateTransportStatus: (id: string, status: TransportStatus) => void
  updateExceptionStatus: (id: string, status: ExceptionStatus, solution?: string) => void
  addExceptionReport: (report: Omit<ExceptionReport, 'id' | 'reportedAt' | 'demandId' | 'supplierId'> & { transportId: string }) => void
  updateSupplierScoreWithException: (supplierId: string, exceptionType: ExceptionType, severity: ExceptionSeverity) => number
  createTransportTaskFromApproval: (approvalId: string) => void
  createDefaultTransitNodes: (transportId: string) => void
}

const initialData = generateAllData()

function getNextId(prefix: string, items: { id: string }[]): string {
  const nums = items.map((item) => {
    const parts = item.id.split('-')
    return parseInt(parts[1], 10)
  })
  const maxNum = Math.max(0, ...nums)
  return `${prefix}-${String(maxNum + 1).padStart(4, '0')}`
}

function calculateScoreImpact(exceptionType: ExceptionType, severity: ExceptionSeverity): number {
  const typeImpact: Record<ExceptionType, number> = {
    '延误': 3,
    '破损': 5,
    '改派': 2,
    '货物损坏': 6,
    '车辆故障': 4,
    '交通拥堵': 1,
    '天气原因': 1,
    '其他': 1,
  }
  const severityImpact: Record<ExceptionSeverity, number> = {
    '轻微': 0.5,
    '一般': 1,
    '严重': 1.5,
    '重大': 2,
  }
  return Math.round(typeImpact[exceptionType] * severityImpact[severity] * 10) / 10
}

const useStore = create<SupplyChainStore>((set, get) => ({
  demands: initialData.demands,
  quotes: initialData.quotes,
  suppliers: initialData.suppliers,
  approvals: initialData.approvals,
  approvalRecords: initialData.approvalRecords,
  transportTasks: initialData.transportTasks,
  transitNodes: initialData.transitNodes,
  exceptionReports: initialData.exceptionReports,
  routeCostAnalysis: initialData.routeCostAnalysis,
  cargoTypeCostAnalysis: initialData.cargoTypeCostAnalysis,
  supplierCostAnalysis: initialData.supplierCostAnalysis,
  quoteComparisons: initialData.quoteComparisons,
  costAnalysisSummary: initialData.costAnalysisSummary,

  addDemand: (demand) => {
    const id = getNextId('DM', get().demands)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    set((state) => ({
      demands: [
        {
          ...demand,
          id,
          createdAt: now,
          status: '待报价' as DemandStatus,
        },
        ...state.demands,
      ],
    }))
  },

  updateDemandStatus: (id, status) => {
    set((state) => ({
      demands: state.demands.map((d) => (d.id === id ? { ...d, status } : d)),
    }))
  },

  addQuote: (quote) => {
    const id = getNextId('QT', get().quotes)
    set((state) => ({
      quotes: [...state.quotes, { ...quote, id }],
    }))
  },

  addApproval: (approval) => {
    const id = getNextId('AP', get().approvals)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    set((state) => ({
      approvals: [
        ...state.approvals,
        {
          ...approval,
          id,
          createdAt: now,
        },
      ],
    }))
  },

  updateApprovalStatus: (id, status) => {
    set((state) => ({
      approvals: state.approvals.map((a) => (a.id === id ? { ...a, status } : a)),
    }))
  },

  addApprovalRecord: (record) => {
    const id = getNextId('AR', get().approvalRecords)
    set((state) => ({
      approvalRecords: [...state.approvalRecords, { ...record, id }],
    }))
  },

  resetData: () => {
    const freshData = generateAllData()
    set({
      demands: freshData.demands,
      quotes: freshData.quotes,
      suppliers: freshData.suppliers,
      approvals: freshData.approvals,
      approvalRecords: freshData.approvalRecords,
      transportTasks: freshData.transportTasks,
      transitNodes: freshData.transitNodes,
      exceptionReports: freshData.exceptionReports,
      routeCostAnalysis: freshData.routeCostAnalysis,
      cargoTypeCostAnalysis: freshData.cargoTypeCostAnalysis,
      supplierCostAnalysis: freshData.supplierCostAnalysis,
      quoteComparisons: freshData.quoteComparisons,
      costAnalysisSummary: freshData.costAnalysisSummary,
    })
  },

  acceptQuote: (quoteId, demandId) => {
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.demandId !== demandId) return q
        return { ...q, status: q.id === quoteId ? '已采纳' as const : '有效' as const }
      }),
      demands: state.demands.map((d) => (d.id === demandId ? { ...d, status: '已选商' as const } : d)),
    }))
  },

  initiateApproval: ({ demandId, supplierId, totalPrice, demandTitle, supplierName }) => {
    const state = get()
    const id = getNextId('AP', state.approvals)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const recordId = getNextId('AR', state.approvalRecords)

    set((s) => ({
      approvals: [
        ...s.approvals,
        {
          id,
          demandId,
          supplierId,
          status: '待审批' as const,
          createdAt: now,
          demandTitle,
          supplierName,
          totalPrice,
        },
      ],
      approvalRecords: [
        ...s.approvalRecords,
        {
          id: recordId,
          approvalId: id,
          approver: '当前用户',
          action: '提交' as const,
          comment: '提交审批申请',
          timestamp: now,
        },
      ],
      demands: s.demands.map((d) => (d.id === demandId ? { ...d, status: '审批中' as const } : d)),
    }))
  },

  approveApproval: (approvalId, comment) => {
    const state = get()
    const approval = state.approvals.find((a) => a.id === approvalId)
    if (!approval) return

    const records = state.approvalRecords.filter((r) => r.approvalId === approvalId)
    const passCount = records.filter((r) => r.action === '通过').length
    const step = passCount === 0 ? '初审' : '终审'
    const newStatus: ApprovalStatus = passCount >= 1 ? '已通过' : '审批中'
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const recordId = getNextId('AR', state.approvalRecords)

    set((s) => ({
      approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: newStatus } : a)),
      approvalRecords: [
        ...s.approvalRecords,
        {
          id: recordId,
          approvalId,
          approver: '当前用户',
          action: '通过' as const,
          comment: comment || `${step}通过`,
          timestamp: now,
        },
      ],
      demands: newStatus === '已通过'
        ? s.demands.map((d) => (d.id === approval.demandId ? { ...d, status: '已完成' as const } : d))
        : s.demands,
    }))

    if (newStatus === '已通过') {
      get().createTransportTaskFromApproval(approvalId)
    }
  },

  rejectApproval: (approvalId, comment) => {
    const state = get()
    const approval = state.approvals.find((a) => a.id === approvalId)
    if (!approval) return

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const recordId = getNextId('AR', state.approvalRecords)

    set((s) => ({
      approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: '已驳回' as const } : a)),
      approvalRecords: [
        ...s.approvalRecords,
        {
          id: recordId,
          approvalId,
          approver: '当前用户',
          action: '驳回' as const,
          comment: comment || '审批驳回',
          timestamp: now,
        },
      ],
      demands: s.demands.map((d) => (d.id === approval.demandId ? { ...d, status: '已选商' as const } : d)),
    }))
  },

  selectSupplierAndInitiateApproval: ({ demandId, supplierId }) => {
    const state = get()
    const demand = state.demands.find((d) => d.id === demandId)
    const supplier = state.suppliers.find((s) => s.id === supplierId)
    if (!demand || !supplier) return

    const demandQuotes = state.quotes.filter((q) => q.demandId === demandId)
    const existingQuote = demandQuotes.find((q) => q.supplierId === supplierId)

    let newQuotes = state.quotes.map((q) => {
      if (q.demandId !== demandId) return q
      return { ...q, status: '有效' as const }
    })

    let selectedQuote: Quote
    if (existingQuote) {
      newQuotes = newQuotes.map((q) =>
        q.id === existingQuote.id ? { ...q, status: '已采纳' as const } : q
      )
      selectedQuote = { ...existingQuote, status: '已采纳' }
    } else {
      const estimatedPrice = Math.round(demand.quantity * (80 + Math.random() * 220) * 100) / 100
      selectedQuote = {
        id: getNextId('QT', state.quotes),
        demandId,
        supplierId,
        price: estimatedPrice,
        transitDays: Math.floor(Math.random() * 12) + 2,
        serviceScore: Math.floor(Math.random() * 25) + 75,
        validUntil: (() => {
          const d = new Date()
          d.setDate(d.getDate() + 20)
          return d.toISOString().split('T')[0]
        })(),
        status: '已采纳',
        remarks: '供应商直选生成报价',
      }
      newQuotes.push(selectedQuote)
    }

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    const approvalId = getNextId('AP', state.approvals)
    const recordId = getNextId('AR', state.approvalRecords)

    set((s) => ({
      quotes: newQuotes,
      demands: s.demands.map((d) => (d.id === demandId ? { ...d, status: '审批中' as const } : d)),
      approvals: [
        ...s.approvals,
        {
          id: approvalId,
          demandId,
          supplierId,
          status: '待审批' as const,
          createdAt: now,
          demandTitle: demand.title,
          supplierName: supplier.name,
          totalPrice: selectedQuote!.price,
        },
      ],
      approvalRecords: [
        ...s.approvalRecords,
        {
          id: recordId,
          approvalId,
          approver: '当前用户',
          action: '提交' as const,
          comment: '供应商直选，提交审批申请',
          timestamp: now,
        },
      ],
    }))
  },

  updateTransportStatus: (id, status) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    set((state) => ({
      transportTasks: state.transportTasks.map((t) => {
        if (t.id !== id) return t
        const updated: TransportTask = { ...t, status }
        if (status === '运输中' && !t.actualDeparture) {
          updated.actualDeparture = now
        }
        if (status === '已完成' && !t.actualArrival) {
          updated.actualArrival = now
        }
        return updated
      }),
    }))
  },

  updateExceptionStatus: (id, status, solution) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    set((state) => {
      const exception = state.exceptionReports.find((e) => e.id === id)
      const wasUnresolved = exception && exception.status !== '已解决'
      const isNowResolved = status === '已解决'
      
      return {
        exceptionReports: state.exceptionReports.map((e) => {
          if (e.id !== id) return e
          const updated: ExceptionReport = { ...e, status }
          if (status !== '待处理' && !e.handledBy) {
            updated.handledBy = '当前用户'
            updated.handledAt = now
          }
          if (solution) {
            updated.solution = solution
          }
          return updated
        }),
        suppliers: state.suppliers.map((sup) => {
          if (!exception || sup.id !== exception.supplierId) return sup
          if (wasUnresolved && isNowResolved) {
            return {
              ...sup,
              resolvedExceptionCount: (sup.resolvedExceptionCount || 0) + 1,
            }
          }
          return sup
        }),
      }
    })
  },

  addExceptionReport: (report) => {
    const state = get()
    const id = getNextId('EX', state.exceptionReports)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    
    const transport = state.transportTasks.find((t) => t.id === report.transportId)
    const demandId = transport?.demandId || ''
    const supplierId = transport?.supplierId || ''
    
    const scoreImpact = calculateScoreImpact(report.type, report.severity)
    
    const newReport: ExceptionReport = {
      ...report,
      id,
      demandId,
      supplierId,
      reportedAt: now,
      scoreImpact,
    }

    set((s) => ({
      exceptionReports: [...s.exceptionReports, newReport],
      suppliers: s.suppliers.map((sup) => {
        if (sup.id !== supplierId) return sup
        const newTimeScore = Math.max(0, sup.timeScore - (report.type === '延误' || report.type === '改派' ? scoreImpact * 0.5 : 0))
        const newServiceScore = Math.max(0, sup.serviceScore - (report.type === '破损' || report.type === '货物损坏' ? scoreImpact * 0.6 : scoreImpact * 0.3))
        const newOverallScore = Math.round((sup.priceScore * 0.25 + newTimeScore * 0.2 + newServiceScore * 0.25 + sup.qualificationScore * 0.15 + sup.fulfillmentRate * 0.15) * 10) / 10
        return {
          ...sup,
          timeScore: Math.round(newTimeScore * 10) / 10,
          serviceScore: Math.round(newServiceScore * 10) / 10,
          overallScore: newOverallScore,
          exceptionCount: (sup.exceptionCount || 0) + 1,
        }
      }),
    }))
  },

  updateSupplierScoreWithException: (supplierId, exceptionType, severity) => {
    const scoreImpact = calculateScoreImpact(exceptionType, severity)
    set((state) => ({
      suppliers: state.suppliers.map((sup) => {
        if (sup.id !== supplierId) return sup
        const newTimeScore = Math.max(0, sup.timeScore - (exceptionType === '延误' || exceptionType === '改派' ? scoreImpact * 0.5 : 0))
        const newServiceScore = Math.max(0, sup.serviceScore - (exceptionType === '破损' || exceptionType === '货物损坏' ? scoreImpact * 0.6 : scoreImpact * 0.3))
        const newOverallScore = Math.round((sup.priceScore * 0.25 + newTimeScore * 0.2 + newServiceScore * 0.25 + sup.qualificationScore * 0.15 + sup.fulfillmentRate * 0.15) * 10) / 10
        return {
          ...sup,
          timeScore: Math.round(newTimeScore * 10) / 10,
          serviceScore: Math.round(newServiceScore * 10) / 10,
          overallScore: newOverallScore,
        }
      }),
    }))
    return scoreImpact
  },

  createTransportTaskFromApproval: (approvalId) => {
    const state = get()
    const approval = state.approvals.find((a) => a.id === approvalId)
    if (!approval) return

    const existingTask = state.transportTasks.find((t) => t.approvalId === approvalId)
    if (existingTask) return

    const demand = state.demands.find((d) => d.id === approval.demandId)
    if (!demand) return

    const plateNumbers = ['沪A12345', '粤B67890', '京C54321', '苏D98765', '浙E13579', '皖F24680', '鲁G11223', '冀H33445', '豫J55667', '川K77889']
    const driverNames = ['张伟', '李强', '王磊', '赵军', '刘洋', '陈涛', '杨帆', '周明', '吴刚', '郑华']

    const randomIndex = Math.floor(Math.random() * plateNumbers.length)
    const now = new Date()
    const estimatedDeparture = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const estimatedArrival = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

    const formatDateTime = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 16)

    const transportId = getNextId('TS', state.transportTasks)
    const newTask: TransportTask = {
      id: transportId,
      approvalId: approval.id,
      demandId: approval.demandId,
      demandTitle: approval.demandTitle,
      supplierId: approval.supplierId,
      supplierName: approval.supplierName,
      origin: demand.origin,
      destination: demand.destination,
      cargoType: demand.cargoType,
      quantity: demand.quantity,
      unit: demand.unit,
      totalPrice: approval.totalPrice,
      status: '待执行',
      plateNumber: plateNumbers[randomIndex % plateNumbers.length],
      driverName: driverNames[randomIndex % driverNames.length],
      driverPhone: `1${Math.floor(Math.random() * 70 + 30)}${Math.floor(Math.random() * 90000000 + 10000000)}`,
      estimatedDeparture: formatDateTime(estimatedDeparture),
      estimatedArrival: formatDateTime(estimatedArrival),
      createdAt: formatDateTime(now),
    }

    set((s) => ({
      transportTasks: [...s.transportTasks, newTask],
    }))

    get().createDefaultTransitNodes(transportId)
  },

  createDefaultTransitNodes: (transportId) => {
    const state = get()
    const task = state.transportTasks.find((t) => t.id === transportId)
    if (!task) return

    const existingNodes = state.transitNodes.filter((n) => n.transportId === transportId)
    if (existingNodes.length > 0) return

    const now = new Date()
    const formatDateTime = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 16)

    const defaultNodes = [
      {
        name: '始发仓',
        location: task.origin,
        order: 1,
        daysOffset: 1,
      },
      {
        name: '中转仓A',
        location: '杭州',
        order: 2,
        daysOffset: 2,
      },
      {
        name: '中转仓B',
        location: '武汉',
        order: 3,
        daysOffset: 3,
      },
      {
        name: '目的地仓',
        location: task.destination,
        order: 4,
        daysOffset: 5,
      },
    ]

    let currentNodes = [...state.transitNodes]
    const newNodes: TransitNode[] = []

    defaultNodes.forEach((node) => {
      const estimatedTime = new Date(now.getTime() + node.daysOffset * 24 * 60 * 60 * 1000)
      const nodeId = getNextId('TN', currentNodes)
      const newNode: TransitNode = {
        id: nodeId,
        transportId,
        name: node.name,
        location: node.location,
        status: '未到达',
        estimatedTime: formatDateTime(estimatedTime),
        order: node.order,
      }
      newNodes.push(newNode)
      currentNodes.push(newNode)
    })

    set((s) => ({
      transitNodes: [...s.transitNodes, ...newNodes],
    }))
  },
}))

export default useStore
