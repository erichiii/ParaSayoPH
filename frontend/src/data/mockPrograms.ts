import type { Program } from '../domain/program'

// Local/demo fixtures only. These are not scraped, validated, current, or official programs.
export const localDemoPrograms: Program[] = [
  {
    id: 'demo-open-scholarship-record',
    title: 'Demo Open Scholarship Record',
    provider: 'Local Demo Provider',
    category: 'scholarship',
    description: 'A complete local fixture used to develop program card states.',
    coverage: {
      type: 'regional',
      locations: ['Demo Region'],
    },
    eligibility: {
      age: { min: null, max: null, raw_text: null },
      education: { levels: [], raw_text: null },
      employment: { statuses: [], raw_text: null },
      income: { min: null, max: null, period: null, scope: null, raw_text: null },
      residency: { locations: [], raw_text: null },
      other_requirements: [],
    },
    benefits: ['Local demo benefit'],
    requirements: ['Local demo requirement'],
    application: {
      start_date: '2026-08-01',
      deadline: '2026-09-30',
      process: 'Local demo process',
      url: 'https://example.com/local-demo-scholarship-apply',
    },
    source: {
      url: 'https://example.com/local-demo-scholarship',
      last_verified_at: '2026-08-22T00:00:00Z',
    },
    status: 'open',
  },
  {
    id: 'demo-unknown-status-record',
    title: 'Demo Unknown Status Record',
    provider: 'Local Demo Provider',
    category: 'financial_assistance',
    description: 'A local fixture for unknown status and missing deadline treatment.',
    coverage: {
      type: 'nationwide',
      locations: [],
    },
    eligibility: {
      age: { min: null, max: null, raw_text: null },
      education: { levels: [], raw_text: null },
      employment: { statuses: [], raw_text: null },
      income: { min: null, max: null, period: null, scope: null, raw_text: null },
      residency: { locations: [], raw_text: null },
      other_requirements: [],
    },
    benefits: [],
    requirements: [],
    application: { start_date: null, deadline: null, process: null, url: null },
    source: {
      url: 'https://example.com/local-demo-unknown-status',
      last_verified_at: '2026-08-22T00:00:00Z',
    },
    status: 'unknown',
  },
  {
    id: 'demo-training-record',
    title: 'Demo Training Record',
    provider: null,
    category: 'training',
    description: null,
    coverage: {
      type: 'unknown',
      locations: [],
    },
    eligibility: {
      age: { min: null, max: null, raw_text: null },
      education: { levels: [], raw_text: null },
      employment: { statuses: [], raw_text: null },
      income: { min: null, max: null, period: null, scope: null, raw_text: null },
      residency: { locations: [], raw_text: null },
      other_requirements: [],
    },
    benefits: [],
    requirements: [],
    application: { start_date: null, deadline: null, process: null, url: null },
    source: {
      url: 'https://example.com/local-demo-training',
      last_verified_at: '2026-08-22T00:00:00Z',
    },
    status: 'unknown',
  },
]
