import type { EducationLevelId, EmploymentStatusId, RegionId } from '../domain/profile'
import type { ProgramCategory, ProgramStatus } from '../domain/program'

export const matchRegions = [
  { value: 'ncr', label: 'National Capital Region' },
  { value: 'car', label: 'Cordillera Administrative Region' },
  { value: 'region_3', label: 'Central Luzon' },
  { value: 'region_4a', label: 'CALABARZON' },
  { value: 'region_4b', label: 'MIMAROPA' },
  { value: 'region_6', label: 'Western Visayas' },
  { value: 'region_7', label: 'Central Visayas' },
  { value: 'region_10', label: 'Northern Mindanao' },
  { value: 'region_11', label: 'Davao Region' },
  { value: 'region_12', label: 'SOCCSKSARGEN' },
  { value: 'barmm', label: 'Bangsamoro Autonomous Region in Muslim Mindanao' },
] as const satisfies readonly { value: RegionId; label: string }[]

export const matchEmploymentStatuses = [
  { value: 'student', label: 'Student', description: 'Currently studying' },
  { value: 'employed', label: 'Working', description: 'Currently employed' },
  { value: 'job_seeker', label: 'Looking for work', description: 'Actively seeking opportunities' },
  { value: 'other', label: 'Other', description: 'Something else' },
] as const satisfies readonly { value: EmploymentStatusId; label: string; description: string }[]

export const matchEducationLevels = [
  { value: 'incoming_first_year_college', label: 'Incoming first-year college' },
  { value: 'second_year_college', label: 'Second-year college' },
  { value: 'third_year_college', label: 'Third-year college' },
  { value: 'fourth_year_college', label: 'Fourth-year college' },
  { value: 'tvet', label: 'Technical-vocational education' },
] as const satisfies readonly { value: EducationLevelId; label: string }[]

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
