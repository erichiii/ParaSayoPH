import { brandAssets } from '../../data/brandAssets'
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
      <div aria-hidden="true" className="ps-matching-transition__jeepney">
        {brandAssets.jeepneyRoad ? <img alt="" className="ps-matching-transition__road" src={brandAssets.jeepneyRoad} /> : null}
        {brandAssets.jeepneyBody ? <img alt="" className="ps-matching-transition__body" src={brandAssets.jeepneyBody} /> : null}
        {brandAssets.jeepneyWheels ? <img alt="" className="ps-matching-transition__wheel ps-matching-transition__wheel--rear" src={brandAssets.jeepneyWheels} /> : null}
        {brandAssets.jeepneyWheels ? <img alt="" className="ps-matching-transition__wheel ps-matching-transition__wheel--front" src={brandAssets.jeepneyWheels} /> : null}
      </div>
      <h1>Finding opportunities that may fit you</h1>
      <p>We&apos;re checking the details you shared.</p>
      <p className="ps-matching-transition__activity"><span aria-hidden="true" />Checking relevant programs</p>
    </section>
  )
}
