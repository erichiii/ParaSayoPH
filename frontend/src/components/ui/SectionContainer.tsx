import type { HTMLAttributes, ReactNode } from 'react'

type SectionContainerProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
}

export function SectionContainer({ children, className, ...props }: SectionContainerProps) {
  const containerClassName = ['ps-section-container', className].filter(Boolean).join(' ')

  return (
    <section {...props} className={containerClassName}>
      {children}
    </section>
  )
}
