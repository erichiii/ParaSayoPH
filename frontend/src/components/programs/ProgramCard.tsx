import type { HTMLAttributes } from 'react'
import { programCategoryLabels } from '../../data/taxonomies'
import type { Program } from '../../domain/program'
import { AgencyLogo } from '../ui/AgencyLogo'
import { Card } from '../ui/Card'
import { MediaSlot } from '../ui/MediaSlot'
import { ProgramStatusBadge } from './ProgramStatusBadge'

type ProgramCardVariant = 'opportunity' | 'program'

type ProgramCardProps = HTMLAttributes<HTMLDivElement> & {
  agencyLogo?: {
    alt?: string
    objectPosition?: string
    src?: string | null
  }
  image?: {
    alt?: string
    objectPosition?: string
    src?: string | null
  }
  program: Program
  variant?: ProgramCardVariant
}

const coverageLabels = {
  nationwide: 'Nationwide',
  regional: 'Regional',
  provincial: 'Provincial',
  city: 'City',
  municipal: 'Municipal',
  district: 'District',
} as const

const lastCheckedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

function getCoverageDetails(program: Program) {
  if (program.coverage.type === 'unknown') {
    return 'Coverage details unavailable'
  }

  if (program.coverage.locations.length > 0) {
    return program.coverage.locations.join(', ')
  }

  return coverageLabels[program.coverage.type]
}

function getLastCheckedLabel(lastVerifiedAt: string) {
  const date = new Date(lastVerifiedAt)

  if (Number.isNaN(date.getTime())) {
    return 'Last checked date unavailable'
  }

  return `Last checked ${lastCheckedDateFormatter.format(date)}`
}

export function ProgramCard({
  agencyLogo,
  className,
  image,
  program,
  variant = 'program',
  ...props
}: ProgramCardProps) {
  const cardClassName = ['ps-program-card', `ps-program-card--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Card {...props} className={cardClassName}>
      <MediaSlot
        alt={image?.alt ?? `${programCategoryLabels[program.category]} program image`}
        category={program.category}
        className="ps-program-card__media"
        kind="program"
        objectPosition={image?.objectPosition}
        src={image?.src}
      />
      <div className="ps-program-card__content">
        <div className="ps-program-card__topline">
          <span className="ps-program-card__category">{programCategoryLabels[program.category]}</span>
          {variant === 'program' ? <ProgramStatusBadge status={program.status} /> : null}
        </div>
        <h3 className="ps-program-card__title">{program.title}</h3>
        {program.description ? <p className="ps-program-card__description">{program.description}</p> : null}

        {variant === 'program' ? (
          <>
            <div className="ps-program-card__provider">
              <AgencyLogo
                alt={agencyLogo?.alt ?? ''}
                className="ps-program-card__agency-logo"
                objectPosition={agencyLogo?.objectPosition}
                src={agencyLogo?.src}
              />
              <span>{program.provider ?? 'Provider not specified'}</span>
            </div>
            <dl className="ps-program-card__details">
              <div>
                <dt>Coverage</dt>
                <dd>{getCoverageDetails(program)}</dd>
              </div>
              <div>
                <dt>Deadline</dt>
                <dd>{program.application.deadline ?? 'Deadline not provided'}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>
                  <a
                    className="ps-program-card__source-action"
                    href={program.source.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View source <span aria-hidden="true">-&gt;</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>Source health</dt>
                <dd>{getLastCheckedLabel(program.source.last_verified_at)}</dd>
              </div>
            </dl>
          </>
        ) : null}
      </div>
    </Card>
  )
}
