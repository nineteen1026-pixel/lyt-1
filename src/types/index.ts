export type DemandStatus = '待报价' | '报价中' | '已选商' | '审批中' | '已完成' | '已取消'
export type Urgency = '紧急' | '高' | '中' | '低'
export type ApprovalStatus = '待审批' | '审批中' | '已通过' | '已驳回'
export type ApprovalAction = '通过' | '驳回' | '提交'
export type TransportStatus = '待执行' | '运输中' | '已完成' | '已取消'
export type TransitNodeStatus = '未到达' | '已到达' | '已出发'
export type ExceptionStatus = '待处理' | '处理中' | '已解决'
export type ExceptionType = '车辆故障' | '交通拥堵' | '天气原因' | '货物损坏' | '延误' | '破损' | '改派' | '其他'
export type ExceptionSeverity = '轻微' | '一般' | '严重' | '重大'

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
  exceptionCount?: number
  resolvedExceptionCount?: number
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

export interface TransportTask {
  id: string
  approvalId: string
  demandId: string
  demandTitle: string
  supplierId: string
  supplierName: string
  origin: string
  destination: string
  cargoType: string
  quantity: number
  unit: string
  totalPrice: number
  status: TransportStatus
  plateNumber: string
  driverName: string
  driverPhone: string
  estimatedDeparture: string
  estimatedArrival: string
  actualDeparture?: string
  actualArrival?: string
  createdAt: string
}

export interface TransitNode {
  id: string
  transportId: string
  name: string
  location: string
  status: TransitNodeStatus
  estimatedTime: string
  actualTime?: string
  remark?: string
  order: number
}

export interface ExceptionReport {
  id: string
  transportId: string
  demandId: string
  supplierId: string
  type: ExceptionType
  severity: ExceptionSeverity
  description: string
  status: ExceptionStatus
  reporter: string
  reportedAt: string
  handledBy?: string
  handledAt?: string
  solution?: string
  lossAmount?: number
  scoreImpact?: number
  delayHours?: number
}

export interface RouteCostAnalysis {
  id: string
  route: string
  origin: string
  destination: string
  totalShipments: number
  avgCostPerUnit: number
  minCost: number
  maxCost: number
  totalCost: number
  avgTransitDays: number
  costTrend: 'up' | 'down' | 'stable'
}

export interface CargoTypeCostAnalysis {
  id: string
  cargoType: string
  totalShipments: number
  totalCost: number
  avgCostPerUnit: number
  avgCostPerKg: number
  costPercentage: number
  lossAmount: number
  lossRate: number
}

export interface SupplierCostAnalysis {
  id: string
  supplierId: string
  supplierName: string
  totalQuotes: number
  acceptedQuotes: number
  avgQuotePrice: number
  avgAcceptedPrice: number
  totalCost: number
  priceCompetitiveness: number
  avgTransitDays: number
  onTimeRate: number
  costSaving: number
}

export interface QuoteComparison {
  demandId: string
  demandTitle: string
  cargoType: string
  origin: string
  destination: string
  quantity: number
  unit: string
  quotes: Array<{
    quoteId: string
    supplierId: string
    supplierName: string
    price: number
    transitDays: number
    serviceScore: number
    status: string
    isAccepted: boolean
  }>
  finalCost: number
  finalSupplier: string
  savingAmount: number
  savingPercentage: number
}

export interface CostAnalysisSummary {
  totalCost: number
  totalShipments: number
  avgCostPerShipment: number
  costSavingTotal: number
  avgSavingPercentage: number
  topRoute: string
  topCargoType: string
  topSupplier: string
}

export type WarningRuleType = 'eta' | 'exception' | 'supplier_score'
export type WarningLevel = 'info' | 'warning' | 'danger'
export type WarningStatus = '未读' | '已读' | '已处理'

export interface WarningRule {
  id: string
  name: string
  type: WarningRuleType
  enabled: boolean
  level: WarningLevel
  conditions: {
    etaHoursThreshold?: number
    exceptionTypes?: ExceptionType[]
    exceptionSeverities?: ExceptionSeverity[]
    scoreThreshold?: number
  }
  notifyMethods: string[]
  description: string
  createdAt: string
}

export interface WarningNotification {
  id: string
  ruleId: string
  ruleName: string
  ruleType: WarningRuleType
  level: WarningLevel
  title: string
  message: string
  status: WarningStatus
  transportId?: string
  supplierId?: string
  supplierName?: string
  exceptionId?: string
  nodeId?: string
  nodeName?: string
  triggeredAt: string
  handledAt?: string
  handledBy?: string
}
