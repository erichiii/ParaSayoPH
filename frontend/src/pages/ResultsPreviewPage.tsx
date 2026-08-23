import { useState } from 'react'
import { ResultsPage, type ResultsView } from './ResultsPage'

const previewStates: { label: string; value: ResultsView }[] = [
  { label: 'Resolved', value: 'resolved' },
  { label: 'Loading', value: 'loading' },
  { label: 'Summary', value: 'summary' },
  { label: 'Zero matches', value: 'empty' },
  { label: 'Failure', value: 'failure' },
]

export function ResultsPreviewPage() {
  const [previewState, setPreviewState] = useState<ResultsView>('resolved')

  return (
    <div className="ps-results-preview">
      <div aria-label="Results preview states" className="ps-results-preview__controls">
        <span>Development preview</span>
        {previewStates.map((state) => <button aria-pressed={previewState === state.value} className={previewState === state.value ? 'is-active' : ''} key={state.value} onClick={() => setPreviewState(state.value)} type="button">{state.label}</button>)}
      </div>
      <ResultsPage onPreviewStateChange={setPreviewState} previewState={previewState} />
    </div>
  )
}
