import type { LucideIcon } from 'lucide-react'

export function StatCard({ icon: Icon, value, label, tone = 'amber' }: {
  icon: LucideIcon
  value: string | number
  label: string
  tone?: string
}) {
  return (
    <article className="stat-card">
      <span className={`stat-icon tone-${tone}`}><Icon size={19} /></span>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}
