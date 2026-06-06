import { NavLink, useLocation } from 'react-router-dom'
import {
  Package,
  GitCompareArrows,
  Users,
  CheckCircle,
  Database,
  LayoutDashboard,
  Truck,
  BarChart3,
  Bell,
} from 'lucide-react'

const navItems = [
  { path: '/transport', label: '运输执行看板', icon: Truck },
  { path: '/warning-rules', label: '节点预警中心', icon: Bell },
  { path: '/demands', label: '需求池', icon: Package },
  { path: '/quotes', label: '报价对比', icon: GitCompareArrows },
  { path: '/suppliers', label: '供应商选择', icon: Users },
  { path: '/approvals', label: '审批状态', icon: CheckCircle },
  { path: '/cost-analysis', label: '成本分析', icon: BarChart3 },
  { path: '/mock', label: '数据 Mock', icon: Database },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-60 min-h-screen bg-brand-500 flex flex-col fixed left-0 top-0 z-30">
      <div className="px-5 py-6 flex items-center gap-3 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-accent-500 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-sm leading-tight">智慧供应链</h1>
          <p className="text-white/50 text-xs">物流协同平台</p>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-black/10'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-500" />
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-300 text-xs font-bold">
            管
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">供应链管理员</p>
            <p className="text-white/40 text-[10px]">admin@supply.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
