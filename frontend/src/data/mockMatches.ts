import type { MatchResult } from '../domain/matching'
import type { MatchProfile } from '../domain/profile'
import { localDemoPrograms } from './mockPrograms'

const programById = new Map(localDemoPrograms.map((program) => [program.id, program]))

function getProgram(id: string) {
  const program = programById.get(id)
  if (!program) {
    throw new Error(`Missing local program fixture: ${id}`)
  }
  return program
}

// Local review fixtures only. Reasons are explicit fixture data, not page-level matching logic.
export const localMatchProfileFixture: MatchProfile = {
  location: 'Region IV-A',
  age: null,
  employment_status: 'student',
  education_level: 'college',
  categories_needed: ['training', 'scholarship'],
}

export const localMatchResults: MatchResult[] = [
  {
    program: getProgram('workready-skills-training'),
    state: 'likely_eligible',
    reasons: ['Your training interest matches', 'Your current situation matches'],
  },
  {
    program: getProgram('digital-skills-for-all-course'),
    state: 'likely_eligible',
    reasons: ['Your education level matches', 'Your training interest matches'],
  },
  {
    program: getProgram('tech-scholars-program'),
    state: 'likely_eligible',
    reasons: ['Your education level matches', 'Your current situation matches'],
  },
  {
    program: getProgram('demo-emergency-crisis-support'),
    state: 'uncertain',
    reasons: ['We need a few more details to confirm your fit'],
  },
]
