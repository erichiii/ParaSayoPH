import type { HTMLAttributes, ReactNode } from 'react'

type IconCircleSize = 'small' | 'medium' | 'large'
type IconCircleTone = 'brand' | 'soft' | 'warm'

type IconCircleProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode
  size?: IconCircleSize
  tone?: IconCircleTone
}

export function IconCircle({
  children,
  className,
  size = 'medium',
  tone = 'brand',
  ...props
}: IconCircleProps) {
  const iconClassName = [
    'ps-icon-circle',
    `ps-icon-circle--${size}`,
    `ps-icon-circle--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span {...props} className={iconClassName}>
      {children}
    </span>
  )
}
