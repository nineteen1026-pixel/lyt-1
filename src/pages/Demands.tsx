import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Package, Clock, CheckCircle2, XCircle, ArrowRight, X, CheckCircle, Send } from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { Demand, DemandStatus, Urgency } from '@/types'

const urgencyStyle: Record<Urgency, string> = {
  '紧急': 'bg-red-100 text-red-700',
  '高': 'bg-orange-100 text-orange-700',
  '中': 'bg-blue-100 text-blue-700',
  '低': 'bg-gray-100 text-gray-600',
}

const statusStyle: Record<string, string> = {
  '待报价': 'bg-gray-100 text-gray-600',
  '报价中': 'bg-blue-100 text-blue-700',
  '已选商': 'bg-purple-100 text-purple-700',
  '审批中': 'bg-orange-100 text-orange-700',
  '已通过': 'bg-green-100 text-green-700',
  '已完成': 'bg-emerald-100 text-emerald-700',
  '已取消': 'bg-red-100 text-red-700',
}

const statusList: DemandStatus[] = ['待报价', '报价中', '已选商', '审批中', '已完成', '已取消']
const urgencyList: Urgency[] = ['紧急', '高', '中', '低']

const initForm = {
  title: '', cargoType: '', origin: '', destination: '',
  quantity: 0, unit: '吨', urgency: '中' as Urgency,
  expectedDate: '', description: '',
}

export default function Demands() {
  const { demands, addDemand, quotes, suppliers, acceptQuote, initiateApproval, approvals } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected] = useState<Demand | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(initForm)

  const filtered = useMemo(() => demands.filter(d =>
    (!statusFilter || d.status === statusFilter) &&
    (!urgencyFilter || d.urgency === urgencyFilter) &&
    (!search || d.title.includes(search) || d.id.includes(search) || d.cargoType.includes(search))
  ), [demands, statusFilter, urgencyFilter, search])

  const stats = useMemo(() => ({
    total: demands.length,
    pending: demands.filter(d => d.status === '待报价').length,
    inProgress: demands.filter(d => ['报价中', '已选商', '审批中'].includes(d.status)).length,
    completed: demands.filter(d => d.status === '已完成').length,
  }), [demands])

  const relatedQuotes = useMemo(() => {
    if (!selected) return []
    return quotes.filter(q => q.demandId === selected.id).map(q => ({
      ...q,
      supplierName: suppliers.find(s => s.id === q.supplierId)?.name ?? '未知',
    }))
  }, [selected, quotes, suppliers])

  const handleSubmit = () => {
    if (!form.title || !form.cargoType || !form.origin || !form.destination || !form.expectedDate) return
    addDemand(form)
    setForm(initForm)
    setShowModal(false)
  }

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const inputCls = 'w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
  const selectCls = 'border border-surface-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">需求池</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" />新建需求
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatsCard label="总需求数" value={stats.total} icon={Package} color="blue" />
        <StatsCard label="待报价" value={stats.pending} icon={Clock} color="orange" />
        <StatsCard label="进行中" value={stats.inProgress} icon={Filter} color="purple" />
        <StatsCard label="已完成" value={stats.completed} icon={CheckCircle2} color="green" />
      </div>

      <div className="flex items-center gap-4">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
          <option value="">全部状态</option>
          {statusList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value)} className={selectCls}>
          <option value="">全部紧急度</option>
          {urgencyList.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索需求ID/标题/货物类型" className={`${inputCls} pl-10`} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-50 text-surface-500 text-left">
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">需求标题</th>
                <th className="px-4 py-3 font-medium">货物类型</th>
                <th className="px-4 py-3 font-medium">路线</th>
                <th className="px-4 py-3 font-medium">数量</th>
                <th className="px-4 py-3 font-medium">紧急度</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">期望日期</th>
                <th className="px-4 py-3 font-medium">创建时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(d => (
                <tr key={d.id} onClick={() => setSelected(d)} className="cursor-pointer hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 text-brand-600 font-medium">{d.id}</td>
                  <td className="px-4 py-3 text-surface-900 max-w-[200px] truncate">{d.title}</td>
                  <td className="px-4 py-3 text-surface-600">{d.cargoType}</td>
                  <td className="px-4 py-3 text-surface-600 whitespace-nowrap">
                    {d.origin}<ArrowRight className="inline w-3 h-3 mx-1 text-surface-400" />{d.destination}
                  </td>
                  <td className="px-4 py-3 text-surface-600">{d.quantity} {d.unit}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyStyle[d.urgency]}`}>{d.urgency}</span></td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[d.status] ?? 'bg-gray-100 text-gray-600'}`}>{d.status}</span></td>
                  <td className="px-4 py-3 text-surface-600 whitespace-nowrap">{d.expectedDate}</td>
                  <td className="px-4 py-3 text-surface-400 whitespace-nowrap">{d.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-surface-400">暂无匹配的需求</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl mx-4 p-6 animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-surface-900">新建需求</h2>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">需求标题</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} placeholder="请输入需求标题" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">货物类型</label>
                <input value={form.cargoType} onChange={e => set('cargoType', e.target.value)} className={inputCls} placeholder="如：电子元器件" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">紧急度</label>
                <select value={form.urgency} onChange={e => set('urgency', e.target.value)} className={selectCls + ' w-full'}>
                  {urgencyList.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">起始地</label>
                <input value={form.origin} onChange={e => set('origin', e.target.value)} className={inputCls} placeholder="如：上海浦东" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">目的地</label>
                <input value={form.destination} onChange={e => set('destination', e.target.value)} className={inputCls} placeholder="如：成都青白江" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">数量</label>
                <input type="number" value={form.quantity || ''} onChange={e => set('quantity', Number(e.target.value))} className={inputCls} placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">单位</label>
                <select value={form.unit} onChange={e => set('unit', e.target.value)} className={selectCls + ' w-full'}>
                  {['吨', '立方米', '标准箱', '托盘', '件'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">期望日期</label>
                <input type="date" value={form.expectedDate} onChange={e => set('expectedDate', e.target.value)} className={inputCls} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">描述</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className={inputCls + ' resize-none'} placeholder="请输入需求描述" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-surface-200 text-surface-600 text-sm hover:bg-surface-50 transition-colors">取消</button>
              <button onClick={handleSubmit} className="px-6 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors">提交</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative w-full max-w-lg bg-white h-full overflow-y-auto animate-fade-in-up shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-surface-900">需求详情</h2>
              <button onClick={() => setSelected(null)} className="text-surface-400 hover:text-surface-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-brand-600 font-bold">{selected.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle[selected.status] ?? 'bg-gray-100 text-gray-600'}`}>{selected.status}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgencyStyle[selected.urgency]}`}>{selected.urgency}</span>
              </div>
              <h3 className="text-base font-semibold text-surface-900">{selected.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-surface-400">货物类型</span><p className="text-surface-800 mt-0.5">{selected.cargoType}</p></div>
                <div><span className="text-surface-400">数量</span><p className="text-surface-800 mt-0.5">{selected.quantity} {selected.unit}</p></div>
                <div><span className="text-surface-400">起始地</span><p className="text-surface-800 mt-0.5">{selected.origin}</p></div>
                <div><span className="text-surface-400">目的地</span><p className="text-surface-800 mt-0.5">{selected.destination}</p></div>
                <div><span className="text-surface-400">期望日期</span><p className="text-surface-800 mt-0.5">{selected.expectedDate}</p></div>
                <div><span className="text-surface-400">创建时间</span><p className="text-surface-800 mt-0.5">{selected.createdAt}</p></div>
              </div>
              {selected.description && (
                <div className="text-sm"><span className="text-surface-400">描述</span><p className="text-surface-700 mt-1 leading-relaxed">{selected.description}</p></div>
              )}
              {relatedQuotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-surface-800 mb-3">相关报价 ({relatedQuotes.length})</h4>
                  <div className="space-y-3">
                    {relatedQuotes.map(q => (
                      <div key={q.id} className="bg-surface-50 rounded-lg p-3 text-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-surface-800">{q.supplierName}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${q.status === '有效' ? 'bg-green-100 text-green-700' : q.status === '已采纳' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{q.status}</span>
                        </div>
                        <div className="flex gap-4 text-surface-500">
                          <span>报价: <em className="text-brand-600 font-medium not-italic">¥{q.price.toLocaleString()}</em></span>
                          <span>运输: {q.transitDays}天</span>
                          <span>服务评分: {q.serviceScore}</span>
                        </div>
                        {q.remarks && <p className="text-surface-400 text-xs">{q.remarks}</p>}
                        {selected && selected.status === '报价中' && q.status === '有效' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              acceptQuote(q.id, selected.id)
                            }}
                            className="mt-2 w-full py-1.5 rounded-md bg-accent-500 hover:bg-accent-600 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> 采纳此报价
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected && selected.status === '已选商' && !approvals.some(a => a.demandId === selected.id) && (
                <button
                  onClick={() => {
                    const acceptedQuote = relatedQuotes.find(q => q.status === '已采纳')
                    const supplier = suppliers.find(s => s.id === acceptedQuote?.supplierId)
                    if (acceptedQuote && supplier) {
                      initiateApproval({
                        demandId: selected.id,
                        supplierId: supplier.id,
                        totalPrice: acceptedQuote.price,
                        demandTitle: selected.title,
                        supplierName: supplier.name,
                      })
                    }
                  }}
                  className="w-full py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> 发起审批
                </button>
              )}
              {selected && approvals.some(a => a.demandId === selected.id) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  该需求已发起审批，请前往审批状态页面查看
                </div>
              )}
              {relatedQuotes.length === 0 && (
                <div className="text-center py-6 text-surface-400 text-sm">暂无相关报价</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
