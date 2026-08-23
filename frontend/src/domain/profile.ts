import type { ProgramCategory } from './program'

export type RegionId =
  | 'ncr'
  | 'car'
  | 'region_3'
  | 'region_4a'
  | 'region_4b'
  | 'region_6'
  | 'region_7'
  | 'region_10'
  | 'region_11'
  | 'region_12'
  | 'barmm'

export type EmploymentStatusId = 'student' | 'employed' | 'job_seeker' | 'other'
export type EducationLevelId =
  | 'incoming_first_year_college'
  | 'second_year_college'
  | 'third_year_college'
  | 'fourth_year_college'
  | 'tvet'
export type MatchableProgramCategory = Exclude<ProgramCategory, 'other'>

export type MatchProfile = {
  location: RegionId | null
  age: number | null
  employment_status: EmploymentStatusId | null
  education_level: EducationLevelId | null
  categories_needed: MatchableProgramCategory[]
}
