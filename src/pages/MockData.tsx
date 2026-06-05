import { useState, useMemo } from 'react'
import { Database, RefreshCw, Package, Users, GitCompareArrows, CheckCircle, AlertTriangle, Table } from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'

const demandStatuses = ['待报价', '报价中', '已选商', '审批中', '已完成', '已取消'] as const
const quoteStatuses = ['有效', '已过期', '已采纳'] as const
const approvalStatuses = ['待审批', '审批中', '已通过', '已驳回'] as const

const statusColorMap: Record<string, string> = {
  '待报价': 'bg-slate-100 text-slate-600',
  '报价中': 'bg-blue-100 text-blue-600',
  '已选商': 'bg-amber-100 text-amber-600',
  '审批中': 'bg-purple-100 text-purple-600',
  '已完成': 'bg-emerald-100 text-emerald-600',
  '已取消': 'bg-red-100 text-red-600',
  '紧急': 'bg-red-100 text-red-700',
  '高': 'bg-orange-100 text-orange-700',
  '中': 'bg-blue-100 text-blue-700',
  '低': 'bg-slate-100 text-slate-600',
}

const urgencyOrder: Record<string, number> = { '紧急': 0, '高': 1, '中': 2, '低': 3 }

export default function MockData() {
  const { demands, suppliers, quotes, approvals, approvalRecords, resetData } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)

  const demandBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    demandStatuses.forEach((s) => (map[s] = 0))
    demands.forEach((d) => (map[d.status] = (map[d.status] || 0) + 1))
    return map
  }, [demands])

  const quoteBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    quoteStatuses.forEach((s) => (map[s] = 0))
    quotes.forEach((q) => (map[q.status] = (map[q.status] || 0) + 1))
    return map
  }, [quotes])

  const approvalBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    approvalStatuses.forEach((s) => (map[s] = 0))
    approvals.forEach((a) => (map[a.status] = (map[a.status] || 0) + 1))
    return map
  }, [approvals])

  const avgOverallScore = useMemo(() => {
    if (!suppliers.length) return 0
    return (suppliers.reduce((s, sp) => s + sp.overallScore, 0) / suppliers.length).toFixed(1)
  }, [suppliers])

  const avgFulfillmentRate = useMemo(() => {
    if (!suppliers.length) return 0
    return (suppliers.reduce((s, sp) => s + sp.fulfillmentRate, 0) / suppliers.length).toFixed(1)
  }, [suppliers])

  const avgPrice = useMemo(() => {
    if (!quotes.length) return 0
    return (quotes.reduce((s, q) => s + q.price, 0) / quotes.length).toFixed(0)
  }, [quotes])

  const previewDemands = useMemo(() => demands.slice(0, 5), [demands])

  const handleReset = () => {
    if (confirmReset) {
      resetData()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
    }
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-brand-500" />
          <h1 className="text-2xl font-bold text-surface-800">数据 Mock 管理</h1>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleReset}
          onBlur={() => setConfirmReset(false)}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all duration-200 shadow-lg ${
            confirmReset
              ? 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          {confirmReset ? '确认重置?' : '重置所有数据'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard label="需求数" value={demands.length} icon={Package} color="blue" />
        <StatsCard label="供应商数" value={suppliers.length} icon={Users} color="green" />
        <StatsCard label="报价数" value={quotes.length} icon={GitCompareArrows} color="orange" />
        <StatsCard label="审批数" value={approvals.length} icon={CheckCircle} color="purple" />
        <StatsCard label="审批记录" value={approvalRecords.length} icon={AlertTriangle} color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />需求池
          </h3>
          <p className="text-3xl font-bold text-blue-600 mb-3">{demands.length}</p>
          <div className="grid grid-cols-3 gap-2">
            {demandStatuses.map((s) => (
              <div key={s} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-surface-600">{s}</span>
                <span className="font-semibold text-surface-800">{demandBreakdown[s]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-emerald-500">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-500" />供应商
          </h3>
          <p className="text-3xl font-bold text-emerald-600 mb-3">{suppliers.length}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
              <span className="text-surface-600">平均综合评分</span>
              <span className="font-semibold text-surface-800">{avgOverallScore}</span>
            </div>
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
              <span className="text-surface-600">平均履约率</span>
              <span className="font-semibold text-surface-800">{avgFulfillmentRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-orange-500" />报价
          </h3>
          <p className="text-3xl font-bold text-orange-600 mb-3">{quotes.length}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2 text-sm">
              <span className="text-surface-600">平均报价</span>
              <span className="font-semibold text-surface-800">¥{Number(avgPrice).toLocaleString()}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {quoteStatuses.map((s) => (
                <div key={s} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                  <span className="text-surface-600">{s}</span>
                  <span className="font-semibold text-surface-800">{quoteBreakdown[s]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
          <h3 className="font-bold text-surface-800 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-purple-500" />审批
          </h3>
          <p className="text-3xl font-bold text-purple-600 mb-3">{approvals.length}</p>
          <div className="grid grid-cols-2 gap-2">
            {approvalStatuses.map((s) => (
              <div key={s} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-surface-600">{s}</span>
                <span className="font-semibold text-surface-800">{approvalBreakdown[s]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-bold text-surface-800 mb-4 flex items-center gap-2">
          <Table className="w-4 h-4 text-surface-500" />需求数据预览
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200">
                <th className="text-left py-2.5 px-3 font-semibold text-surface-600">ID</th>
                <th className="text-left py-2.5 px-3 font-semibold text-surface-600">标题</th>
                <th className="text-left py-2.5 px-3 font-semibold text-surface-600">状态</th>
                <th className="text-left py-2.5 px-3 font-semibold text-surface-600">紧急度</th>
              </tr>
            </thead>
            <tbody>
              {previewDemands.map((d, i) => (
                <tr key={d.id} className={`border-b border-surface-100 ${i % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                  <td className="py-2 px-3 font-mono text-xs text-surface-500">{d.id}</td>
                  <td className="py-2 px-3 text-surface-800 truncate max-w-[260px]">{d.title}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorMap[d.status] || 'bg-slate-100 text-slate-600'}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColorMap[d.urgency] || 'bg-slate-100 text-slate-600'}`}>
                      {d.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {demands.length > 5 && (
          <p className="text-center text-xs text-surface-400 mt-3">仅显示前 5 条，共 {demands.length} 条需求</p>
        )}
      </div>
    </div>
  )
}
