import type { CSSProperties } from 'react'
import { Button } from '../ui/Button'

type MatchingTransitionProps = {
  failureKind?: 'network' | 'validation'
  onRetry?: () => void
}
export function MatchingTransition({ failureKind, onRetry }: MatchingTransitionProps) {
  if (failureKind === 'validation') {
    return (
      <section className="ps-matching-transition ps-matching-transition--failure" role="alert">
        <h1>Some answers need updating.</h1>
        <p>Edit your answers, then try finding opportunities again.</p>
        {onRetry ? <Button onClick={onRetry}>Edit answers</Button> : null}
      </section>
    )
  }

  if (failureKind === 'network') {
    return (
      <section className="ps-matching-transition ps-matching-transition--failure" role="status">
        <h1>We couldn&apos;t find your matches right now.</h1>
        <p>Please try again. Your answers are still available while you stay on this page.</p>
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
