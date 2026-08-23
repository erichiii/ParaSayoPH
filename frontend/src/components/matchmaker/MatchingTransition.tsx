import type { CSSProperties } from 'react'
import { Button } from '../ui/Button'

type MatchingTransitionProps = {
  isFailure?: boolean
  onRetry?: () => void
}
export function MatchingTransition({ isFailure = false, onRetry }: MatchingTransitionProps) {
  if (isFailure) {
    return (
      <section className="ps-matching-transition ps-matching-transition--failure" role="status">
        <h1>We couldn&apos;t find your matches right now.</h1>
        <p>Your answers are kept for this session.</p>
        {onRetry ? <Button onClick={onRetry}>Try again</Button> : null}
      </section>
    )
  }

  return (
    <section aria-busy="true" aria-live="polite" className="ps-matching-transition" role="status">
      <div aria-hidden="true" className="ps-matching-transition__sun-loader">
        <div className="ps-sun-center" />
        <div className="ps-sun-rays">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="ps-sun-ray"
              style={{ '--ray-index': index } as CSSProperties}
            />
          ))}
        </div>
      </div>
      <h1>Finding opportunities that may fit you</h1>
      <p>We&apos;re checking the details you shared.</p>
      <p className="ps-matching-transition__activity">Checking relevant programs</p>
    </section>
  )
}
