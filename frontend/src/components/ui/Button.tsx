import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'hero' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  isLoading?: boolean
  variant?: ButtonVariant
}

export function Button({
  children,
  className,
  disabled,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const buttonClassName = ['ps-button', `ps-button--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      className={buttonClassName}
      disabled={disabled || isLoading}
      type={type}
      aria-busy={isLoading || undefined}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  )
}
