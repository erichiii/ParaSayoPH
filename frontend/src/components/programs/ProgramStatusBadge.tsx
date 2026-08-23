import type { HTMLAttributes } from 'react'
import { programStatusLabels } from '../../data/taxonomies'
import type { ProgramStatus } from '../../domain/program'

type ProgramStatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  status: ProgramStatus
}

export function ProgramStatusBadge({ className, status, ...props }: ProgramStatusBadgeProps) {
  const badgeClassName = ['ps-program-status-badge', `ps-program-status-badge--${status}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <span {...props} className={badgeClassName}>
      {programStatusLabels[status]}
    </span>
  )
}
