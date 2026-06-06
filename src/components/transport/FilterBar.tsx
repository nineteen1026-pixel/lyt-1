import type { ReactNode } from 'react'

interface FilterOption<T extends string> {
  label: T
  value: T
}

interface FilterBarProps<T extends string> {
  icon: ReactNode
  title: string
  filters: FilterOption<T>[]
  activeFilter: T
  onFilterChange: (filter: T) => void
  activeColor?: 'brand' | 'red'
}

export default function FilterBar<T extends string>({
  icon,
  title,
  filters,
  activeFilter,
  onFilterChange,
  activeColor = 'brand',
}: FilterBarProps<T>) {
  const activeClasses =
    activeColor === 'red'
      ? 'bg-red-500 text-white shadow-md'
      : 'bg-brand-500 text-white shadow-md'

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-surface-700">{title}</h2>
      </div>
      <div className="flex gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              activeFilter === filter.value
                ? activeClasses
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
