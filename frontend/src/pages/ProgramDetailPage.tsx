import { useEffect, useState, type CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ProgramNotFoundError, getProgramById } from '../api/programs'
import { ProgramStatusBadge } from '../components/programs/ProgramStatusBadge'
import { AgencyLogo } from '../components/ui/AgencyLogo'
import { BrandWordmark } from '../components/ui/BrandWordmark'
import { Card } from '../components/ui/Card'
import { IconCircle } from '../components/ui/IconCircle'
import { MediaSlot } from '../components/ui/MediaSlot'
import { SectionContainer } from '../components/ui/SectionContainer'
import { brandAssets } from '../data/brandAssets'
import { programCategoryLabels } from '../data/taxonomies'
import type { Program } from '../domain/program'
import type { MatchProfile } from '../domain/profile'

type DetailSectionKind = 'application' | 'benefits' | 'coverage' | 'description' | 'requirements'

type DetailSectionProps = {
  children: React.ReactNode
  kind: DetailSectionKind
  title: string
}

type BrandAssetStyles = CSSProperties & Record<`--${string}`, string>

type ProgramEntryState = {
  from: 'results' | 'explore'
  returnTo: '/results' | '/explore'
  lastMatchedProfile?: MatchProfile
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

const programDetailBrandAssetStyles: BrandAssetStyles = {
  ...(brandAssets.sun
    ? {
        '--ps-detail-sun-image': `url("${brandAssets.sun}")`,
        '--ps-detail-sun-center-display': 'none',
      }
    : {}),
}

function DetailGlyph({ kind }: { kind: DetailSectionKind }) {
  const paths: Record<DetailSectionKind, string> = {
    description: 'M6 2h9l3 3v17H6V2Zm8 1.5V6h2.5L14 3.5ZM9 10v2h6v-2H9Zm0 4v2h6v-2H9Z',
    coverage: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 10.5A3.5 3.5 0 1 1 12 5a3.5 3.5 0 0 1 0 7.5Z',
    benefits: 'M20 7h-3V4H7v3H4a2 2 0 0 0-2 2v3h2v8h16v-8h2V9a2 2 0 0 0-2-2ZM9 6h6v1H9V6Zm9 12H6v-6h4v2h4v-2h4v6Zm-6-6h-2v-1h2v1Z',
    requirements: 'M9.5 2h5l3.5 3.5V21h-12V2h3.5Zm4 2H8v15h8V6.5H13.5V4ZM10 9h4v2h-4V9Zm0 4h4v2h-4v-2Z',
    application: 'M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm11 7H6v11h12V9Zm-8 3h2v2h-2v-2Zm4 0h2v2h-2v-2Z',
  }

  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d={paths[kind]} />
    </svg>
  )
}

function DetailSection({ children, kind, title }: DetailSectionProps) {
  return (
    <section className="ps-detail-section">
      <IconCircle className="ps-detail-section__icon" size="large" tone="brand">
        <DetailGlyph kind={kind} />
      </IconCircle>
      <div className="ps-detail-section__content">
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  )
}

function getCoverageDetails(program: Program) {
  if (program.coverage.type === 'unknown') {
    return 'Coverage details unavailable'
  }

  if (program.coverage.locations.length > 0) {
    return program.coverage.locations.join(', ')
  }

  return coverageLabels[program.coverage.type]
}

function formatDisplayDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return lastCheckedDateFormatter.format(date)
}

function getDeadlineLabel(deadline: string | null) {
  if (!deadline) {
    return 'Deadline not provided'
  }

  const formattedDeadline = formatDisplayDate(`${deadline}T00:00:00Z`)

  return formattedDeadline ? `Deadline: ${formattedDeadline}` : 'Deadline not provided'
}

function isResultsEntry(state: unknown): state is ProgramEntryState {
  if (!state || typeof state !== 'object') {
    return false
  }

  const entry = state as Partial<ProgramEntryState>
  return entry.from === 'results' && entry.returnTo === '/results' && Boolean(entry.lastMatchedProfile)
}

export function ProgramDetailPage() {
  const { id } = useParams()
  return <ProgramDetailContent key={id} id={id ?? ''} />
}

function ProgramDetailContent({ id }: { id: string }) {
  const location = useLocation()
  const [program, setProgram] = useState<Program | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const enteredFromResults = isResultsEntry(location.state)
  const returnTo = enteredFromResults ? '/results' : '/explore'
  const returnState = enteredFromResults ? { lastMatchedProfile: (location.state as ProgramEntryState).lastMatchedProfile } : undefined
  const returnLabel = enteredFromResults ? 'Back to your matches' : 'Back to explore'
  const breadcrumbLabel = enteredFromResults ? 'Your matches' : 'Explore opportunities'

  useEffect(() => {
    let isCurrent = true

    void getProgramById(id)
      .then((result) => {
        if (isCurrent) {
          setProgram(result)
        }
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }
        if (error instanceof ProgramNotFoundError) {
          setProgram(null)
          return
        }
        setLoadError('We could not load this program right now. Please try again.')
      })

    return () => {
      isCurrent = false
    }
  }, [id, requestVersion])

  if (loadError) {
    return (
      <main className="ps-detail-page">
        <SectionContainer className="ps-detail-state" role="alert">
          <h1>Unable to load program</h1>
          <p>{loadError}</p>
          <button className="ps-button ps-button--primary" onClick={() => {
            setProgram(undefined)
            setLoadError(null)
            setRequestVersion((version) => version + 1)
          }} type="button">
            Try again
          </button>
          <Link className="ps-detail-back-link" state={returnState} to={returnTo}>
            ← {returnLabel}
          </Link>
        </SectionContainer>
      </main>
    )
  }

  if (program === undefined) {
    return (
      <main className="ps-detail-page">
        <SectionContainer className="ps-detail-state">
          <p>Loading program details...</p>
        </SectionContainer>
      </main>
    )
  }

  if (program === null) {
    return (
      <main className="ps-detail-page">
        <SectionContainer className="ps-detail-state">
          <h1>Program not found</h1>
          <p>The requested program is unavailable.</p>
          <Link className="ps-detail-back-link" state={returnState} to={returnTo}>
            ← {returnLabel}
          </Link>
        </SectionContainer>
      </main>
    )
  }

  return (
    <div className="ps-detail-page" style={programDetailBrandAssetStyles}>
      <header className="ps-detail-navbar">
        <SectionContainer className="ps-detail-navbar__inner">
          <BrandWordmark />
          <nav aria-label="Primary navigation" className="ps-detail-navbar__links">
            <Link to="/explore">Explore</Link>
            <Link to="/matchmaker">Para Sa Akin?</Link>
          </nav>
          <Link className="ps-detail-navbar__cta" to="/matchmaker">
            Find a match
          </Link>
          <details className="ps-detail-navbar__mobile-menu">
            <summary aria-label="Open navigation menu">
              <span aria-hidden="true" />
            </summary>
            <nav aria-label="Mobile navigation">
              <Link to="/explore">Explore</Link>
              <Link to="/matchmaker">Para Sa Akin?</Link>
              <Link to="/matchmaker">Find a match</Link>
            </nav>
          </details>
        </SectionContainer>
      </header>

      <section className="ps-detail-summary-band">
        <SectionContainer>
          <nav aria-label="Breadcrumb" className="ps-detail-breadcrumb">
            <Link to="/">Home</Link><span aria-hidden="true">›</span><Link state={returnState} to={returnTo}>{breadcrumbLabel}</Link><span aria-hidden="true">›</span><span>Program details</span>
          </nav>
          <Link className="ps-detail-back-link ps-detail-back-link--band" state={returnState} to={returnTo}>
            ← {returnLabel}
          </Link>
          <Card className="ps-detail-summary-card">
            <MediaSlot
              alt={`${program.title} program image`}
              aspectRatio="4 / 3"
              category={program.category}
              className="ps-detail-summary-card__media"
              kind="program"
            />
            <div className="ps-detail-summary-card__identity">
              <p className="ps-detail-summary-card__category">
                {programCategoryLabels[program.category]}
              </p>
              <h1>{program.title}</h1>
              <span aria-hidden="true" className="ps-detail-summary-card__accent" />
              <div className="ps-detail-summary-card__provider">
                <AgencyLogo className="ps-detail-summary-card__agency-logo" />
                <div>
                  <span>Provider</span>
                  <p>{program.provider ?? 'Provider not specified'}</p>
                </div>
              </div>
            </div>
            <aside className="ps-detail-summary-card__status" aria-label="Program status and last checked">
              <div>
                <span>Status</span>
                <ProgramStatusBadge status={program.status} />
              </div>
              <div>
                <span>Last checked</span>
                <p>{formatDisplayDate(program.source.last_verified_at) ?? 'Date unavailable'}</p>
                <small>Details may vary by source.</small>
              </div>
            </aside>
          </Card>
        </SectionContainer>
      </section>

      <main className="ps-detail-main">
        <SectionContainer className="ps-detail-layout">
          <div className="ps-detail-content-column">
            <DetailSection kind="description" title="Description">
              <p>{program.description ?? 'Details not provided'}</p>
            </DetailSection>
            <DetailSection kind="coverage" title="Coverage">
              <p>{getCoverageDetails(program)}</p>
            </DetailSection>
            <DetailSection kind="benefits" title="Benefits">
              {program.benefits.length > 0 ? (
                <ul>
                  {program.benefits.map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              ) : (
                <p>Details not provided</p>
              )}
            </DetailSection>
            <DetailSection kind="requirements" title="Requirements">
              {program.requirements.length > 0 ? (
                <ul>
                  {program.requirements.map((requirement) => (
                    <li key={requirement}>{requirement}</li>
                  ))}
                </ul>
              ) : (
                <p>Details not provided</p>
              )}
            </DetailSection>
            <DetailSection kind="application" title="Application">
              <p>{program.application.process ?? 'Details not provided'}</p>
              <p className="ps-detail-application-deadline">{getDeadlineLabel(program.application.deadline)}</p>
            </DetailSection>
          </div>

          <aside className="ps-detail-source-panel">
            <div className="ps-detail-source-panel__heading">
              <span aria-hidden="true" className="ps-detail-source-panel__sun" />
              <h2>Source details</h2>
            </div>
            <dl>
              <div>
                <dt>Provider</dt>
                <dd>{program.provider ?? 'Provider not specified'}</dd>
              </div>
              <div>
                <dt>Last checked</dt>
                <dd>{formatDisplayDate(program.source.last_verified_at) ?? 'Date unavailable'}</dd>
              </div>
            </dl>
            <a
              className="ps-detail-source-panel__action"
              href={program.source.url}
              rel="noreferrer"
              target="_blank"
            >
              View source
            </a>
            <div className="ps-detail-source-panel__transparency">
              <IconCircle size="medium" tone="brand">
                <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                  <path d="m12 2 8 3v6c0 5.1-3.4 9.8-8 11-4.6-1.2-8-5.9-8-11V5l8-3Zm0 3.1L7 6.97V11c0 3.8 2.4 7.4 5 8.6 2.6-1.2 5-4.8 5-8.6V6.97l-5-1.87Zm-1.1 10.2L8.5 12.9l1.4-1.4 1 1 3.2-3.2 1.4 1.4-4.6 4.6Z" />
                </svg>
              </IconCircle>
              <div>
                <h3>Source transparency</h3>
                <p>
                  We show the source and when ParaSa'yo last checked it. Program details may change,
                  so review the source for updates.
                </p>
              </div>
            </div>
          </aside>
        </SectionContainer>
      </main>
    </div>
  )
}
