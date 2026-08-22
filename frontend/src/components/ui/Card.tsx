import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode
}

export function Card({ children, className, ...props }: CardProps) {
  const cardClassName = ['ps-card', className].filter(Boolean).join(' ')

  return (
    <div {...props} className={cardClassName}>
      {children}
    </div>
  )
}
