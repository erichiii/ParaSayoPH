import type { HTMLAttributes } from 'react'
import type { ProgramCategory } from '../../domain/program'

type MediaSlotKind = 'hero' | 'category' | 'program'

type MediaSlotProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  alt?: string
  aspectRatio?: string
  category?: ProgramCategory
  kind?: MediaSlotKind
  objectPosition?: string
  src?: string | null
}

const categoryIconPaths: Record<ProgramCategory, string> = {
  scholarship: 'M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 9v4.5C6 19 8.7 21 12 21s6-2 6-4.5V12l-6 3-6-3Z',
  financial_assistance: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15.5v.5h-2v-.5a3.5 3.5 0 0 1-2.5-3.25h2a1.5 1.5 0 0 0 3 0c0-.8-.48-1.08-1.92-1.47C10.2 12.4 8.5 11.7 8.5 9.25A3.5 3.5 0 0 1 11 6v-.5h2V6a3.5 3.5 0 0 1 2.5 3.25h-2a1.5 1.5 0 0 0-3 0c0 .8.48 1.08 1.92 1.47 1.38.38 3.08 1.08 3.08 3.53A3.5 3.5 0 0 1 13 17.5Z',
  medical_assistance: 'M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3Z',
  crisis_assistance: 'm13 2-9 12h6l-1 8 9-12h-6l1-8Z',
  disaster_assistance: 'M12 2c3.8 4.2 6 7.6 6 11.2A6 6 0 1 1 6 13.2C6 9.6 8.2 6.2 12 2Zm0 7.2c-1.2 1.6-2 2.9-2 4a2 2 0 1 0 4 0c0-1.1-.8-2.4-2-4Z',
  transportation_assistance: 'M5 4h14a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3l1 2v1h-2l-1-2H8l-1 2H5v-1l1-2a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2Zm1 3v4h12V7H6Zm2 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z',
  burial_assistance: 'M5 3h14v18H5V3Zm3 3v3h3V6H8Zm0 6v3h3v-3H8Zm5-6v3h3V6h-3Zm0 6v3h3v-3h-3Z',
  ofw_assistance: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-7.9 9h3.2a15.7 15.7 0 0 1 1.1-5.1A8 8 0 0 0 4.1 11Zm0 2a8 8 0 0 0 4.3 5.1A15.7 15.7 0 0 1 7.3 13H4.1Zm5.3 0c.2 2.3 1 4.5 2.6 5.8 1.6-1.3 2.4-3.5 2.6-5.8H9.4Zm0-2h5.2c-.2-2.3-1-4.5-2.6-5.8C10.4 6.5 9.6 8.7 9.4 11Zm6.2 2a15.7 15.7 0 0 1-1.1 5.1 8 8 0 0 0 4.3-5.1h-3.2Zm0-2h3.2a8 8 0 0 0-4.3-5.1 15.7 15.7 0 0 1 1.1 5.1Z',
  training: 'M4 4h16v13H4V4Zm2 2v9h12V6H6Zm3 12h6v2H9v-2Z',
  other: 'M11 17h2v2h-2v-2Zm1-14a5 5 0 0 1 3.7 8.36c-.92.99-1.7 1.66-1.7 3.14h-2c0-2.2 1.08-3.16 2.24-4.4A3 3 0 1 0 9 8H7a5 5 0 0 1 5-5Z',
}

function CategoryIcon({ category }: { category: ProgramCategory }) {
  return (
    <svg
      aria-hidden="true"
      className="ps-media-slot__fallback-icon"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d={categoryIconPaths[category]} />
    </svg>
  )
}

export function MediaSlot({
  alt = '',
  aspectRatio = '4 / 3',
  category = 'other',
  className,
  kind = 'program',
  objectPosition,
  src,
  style,
  ...props
}: MediaSlotProps) {
  const isFallback = !src
  const mediaClassName = [
    'ps-media-slot',
    `ps-media-slot--${kind}`,
    isFallback && kind !== 'hero' ? 'ps-media-slot--fallback' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      {...props}
      className={mediaClassName}
      role={isFallback && alt ? 'img' : undefined}
      aria-label={isFallback && alt ? `${alt} image unavailable` : undefined}
      style={{ ...style, aspectRatio }}
    >
      {src ? (
        <img
          alt={alt}
          className="ps-media-slot__image"
          src={src}
          style={{ objectPosition }}
        />
      ) : kind !== 'hero' ? (
        <CategoryIcon category={category} />
      ) : null}
    </div>
  )
}
