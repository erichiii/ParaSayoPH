import type { HTMLAttributes } from 'react'

type AgencyLogoProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  alt?: string
  objectPosition?: string
  src?: string | null
}

export function AgencyLogo({
  alt = '',
  className,
  objectPosition,
  src,
  ...props
}: AgencyLogoProps) {
  const logoClassName = ['ps-agency-logo', !src && 'ps-agency-logo--fallback', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      {...props}
      className={logoClassName}
      role={!src ? 'img' : undefined}
      aria-label={!src ? 'Agency logo unavailable' : undefined}
    >
      {src ? (
        <img
          alt={alt}
          className="ps-agency-logo__image"
          src={src}
          style={{ objectPosition }}
        />
      ) : (
        <span aria-hidden="true">Agency</span>
      )}
    </div>
  )
}
