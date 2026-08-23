import { parseProgram } from './programs'
import type { MatchProfile } from '../domain/profile'
import type { MatchReason, MatchReasonCode, MatchRecommendation, MatchResponse, MatchResult, MatchState } from '../domain/matching'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

const reasonLabels: Record<MatchReasonCode, string> = {
  category_selected: 'Matches a category you selected.',
  age_within_range: 'Your age is within the listed age range.',
  coverage_location_match: 'Your location is listed in the program coverage.',
  nationwide_coverage: 'This program is available nationwide.',
  residency_location_match: 'Your location meets the listed residency requirement.',
  employment_status_match: 'Your current status matches the listed requirement.',
  education_level_match: 'Your education level matches the listed requirement.',
  age_not_submitted: 'Add your age to check the listed age requirement.',
  location_not_submitted: 'Add your location to check the listed location requirement.',
  employment_not_submitted: 'Add your current status to check the listed employment requirement.',
  education_not_submitted: 'Add your education level to check the listed education requirement.',
  age_criteria_unavailable: 'The published eligibility details do not include age information.',
  location_criteria_unavailable: 'The published eligibility details do not include location information.',
  employment_criteria_unavailable: 'The published eligibility details do not include employment information.',
  education_criteria_unavailable: 'The published eligibility details do not include education information.',
  eligibility_details_unavailable: 'The published eligibility details do not include structured requirements.',
}

export class MatchesApiError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'MatchesApiError'
    this.status = status
  }
}

export class MatchesValidationError extends MatchesApiError {
  constructor() {
    super('Some answers need updating before we can find matches.', 422)
    this.name = 'MatchesValidationError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseReason(value: unknown): MatchReason {
  if (!isRecord(value) || typeof value.code !== 'string' || typeof value.label !== 'string') {
    throw new MatchesApiError('The Matches API returned an invalid response.')
  }

  const code = value.code as MatchReasonCode
  if (!(code in reasonLabels) || value.label !== reasonLabels[code]) {
    throw new MatchesApiError('The Matches API returned an invalid response.')
  }

  return { code, label: value.label }
}

function parseMatchResult(value: unknown): MatchResult {
  if (!isRecord(value) || !Array.isArray(value.reasons) || (value.match_state !== 'likely_eligible' && value.match_state !== 'uncertain')) {
    throw new MatchesApiError('The Matches API returned an invalid response.')
  }

  return {
    program: parseProgram(value.program),
    state: value.match_state as MatchState,
    reasons: value.reasons.map(parseReason),
  }
}

function parseRecommendation(value: unknown, results: MatchResult[]): MatchRecommendation | null {
  if (value === undefined) {
    return null
  }
  if (!isRecord(value) || typeof value.program_id !== 'string' || !Array.isArray(value.reasons)) {
    throw new MatchesApiError('The Matches API returned an invalid response.')
  }

  const recommended = results.find((result) => result.program.id === value.program_id)
  const reasons = value.reasons.map(parseReason)
  const evidenceGroups = new Set(reasons.map((reason) => ({
    age_within_range: 'age',
    coverage_location_match: 'location',
    nationwide_coverage: 'location',
    residency_location_match: 'location',
    education_level_match: 'education',
    employment_status_match: 'employment',
  } as Partial<Record<MatchReasonCode, string>>)[reason.code]).filter(Boolean))

  if (!recommended || recommended.state !== 'likely_eligible' || recommended.program.status !== 'open' || evidenceGroups.size < 2) {
    throw new MatchesApiError('The Matches API returned an invalid response.')
  }

  return { programId: value.program_id, reasons }
}

export async function getMatches(profile: MatchProfile): Promise<MatchResponse> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/api/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
  } catch {
    throw new MatchesApiError('Unable to reach the Matches API.')
  }

  if (response.status === 422) {
    throw new MatchesValidationError()
  }
  if (!response.ok) {
    throw new MatchesApiError('The Matches API is unavailable.', response.status)
  }

  let value: unknown
  try {
    value = await response.json()
  } catch {
    throw new MatchesApiError('The Matches API returned an invalid response.', response.status)
  }

  if (!isRecord(value) || !Array.isArray(value.results)) {
    throw new MatchesApiError('The Matches API returned an invalid response.', response.status)
  }

  const results = value.results.map(parseMatchResult)
  return { results, recommendation: parseRecommendation(value.recommendation, results) }
}
