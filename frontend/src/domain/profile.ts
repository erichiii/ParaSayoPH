import type { ProgramCategory } from './program'

export type MatchProfile = {
  location: string | null
  age: number | null
  employment_status: string | null
  education_level: string | null
  categories_needed: ProgramCategory[]
}
