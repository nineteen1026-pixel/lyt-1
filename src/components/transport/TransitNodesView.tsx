import { MapPin, CheckCircle2 } from 'lucide-react'
import type { TransitNode, TransitNodeStatus } from '@/types'
import { NODE_BADGE } from '@/constants/transport'

interface TransitNodesViewProps {
  nodes: TransitNode[]
}

export default function TransitNodesView({ nodes }: TransitNodesViewProps) {
  const sortedNodes = [...nodes].sort((a, b) => a.order - b.order)

  const getNodeStyles = (status: TransitNodeStatus) => {
    switch (status) {
      case '已出发':
        return 'bg-emerald-500 border-emerald-500 text-white'
      case '已到达':
        return 'bg-blue-500 border-blue-500 text-white'
      default:
        return 'bg-white border-gray-300 text-gray-400'
    }
  }

  const getNodeTextColor = (status: TransitNodeStatus) => {
    switch (status) {
      case '已出发':
        return 'text-emerald-600'
      case '已到达':
        return 'text-blue-600'
      default:
        return 'text-gray-400'
    }
  }

  const getNodeIcon = (status: TransitNodeStatus, order: number) => {
    switch (status) {
      case '已出发':
        return <CheckCircle2 className="w-4 h-4" />
      case '已到达':
        return <MapPin className="w-4 h-4" />
      default:
        return order
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-500" />
        在途节点
      </h3>
      <div className="flex items-start gap-0">
        {sortedNodes.map((node, i) => {
          const isLast = i === sortedNodes.length - 1
          return (
            <div key={node.id} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${getNodeStyles(node.status)}`}
                >
                  {getNodeIcon(node.status, node.order)}
                </div>
                <span className={`mt-1.5 text-xs font-medium ${getNodeTextColor(node.status)}`}>
                  {node.name}
                </span>
                <span className="text-[10px] text-surface-400 mt-0.5">{node.location}</span>
                <span
                  className={`text-[10px] mt-1 px-1.5 py-0.5 rounded ${NODE_BADGE[node.status].bg} ${NODE_BADGE[node.status].text}`}
                >
                  {node.status}
                </span>
                {node.actualTime && (
                  <span className="text-[10px] text-surface-500 mt-1">{node.actualTime}</span>
                )}
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mt-4 mx-1 rounded ${
                    sortedNodes[i + 1]?.status !== '未到达' || node.status === '已出发'
                      ? 'bg-emerald-300'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
