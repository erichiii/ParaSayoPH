import { getPrograms } from './programs'
import type { MatchProfile, MatchResult } from './types'

export async function getMatches(_profile: MatchProfile): Promise<MatchResult[]> {
  const programs = await getPrograms()

  return programs.map((program) => ({
    program,
    state: 'uncertain',
    reasons: [],
  }))
}
