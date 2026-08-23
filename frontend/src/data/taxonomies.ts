import type { ProgramCategory, ProgramStatus } from '../domain/program'

// TODO: Replace or map these UI-only fixtures when Backend supplies the authoritative taxonomy response.
// These values are not production backend IDs.
export const matchRegions = [
  { value: 'NCR', label: 'National Capital Region (NCR)' },
  { value: 'CAR', label: 'Cordillera Administrative Region (CAR)' },
  { value: 'Region III', label: 'Region III – Central Luzon' },
  { value: 'Region IV-A', label: 'Region IV-A – CALABARZON' },
  { value: 'Region VII', label: 'Region VII – Central Visayas' },
  { value: 'Region XI', label: 'Region XI – Davao Region' },
  { value: 'BARMM', label: 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)' },
] as const

export const matchEmploymentStatuses = [
  { value: 'student', label: 'Student', description: 'Currently studying' },
  { value: 'employed', label: 'Working', description: 'Currently employed' },
  { value: 'job_seeker', label: 'Looking for work', description: 'Actively seeking opportunities' },
  { value: 'other', label: 'Other', description: 'Something else' },
] as const

export const matchEducationLevels = [
  { value: 'high_school', label: 'High school' },
  { value: 'senior_high_school', label: 'Senior high school' },
  { value: 'college', label: 'College' },
  { value: 'graduate_or_higher', label: 'Graduate / higher' },
] as const

export const matchCategoryChoices = [
  'scholarship',
  'financial_assistance',
  'crisis_assistance',
  'training',
] as const satisfies readonly ProgramCategory[]

export const programCategoryLabels: Record<ProgramCategory, string> = {
  scholarship: 'Scholarship',
  financial_assistance: 'Financial Assistance',
  medical_assistance: 'Medical Assistance',
  crisis_assistance: 'Crisis Assistance',
  disaster_assistance: 'Disaster Assistance',
  transportation_assistance: 'Transportation Assistance',
  burial_assistance: 'Burial Assistance',
  ofw_assistance: 'OFW Assistance',
  training: 'Training',
  // This backend fallback must not be a standard visible filter or questionnaire option.
  other: 'Other',
}

export const programStatusLabels: Record<ProgramStatus, string> = {
  open: 'Open',
  ongoing: 'Ongoing',
  upcoming: 'Upcoming',
  closed: 'Closed',
  unknown: 'Status unknown',
}
