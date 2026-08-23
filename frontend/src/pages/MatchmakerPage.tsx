import { useState, type CSSProperties } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { BrandWordmark } from '../components/ui/BrandWordmark'
import { Button } from '../components/ui/Button'
import { SectionContainer } from '../components/ui/SectionContainer'
import { brandAssets } from '../data/brandAssets'
import {
  matchCategoryChoices,
  matchEducationLevels,
  matchEmploymentStatuses,
  matchRegions,
  programCategoryLabels,
} from '../data/taxonomies'
import type { MatchProfile, MatchableProgramCategory, RegionId } from '../domain/profile'

type MatchmakerStage = 'introduction' | 1 | 2 | 3 | 'review'
type MatchmakerBrandStyles = CSSProperties & Record<`--${string}`, string>

const initialProfile: MatchProfile = {
  location: null,
  age: null,
  employment_status: null,
  education_level: null,
  categories_needed: [],
}

const stageDetails = {
  1: { title: 'Who & Where', helper: 'Your location and age help us show relevant opportunities.' },
  2: { title: 'Background & Study', helper: 'A little context can help narrow your results.' },
  3: { title: 'Support Needed', helper: 'Choose the kinds of opportunities you want to explore.' },
} as const

const matchmakerBrandStyles: MatchmakerBrandStyles = {
  ...(brandAssets.sun
    ? {
        '--ps-matchmaker-sun-image': `url("${brandAssets.sun}")`,
        '--ps-matchmaker-sun-center-display': 'none',
      }
    : {}),
}

function ChoiceCheck() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function ChoiceIcon({ type }: { type: 'status' | 'education' | 'category' }) {
  const paths = {
    status: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
    education: 'm3 9 9-5 9 5-9 5-9-5Zm3 3v4.5c0 1.5 2.7 3.5 6 3.5s6-2 6-3.5V12',
    category: 'M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 5 5 2.8v4.4L12 17l-5-2.8V9.8L12 7Z',
  }

  return (
    <span aria-hidden="true" className="ps-matchmaker-choice__icon">
      <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d={paths[type]} />
      </svg>
    </span>
  )
}

function getOptionLabel(options: readonly { value: string; label: string }[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? null
}

function isMatchProfile(value: unknown): value is MatchProfile {
  return Boolean(value && typeof value === 'object' && Array.isArray((value as Partial<MatchProfile>).categories_needed))
}

function cloneProfile(profile: MatchProfile): MatchProfile {
  return { ...profile, categories_needed: [...profile.categories_needed] }
}

export function MatchmakerPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const routeState = location.state as { editProfile?: unknown; returnToResults?: boolean } | null
  const editProfile = isMatchProfile(routeState?.editProfile) ? routeState.editProfile : null
  const [stage, setStage] = useState<MatchmakerStage>(() => editProfile ? 'review' : 'introduction')
  const [profile, setProfile] = useState<MatchProfile>(() => editProfile ? cloneProfile(editProfile) : initialProfile)
  const [ageInput, setAgeInput] = useState(() => editProfile?.age === null || editProfile?.age === undefined ? '' : String(editProfile.age))
  const [ageError, setAgeError] = useState<string | null>(null)
  const [stepGuidance, setStepGuidance] = useState<string | null>(null)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  const setProfileValue = <Key extends keyof MatchProfile>(key: Key, value: MatchProfile[Key]) => {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  const validateAge = () => {
    if (ageInput.trim() === '') {
      setProfileValue('age', null)
      setAgeError(null)
      return true
    }

    const age = Number(ageInput)
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      setAgeError('Enter an age between 1 and 120.')
      return false
    }

    setProfileValue('age', age)
    setAgeError(null)
    return true
  }

  const updateAge = (value: string) => {
    setAgeInput(value)
    if (value === '') {
      setProfileValue('age', null)
      setAgeError(null)
      return
    }

    const age = Number(value)
    const isValidAge = Number.isInteger(age) && age >= 1 && age <= 120
    setProfileValue('age', isValidAge ? age : null)
    if (isValidAge) {
      setStepGuidance(null)
    }
    setAgeError(null)
  }

  const changeAge = (amount: number) => {
    const currentAge = profile.age ?? 18
    const nextAge = Math.min(120, Math.max(1, currentAge + amount))
    setAgeInput(String(nextAge))
    setProfileValue('age', nextAge)
    setAgeError(null)
    setStepGuidance(null)
  }

  const continueFromStepOne = () => {
    if (!validateAge()) {
      return
    }
    if (profile.location === null && profile.age === null) {
      setStepGuidance('Answer at least one question, or choose ‘Skip this step’.')
      return
    }
    setStepGuidance(null)
    setStage(2)
  }

  const continueFromStepTwo = () => {
    if (profile.employment_status === null && profile.education_level === null) {
      setStepGuidance('Answer at least one question, or choose ‘Skip this step’.')
      return
    }
    setStepGuidance(null)
    setStage(3)
  }

  const continueFromStepThree = () => {
    if (profile.categories_needed.length === 0) {
      setCategoryError('Choose at least one category to continue.')
      return
    }
    setCategoryError(null)
    setStage('review')
  }

  const toggleCategory = (category: MatchableProgramCategory) => {
    setProfile((current) => ({
      ...current,
      categories_needed: current.categories_needed.includes(category)
        ? current.categories_needed.filter((item) => item !== category)
        : [...current.categories_needed, category],
    }))
    setCategoryError(null)
  }

  const locationLabel = getOptionLabel(matchRegions, profile.location)
  const employmentLabel = getOptionLabel(matchEmploymentStatuses, profile.employment_status)
  const educationLabel = getOptionLabel(matchEducationLevels, profile.education_level)

  const renderStepOne = () => (
    <>
      <div className="ps-matchmaker-form__intro">
        <h1>Who &amp; Where</h1>
        <p>Tell us a little about your location and age.</p>
      </div>
      <div className="ps-matchmaker-question-group">
        <label className="ps-matchmaker-label" htmlFor="matchmaker-region">
          Where do you currently live?
        </label>
        <p className="ps-matchmaker-helper">This helps us show programs available in your area.</p>
        <div className="ps-matchmaker-select-wrap">
          <select
            className="ps-matchmaker-select"
            id="matchmaker-region"
            onChange={(event) => {
              setProfileValue('location', event.target.value ? event.target.value as RegionId : null)
              setStepGuidance(null)
            }}
            value={profile.location ?? ''}
          >
            <option value="">Choose a region (optional)</option>
            {matchRegions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="ps-matchmaker-question-group">
        <label className="ps-matchmaker-label" htmlFor="matchmaker-age">
          How old are you?
        </label>
        <p className="ps-matchmaker-helper">Used to check age requirements for some programs.</p>
        <div className="ps-matchmaker-age-control">
          <input
            aria-describedby={ageError ? 'matchmaker-age-error' : undefined}
            aria-invalid={ageError ? true : undefined}
            className="ps-matchmaker-age-input"
            id="matchmaker-age"
            inputMode="numeric"
            max="120"
            min="1"
            onBlur={validateAge}
            onChange={(event) => updateAge(event.target.value)}
            placeholder="Age"
            type="number"
            value={ageInput}
          />
          <button aria-label="Decrease age" className="ps-matchmaker-age-button" disabled={profile.age === null || profile.age <= 1} onClick={() => changeAge(-1)} type="button">
            <span aria-hidden="true">−</span>
          </button>
          <button aria-label="Increase age" className="ps-matchmaker-age-button" disabled={profile.age === 120} onClick={() => changeAge(1)} type="button">
            <span aria-hidden="true">+</span>
          </button>
        </div>
        {ageError ? <p className="ps-matchmaker-error" id="matchmaker-age-error" role="alert">{ageError}</p> : null}
      </div>
      {stepGuidance ? <p aria-live="polite" className="ps-matchmaker-guidance">{stepGuidance}</p> : null}
      <div className="ps-matchmaker-actions">
        <Button onClick={() => { setStepGuidance(null); setStage(2) }} variant="secondary">Skip this step</Button>
        <Button onClick={continueFromStepOne}>Continue <span aria-hidden="true">→</span></Button>
      </div>
    </>
  )

  const renderStepTwo = () => (
    <>
      <div className="ps-matchmaker-form__intro">
        <h1>Background &amp; Study</h1>
        <p>Tell us about your current situation.</p>
      </div>
      <fieldset className="ps-matchmaker-choice-group">
        <legend>What&apos;s your current situation?</legend>
        <p className="ps-matchmaker-helper">Choose the one that best describes you.</p>
        <div className="ps-matchmaker-choice-grid">
          {matchEmploymentStatuses.map((status) => {
            const isSelected = profile.employment_status === status.value
            return (
              <label className={`ps-matchmaker-choice ${isSelected ? 'ps-matchmaker-choice--selected' : ''}`} key={status.value}>
                <input checked={isSelected} name="employment-status" onChange={() => { setProfileValue('employment_status', status.value); setStepGuidance(null) }} type="radio" value={status.value} />
                <ChoiceIcon type="status" />
                <span className="ps-matchmaker-choice__copy"><strong>{status.label}</strong><small>{status.description}</small></span>
                <span className="ps-matchmaker-choice__check"><ChoiceCheck /></span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <fieldset className="ps-matchmaker-choice-group">
        <legend>What&apos;s your current education level?</legend>
        <div className="ps-matchmaker-choice-grid">
          {matchEducationLevels.map((level) => {
            const isSelected = profile.education_level === level.value
            return (
              <label className={`ps-matchmaker-choice ${isSelected ? 'ps-matchmaker-choice--selected' : ''}`} key={level.value}>
                <input checked={isSelected} name="education-level" onChange={() => { setProfileValue('education_level', level.value); setStepGuidance(null) }} type="radio" value={level.value} />
                <ChoiceIcon type="education" />
                <span className="ps-matchmaker-choice__copy"><strong>{level.label}</strong></span>
                <span className="ps-matchmaker-choice__check"><ChoiceCheck /></span>
              </label>
            )
          })}
        </div>
      </fieldset>
      {stepGuidance ? <p aria-live="polite" className="ps-matchmaker-guidance">{stepGuidance}</p> : null}
      <div className="ps-matchmaker-actions">
        <Button onClick={() => { setStepGuidance(null); setStage(1) }} variant="secondary"><span aria-hidden="true">←</span> Back</Button>
        <div className="ps-matchmaker-actions__right"><Button onClick={() => { setStepGuidance(null); setStage(3) }} variant="secondary">Skip this step</Button><Button onClick={continueFromStepTwo}>Continue <span aria-hidden="true">→</span></Button></div>
      </div>
    </>
  )

  const renderStepThree = () => (
    <>
      <div className="ps-matchmaker-form__intro">
        <h1>Support Needed</h1>
        <p>What are you looking for?</p>
      </div>
      <fieldset aria-describedby={categoryError ? 'matchmaker-category-error' : undefined} className="ps-matchmaker-choice-group ps-matchmaker-choice-group--compact">
        <legend>Select everything you&apos;re interested in.</legend>
        <div className="ps-matchmaker-category-grid">
          {matchCategoryChoices.map((category) => {
            const isSelected = profile.categories_needed.includes(category)
            return (
              <label className={`ps-matchmaker-choice ps-matchmaker-choice--category ${isSelected ? 'ps-matchmaker-choice--selected' : ''}`} key={category}>
                <input checked={isSelected} onChange={() => toggleCategory(category)} type="checkbox" value={category} />
                <ChoiceIcon type="category" />
                <span className="ps-matchmaker-choice__copy"><strong>{programCategoryLabels[category]}</strong></span>
                <span className="ps-matchmaker-choice__check"><ChoiceCheck /></span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <p className="ps-matchmaker-note">You can choose more than one. Select at least one category before finding opportunities.</p>
      {categoryError ? <p aria-live="polite" className="ps-matchmaker-error" id="matchmaker-category-error">{categoryError}</p> : null}
      <div className="ps-matchmaker-actions">
        <Button onClick={() => { setCategoryError(null); setStage(2) }} variant="secondary"><span aria-hidden="true">←</span> Back</Button>
        <div className="ps-matchmaker-actions__right"><Button onClick={() => { setCategoryError(null); setStage('review') }} variant="secondary">Skip this step</Button><Button onClick={continueFromStepThree}>Continue <span aria-hidden="true">→</span></Button></div>
      </div>
    </>
  )

  const reviewRows = [
    { title: 'Who & Where', details: [locationLabel, profile.age === null ? null : `${profile.age} years old`].filter(Boolean), editStage: 1 as const },
    { title: 'Background & Study', details: [employmentLabel, educationLabel].filter(Boolean), editStage: 2 as const },
    { title: 'Support Needed', details: profile.categories_needed.map((category) => programCategoryLabels[category]), editStage: 3 as const },
  ]

  const renderReview = () => (
    <>
      <div className="ps-matchmaker-form__intro">
        <p className="ps-matchmaker-eyebrow">Your profile</p>
        <h1>Ready when you are</h1>
        <p>Here&apos;s what we&apos;ll use to find potential matches.</p>
      </div>
      <div className="ps-matchmaker-review-list">
        {reviewRows.map((row) => (
          <section className="ps-matchmaker-review-row" key={row.title}>
            <div>
              <h2>{row.title}</h2>
              {row.details.length > 0 ? <p>{row.details.join(' · ')}</p> : <p className="ps-matchmaker-review-row__empty">No answer yet. You can still continue.</p>}
            </div>
            <button onClick={() => setStage(row.editStage)} type="button">Edit</button>
          </section>
        ))}
      </div>
      {profile.categories_needed.length === 0 ? <p className="ps-matchmaker-error" role="alert">Choose at least one support category to find opportunities.</p> : null}
      <div className="ps-matchmaker-actions">
        {routeState?.returnToResults && editProfile ? <Button onClick={() => navigate('/results', { state: { lastMatchedProfile: editProfile } })} variant="secondary">Cancel</Button> : <Button onClick={() => setStage(3)} variant="secondary"><span aria-hidden="true">←</span> Back</Button>}
        <Button disabled={profile.categories_needed.length === 0} onClick={() => navigate('/results', { state: { lastMatchedProfile: cloneProfile(profile) } })}>Find opportunities <span aria-hidden="true">→</span></Button>
      </div>
    </>
  )

  if (stage === 'introduction') {
    return (
      <div className="ps-matchmaker-page" style={matchmakerBrandStyles}>
        <MatchmakerNav />
        <main className="ps-matchmaker-stage">
          <div className="ps-matchmaker-workspace">
            <aside className="ps-matchmaker-panel">
              <div className="ps-matchmaker-panel__content">
                <p className="ps-matchmaker-panel__kicker">ParaSa&apos;yo Matchmaker</p>
                <h2>Para Sa Akin?</h2>
                <p>Answer three short questions to discover opportunities that may fit you.</p>
              </div>
            </aside>
            <section className="ps-matchmaker-form ps-matchmaker-form--introduction">
              <div className="ps-matchmaker-form__intro">
                <p className="ps-matchmaker-eyebrow">Get started</p>
                <h1>Find opportunities that may fit you.</h1>
                <p>No sign-up required. Share only what you&apos;re comfortable with.</p>
              </div>
              <div className="ps-matchmaker-introduction__details"><span>3 quick steps</span><span>No sign-up required</span></div>
              <Button onClick={() => setStage(1)}>Get started <span aria-hidden="true">→</span></Button>
            </section>
          </div>
        </main>
      </div>
    )
  }

  const isReview = stage === 'review'
  const currentStep = isReview ? 3 : stage
  const currentDetail = stageDetails[currentStep]

  return (
      <div className="ps-matchmaker-page" style={matchmakerBrandStyles}>
      <MatchmakerNav />
      <main className="ps-matchmaker-stage">
        <div className="ps-matchmaker-workspace">
          <aside className="ps-matchmaker-panel">
            <div className="ps-matchmaker-panel__content">
              <p className="ps-matchmaker-panel__kicker">Step {currentStep} of 3</p>
              <h2>{isReview ? 'Profile review' : currentDetail.title}</h2>
              <p>{isReview ? 'Check your answers before we look for potential matches.' : currentDetail.helper}</p>
              <ol aria-label="Matchmaker progress" className="ps-matchmaker-panel__progress">
                {([1, 2, 3] as const).map((step) => <li className={step <= currentStep ? 'is-active' : ''} key={step}><span>{step < currentStep ? <ChoiceCheck /> : step}</span><small>{stageDetails[step].title}</small></li>)}
              </ol>
            </div>
          </aside>
          <section className="ps-matchmaker-form" aria-label={isReview ? 'Profile review' : `Step ${currentStep}: ${currentDetail.title}`}>
            <div className="ps-matchmaker-form__progress" aria-hidden="true">
              {([1, 2, 3] as const).map((step) => <span className={step <= currentStep ? 'is-active' : ''} key={step}><i>{step < currentStep ? <ChoiceCheck /> : step}</i><b>{stageDetails[step].title}</b></span>)}
            </div>
            {stage === 1 ? renderStepOne() : null}
            {stage === 2 ? renderStepTwo() : null}
            {stage === 3 ? renderStepThree() : null}
            {stage === 'review' ? renderReview() : null}
          </section>
        </div>
      </main>
    </div>
  )
}

function MatchmakerNav() {
  return (
    <header className="ps-matchmaker-navbar">
      <SectionContainer className="ps-matchmaker-navbar__inner">
        <BrandWordmark />
        <nav aria-label="Primary navigation" className="ps-matchmaker-navbar__links"><Link to="/explore">Explore</Link><Link aria-current="page" className="is-active" to="/matchmaker">Para Sa Akin?</Link></nav>
        <Link className="ps-matchmaker-navbar__cta" to="/explore">Explore programs</Link>
      </SectionContainer>
    </header>
  )
}
