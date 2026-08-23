import { brandAssets } from './brandAssets'

// Owner-controlled Landing imagery. Absent assets intentionally use component fallbacks.
export const landingContent = {
  hero: {
    src: brandAssets.landingHero,
    alt: 'Filipino students, workers, and community members exploring opportunities',
    objectPosition: '100%',
  },
  categoryImages: {
    scholarship: { src: brandAssets.landingCategoryScholarship, alt: 'Scholarship opportunities', objectPosition: 'center' },
    training: { src: brandAssets.landingCategoryTraining, alt: 'Training opportunities', objectPosition: 'center' },
    financial_assistance: { src: brandAssets.landingCategoryFinancialAssistance, alt: 'Financial assistance opportunities', objectPosition: 'center' },
    medical_assistance: { src: brandAssets.landingCategoryMedicalAssistance, alt: 'Medical assistance opportunities', objectPosition: 'center' },
    crisis_assistance: { src: brandAssets.landingCategoryCrisisAssistance, alt: 'Crisis assistance opportunities', objectPosition: 'center' },
    ofw_assistance: { src: brandAssets.landingCategoryOfwAssistance, alt: 'OFW assistance opportunities', objectPosition: 'center' },
  },
  programAgencyLogos: {
    'medical-assistance-program': { src: brandAssets.landingProgramMedicalAssistanceLogo, alt: 'Health Services Office logo', objectPosition: 'center' },
    'tulong-aral-scholarship': { src: brandAssets.landingProgramScholarshipLogo, alt: 'Education Agency logo', objectPosition: 'center' },
    'workready-skills-training': { src: brandAssets.landingProgramTrainingLogo, alt: 'Skills Development Office logo', objectPosition: 'center' },
  },
  sourceTrust: {
    src: brandAssets.landingSourceTrust,
    alt: 'Source transparency supporting image',
    objectPosition: 'center',
  },
} as const
