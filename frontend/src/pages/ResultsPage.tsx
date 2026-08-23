import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { getMatches, MatchesValidationError } from '../api/matches'
import { MatchingTransition } from '../components/matchmaker/MatchingTransition'
import { ProgramStatusBadge } from '../components/programs/ProgramStatusBadge'
import { AgencyLogo } from '../components/ui/AgencyLogo'
import { BrandWordmark } from '../components/ui/BrandWordmark'
import { Button } from '../components/ui/Button'
import { SectionContainer } from '../components/ui/SectionContainer'
import { matchEducationLevels, matchEmploymentStatuses, matchRegions, programCategoryLabels } from '../data/taxonomies'
import type { MatchRecommendation, MatchResult } from '../domain/matching'
import type { MatchProfile } from '../domain/profile'
import type { ProgramCategory } from '../domain/program'

type ResultsView = 'loading' | 'resolved' | 'empty' | 'validation' | 'failure'

type ResultsRouteState = {
  lastMatchedProfile?: unknown
}

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

function cloneProfile(profile: MatchProfile): MatchProfile {
  return { ...profile, categories_needed: [...profile.categories_needed] }
}

function formatCheckedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : checkedDateFormatter.format(date)
}

function MatchOutcome({ result }: { result: MatchResult }) {
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
      {reasons.map((reason) => <li key={reason.code}><span aria-hidden="true">{isUncertain ? 'i' : '✓'}</span>{reason.label}</li>)}
    </ul>
  )
}

function ResultsNav() {
  return (
    <header className="ps-results-navbar">
      <SectionContainer className="ps-results-navbar__inner">
        <BrandWordmark />
        <nav aria-label="Primary navigation" className="ps-results-navbar__links"><Link to="/explore">Explore</Link><Link to="/matchmaker">Para Sa Akin?</Link></nav>
        <Link className="ps-results-navbar__cta" to="/matchmaker">Find a match</Link>
      </SectionContainer>
    </header>
  )
}

export function ResultsPage() {
  const location = useLocation()
  const routeProfile = (location.state as ResultsRouteState | null)?.lastMatchedProfile

  if (!isMatchProfile(routeProfile)) {
    return <Navigate replace to="/matchmaker" />
  }

  return <div className="ps-results-page"><ResultsNav /><LiveResults key={location.key} profile={cloneProfile(routeProfile)} /></div>
}

function LiveResults({ profile }: { profile: MatchProfile }) {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | 'all'>('all')
  const [results, setResults] = useState<MatchResult[]>([])
  const [recommendation, setRecommendation] = useState<MatchRecommendation | null>(null)
  const [view, setView] = useState<ResultsView>('loading')

  useEffect(() => {
    let isCurrent = true

    void getMatches(profile)
      .then((response) => {
        if (!isCurrent) {
          return
        }
        setResults(response.results)
        setRecommendation(response.recommendation)
        setView(response.results.length === 0 ? 'empty' : 'resolved')
      })
      .catch((error: unknown) => {
        if (!isCurrent) {
          return
        }
        setView(error instanceof MatchesValidationError ? 'validation' : 'failure')
      })

    return () => {
      isCurrent = false
    }
  }, [profile])

  const profileLabels = getProfileLabels(profile)
  const recommendedResult = recommendation ? results.find((result) => result.program.id === recommendation.programId) ?? null : null
  const visibleResults = results.filter((result) => result.program.id !== recommendation?.programId && (selectedCategory === 'all' || result.program.category === selectedCategory))
  const uncertainOnly = results.length > 0 && results.every((result) => result.state === 'uncertain')
  const resultsEntryState = { from: 'results' as const, returnTo: '/results' as const, lastMatchedProfile: profile }
  const editAnswers = () => {
    navigate('/matchmaker', { state: { editProfile: profile, returnToResults: true } })
  }
  const retry = () => {
    navigate('/results', { replace: true, state: { lastMatchedProfile: profile } })
  }

  const renderState = () => {
    if (view === 'loading') {
      return <MatchingTransition />
    }
    if (view === 'validation') {
      return <MatchingTransition failureKind="validation" onRetry={editAnswers} />
    }
    if (view === 'failure') {
      return <MatchingTransition failureKind="network" onRetry={retry} />
    }
    if (view === 'empty') {
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
            {uncertainOnly ? <aside className="ps-results-trust-note"><strong>We found opportunities, but more details need verification.</strong><p>Review the listed reasons and official requirements before deciding whether to apply.</p></aside> : null}
            {recommendedResult && recommendation ? <section aria-labelledby="recommended-opportunity-heading" className="ps-results-recommendation"><p className="ps-results-section-label" id="recommended-opportunity-heading">Recommended based on confirmed details</p><Link className="ps-results-row" state={resultsEntryState} to={`/programs/${recommendedResult.program.id}`}><AgencyLogo alt={recommendedResult.program.provider ?? ''} className="ps-results-row__logo" /><div className="ps-results-row__identity"><p>{recommendedResult.program.provider ?? 'Provider not specified'}</p><h2>{recommendedResult.program.title}</h2></div><ResultReasons reasons={recommendation.reasons} state={recommendedResult.state} /><div className="ps-results-row__meta"><ProgramStatusBadge status={recommendedResult.program.status} />{formatCheckedDate(recommendedResult.program.source.last_verified_at) ? <p>ParaSa&apos;yo checked {formatCheckedDate(recommendedResult.program.source.last_verified_at)}</p> : null}</div><MatchOutcome result={recommendedResult} /><span className="ps-results-row__action">View program <span aria-hidden="true">→</span></span></Link></section> : null}
            <section aria-labelledby="opportunities-heading">
              <div className="ps-results-list-header"><p className="ps-results-section-label" id="opportunities-heading">Opportunities</p><div aria-label="Refine displayed opportunities" className="ps-results-filters">{resultFilters.map((filter) => <button aria-pressed={selectedCategory === filter.category} className={selectedCategory === filter.category ? 'is-active' : ''} key={filter.category} onClick={() => setSelectedCategory(filter.category)} type="button">{filter.label}</button>)}</div></div>
              {visibleResults.length > 0 ? <div className="ps-results-list">{visibleResults.map((result) => <Link className="ps-results-row" key={result.program.id} state={resultsEntryState} to={`/programs/${result.program.id}`}><AgencyLogo alt={result.program.provider ?? ''} className="ps-results-row__logo" /><div className="ps-results-row__identity"><p>{result.program.provider ?? 'Provider not specified'}</p><h2>{result.program.title}</h2></div><ResultReasons reasons={result.reasons} state={result.state} /><div className="ps-results-row__meta"><ProgramStatusBadge status={result.program.status} />{formatCheckedDate(result.program.source.last_verified_at) ? <p>ParaSa&apos;yo checked {formatCheckedDate(result.program.source.last_verified_at)}</p> : null}</div><MatchOutcome result={result} /><span className="ps-results-row__action">View program <span aria-hidden="true">→</span></span></Link>)}</div> : <p className="ps-results-no-filtered-results">No opportunities match this category.</p>}
            </section>
            <aside className="ps-results-trust-note"><strong>Matches use the information you shared and may change when you update your answers.</strong></aside>
          </SectionContainer>
        </main>
      </>
    )
  }

  return renderState()
}
