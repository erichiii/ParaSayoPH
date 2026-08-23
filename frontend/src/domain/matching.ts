import type { Program } from './program'

export type MatchState = 'likely_eligible' | 'uncertain'

export type MatchReasonCode =
  | 'category_selected'
  | 'age_within_range'
  | 'coverage_location_match'
  | 'nationwide_coverage'
  | 'residency_location_match'
  | 'employment_status_match'
  | 'education_level_match'
  | 'age_not_submitted'
  | 'location_not_submitted'
  | 'employment_not_submitted'
  | 'education_not_submitted'
  | 'age_criteria_unavailable'
  | 'location_criteria_unavailable'
  | 'employment_criteria_unavailable'
  | 'education_criteria_unavailable'
  | 'eligibility_details_unavailable'

export type MatchReason = {
  code: MatchReasonCode
  label: string
}

export type MatchResult = {
  program: Program
  state: MatchState
  reasons: MatchReason[]
}

export type MatchRecommendation = {
  programId: string
  reasons: MatchReason[]
}

export type MatchResponse = {
  results: MatchResult[]
  recommendation: MatchRecommendation | null
}
