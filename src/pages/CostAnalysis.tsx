import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  MapPin,
  Package,
  Truck,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowRight,
  CheckCircle,
  TrendingDown,
  Minus,
  Award,
  GitCompare,
} from 'lucide-react'
import useStore from '@/store/useStore'
import StatsCard from '@/components/StatsCard'
import type { QuoteComparison } from '@/types'

const COLORS = ['#1B2A4A', '#FF6B35', '#00B4D8', '#4CAF50', '#9C27B0', '#FF9800', '#F44336', '#8BC34A']

const trendIcon = {
  up: <TrendingUp className="w-3.5 h-3.5 text-red-500" />,
  down: <TrendingDown className="w-3.5 h-3.5 text-green-500" />,
  stable: <Minus className="w-3.5 h-3.5 text-gray-500" />,
}

const trendBadge = {
  up: 'bg-red-50 text-red-600',
  down: 'bg-green-50 text-green-600',
  stable: 'bg-gray-50 text-gray-600',
}

type TabType = 'overview' | 'route' | 'cargo' | 'supplier' | 'quote'

export default function CostAnalysis() {
  const {
    costAnalysisSummary,
    routeCostAnalysis,
    cargoTypeCostAnalysis,
    supplierCostAnalysis,
    quoteComparisons,
  } = useStore()

  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [selectedComparison, setSelectedComparison] = useState<string>('')

  const tabs: Array<{ key: TabType; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: '成本概览', icon: BarChart3 },
    { key: 'route', label: '路线分析', icon: MapPin },
    { key: 'cargo', label: '货类分析', icon: Package },
    { key: 'supplier', label: '供应商分析', icon: Truck },
    { key: 'quote', label: '报价对比', icon: GitCompare },
  ]

  const routeChartData = useMemo(() => {
    return routeCostAnalysis.slice(0, 8).map((r) => ({
      name: r.route.split('-').map((s) => s.slice(0, 2)).join('-'),
      avgCost: r.avgCostPerUnit,
      totalCost: r.totalCost,
      shipments: r.totalShipments,
    }))
  }, [routeCostAnalysis])

  const cargoChartData = useMemo(() => {
    return cargoTypeCostAnalysis.map((c) => ({
      name: c.cargoType,
      value: c.totalCost,
      percentage: c.costPercentage,
    }))
  }, [cargoTypeCostAnalysis])

  const supplierRadarData = useMemo(() => {
    const top5 = [...supplierCostAnalysis].sort((a, b) => b.totalCost - a.totalCost).slice(0, 5)
    return top5.map((s) => ({
      supplier: s.supplierName.length > 4 ? s.supplierName.slice(0, 4) : s.supplierName,
      价格竞争力: s.priceCompetitiveness,
      准时率: s.onTimeRate,
      成本节约: Math.min(s.costSaving / 100, 100),
      报价次数: Math.min(s.totalQuotes * 10, 100),
      采纳率: s.totalQuotes > 0 ? Math.round((s.acceptedQuotes / s.totalQuotes) * 100) : 0,
    }))
  }, [supplierCostAnalysis])

  const activeComparison = selectedComparison || quoteComparisons[0]?.demandId || ''
  const comparisonDetail = quoteComparisons.find((q) => q.demandId === activeComparison)

  const comparisonChartData = useMemo(() => {
    if (!comparisonDetail) return []
    return comparisonDetail.quotes.map((q) => ({
      name: q.supplierName.length > 4 ? q.supplierName.slice(0, 4) : q.supplierName,
      报价: q.price,
      运输天数: q.transitDays * 1000,
      服务评分: q.serviceScore * 100,
      isAccepted: q.isAccepted,
    }))
  }, [comparisonDetail])

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-brand-500">物流成本分析</h1>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md'
                  : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatsCard
              label="总运输成本"
              value={`¥${costAnalysisSummary.totalCost.toLocaleString()}`}
              icon={DollarSign}
              color="blue"
            />
            <StatsCard
              label="总运单数"
              value={costAnalysisSummary.totalShipments}
              icon={Package}
              color="orange"
            />
            <StatsCard
              label="平均单票成本"
              value={`¥${costAnalysisSummary.avgCostPerShipment.toLocaleString()}`}
              icon={TrendingUp}
              color="green"
            />
            <StatsCard
              label="累计成本节约"
              value={`¥${costAnalysisSummary.costSavingTotal.toLocaleString()}`}
              icon={TrendingDown}
              color="purple"
            />
            <StatsCard
              label="平均节约比例"
              value={`${costAnalysisSummary.avgSavingPercentage}%`}
              icon={Award}
              color="cyan"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
              <h2 className="text-lg font-bold text-brand-500 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                热门路线成本分布
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={routeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === 'totalCost') return [`¥${value.toLocaleString()}`, '总成本']
                      if (name === 'avgCost') return [`¥${value.toLocaleString()}`, '平均成本']
                      return [value, name]
                    }}
                  />
                  <Bar dataKey="totalCost" fill="#1B2A4A" radius={[4, 4, 0, 0]} name="总成本" />
                  <Bar dataKey="avgCost" fill="#FF6B35" radius={[4, 4, 0, 0]} name="平均成本" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
              <h2 className="text-lg font-bold text-brand-500 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-brand-500" />
                货类成本占比
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cargoChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    labelLine={{ stroke: '#999', strokeWidth: 0.5 }}
                  >
                    {cargoChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '成本']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
              <p className="text-sm text-surface-500">最热门路线</p>
              <p className="text-lg font-bold text-brand-500 mt-1">{costAnalysisSummary.topRoute}</p>
              <p className="text-xs text-surface-400 mt-1">按运单数量统计</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
              <p className="text-sm text-surface-500">最高成本货类</p>
              <p className="text-lg font-bold text-brand-500 mt-1">{costAnalysisSummary.topCargoType}</p>
              <p className="text-xs text-surface-400 mt-1">按总成本统计</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-5">
              <p className="text-sm text-surface-500">核心供应商</p>
              <p className="text-lg font-bold text-brand-500 mt-1">{costAnalysisSummary.topSupplier}</p>
              <p className="text-xs text-surface-400 mt-1">按合作金额统计</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'route' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
            <div className="p-4 border-b border-surface-100">
              <h2 className="text-lg font-bold text-brand-500 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                路线成本分析
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">路线</th>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">起点</th>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">终点</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">运单数</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">总成本</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">平均单票</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">最低成本</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">最高成本</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">平均时效</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {routeCostAnalysis.map((route) => (
                    <tr key={route.id} className="border-t border-surface-50 hover:bg-surface-50/50">
                      <td className="px-4 py-3 font-medium text-brand-500">{route.route}</td>
                      <td className="px-4 py-3 text-surface-600">{route.origin}</td>
                      <td className="px-4 py-3 text-surface-600">{route.destination}</td>
                      <td className="px-4 py-3 text-center text-surface-600">{route.totalShipments}</td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-500">
                        ¥{route.totalCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{route.avgCostPerUnit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{route.minCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{route.maxCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center text-surface-600">{route.avgTransitDays}天</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${trendBadge[route.costTrend]}`}
                        >
                          {trendIcon[route.costTrend]}
                          {route.costTrend === 'up' ? '上涨' : route.costTrend === 'down' ? '下降' : '平稳'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {routeCostAnalysis.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-surface-400">
                        暂无路线成本数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cargo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
            <div className="p-4 border-b border-surface-100">
              <h2 className="text-lg font-bold text-brand-500 flex items-center gap-2">
                <Package className="w-5 h-5 text-brand-500" />
                货类成本分析
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">货类</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">运单数</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">总成本</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">成本占比</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">平均单票</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">单位成本</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">货损金额</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">货损率</th>
                  </tr>
                </thead>
                <tbody>
                  {cargoTypeCostAnalysis.map((cargo) => (
                    <tr key={cargo.id} className="border-t border-surface-50 hover:bg-surface-50/50">
                      <td className="px-4 py-3 font-medium text-brand-500">{cargo.cargoType}</td>
                      <td className="px-4 py-3 text-center text-surface-600">{cargo.totalShipments}</td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-500">
                        ¥{cargo.totalCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">{cargo.costPercentage}%</td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{cargo.avgCostPerUnit.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{cargo.avgCostPerKg.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{cargo.lossAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            cargo.lossRate > 2 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {cargo.lossRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {cargoTypeCostAnalysis.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-surface-400">
                        暂无货类成本数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'supplier' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
              <h2 className="text-lg font-bold text-brand-500 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" />
                供应商综合能力雷达图
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={supplierRadarData}>
                  <PolarGrid stroke="#EBEDF3" />
                  <PolarAngleAxis dataKey="supplier" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  {supplierRadarData.map((_, i) => (
                    <Radar
                      key={i}
                      name={_.supplier}
                      dataKey={['价格竞争力', '准时率', '成本节约', '报价次数', '采纳率'][i % 5]}
                      stroke={COLORS[i % COLORS.length]}
                      fill={COLORS[i % COLORS.length]}
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
              <h2 className="text-lg font-bold text-brand-500 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-brand-500" />
                供应商成本节约对比
              </h2>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={supplierCostAnalysis
                    .sort((a, b) => b.costSaving - a.costSaving)
                    .slice(0, 8)
                    .map((s) => ({
                      name: s.supplierName.length > 4 ? s.supplierName.slice(0, 4) : s.supplierName,
                      成本节约: s.costSaving,
                    }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [`¥${value.toLocaleString()}`, '成本节约']} />
                  <Bar dataKey="成本节约" fill="#4CAF50" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
            <div className="p-4 border-b border-surface-100">
              <h2 className="text-lg font-bold text-brand-500 flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-500" />
                供应商成本详情
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-surface-500">供应商</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">报价次数</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">采纳次数</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">平均报价</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">平均成交价</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">合作总额</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">价格竞争力</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">平均时效</th>
                    <th className="px-4 py-3 text-center font-medium text-surface-500">准时率</th>
                    <th className="px-4 py-3 text-right font-medium text-surface-500">成本节约</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierCostAnalysis.map((supplier) => (
                    <tr key={supplier.id} className="border-t border-surface-50 hover:bg-surface-50/50">
                      <td className="px-4 py-3 font-medium text-brand-500">{supplier.supplierName}</td>
                      <td className="px-4 py-3 text-center text-surface-600">{supplier.totalQuotes}</td>
                      <td className="px-4 py-3 text-center text-surface-600">{supplier.acceptedQuotes}</td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{supplier.avgQuotePrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-surface-600">
                        ¥{supplier.avgAcceptedPrice.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-500">
                        ¥{supplier.totalCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            supplier.priceCompetitiveness > 10
                              ? 'bg-green-100 text-green-600'
                              : supplier.priceCompetitiveness > 0
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {supplier.priceCompetitiveness > 0 ? '+' : ''}
                          {supplier.priceCompetitiveness}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-surface-600">
                        {supplier.avgTransitDays}天
                      </td>
                      <td className="px-4 py-3 text-center text-surface-600">{supplier.onTimeRate}%</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">
                        ¥{supplier.costSaving.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {supplierCostAnalysis.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-surface-400">
                        暂无供应商成本数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quote' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-surface-600">选择需求：</label>
              <select
                value={activeComparison}
                onChange={(e) => setSelectedComparison(e.target.value)}
                className="flex-1 max-w-md border border-surface-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                {quoteComparisons.map((q) => (
                  <option key={q.demandId} value={q.demandId}>
                    {q.demandTitle}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {comparisonDetail && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
                  <p className="text-xs text-surface-500">最终成交成本</p>
                  <p className="text-xl font-bold text-brand-500 mt-1">
                    ¥{comparisonDetail.finalCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">{comparisonDetail.finalSupplier}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
                  <p className="text-xs text-surface-500">平均报价</p>
                  <p className="text-xl font-bold text-surface-600 mt-1">
                    ¥
                    {(
                      comparisonDetail.quotes.reduce((a, b) => a + b.price, 0) /
                      comparisonDetail.quotes.length
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">共 {comparisonDetail.quotes.length} 家报价</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
                  <p className="text-xs text-surface-500">节约金额</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    ¥{comparisonDetail.savingAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-surface-400 mt-1">相比平均报价</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-4">
                  <p className="text-xs text-surface-500">节约比例</p>
                  <p className="text-xl font-bold text-green-600 mt-1">
                    {comparisonDetail.savingPercentage}%
                  </p>
                  <p className="text-xs text-surface-400 mt-1">成本优化效果</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
                  <h2 className="text-lg font-bold text-brand-500 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-brand-500" />
                    报价对比图
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={comparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EBEDF3" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number, name: string) => {
                          if (name === '报价') return [`¥${value.toLocaleString()}`, name]
                          if (name === '运输天数') return [`${value / 1000}天`, name]
                          if (name === '服务评分') return [`${value / 100}分`, name]
                          return [value, name]
                        }}
                      />
                      <Bar dataKey="报价" radius={[4, 4, 0, 0]}>
                        {comparisonChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.isAccepted ? '#FF6B35' : '#1B2A4A'} />
                        ))}
                      </Bar>
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6">
                  <h2 className="text-lg font-bold text-brand-500 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-brand-500" />
                    需求信息
                  </h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-surface-50">
                      <span className="text-surface-500">需求编号</span>
                      <span className="font-mono text-surface-700">{comparisonDetail.demandId}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-surface-50">
                      <span className="text-surface-500">需求标题</span>
                      <span className="text-surface-700 font-medium">{comparisonDetail.demandTitle}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-surface-50">
                      <span className="text-surface-500">货物类型</span>
                      <span className="text-surface-700">{comparisonDetail.cargoType}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-surface-50">
                      <span className="text-surface-500">运输路线</span>
                      <span className="text-surface-700 flex items-center gap-1">
                        {comparisonDetail.origin}
                        <ArrowRight className="w-3 h-3 text-surface-300" />
                        {comparisonDetail.destination}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-surface-500">货物数量</span>
                      <span className="text-surface-700">
                        {comparisonDetail.quantity} {comparisonDetail.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-surface-100 overflow-hidden">
                <div className="p-4 border-b border-surface-100">
                  <h2 className="text-lg font-bold text-brand-500 flex items-center gap-2">
                    <GitCompare className="w-5 h-5 text-brand-500" />
                    供应商报价明细对比
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-surface-500">供应商</th>
                        <th className="px-4 py-3 text-right font-medium text-surface-500">报价金额</th>
                        <th className="px-4 py-3 text-center font-medium text-surface-500">运输天数</th>
                        <th className="px-4 py-3 text-center font-medium text-surface-500">服务评分</th>
                        <th className="px-4 py-3 text-center font-medium text-surface-500">报价状态</th>
                        <th className="px-4 py-3 text-center font-medium text-surface-500">是否成交</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonDetail.quotes.map((quote) => (
                        <tr
                          key={quote.quoteId}
                          className={`border-t border-surface-50 hover:bg-surface-50/50 ${
                            quote.isAccepted ? 'bg-accent-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3 font-medium text-brand-500">{quote.supplierName}</td>
                          <td className="px-4 py-3 text-right font-semibold text-brand-500">
                            ¥{quote.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center text-surface-600">{quote.transitDays}天</td>
                          <td className="px-4 py-3 text-center text-surface-600">{quote.serviceScore}分</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                quote.status === '已采纳'
                                  ? 'bg-green-100 text-green-600'
                                  : quote.status === '已过期'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-blue-100 text-blue-600'
                              }`}
                            >
                              {quote.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {quote.isAccepted ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle className="w-4 h-4" />
                                已成交
                              </span>
                            ) : (
                              <span className="text-surface-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
