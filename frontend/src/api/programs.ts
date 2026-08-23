import type { Program, ProgramCategory, ProgramStatus } from '../domain/program'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '')

const categories = new Set<ProgramCategory>([
  'scholarship',
  'financial_assistance',
  'medical_assistance',
  'crisis_assistance',
  'disaster_assistance',
  'transportation_assistance',
  'burial_assistance',
  'ofw_assistance',
  'training',
  'other',
])

const statuses = new Set<ProgramStatus>(['open', 'ongoing', 'upcoming', 'closed', 'unknown'])
const coverageTypes = new Set(['nationwide', 'regional', 'provincial', 'city', 'municipal', 'district', 'unknown'])

export class ProgramsApiError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ProgramsApiError'
    this.status = status
  }
}

export class ProgramNotFoundError extends ProgramsApiError {
  constructor() {
    super('Program not found.', 404)
    this.name = 'ProgramNotFoundError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string'
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === 'number'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isDateOnlyOrNull(value: unknown): value is string | null {
  return isNullableString(value) && (value === null || /^\d{4}-\d{2}-\d{2}$/.test(value))
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isVerifiedTimestamp(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
}

export function parseProgram(value: unknown): Program {
  if (!isRecord(value)) {
    throw new ProgramsApiError('The Programs API returned an invalid response.')
  }

  const { application, benefits, category, coverage, description, eligibility, id, provider, requirements, source, status, title } = value
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    !isNullableString(provider) ||
    !categories.has(category as ProgramCategory) ||
    !isNullableString(description) ||
    !isRecord(coverage) ||
    !isRecord(eligibility) ||
    !isStringArray(benefits) ||
    !isStringArray(requirements) ||
    !isRecord(application) ||
    !isRecord(source) ||
    !statuses.has(status as ProgramStatus)
  ) {
    throw new ProgramsApiError('The Programs API returned an invalid response.')
  }

  const { locations, type } = coverage
  const { age, education, employment, income, other_requirements: otherRequirements, residency } = eligibility
  const { deadline, process, start_date: startDate, url } = application
  const { last_verified_at: lastVerifiedAt, url: sourceUrl } = source

  if (
    !coverageTypes.has(type as string) ||
    !isStringArray(locations) ||
    !isRecord(age) ||
    !isRecord(education) ||
    !isRecord(employment) ||
    !isRecord(income) ||
    !isRecord(residency) ||
    !isStringArray(otherRequirements) ||
    !isDateOnlyOrNull(startDate) ||
    !isDateOnlyOrNull(deadline) ||
    !isNullableString(process) ||
    !isNullableString(url) ||
    !isHttpUrl(sourceUrl) ||
    !isVerifiedTimestamp(lastVerifiedAt)
  ) {
    throw new ProgramsApiError('The Programs API returned an invalid response.')
  }

  const { max: ageMax, min: ageMin, raw_text: ageRawText } = age
  const { levels, raw_text: educationRawText } = education
  const { raw_text: employmentRawText, statuses: employmentStatuses } = employment
  const { max: incomeMax, min: incomeMin, period, raw_text: incomeRawText, scope } = income
  const { locations: residencyLocations, raw_text: residencyRawText } = residency

  if (
    !isNullableNumber(ageMin) ||
    !isNullableNumber(ageMax) ||
    !isNullableString(ageRawText) ||
    !isStringArray(levels) ||
    !isNullableString(educationRawText) ||
    !isStringArray(employmentStatuses) ||
    !isNullableString(employmentRawText) ||
    !isNullableNumber(incomeMin) ||
    !isNullableNumber(incomeMax) ||
    !isNullableString(period) ||
    !isNullableString(scope) ||
    !isNullableString(incomeRawText) ||
    !isStringArray(residencyLocations) ||
    !isNullableString(residencyRawText)
  ) {
    throw new ProgramsApiError('The Programs API returned an invalid response.')
  }

  return value as Program
}

async function requestProgramData(path: string): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}${path}`)
  } catch {
    throw new ProgramsApiError('Unable to reach the Programs API.')
  }

  if (response.status === 404) {
    throw new ProgramNotFoundError()
  }
  if (!response.ok) {
    throw new ProgramsApiError('The Programs API is unavailable.', response.status)
  }

  try {
    return await response.json()
  } catch {
    throw new ProgramsApiError('The Programs API returned an invalid response.', response.status)
  }
}

export async function getPrograms(): Promise<Program[]> {
  const value = await requestProgramData('/programs')
  if (!Array.isArray(value)) {
    throw new ProgramsApiError('The Programs API returned an invalid response.')
  }

  return value.map(parseProgram)
}

export async function getProgramById(id: string): Promise<Program> {
  return parseProgram(await requestProgramData(`/programs/${encodeURIComponent(id)}`))
}
