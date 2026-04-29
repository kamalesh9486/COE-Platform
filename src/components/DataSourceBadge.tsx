export type DataSourceType = 'live' | 'internal' | 'simulated' | 'mixed'

const LABELS: Record<DataSourceType, string> = {
  live:      'Live Data',
  internal:  'Internal DB',
  simulated: 'Simulated',
  mixed:     'Mixed Sources',
}

interface Props {
  type: DataSourceType
  title?: string
}

export default function DataSourceBadge({ type, title }: Props) {
  return (
    <span className={`ds-badge ds-badge--${type}`} title={title}>
      {LABELS[type]}
    </span>
  )
}
