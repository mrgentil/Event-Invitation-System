interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  accent?: 'primary' | 'emerald' | 'amber' | 'violet'
}

const accentStyles = {
  primary: 'bg-primary-50 border-primary-100 text-primary-700',
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  amber: 'bg-amber-50 border-amber-100 text-amber-700',
  violet: 'bg-violet-50 border-violet-100 text-violet-700',
}

export default function KPICard({ title, value, subtitle, icon, accent = 'primary' }: KPICardProps) {
  return (
    <div className={`rounded-xl border p-5 ${accentStyles[accent]} transition-shadow hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
          {subtitle && <p className="text-xs mt-1 opacity-80">{subtitle}</p>}
        </div>
        <span className="text-3xl opacity-80" aria-hidden>{icon}</span>
      </div>
    </div>
  )
}
