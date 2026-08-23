import { localMatchResults } from '../data/mockMatches'
import type { MatchProfile, MatchResult } from './types'

export async function getMatches(_profile: MatchProfile): Promise<MatchResult[]> {
  return localMatchResults.map((result) => ({ ...result, reasons: [...result.reasons] }))
}
