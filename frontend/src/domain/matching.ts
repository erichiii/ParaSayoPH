import type { Program } from './program'

export type MatchState = 'likely_eligible' | 'uncertain' | 'known_conflict'

export type MatchResult = {
  program: Program
  state: MatchState
  reasons: string[]
}
