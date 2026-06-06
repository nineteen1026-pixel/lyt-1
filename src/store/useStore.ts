import { create } from 'zustand'
import type { Demand, Quote, Supplier, Approval, ApprovalRecord, DemandStatus, Urgency, ApprovalStatus, ApprovalAction, TransportTask, TransitNode, ExceptionReport, TransportStatus, ExceptionStatus } from '@/types'
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
  addExceptionReport: (report: Omit<ExceptionReport, 'id' | 'reportedAt'>) => void
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

const useStore = create<SupplyChainStore>((set, get) => ({
  demands: initialData.demands,
  quotes: initialData.quotes,
  suppliers: initialData.suppliers,
  approvals: initialData.approvals,
  approvalRecords: initialData.approvalRecords,
  transportTasks: initialData.transportTasks,
  transitNodes: initialData.transitNodes,
  exceptionReports: initialData.exceptionReports,

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
    set((state) => ({
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
    }))
  },

  addExceptionReport: (report) => {
    const id = getNextId('EX', get().exceptionReports)
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16)
    set((state) => ({
      exceptionReports: [
        ...state.exceptionReports,
        {
          ...report,
          id,
          reportedAt: now,
        },
      ],
    }))
  },
}))

export default useStore
