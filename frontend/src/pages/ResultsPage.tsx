import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { MatchSummary } from '../components/matchmaker/MatchSummary'
import { MatchingTransition } from '../components/matchmaker/MatchingTransition'
import { ProgramStatusBadge } from '../components/programs/ProgramStatusBadge'
import { AgencyLogo } from '../components/ui/AgencyLogo'
import { Button } from '../components/ui/Button'
import { SectionContainer } from '../components/ui/SectionContainer'
import { localMatchProfileFixture, localMatchResults } from '../data/mockMatches'
import { matchEducationLevels, matchEmploymentStatuses, matchRegions, programCategoryLabels } from '../data/taxonomies'
import type { MatchResult } from '../domain/matching'
import type { MatchProfile } from '../domain/profile'
import type { ProgramCategory } from '../domain/program'

export type ResultsView = 'resolved' | 'loading' | 'summary' | 'empty' | 'failure'

type ResultsPageProps = {
  onPreviewStateChange?: (state: ResultsView) => void
  previewState?: ResultsView
}

const resultsProgramEntryState = { from: 'results', returnTo: '/results' } as const

const resultFilters: { category: ProgramCategory | 'all'; label: string }[] = [
  { category: 'all', label: 'All' },
  { category: 'scholarship', label: 'Scholarships' },
  { category: 'training', label: 'Training' },
  { category: 'financial_assistance', label: 'Financial assistance' },
  { category: 'crisis_assistance', label: 'Crisis assistance' },
]

const checkedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

function getOptionLabel(options: readonly { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? null
}

function getProfileLabels(profile: MatchProfile) {
  return [
    getOptionLabel(matchRegions, profile.location),
    profile.age === null ? null : `${profile.age} years old`,
    getOptionLabel(matchEducationLevels, profile.education_level),
    getOptionLabel(matchEmploymentStatuses, profile.employment_status),
    ...profile.categories_needed.map((category) => programCategoryLabels[category]),
  ].filter((value): value is string => Boolean(value))
}

function isMatchProfile(value: unknown): value is MatchProfile {
  if (!value || typeof value !== 'object') {
    return false
  }
  const candidate = value as Partial<MatchProfile>
  return Array.isArray(candidate.categories_needed)
}

function formatCheckedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : checkedDateFormatter.format(date)
}

function MatchOutcome({ result }: { result: MatchResult }) {
  if (result.state === 'known_conflict') {
    return null
  }
  const isLikely = result.state === 'likely_eligible'
  return (
    <span className={`ps-results-outcome ${isLikely ? 'ps-results-outcome--likely' : 'ps-results-outcome--uncertain'}`}>
      <span aria-hidden="true">{isLikely ? '✓' : 'i'}</span>
      {isLikely ? 'May be a fit' : 'More details needed'}
    </span>
  )
}

function ResultReasons({ reasons, state }: Pick<MatchResult, 'reasons' | 'state'>) {
  const isUncertain = state === 'uncertain'
  return (
    <ul className={`ps-results-reasons ${isUncertain ? 'ps-results-reasons--uncertain' : ''}`}>
      {reasons.map((reason) => <li key={reason}><span aria-hidden="true">{isUncertain ? 'i' : '✓'}</span>{reason}</li>)}
    </ul>
  )
}

function ResultsNav() {
  return (
    <header className="ps-results-navbar">
      <SectionContainer className="ps-results-navbar__inner">
        <Link aria-label="ParaSa'yo home" className="ps-results-wordmark" to="/">
          <span aria-hidden="true" className="ps-results-wordmark__sun" />
          <span><span className="ps-results-wordmark__para">Para</span><span className="ps-results-wordmark__sayo">Sa&apos;yo</span></span>
        </Link>
        <nav aria-label="Primary navigation" className="ps-results-navbar__links"><Link to="/explore">Explore</Link><Link to="/matchmaker">Para Sa Akin?</Link></nav>
        <Link className="ps-results-navbar__cta" to="/matchmaker">Find a match</Link>
      </SectionContainer>
    </header>
  )
}

export function ResultsPage({ onPreviewStateChange, previewState = 'resolved' }: ResultsPageProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | 'all'>('all')
  const routeProfile = (location.state as { lastMatchedProfile?: unknown } | null)?.lastMatchedProfile
  const lastMatchedProfile = isMatchProfile(routeProfile) ? routeProfile : localMatchProfileFixture
  const profileLabels = getProfileLabels(lastMatchedProfile)
  const visibleResults = localMatchResults.filter((result) => result.state !== 'known_conflict')
  const featuredResult = visibleResults[0]
  const otherResults = visibleResults.slice(1).filter((result) => selectedCategory === 'all' || result.program.category === selectedCategory)

  const editAnswers = () => {
    navigate('/matchmaker', { state: { editProfile: lastMatchedProfile, returnToResults: true } })
  }

  const setPreviewState = (state: ResultsView) => {
    onPreviewStateChange?.(state)
  }

  const renderState = () => {
    if (previewState === 'loading') {
      return <MatchingTransition />
    }
    if (previewState === 'failure') {
      return <MatchingTransition isFailure onRetry={() => setPreviewState('loading')} />
    }
    if (previewState === 'summary') {
      return <MatchSummary answerLabels={profileLabels} count={localMatchResults.length} onEditAnswers={editAnswers} onSeeMatches={() => setPreviewState('resolved')} />
    }
    if (previewState === 'empty') {
      return (
        <section className="ps-results-empty-state">
          <h1>We couldn&apos;t find opportunities that may fit based on what you shared.</h1>
          <p>You can adjust your answers or browse all available opportunities.</p>
          <div><Button onClick={editAnswers} variant="secondary">Edit answers</Button><Link className="ps-results-inline-action" to="/explore">Explore opportunities <span aria-hidden="true">→</span></Link></div>
        </section>
      )
    }

    return (
      <>
        <section className="ps-results-hero">
          <SectionContainer className="ps-results-hero__inner">
            <div>
              <p className="ps-results-hero__eyebrow">Your matches</p>
              <h1>Opportunities that may fit you</h1>
              <p>Based on the details you shared.</p>
              {profileLabels.length > 0 ? <ul className="ps-results-profile-chips">{profileLabels.map((label) => <li key={label}>{label}</li>)}</ul> : null}
            </div>
            <Button onClick={editAnswers} variant="secondary">Edit answers</Button>
          </SectionContainer>
        </section>
        <main className="ps-results-main">
          <SectionContainer className="ps-results-content">
            <section aria-labelledby="featured-opportunity-heading">
              <p className="ps-results-section-label">Featured opportunity</p>
              <article className="ps-results-featured-card">
                <AgencyLogo alt={featuredResult.program.provider ?? ''} className="ps-results-featured-card__logo" />
                <div className="ps-results-featured-card__identity"><p>{featuredResult.program.provider ?? 'Provider not specified'}</p><h2 id="featured-opportunity-heading">{featuredResult.program.title}</h2><ResultReasons reasons={featuredResult.reasons} state={featuredResult.state} /></div>
                <div className="ps-results-featured-card__meta"><ProgramStatusBadge status={featuredResult.program.status} />{formatCheckedDate(featuredResult.program.source.last_verified_at) ? <p>ParaSa&apos;yo checked {formatCheckedDate(featuredResult.program.source.last_verified_at)}</p> : null}</div>
                <div className="ps-results-featured-card__action"><MatchOutcome result={featuredResult} /><Link state={resultsProgramEntryState} to={`/programs/${featuredResult.program.id}`}>View program <span aria-hidden="true">→</span></Link></div>
              </article>
            </section>
            <section aria-labelledby="more-opportunities-heading">
              <div className="ps-results-list-header"><p className="ps-results-section-label" id="more-opportunities-heading">More opportunities</p><div aria-label="Refine displayed opportunities" className="ps-results-filters">{resultFilters.map((filter) => <button aria-pressed={selectedCategory === filter.category} className={selectedCategory === filter.category ? 'is-active' : ''} key={filter.category} onClick={() => setSelectedCategory(filter.category)} type="button">{filter.label}</button>)}</div></div>
              {otherResults.length > 0 ? <div className="ps-results-list">{otherResults.map((result) => <Link className="ps-results-row" key={result.program.id} state={resultsProgramEntryState} to={`/programs/${result.program.id}`}><AgencyLogo alt={result.program.provider ?? ''} className="ps-results-row__logo" /><div className="ps-results-row__identity"><p>{result.program.provider ?? 'Provider not specified'}</p><h3>{result.program.title}</h3></div><ResultReasons reasons={result.reasons} state={result.state} /><div className="ps-results-row__meta"><ProgramStatusBadge status={result.program.status} />{formatCheckedDate(result.program.source.last_verified_at) ? <p>ParaSa&apos;yo checked {formatCheckedDate(result.program.source.last_verified_at)}</p> : null}</div><MatchOutcome result={result} /><span className="ps-results-row__action">View program <span aria-hidden="true">→</span></span></Link>)}</div> : <p className="ps-results-no-filtered-results">No more opportunities match this category.</p>}
            </section>
            <aside className="ps-results-trust-note"><strong>Matches use the information you shared and may change when you update your answers.</strong></aside>
          </SectionContainer>
        </main>
      </>
    )
  }

  return <div className="ps-results-page"><ResultsNav />{renderState()}</div>
}
