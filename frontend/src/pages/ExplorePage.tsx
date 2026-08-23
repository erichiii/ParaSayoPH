import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { getPrograms } from '../api/programs'
import { AgencyLogo } from '../components/ui/AgencyLogo'
import { Card } from '../components/ui/Card'
import { IconCircle } from '../components/ui/IconCircle'
import { SectionContainer } from '../components/ui/SectionContainer'
import { brandAssets } from '../data/brandAssets'
import { programCategoryLabels } from '../data/taxonomies'
import type { Program, ProgramCategory, ProgramStatus } from '../domain/program'

const ITEMS_PER_PAGE = 9

type ExploreBrandStyles = CSSProperties & Record<`--${string}`, string>

const exploreBrandStyles: ExploreBrandStyles = {
  ...(brandAssets.sun
    ? {
        '--ps-explore-sun-image': `url("${brandAssets.sun}")`,
        '--ps-explore-sun-center-display': 'none',
      }
    : {}),
  ...(brandAssets.wovenPattern
    ? {
        '--ps-explore-weave-image': `url("${brandAssets.wovenPattern}")`,
      }
    : {}),
}

const filterCategories: { category: ProgramCategory; icon: string; label: string }[] = [
  {
    category: 'scholarship',
    label: 'Scholarship',
    icon: 'M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 9v4.5C6 19 8.7 21 12 21s6-2 6-4.5V12l-6 3-6-3Z',
  },
  {
    category: 'financial_assistance',
    label: 'Financial assistance',
    icon: 'M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.99 1-1.72V9c0-.73-.41-1.37-1-1.72zM20 9v6h-7V9h7zM5 19V5h14v2h-6c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h6v2H5z',
  },
  {
    category: 'medical_assistance',
    label: 'Medical assistance',
    icon: 'M19 3h-3V0H8v3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 10h-2v2h-2v-2H8v-2h2V9h2v2h2v2z',
  },
  {
    category: 'crisis_assistance',
    label: 'Crisis assistance',
    icon: 'M13 2 3 14h7l-1 8 10-12h-7l1-8z',
  },
  {
    category: 'training',
    label: 'Training',
    icon: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
  },
  {
    category: 'ofw_assistance',
    label: 'OFW assistance',
    icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-3.1a15.7 15.7 0 0 0-1.4-3.6A8.1 8.1 0 0 1 18.9 8zM12 4c.8 1.1 1.5 2.5 1.8 4h-3.6c.3-1.5 1-2.9 1.8-4zM4.3 14a8.3 8.3 0 0 1 0-4h3.4a16.6 16.6 0 0 0 0 4H4.3zm.8 2h3.1a15.7 15.7 0 0 0 1.4 3.6A8.1 8.1 0 0 1 5.1 16zM8.2 8H5.1a8.1 8.1 0 0 1 4.5-3.6A15.7 15.7 0 0 0 8.2 8zM12 20c-.8-1.1-1.5-2.5-1.8-4h3.6c-.3 1.5-1 2.9-1.8 4zm2.3-6H9.7a14.4 14.4 0 0 1 0-4h4.6a14.4 14.4 0 0 1 0 4zm.1 5.6a15.7 15.7 0 0 0 1.4-3.6h3.1a8.1 8.1 0 0 1-4.5 3.6zm1.9-5.6a16.6 16.6 0 0 0 0-4h3.4a8.3 8.3 0 0 1 0 4h-3.4z',
  },
]

function getCategoryFromRouteState(state: unknown): ProgramCategory | null {
  if (!state || typeof state !== 'object') {
    return null
  }

  const category = (state as { category?: unknown }).category
  return typeof category === 'string' && category !== 'other' && category in programCategoryLabels
    ? category as ProgramCategory
    : null
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

function formatDisplayDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return lastCheckedDateFormatter.format(date)
}

function getCoverageDisplay(program: Program) {
  if (program.coverage.type === 'unknown') {
    return 'Coverage details unavailable'
  }
  if (program.coverage.locations.length > 0) {
    return program.coverage.locations.join(', ')
  }
  return coverageLabels[program.coverage.type]
}

function getDeadlineDisplay(deadline: string | null, status: ProgramStatus) {
  if (deadline) {
    const formatted = formatDisplayDate(`${deadline}T00:00:00Z`)
    return formatted ? `Deadline: ${formatted}` : 'Deadline not provided'
  }
  if (status === 'ongoing') {
    return 'Deadline: Ongoing'
  }
  return 'Deadline not provided'
}

export function ExplorePage() {
  const location = useLocation()
  const routeCategory = getCategoryFromRouteState(location.state)
  const [programs, setPrograms] = useState<Program[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<ProgramCategory | 'all'>(routeCategory ?? 'all')
  const [selectedStatus, setSelectedStatus] = useState<ProgramStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isCurrent = true

    void getPrograms()
      .then((data) => {
        if (isCurrent) {
          setPrograms(data)
        }
      })
      .catch(() => {
        if (isCurrent) {
          setPrograms([])
          setLoadError('We could not load opportunities right now. Please try again.')
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })
    return () => {
      isCurrent = false
    }
  }, [requestVersion])

  // Filter programs based on query, category, and status
  const filteredPrograms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return programs.filter((program) => {
      // Search matching title or provider
      if (query) {
        const matchTitle = program.title.toLowerCase().includes(query)
        const matchProvider = (program.provider ?? '').toLowerCase().includes(query)
        const matchDescription = (program.description ?? '').toLowerCase().includes(query)
        if (!matchTitle && !matchProvider && !matchDescription) {
          return false
        }
      }

      // Category matching
      if (selectedCategory !== 'all' && program.category !== selectedCategory) {
        return false
      }

      // Status matching
      if (selectedStatus !== 'all' && program.status !== selectedStatus) {
        return false
      }

      return true
    })
  }, [programs, searchQuery, selectedCategory, selectedStatus])

  // Pagination calculation
  const totalItems = filteredPrograms.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPrograms.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredPrograms, currentPage])

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedStatus !== 'all'

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedStatus('all')
    setCurrentPage(1)
  }

  const startCount = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endCount = Math.min(currentPage * ITEMS_PER_PAGE, totalItems)

  return (
    <div className="ps-explore-page" style={exploreBrandStyles}>
      {/* Top Navbar */}
      <header className="ps-explore-navbar">
        <SectionContainer className="ps-explore-navbar__inner">
          <Link aria-label="ParaSa'yo home" className="ps-explore-wordmark" to="/">
            <span aria-hidden="true" className="ps-explore-wordmark__sun" />
            <span>
              <span className="ps-explore-wordmark__para">Para</span>
              <span className="ps-explore-wordmark__sayo">Sa'yo</span>
            </span>
          </Link>
          <nav aria-label="Primary navigation" className="ps-explore-navbar__links">
            <Link className="ps-explore-navbar__link--active" to="/explore">
              Explore
            </Link>
            <Link to="/matchmaker">Para Sa Akin?</Link>
          </nav>
          <Link className="ps-explore-navbar__cta" to="/matchmaker">
            Find a match
          </Link>
          <details className="ps-explore-navbar__mobile-menu">
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

      {/* Hero Banner with Search & Filters */}
      <section className="ps-explore-hero">
        <span aria-hidden="true" className="ps-explore-hero__sun" />
        <SectionContainer className="ps-explore-hero__inner">
          <div className="ps-explore-hero__content">
            <p className="ps-explore-hero__eyebrow">Public Support and Opportunities</p>
            <h1 className="ps-explore-hero__title">Explore opportunities</h1>
            <p className="ps-explore-hero__subtitle">
              Browse public programs and services that can help you learn, grow, and build a better future.
            </p>
          </div>

          {/* Floating Filter Card */}
          <Card className="ps-explore-filter-card">
            {/* Search Input */}
            <div className="ps-explore-filter-card__search-box">
              <span aria-hidden="true" className="ps-explore-filter-card__search-icon">
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </span>
              <input
                aria-label="Search programs or providers"
                className="ps-explore-filter-card__search-input"
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Search programs or providers"
                type="search"
                value={searchQuery}
              />
            </div>

            {/* Filter Row: Category Chips, Status Dropdown, Clear Action */}
            <div className="ps-explore-filter-card__controls">
              <div className="ps-explore-filter-card__category-group">
                <span className="ps-explore-filter-card__label">Category</span>
                <div className="ps-explore-filter-card__chips">
                  {filterCategories.map((item) => {
                    const isSelected = selectedCategory === item.category
                    return (
                      <button
                        key={item.category}
                        aria-pressed={isSelected}
                        className={`ps-explore-chip ${isSelected ? 'ps-explore-chip--active' : ''}`}
                        onClick={() => {
                          setSelectedCategory(isSelected ? 'all' : item.category)
                          setCurrentPage(1)
                        }}
                        type="button"
                      >
                        <span aria-hidden="true" className="ps-explore-chip__icon">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d={item.icon} />
                          </svg>
                        </span>
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="ps-explore-filter-card__status-group">
                <label className="ps-explore-filter-card__label" htmlFor="explore-status-select">
                  Status
                </label>
                <div className="ps-explore-select-wrapper">
                  <select
                    id="explore-status-select"
                    className="ps-explore-select"
                    onChange={(e) => {
                      setSelectedStatus(e.target.value as ProgramStatus | 'all')
                      setCurrentPage(1)
                    }}
                    value={selectedStatus}
                  >
                    <option value="all">All statuses</option>
                    <option value="open">Open</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="closed">Closed</option>
                    <option value="unknown">Status unknown</option>
                  </select>
                </div>
              </div>

              {hasActiveFilters ? (
                <button
                  className="ps-explore-clear-button"
                  onClick={handleClearFilters}
                  type="button"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          </Card>
        </SectionContainer>
      </section>

      {/* Main Content: Card Grid & Results */}
      <main className="ps-explore-main">
        <SectionContainer>
          <div className="ps-explore-header-row">
            <div>
              <h2 className="ps-explore-section-title">Programs to explore</h2>
              <p className="ps-explore-results-count">
                {isLoading
                  ? 'Loading opportunities...'
                  : loadError
                    ? 'Unable to load opportunities'
                  : totalItems > 0
                    ? `Showing ${startCount}–${endCount} of ${totalItems} opportunities`
                    : 'Showing 0 opportunities'}
              </p>
            </div>
          </div>

          {/* Card Grid */}
          {!isLoading && paginatedPrograms.length > 0 ? (
            <div className="ps-explore-grid">
              {paginatedPrograms.map((program) => (
                <Card key={program.id} className="ps-explore-card">
                  <div className="ps-explore-card__top">
                    <div className="ps-explore-card__avatar">
                      <AgencyLogo className="ps-explore-card__agency-logo" />
                    </div>
                    <span className={`ps-explore-card__badge ps-explore-card__badge--${program.category}`}>
                      {programCategoryLabels[program.category]}
                    </span>
                  </div>

                  <div className="ps-explore-card__body">
                    <h3 className="ps-explore-card__title">{program.title}</h3>
                    <p className="ps-explore-card__provider">
                      {program.provider ?? 'Provider not specified'}
                    </p>
                    {program.description ? (
                      <p className="ps-explore-card__description">{program.description}</p>
                    ) : null}
                  </div>

                  <dl className="ps-explore-card__meta">
                    <div className="ps-explore-card__meta-item">
                      <span aria-hidden="true" className="ps-explore-card__meta-icon">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 10.5A3.5 3.5 0 1 1 12 5a3.5 3.5 0 0 1 0 7.5Z" />
                        </svg>
                      </span>
                      <div>
                        <dt className="sr-only">Coverage</dt>
                        <dd>Coverage: {getCoverageDisplay(program)}</dd>
                      </div>
                    </div>

                    <div className="ps-explore-card__meta-item">
                      <span aria-hidden="true" className="ps-explore-card__meta-icon">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
                        </svg>
                      </span>
                      <div>
                        <dt className="sr-only">Deadline</dt>
                        <dd>{getDeadlineDisplay(program.application.deadline, program.status)}</dd>
                      </div>
                    </div>

                    <div className="ps-explore-card__meta-item">
                      <span aria-hidden="true" className="ps-explore-card__meta-icon">
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                        </svg>
                      </span>
                      <div>
                        <dt className="sr-only">Last checked</dt>
                        <dd>
                          {formatDisplayDate(program.source.last_verified_at)
                            ? `Last checked: ${formatDisplayDate(program.source.last_verified_at)}`
                            : 'Last checked date unavailable'}
                        </dd>
                      </div>
                    </div>
                  </dl>

                  <div className="ps-explore-card__action-row">
                    <Link className="ps-explore-card__action" to={`/programs/${program.id}`}>
                      View details <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}

          {/* Empty State */}
          {!isLoading && loadError ? (
            <div className="ps-explore-empty-state" role="alert">
              <IconCircle size="large" tone="warm">
                <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '1.75rem', height: '1.75rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M5.1 19h13.8c1.5 0 2.4-1.6 1.7-2.9L13.7 4.3c-.7-1.3-2.7-1.3-3.4 0L3.4 16.1C2.7 17.4 3.6 19 5.1 19Z" />
                </svg>
              </IconCircle>
              <h3>Unable to load programs</h3>
              <p>{loadError}</p>
              <button className="ps-button ps-button--primary" onClick={() => {
                setIsLoading(true)
                setLoadError(null)
                setRequestVersion((version) => version + 1)
              }} type="button">
                Try again
              </button>
            </div>
          ) : null}

          {!isLoading && !loadError && filteredPrograms.length === 0 ? (
            <div className="ps-explore-empty-state">
              <IconCircle size="large" tone="warm">
                <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ width: '1.75rem', height: '1.75rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </IconCircle>
              <h3>No programs found</h3>
              <p>We couldn't find any opportunities matching your filters. Try adjusting your search term or clearing filters.</p>
              <button className="ps-button ps-button--primary" onClick={handleClearFilters} type="button">
                Clear all filters
              </button>
            </div>
          ) : null}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 ? (
            <nav aria-label="Pagination" className="ps-explore-pagination">
              <div className="ps-explore-pagination__controls">
                <button
                  aria-label="Previous page"
                  className="ps-explore-pagination__button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  type="button"
                >
                  <span aria-hidden="true">‹</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    aria-current={pageNum === currentPage ? 'page' : undefined}
                    className={`ps-explore-pagination__page ${
                      pageNum === currentPage ? 'ps-explore-pagination__page--active' : ''
                    }`}
                    onClick={() => setCurrentPage(pageNum)}
                    type="button"
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  aria-label="Next page"
                  className="ps-explore-pagination__button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  type="button"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>
              <p className="ps-explore-pagination__label">
                Page {currentPage} of {totalPages}
              </p>
            </nav>
          ) : null}

          {/* Source Transparency Callout */}
          <aside className="ps-explore-source-callout" aria-label="Source transparency note">
            <div className="ps-explore-source-callout__icon">
              <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
              </svg>
            </div>
            <div className="ps-explore-source-callout__body">
              <h3>Source transparency</h3>
              <p>
                Information is provided by participating public agencies and updated regularly. Program details,
                deadlines, and availability may change. Please verify with the provider before taking action.
              </p>
            </div>
            <div className="ps-explore-source-callout__action">
              <Link to="/explore" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
                Learn more about our sources <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>
        </SectionContainer>
      </main>
    </div>
  )
}
