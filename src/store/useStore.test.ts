import { describe, it, expect, beforeEach } from 'vitest'
import useStore from './useStore'

describe('Quotation selection to approval process', () => {
  beforeEach(() => {
    useStore.getState().resetData()
  })

  it('complete flow: accept quote -> initiate approval -> first pass -> final pass -> create transport task', () => {
    useStore.getState().addDemand({
      title: 'Test demand - complete flow',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - complete flow')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('待报价')

    useStore.getState().acceptQuote(quote.id, demand.id)

    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('已选商')
    expect(useStore.getState().quotes.find(q => q.id === quote.id)!.status).toBe('已采纳')

    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('审批中')
    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    expect(approval).toBeDefined()
    expect(approval.status).toBe('待审批')

    const submitRecord = useStore.getState().approvalRecords.find(r => r.approvalId === approval.id)
    expect(submitRecord).toBeDefined()
    expect(submitRecord.action).toBe('提交')

    useStore.getState().approveApproval(approval.id, 'First pass')

    const approvalAfterFirst = useStore.getState().approvals.find(a => a.id === approval.id)!
    const firstPassRecords = useStore.getState().approvalRecords.filter(
      r => r.approvalId === approval.id && r.action === '通过'
    )
    expect(approvalAfterFirst.status).toBe('审批中')
    expect(firstPassRecords.length).toBe(1)
    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('审批中')

    useStore.getState().approveApproval(approval.id, 'Final pass')

    const approvalAfterSecond = useStore.getState().approvals.find(a => a.id === approval.id)!
    const secondPassRecords = useStore.getState().approvalRecords.filter(
      r => r.approvalId === approval.id && r.action === '通过'
    )
    expect(approvalAfterSecond.status).toBe('已通过')
    expect(secondPassRecords.length).toBe(2)
    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('已完成')

    const transportTask = useStore.getState().transportTasks.find(t => t.approvalId === approval.id)
    expect(transportTask).toBeDefined()
    expect(transportTask.status).toBe('待执行')
    expect(transportTask.demandId).toBe(demand.id)
    expect(transportTask.supplierId).toBe(supplier.id)

    const transitNodes = useStore.getState().transitNodes.filter(n => n.transportId === transportTask.id)
    expect(transitNodes.length).toBe(4)
  })

  it('other quotes remain valid when one quote is accepted', () => {
    useStore.getState().addDemand({
      title: 'Test demand - multiple quotes',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - multiple quotes')!
    const supplier1 = useStore.getState().suppliers[0]
    const supplier2 = useStore.getState().suppliers[1]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier1.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Quote 1',
    })
    const quote1 = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier2.id,
      price: 9000,
      transitDays: 4,
      serviceScore: 85,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Quote 2',
    })
    const quote2 = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote1.id, demand.id)

    expect(useStore.getState().quotes.find(q => q.id === quote1.id)!.status).toBe('已采纳')
    expect(useStore.getState().quotes.find(q => q.id === quote2.id)!.status).toBe('有效')
  })

  it('selectSupplierAndInitiateApproval completes selection and approval in one step', () => {
    useStore.getState().addDemand({
      title: 'Test demand - direct select',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - direct select')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().selectSupplierAndInitiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
    })

    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('审批中')

    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)
    expect(approval).toBeDefined()
    expect(approval.supplierId).toBe(supplier.id)
    expect(approval.status).toBe('待审批')

    const acceptedQuote = useStore.getState().quotes.find(
      q => q.demandId === demand.id && q.supplierId === supplier.id
    )
    expect(acceptedQuote).toBeDefined()
    expect(acceptedQuote.status).toBe('已采纳')
  })
})

describe('Approval rejection status rollback', () => {
  beforeEach(() => {
    useStore.getState().resetData()
  })

  it('demand status rolls back to selected after rejection at pending approval', () => {
    useStore.getState().addDemand({
      title: 'Test demand - reject pending',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - reject pending')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    expect(approval.status).toBe('待审批')

    useStore.getState().rejectApproval(approval.id, 'Price too high')

    expect(useStore.getState().approvals.find(a => a.id === approval.id)!.status).toBe('已驳回')
    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('已选商')

    const rejectRecord = useStore.getState().approvalRecords.find(
      r => r.approvalId === approval.id && r.action === '驳回'
    )
    expect(rejectRecord).toBeDefined()
    expect(rejectRecord.comment).toBe('Price too high')
  })

  it('demand status rolls back after rejection following first approval pass', () => {
    useStore.getState().addDemand({
      title: 'Test demand - reject after first pass',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - reject after first pass')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    useStore.getState().approveApproval(approval.id, 'First pass')

    expect(useStore.getState().approvals.find(a => a.id === approval.id)!.status).toBe('审批中')

    useStore.getState().rejectApproval(approval.id, 'Insufficient qualification')

    expect(useStore.getState().approvals.find(a => a.id === approval.id)!.status).toBe('已驳回')
    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('已选商')
  })

  it('can re-initiate approval after rejection', () => {
    useStore.getState().addDemand({
      title: 'Test demand - re-initiate',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - re-initiate')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const firstApproval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    useStore.getState().rejectApproval(firstApproval.id, 'Need more docs')

    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('已选商')

    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('审批中')

    const approvalsForDemand = useStore.getState().approvals.filter(a => a.demandId === demand.id)
    expect(approvalsForDemand.length).toBe(2)
    expect(approvalsForDemand.find(a => a.id === firstApproval.id)!.status).toBe('已驳回')
    const newApproval = approvalsForDemand.find(a => a.id !== firstApproval.id)!
    expect(newApproval.status).toBe('待审批')
  })

  it('accepted quote status remains unchanged after rejection', () => {
    useStore.getState().addDemand({
      title: 'Test demand - quote status',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - quote status')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    useStore.getState().rejectApproval(approval.id, 'Rejected')

    expect(useStore.getState().quotes.find(q => q.id === quote.id)!.status).toBe('已采纳')
  })

  it('no transport task created after rejection', () => {
    useStore.getState().addDemand({
      title: 'Test demand - no transport after reject',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - no transport after reject')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    expect(useStore.getState().transportTasks.filter(t => t.approvalId === approval.id).length).toBe(0)

    useStore.getState().rejectApproval(approval.id, 'Rejected')

    expect(useStore.getState().transportTasks.filter(t => t.approvalId === approval.id).length).toBe(0)
  })
})

describe('Approval process edge cases', () => {
  beforeEach(() => {
    useStore.getState().resetData()
  })

  it('approval records correctly track all operations in order', () => {
    useStore.getState().addDemand({
      title: 'Test demand - record order',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - record order')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const approval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    useStore.getState().approveApproval(approval.id, 'First pass')
    useStore.getState().rejectApproval(approval.id, 'Final rejection')

    const records = useStore.getState().approvalRecords
      .filter(r => r.approvalId === approval.id)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    expect(records.length).toBe(3)
    expect(records[0].action).toBe('提交')
    expect(records[1].action).toBe('通过')
    expect(records[2].action).toBe('驳回')
  })

  it('re-initiate approval after rejection can complete full flow successfully', () => {
    useStore.getState().addDemand({
      title: 'Test demand - full flow after reject',
      cargoType: 'Electronics',
      origin: 'Shanghai',
      destination: 'Chengdu',
      quantity: 100,
      unit: 'pcs',
      urgency: '中',
      expectedDate: '2026-06-10',
      description: 'Test description',
    })
    
    const demand = useStore.getState().demands.find(d => d.title === 'Test demand - full flow after reject')!
    const supplier = useStore.getState().suppliers[0]

    useStore.getState().addQuote({
      demandId: demand.id,
      supplierId: supplier.id,
      price: 8000,
      transitDays: 5,
      serviceScore: 90,
      validUntil: '2026-06-30',
      status: '有效',
      remarks: 'Test quote',
    })
    const quote = useStore.getState().quotes[useStore.getState().quotes.length - 1]

    useStore.getState().acceptQuote(quote.id, demand.id)
    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const firstApproval = useStore.getState().approvals.find(a => a.demandId === demand.id)!
    useStore.getState().rejectApproval(firstApproval.id, 'First rejection')

    useStore.getState().initiateApproval({
      demandId: demand.id,
      supplierId: supplier.id,
      totalPrice: quote.price,
      demandTitle: demand.title,
      supplierName: supplier.name,
    })

    const secondApproval = useStore.getState().approvals.find(
      a => a.demandId === demand.id && a.status === '待审批'
    )!
    expect(secondApproval).toBeDefined()
    expect(secondApproval.id).not.toBe(firstApproval.id)

    useStore.getState().approveApproval(secondApproval.id)
    useStore.getState().approveApproval(secondApproval.id)

    expect(useStore.getState().approvals.find(a => a.id === secondApproval.id)!.status).toBe('已通过')
    expect(useStore.getState().demands.find(d => d.id === demand.id)!.status).toBe('已完成')
    expect(useStore.getState().transportTasks.find(t => t.approvalId === secondApproval.id)).toBeDefined()
  })
})
