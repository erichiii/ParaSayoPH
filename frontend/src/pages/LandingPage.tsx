import { useState } from 'react'
import { Link } from 'react-router'
import { ProgramStatusBadge } from '../components/programs/ProgramStatusBadge'
import { AgencyLogo } from '../components/ui/AgencyLogo'
import { BrandWordmark } from '../components/ui/BrandWordmark'
import { MediaSlot } from '../components/ui/MediaSlot'
import { SectionContainer } from '../components/ui/SectionContainer'
import { landingContent } from '../data/landingContent'
import { localDemoPrograms } from '../data/mockPrograms'
import { programCategoryLabels } from '../data/taxonomies'
import type { Program } from '../domain/program'

type LandingCategory = {
  category: keyof typeof landingContent.categoryImages
  description: string
}

const landingCategories: LandingCategory[] = [
  { category: 'scholarship', description: 'Support for your studies' },
  { category: 'training', description: 'Build skills for what comes next' },
  { category: 'financial_assistance', description: 'Help with essential needs' },
  { category: 'medical_assistance', description: 'Support for medical needs' },
  { category: 'crisis_assistance', description: 'Help during urgent moments' },
  { category: 'ofw_assistance', description: 'Support for OFWs and families' },
]

const previewProgramIds = [
  'tulong-aral-scholarship',
  'workready-skills-training',
  'medical-assistance-program',
]

const previewPrograms = previewProgramIds
  .map((id) => localDemoPrograms.find((program) => program.id === id))
  .filter((program): program is Program => Boolean(program))

const checkedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
})

function formatCheckedDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : checkedDateFormatter.format(date)
}

function FilledIcon({ kind }: { kind: 'calendar' | 'choice' | 'details' | 'source' }) {
  const paths = {
    calendar: 'M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V2Zm12 8H5v10h14V10Zm-2-4H7v2h10V6Z',
    choice: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v6h-2V7Zm0 8h2v2h-2v-2Z',
    details: 'M4 3h16v18H4V3Zm3 4v2h10V7H7Zm0 4v2h10v-2H7Zm0 4v2h6v-2H7Z',
    source: 'M12 2 3 6v5c0 5.5 3.8 9.5 9 11 5.2-1.5 9-5.5 9-11V6l-9-4Zm-1 14-4-4 1.4-1.4L11 13.2l4.6-4.6L17 10l-6 6Z',
  } as const

  return <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"><path d={paths[kind]} /></svg>
}

function LandingNav() {
  return (
    <header className="ps-landing-navbar">
      <SectionContainer className="ps-landing-navbar__inner">
        <BrandWordmark />
        <nav aria-label="Primary navigation" className="ps-landing-navbar__links">
          <Link to="/explore">Explore</Link>
          <Link to="/matchmaker">Para Sa Akin?</Link>
          <a href="#how-it-works">How it works</a>
        </nav>
        <Link className="ps-landing-navbar__cta" to="/matchmaker">Find a match</Link>
        <details className="ps-landing-navbar__mobile-menu">
          <summary aria-label="Open navigation menu"><span aria-hidden="true" /></summary>
          <nav aria-label="Mobile navigation">
            <Link to="/explore">Explore</Link>
            <Link to="/matchmaker">Para Sa Akin?</Link>
            <a href="#how-it-works">How it works</a>
            <Link to="/matchmaker">Find a match</Link>
          </nav>
        </details>
      </SectionContainer>
    </header>
  )
}

export function LandingPage() {
  const [heroFailed, setHeroFailed] = useState(false)
  const hasHeroImage = Boolean(landingContent.hero.src) && !heroFailed

  return (
    <div className="ps-landing-page">
      <LandingNav />
      <main>
        <section className={`ps-landing-hero ${hasHeroImage ? 'has-image' : ''}`}>
          {hasHeroImage ? <div className="ps-landing-hero__visual"><img alt={landingContent.hero.alt} onError={() => setHeroFailed(true)} src={landingContent.hero.src ?? undefined} style={{ objectPosition: landingContent.hero.objectPosition }} /></div> : null}
          <SectionContainer className="ps-landing-hero__inner">
            <div className="ps-landing-hero__content">
              <p className="ps-landing-hero__eyebrow">Public opportunities, made easier to find</p>
              <h1>Find what&apos;s available. Find what&apos;s for you.</h1>
              <p>Explore scholarships, training, and assistance opportunities, or answer a few optional questions to find programs that may fit.</p>
              <div className="ps-landing-hero__actions">
                <Link className="ps-button ps-button--hero" to="/matchmaker">Find what&apos;s for me <span aria-hidden="true">→</span></Link>
                <Link className="ps-landing-hero__secondary-action" to="/explore">Explore opportunities <span aria-hidden="true">→</span></Link>
              </div>
              <p className="ps-landing-hero__note">No sign-up required</p>
            </div>
          </SectionContainer>
        </section>

        <SectionContainer className="ps-landing-trust-rail" aria-label="How ParaSa'yo works for you">
          <article><span aria-hidden="true"><FilledIcon kind="source" /></span><div><h2>Source links</h2><p>See where program details come from.</p></div></article>
          <article><span aria-hidden="true"><FilledIcon kind="calendar" /></span><div><h2>Last checked</h2><p>See when ParaSa&apos;yo last checked details.</p></div></article>
          <article><span aria-hidden="true"><FilledIcon kind="choice" /></span><div><h2>No sign-up required</h2><p>Browse and match without an account.</p></div></article>
          <article><span aria-hidden="true"><FilledIcon kind="details" /></span><div><h2>Your choice</h2><p>Explore directly or answer a few questions.</p></div></article>
        </SectionContainer>

        <section className="ps-landing-section ps-landing-categories">
          <SectionContainer>
            <h2>What are you looking for?</h2>
            <div className="ps-landing-category-grid">
              {landingCategories.map((item) => {
                const image = landingContent.categoryImages[item.category]
                return <Link className="ps-landing-category-card" key={item.category} state={{ category: item.category }} to="/explore"><MediaSlot alt={image.alt} aspectRatio="4 / 3" category={item.category} kind="category" objectPosition={image.objectPosition} src={image.src} /><div><h3>{programCategoryLabels[item.category]}</h3><p>{item.description}</p></div><span aria-hidden="true">→</span></Link>
              })}
            </div>
          </SectionContainer>
        </section>

        <section className="ps-landing-process" id="how-it-works">
          <SectionContainer>
            <h2>How ParaSa&apos;yo works</h2>
            <ol>
              <li><span>01</span><div><h3>Tell us about you</h3><p>Answer a few optional questions.</p></div></li>
              <li><span>02</span><div><h3>We find matches</h3><p>Surface opportunities that may fit the details shared.</p></div></li>
              <li><span>03</span><div><h3>Explore and decide</h3><p>Review program details and their source.</p></div></li>
            </ol>
          </SectionContainer>
        </section>

        <section className="ps-landing-section ps-landing-programs">
          <SectionContainer>
            <div className="ps-landing-section-heading"><h2>Programs you can explore</h2><Link to="/explore">View all <span aria-hidden="true">→</span></Link></div>
            <div className="ps-landing-program-list">
              {previewPrograms.map((program) => {
                const logo = landingContent.programAgencyLogos[program.id as keyof typeof landingContent.programAgencyLogos]
                const checkedDate = formatCheckedDate(program.source.last_verified_at)
                return <article className="ps-landing-program-row" key={program.id}><AgencyLogo alt={logo?.alt ?? ''} className="ps-landing-program-row__logo" objectPosition={logo?.objectPosition} src={logo?.src} /><div className="ps-landing-program-row__content"><h3>{program.title}</h3>{program.provider ? <p>{program.provider}</p> : <p>{programCategoryLabels[program.category]}</p>}<small>{program.description ?? programCategoryLabels[program.category]}</small></div><div className="ps-landing-program-row__meta"><ProgramStatusBadge status={program.status} />{checkedDate ? <p>ParaSa&apos;yo checked {checkedDate}</p> : null}</div><Link className="ps-landing-program-row__action" state={{ from: 'explore', returnTo: '/explore' }} to={`/programs/${program.id}`}>View details <span aria-hidden="true">→</span></Link></article>
              })}
            </div>
          </SectionContainer>
        </section>

        <section className="ps-landing-source-note">
          <SectionContainer className="ps-landing-source-note__inner">
            {landingContent.sourceTrust.src ? <MediaSlot alt={landingContent.sourceTrust.alt} aspectRatio="4 / 3" className="ps-landing-source-note__media" kind="program" objectPosition={landingContent.sourceTrust.objectPosition} src={landingContent.sourceTrust.src} /> : <span aria-hidden="true" className="ps-landing-source-note__icon"><FilledIcon kind="source" /></span>}
            <div><h2>Know where program details come from.</h2><p>ParaSa&apos;yo shows the source and when it last checked available details, so you can review the information before deciding.</p></div>
          </SectionContainer>
        </section>
      </main>
    </div>
  )
}
