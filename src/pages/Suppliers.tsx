import { useState, useMemo } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Users, Award, TrendingUp, Search, Star, Phone, MapPin, X, Shield } from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { Supplier } from '@/types'

const categories = ['全部', '综合物流', '冷链运输', '集装箱运输', '散货运输', '危化品运输', '大宗物资']

const barColor = (rate: number) =>
  rate >= 90 ? 'bg-emerald-500' : rate >= 80 ? 'bg-yellow-500' : 'bg-red-500'

const scoreColor = (score: number) =>
  score >= 85 ? 'text-orange-500' : 'text-blue-500'

export default function Suppliers() {
  const suppliers = useStore((s) => s.suppliers)
  const [category, setCategory] = useState('全部')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Supplier | null>(null)

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      const matchCat = category === '全部' || s.category === category
      const matchSearch = s.name.includes(search) || s.qualification.includes(search)
      return matchCat && matchSearch
    })
  }, [suppliers, category, search])

  const stats = useMemo(() => {
    const total = suppliers.length
    const avgRate = total
      ? Math.round(suppliers.reduce((s, v) => s + v.fulfillmentRate, 0) / total * 10) / 10
      : 0
    const top = [...suppliers].sort((a, b) => b.overallScore - a.overallScore)[0]
    const qualified = suppliers.filter((s) => s.fulfillmentRate >= 90).length
    return { total, avgRate, topName: top?.name ?? '-', qualified }
  }, [suppliers])

  const radarData = selected
    ? [
        { dim: '价格', value: selected.priceScore },
        { dim: '时效', value: selected.timeScore },
        { dim: '服务', value: selected.serviceScore },
        { dim: '资质', value: selected.qualificationScore },
        { dim: '履约', value: selected.fulfillmentRate },
      ]
    : []

  const scoreBreakdown = selected
    ? [
        { label: '价格评分', value: selected.priceScore, color: 'bg-blue-500' },
        { label: '时效评分', value: selected.timeScore, color: 'bg-violet-500' },
        { label: '服务评分', value: selected.serviceScore, color: 'bg-cyan-500' },
        { label: '资质评分', value: selected.qualificationScore, color: 'bg-emerald-500' },
        { label: '履约率', value: selected.fulfillmentRate, color: 'bg-orange-500' },
      ]
    : []

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-brand-500">供应商选择</h1>
        <div className="flex items-center gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-surface-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索供应商..."
              className="pl-9 pr-3 py-2 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 w-52"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="供应商总数" value={stats.total} icon={Users} color="blue" />
        <StatsCard label="平均履约率" value={`${stats.avgRate}%`} icon={TrendingUp} color="green" />
        <StatsCard label="最佳供应商" value={stats.topName} icon={Star} color="orange" />
        <StatsCard label="达标供应商" value={stats.qualified} icon={Award} color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-surface-100 p-5 hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-brand-500 text-base">{s.name}</h3>
                <span className="inline-block mt-1 text-xs bg-accent-50 text-accent-600 px-2 py-0.5 rounded-full">{s.category}</span>
              </div>
              <div className={`text-2xl font-bold ${scoreColor(s.overallScore)}`}>{s.overallScore}</div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Shield className="w-3.5 h-3.5 text-accent-500" />
              {s.qualification}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-surface-500">履约率</span>
                <span className="font-medium text-surface-400">{s.fulfillmentRate}%</span>
              </div>
              <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor(s.fulfillmentRate)}`}
                  style={{ width: `${s.fulfillmentRate}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setSelected(s)}
              className="mt-auto w-full py-2 text-sm font-medium text-accent-500 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
            >
              查看评估
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-surface-400">暂无匹配的供应商</div>
      )}

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto animate-[slideInRight_0.3s_ease]">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-brand-500">供应商评估</h2>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-surface-50 transition-colors">
                  <X className="w-5 h-5 text-surface-400" />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-brand-500">{selected.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-surface-500">类别</span>
                  <span className="text-brand-500">{selected.category}</span>
                  <span className="text-surface-500">资质</span>
                  <span className="text-brand-500">{selected.qualification}</span>
                  <span className="text-surface-500">联系人</span>
                  <span className="text-brand-500">{selected.contactPerson}</span>
                  <span className="text-surface-500">电话</span>
                  <span className="flex items-center gap-1 text-brand-500"><Phone className="w-3.5 h-3.5" />{selected.contactPhone}</span>
                  <span className="text-surface-500">地址</span>
                  <span className="flex items-start gap-1 text-brand-500"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{selected.address}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-brand-500 mb-3">能力雷达图</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#D5D9E5" />
                    <PolarAngleAxis dataKey="dim" tick={{ fill: '#7D87A1', fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9AA3B8', fontSize: 10 }} />
                    <Radar dataKey="value" fill="#FF6B35" fillOpacity={0.3} stroke="#FF6B35" strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-brand-500 mb-3">评分明细</h4>
                <div className="space-y-3">
                  {scoreBreakdown.map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-surface-500">{item.label}</span>
                        <span className="font-medium text-surface-400">{item.value}</span>
                      </div>
                      <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color} transition-all`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
