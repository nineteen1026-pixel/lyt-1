import type { Demand, Quote, Supplier, Approval, ApprovalRecord } from '@/types'

const cargoTypes = ['电子元器件', '机械零部件', '化工原料', '食品饮料', '纺织原料', '医疗器械', '汽车配件', '建材物资']
const origins = ['上海浦东', '深圳盐田', '广州黄埔', '宁波北仑', '天津新港', '青岛前湾', '大连大窑湾', '厦门海沧']
const destinations = ['成都青白江', '武汉阳逻', '重庆果园', '西安国际港', '长沙霞凝', '郑州航空港', '昆明王家营', '贵阳改貌']
const units = ['吨', '立方米', '标准箱', '托盘', '件']
const supplierNames = ['顺达国际物流', '远航供应链', '中运达集团', '捷通物流', '鼎盛货运', '安捷供应链', '宏远物流', '万通国际货运']
const categories = ['综合物流', '冷链运输', '集装箱运输', '散货运输', '危化品运输', '大宗物资']
const qualifications = ['AAA级信用企业', 'ISO9001认证', 'A级物流企业', '国家5A级物流', '海关AEO认证', 'ISO14001认证']
const approvers = ['王建国', '李明辉', '张秀英', '陈志强', '刘晓燕']
const demandTitles = [
  '长三角至西南电子元器件运输',
  '华南化工原料紧急调拨',
  '华北建材物资批量运输',
  '进口医疗器械分拨配送',
  '汽车零部件JIT配送',
  '纺织原料跨区域调拨',
  '食品饮料冷链运输',
  '机械设备项目物流',
  '跨境电商保税仓配送',
  '大宗散货港口集疏运',
  '精密仪器专项运输',
  '危化品合规运输',
  '生鲜农产品冷链配送',
  '工业原料定期班列',
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDate(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  return d.toISOString().split('T')[0]
}

function generateDateTime(daysOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + daysOffset)
  d.setHours(randomBetween(8, 18), randomBetween(0, 59))
  return d.toISOString().replace('T', ' ').slice(0, 16)
}

export function generateDemands(count: number = 14): Demand[] {
  const urgencies: Array<Demand['urgency']> = ['紧急', '高', '中', '低']
  const statuses: Array<Demand['status']> = ['待报价', '报价中', '已选商', '审批中', '已完成', '已取消']
  const statusWeights = [2, 3, 2, 3, 2, 1]

  return Array.from({ length: count }, (_, i) => {
    const statusIdx = weightedRandom(statusWeights)
    return {
      id: `DM-${String(1001 + i).padStart(4, '0')}`,
      title: demandTitles[i % demandTitles.length],
      cargoType: pick(cargoTypes),
      origin: pick(origins),
      destination: pick(destinations),
      quantity: randomBetween(5, 500),
      unit: pick(units),
      urgency: urgencies[randomBetween(0, 3)],
      status: statuses[statusIdx],
      expectedDate: generateDate(randomBetween(3, 30)),
      createdAt: generateDateTime(randomBetween(-30, -1)),
      description: `${demandTitles[i % demandTitles.length]}，要求安全准时送达，需提供全程追踪服务。`,
    }
  })
}

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

export function generateSuppliers(count: number = 8): Supplier[] {
  return Array.from({ length: count }, (_, i) => {
    const priceScore = randomBetween(60, 98)
    const timeScore = randomBetween(55, 95)
    const serviceScore = randomBetween(60, 97)
    const qualificationScore = randomBetween(65, 99)
    const fulfillmentRate = randomBetween(82, 99)
    const overallScore = Math.round((priceScore * 0.25 + timeScore * 0.2 + serviceScore * 0.25 + qualificationScore * 0.15 + fulfillmentRate * 0.15) * 10) / 10

    return {
      id: `SP-${String(2001 + i).padStart(4, '0')}`,
      name: supplierNames[i % supplierNames.length],
      category: pick(categories),
      qualification: pick(qualifications),
      fulfillmentRate,
      priceScore,
      timeScore,
      serviceScore,
      qualificationScore,
      overallScore,
      contactPerson: `${pick(['张', '李', '王', '赵', '刘'])}${pick(['经理', '总监', '主管'])}`,
      contactPhone: `1${randomBetween(30, 99)}${String(randomBetween(10000000, 99999999))}`,
      address: `${pick(['上海', '深圳', '广州', '宁波', '天津', '青岛'])}${pick(['市浦东新区', '市南山区', '市天河区', '市鄞州区', '市滨海新区'])}${pick(['物流大道', '港城路', '保税区', '产业园'])}${randomBetween(1, 200)}号`,
    }
  })
}

export function generateQuotes(demands: Demand[], suppliers: Supplier[]): Quote[] {
  const quotes: Quote[] = []
  const statuses: Array<Quote['status']> = ['有效', '已过期', '已采纳']

  demands.forEach((demand) => {
    if (demand.status === '待报价' || demand.status === '已取消') return
    const quoteCount = randomBetween(2, 4)
    const shuffled = [...suppliers].sort(() => Math.random() - 0.5).slice(0, quoteCount)

    const demandQuotes: Quote[] = []
    shuffled.forEach((supplier, j) => {
      const basePrice = demand.quantity * randomBetween(80, 300)
      demandQuotes.push({
        id: `QT-${String(3001 + quotes.length + demandQuotes.length).padStart(4, '0')}`,
        demandId: demand.id,
        supplierId: supplier.id,
        price: Math.round(basePrice * (1 + (j * 0.05)) * 100) / 100,
        transitDays: randomBetween(2, 15),
        serviceScore: randomBetween(70, 98),
        validUntil: generateDate(randomBetween(5, 30)),
        status: '有效',
        remarks: pick(['含保险', '含装卸', '门到门服务', '可开增值税发票', '全程温控', '优先发车']),
      })
    })

    if (demand.status === '已完成') {
      const bestIdx = demandQuotes.findIndex(q => q.price === Math.min(...demandQuotes.map(q => q.price)))
      if (bestIdx >= 0) demandQuotes[bestIdx].status = '已采纳'
    } else if (demand.status === '审批中' || demand.status === '已选商') {
      const pickedIdx = weightedRandom([6, 4])
      if (pickedIdx < demandQuotes.length) demandQuotes[pickedIdx].status = '已采纳'
    } else if (demand.status === '报价中') {
      const hasExpired = weightedRandom([3, 7])
      if (hasExpired === 0 && demandQuotes.length > 1) {
        demandQuotes[demandQuotes.length - 1].status = '已过期'
      }
    }

    quotes.push(...demandQuotes)
  })

  return quotes
}

export function generateApprovals(demands: Demand[], suppliers: Supplier[], quotes: Quote[]): Approval[] {
  const approvals: Approval[] = []
  const approvalStatuses: Array<Approval['status']> = ['待审批', '审批中', '已通过', '已驳回']

  demands
    .filter((d) => ['已选商', '审批中', '已完成'].includes(d.status))
    .forEach((demand) => {
      const demandQuotes = quotes.filter((q) => q.demandId === demand.id)
      const bestQuote = demandQuotes.sort((a, b) => a.price - b.price)[0]
      if (!bestQuote) return

      const supplier = suppliers.find((s) => s.id === bestQuote.supplierId)
      if (!supplier) return

      approvals.push({
        id: `AP-${String(4001 + approvals.length).padStart(4, '0')}`,
        demandId: demand.id,
        supplierId: supplier.id,
        status: demand.status === '已完成' ? '已通过' : pick(approvalStatuses),
        createdAt: generateDateTime(randomBetween(-15, -1)),
        demandTitle: demand.title,
        supplierName: supplier.name,
        totalPrice: bestQuote.price,
      })
    })

  return approvals
}

export function generateApprovalRecords(approvals: Approval[]): ApprovalRecord[] {
  const records: ApprovalRecord[] = []

  approvals.forEach((approval) => {
    records.push({
      id: `AR-${String(5001 + records.length).padStart(4, '0')}`,
      approvalId: approval.id,
      approver: '系统',
      action: '提交',
      comment: '提交审批申请',
      timestamp: approval.createdAt,
    })

    if (approval.status === '审批中' || approval.status === '已通过' || approval.status === '已驳回') {
      records.push({
        id: `AR-${String(5001 + records.length).padStart(4, '0')}`,
        approvalId: approval.id,
        approver: approvers[0],
        action: '通过',
        comment: '初审通过，转上级审批',
        timestamp: generateDateTime(randomBetween(-10, -1)),
      })
    }

    if (approval.status === '已通过') {
      records.push({
        id: `AR-${String(5001 + records.length).padStart(4, '0')}`,
        approvalId: approval.id,
        approver: approvers[1],
        action: '通过',
        comment: '终审通过，准予执行',
        timestamp: generateDateTime(randomBetween(-7, -1)),
      })
    }

    if (approval.status === '已驳回') {
      records.push({
        id: `AR-${String(5001 + records.length).padStart(4, '0')}`,
        approvalId: approval.id,
        approver: approvers[1],
        action: '驳回',
        comment: pick(['报价偏高，请重新议价', '供应商资质不足', '运输方案需优化', '预算超支，需调整方案']),
        timestamp: generateDateTime(randomBetween(-7, -1)),
      })
    }
  })

  return records
}

export function generateAllData() {
  const demands = generateDemands(14)
  const suppliers = generateSuppliers(8)
  const quotes = generateQuotes(demands, suppliers)
  const approvals = generateApprovals(demands, suppliers, quotes)
  const approvalRecords = generateApprovalRecords(approvals)
  return { demands, suppliers, quotes, approvals, approvalRecords }
}
