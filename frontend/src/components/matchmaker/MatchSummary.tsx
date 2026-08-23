import { Button } from '../ui/Button'

type MatchSummaryProps = {
  answerLabels: string[]
  count: number
  onEditAnswers: () => void
  onSeeMatches: () => void
}

export function MatchSummary({ answerLabels, count, onEditAnswers, onSeeMatches }: MatchSummaryProps) {
  return (
    <section className="ps-match-summary">
      <div className="ps-match-summary__main">
        <p className="ps-match-summary__eyebrow">Match summary</p>
        <h1>{count} {count === 1 ? 'opportunity may' : 'opportunities may'} fit you</h1>
        <p>Based on the details you shared.</p>
      </div>
      <div className="ps-match-summary__answers">
        <h2>Your answers</h2>
        {answerLabels.length > 0 ? <ul>{answerLabels.map((label) => <li key={label}>{label}</li>)}</ul> : <p>No answers were supplied.</p>}
        <button onClick={onEditAnswers} type="button">Edit answers</button>
      </div>
      <div className="ps-match-summary__actions"><Button onClick={onSeeMatches}>See matches <span aria-hidden="true">→</span></Button></div>
    </section>
  )
}
