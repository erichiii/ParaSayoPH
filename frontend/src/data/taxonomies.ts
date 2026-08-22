import type { ProgramCategory, ProgramStatus } from '../domain/program'

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
