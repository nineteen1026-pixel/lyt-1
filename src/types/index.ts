export type DemandStatus = '待报价' | '报价中' | '已选商' | '审批中' | '已完成' | '已取消'
export type Urgency = '紧急' | '高' | '中' | '低'
export type ApprovalStatus = '待审批' | '审批中' | '已通过' | '已驳回'
export type ApprovalAction = '通过' | '驳回' | '提交'

export interface Demand {
  id: string
  title: string
  cargoType: string
  origin: string
  destination: string
  quantity: number
  unit: string
  urgency: Urgency
  status: DemandStatus
  expectedDate: string
  createdAt: string
  description: string
}

export interface Quote {
  id: string
  demandId: string
  supplierId: string
  price: number
  transitDays: number
  serviceScore: number
  validUntil: string
  status: '有效' | '已过期' | '已采纳'
  remarks: string
}

export interface Supplier {
  id: string
  name: string
  category: string
  qualification: string
  fulfillmentRate: number
  priceScore: number
  timeScore: number
  serviceScore: number
  qualificationScore: number
  overallScore: number
  contactPerson: string
  contactPhone: string
  address: string
}

export interface Approval {
  id: string
  demandId: string
  supplierId: string
  status: ApprovalStatus
  createdAt: string
  demandTitle: string
  supplierName: string
  totalPrice: number
}

export interface ApprovalRecord {
  id: string
  approvalId: string
  approver: string
  action: ApprovalAction
  comment: string
  timestamp: string
}
