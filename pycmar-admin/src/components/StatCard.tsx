interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  iconColor?: 'navy' | 'accent' | 'ocean' | 'warning'
  badge?: string
  badgeType?: 'up' | 'pending'
}

export default function StatCard({
  label,
  value,
  icon,
  iconColor = 'navy',
  badge,
  badgeType = 'up',
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className={`stat-card-icon ${iconColor}`}>{icon}</div>
        {badge && (
          <span className={`stat-card-badge ${badgeType}`}>{badge}</span>
        )}
      </div>
      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
      </div>
    </div>
  )
}
