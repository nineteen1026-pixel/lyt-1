import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { GitCompareArrows, Trophy, TrendingDown, Star, Clock } from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { Demand, Quote, Supplier } from '@/types'

const rankBadge = (rank: number) => {
  if (rank === 1) return 'bg-yellow-400 text-yellow-900'
  if (rank === 2) return 'bg-gray-300 text-gray-800'
  if (rank === 3) return 'bg-amber-600 text-white'
  return 'bg-surface-200 text-surface-500'
}

export default function Quotes() {
  const { demands, quotes, suppliers } = useStore()
  const [selectedDemandId, setSelectedDemandId] = useState<string>('')

  const demandsWithQuotes = useMemo(
    () => demands.filter((d) => quotes.some((q) => q.demandId === d.id)),
    [demands, quotes]
  )

  const activeDemandId = selectedDemandId || demandsWithQuotes[0]?.id || ''

  const filteredQuotes = useMemo(
    () => quotes.filter((q) => q.demandId === activeDemandId),
    [quotes, activeDemandId]
  )

  const enriched = useMemo(() => {
    return filteredQuotes.map((q) => {
      const supplier = suppliers.find((s) => s.id === q.supplierId)
      return { ...q, supplierName: supplier?.name || '未知供应商' }
    })
  }, [filteredQuotes, suppliers])

  const stats = useMemo(() => {
    if (!enriched.length) return { total: 0, lowest: 0, shortest: 0, bestScore: 0 }
    return {
      total: enriched.length,
      lowest: Math.min(...enriched.map((q) => q.price)),
      shortest: Math.min(...enriched.map((q) => q.transitDays)),
      bestScore: Math.max(...enriched.map((q) => q.serviceScore)),
    }
  }, [enriched])

  const maxPrice = Math.max(...enriched.map((q) => q.price), 1)
  const maxDays = Math.max(...enriched.map((q) => q.transitDays), 1)

  const ranked = useMemo(() => {
    return [...enriched]
      .map((q) => {
        const composite =
          (1 - q.price / maxPrice) * 40 +
          (1 - q.transitDays / maxDays) * 30 +
          (q.serviceScore / 100) * 30
        return { ...q, composite: Math.round(composite * 100) / 100 }
      })
      .sort((a, b) => b.composite - a.composite)
  }, [enriched, maxPrice, maxDays])

  const bestPriceIdx = enriched.findIndex((q) => q.price === stats.lowest)
  const bestDaysIdx = enriched.findIndex((q) => q.transitDays === stats.shortest)
  const bestScoreIdx = enriched.findIndex((q) => q.serviceScore === stats.bestScore)

  const chartData = enriched.map((q) => ({
    name: q.supplierName.length > 4 ? q.supplierName.slice(0, 4) : q.supplierName,
    price: q.price,
    isLowest: q.price === stats.lowest,
  }))

  const metrics = [
    { label: '价格', key: 'price' as const, suffix: '元', bestIdx: bestPriceIdx },
    { label: '运输天数', key: 'transitDays' as const, suffix: '天', bestIdx: bestDaysIdx },
    { label: '服务评分', key: 'serviceScore' as const, suffix: '分', bestIdx: bestScoreIdx },
    { label: '有效期', key: 'validUntil' as const, suffix: '', bestIdx: -1 },
    { label: '状态', key: 'status' as const, suffix: '', bestIdx: -1 },
    { label: '备注', key: 'remarks' as const, suffix: '', bestIdx: -1 },
  ]

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
            <GitCompareArrows className="w-5 h-5 text-accent-600" />
          </div>
          <h1 className="text-2xl font-bold text-brand-500">报价对比</h1>
        </div>
        <select
          value={activeDemandId}
          onChange={(e) => setSelectedDemandId(e.target.value)}
          className="border border-surface-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          {demandsWithQuotes.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="报价数量" value={stats.total} icon={GitCompareArrows} color="blue" />
        <StatsCard label="最低价格" value={stats.lowest ? `¥${stats.lowest.toLocaleString()}` : '-'} icon={TrendingDown} color="orange" />
        <StatsCard label="最短运输天数" value={stats.shortest ? `${stats.shortest}天` : '-'} icon={Clock} color="green" />
        <StatsCard label="最高服务评分" value={stats.bestScore || '-'} icon={Star} color="purple" />
      </div>

      {enriched.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="px-4 py-3 text-left font-semibold text-surface-500 w-24">指标</th>
                  {enriched.map((q) => (
                    <th key={q.id} className="px-4 py-3 text-center font-semibold text-brand-500 min-w-[120px]">
                      {q.supplierName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((m) => (
                  <tr key={m.key} className="border-b border-surface-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-surface-500">{m.label}</td>
                    {enriched.map((q, i) => {
                      const isBest = i === m.bestIdx
                      const val = q[m.key]
                      return (
                        <td key={q.id} className={`px-4 py-3 text-center ${isBest ? 'text-accent-500 font-bold' : 'text-brand-500'}`}>
                          <span className="inline-flex items-center gap-1">
                            {val}{m.suffix}
                            {isBest && (
                              <span className="text-[10px] bg-accent-500 text-white px-1.5 py-0.5 rounded-full leading-none">最优</span>
                            )}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
            <h2 className="text-lg font-bold text-brand-500 mb-4">价格对比图</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => [`¥${v.toLocaleString()}`, '价格']} />
                <Bar dataKey="price" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.isLowest ? '#FF6B35' : '#1B2A4A'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-accent-500" />
              <h2 className="text-lg font-bold text-brand-500">综合排名</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ranked.map((q, i) => (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 flex items-start gap-3 ${
                    i === 0 ? 'border-accent-500 bg-accent-50' : 'border-surface-100 bg-white'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${rankBadge(i + 1)}`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-brand-500 truncate">{q.supplierName}</p>
                    <p className="text-xs text-surface-500 mt-1">
                      价格 ¥{q.price.toLocaleString()} · {q.transitDays}天 · 评分{q.serviceScore}
                    </p>
                    <p className="text-sm font-bold text-accent-500 mt-1">综合得分 {q.composite}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {!enriched.length && (
        <div className="text-center py-20 text-surface-400">暂无报价数据</div>
      )}
    </div>
  )
}
