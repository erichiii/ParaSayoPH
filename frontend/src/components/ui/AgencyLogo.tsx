import type { HTMLAttributes } from 'react'

type AgencyLogoProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  alt?: string
  objectPosition?: string
  src?: string | null
}

function AgencyFallbackIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ps-agency-logo__fallback-icon"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M4 21v-2h2V5h12v14h2v2H4Zm4-4h2v-2H8v2Zm0-4h2v-2H8v2Zm0-4h2V7H8v2Zm4 8h2v-2h-2v2Zm0-4h2v-2h-2v2Zm0-4h2V7h-2v2Z" />
    </svg>
  )
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
        <AgencyFallbackIcon />
      )}
    </div>
  )
}
