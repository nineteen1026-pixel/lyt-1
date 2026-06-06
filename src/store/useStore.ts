import { create } from 'zustand'
import type { Demand, Quote, Supplier, Approval, ApprovalRecord, DemandStatus, Urgency, ApprovalStatus, ApprovalAction } from '@/types'
import { generateAllData } from '@/data/mock'

interface SupplyChainStore {
  demands: Demand[]
  quotes: Quote[]
  suppliers: Supplier[]
  approvals: Approval[]
  approvalRecords: ApprovalRecord[]

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
    const hasFirstReview = records.some((r) => r.action === '通过' && r.comment?.includes('初审'))
    const step = hasFirstReview ? '终审' : '初审'
    const newStatus: ApprovalStatus = hasFirstReview ? '已通过' : '审批中'
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
}))

export default useStore
