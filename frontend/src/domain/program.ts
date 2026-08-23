export type ProgramCategory =
  | 'scholarship'
  | 'financial_assistance'
  | 'medical_assistance'
  | 'crisis_assistance'
  | 'disaster_assistance'
  | 'transportation_assistance'
  | 'burial_assistance'
  | 'ofw_assistance'
  | 'training'
  | 'other'

export type ProgramStatus = 'open' | 'ongoing' | 'upcoming' | 'closed' | 'unknown'

export type CoverageType =
  | 'nationwide'
  | 'regional'
  | 'provincial'
  | 'city'
  | 'municipal'
  | 'district'
  | 'unknown'

export type Program = {
  id: string
  title: string
  provider: string | null
  category: ProgramCategory
  description: string | null
  coverage: {
    type: CoverageType
    locations: string[]
  }
  eligibility: {
    age: {
      min: number | null
      max: number | null
      raw_text: string | null
    }
    education: {
      levels: string[]
      raw_text: string | null
    }
    employment: {
      statuses: string[]
      raw_text: string | null
    }
    income: {
      min: number | null
      max: number | null
      period: string | null
      scope: string | null
      raw_text: string | null
    }
    residency: {
      locations: string[]
      raw_text: string | null
    }
    other_requirements: string[]
  }
  benefits: string[]
  requirements: string[]
  application: {
    start_date: string | null
    deadline: string | null
    process: string | null
    url: string | null
  }
  source: {
    url: string
    last_verified_at: string
  }
  status: ProgramStatus
}
