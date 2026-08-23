export type BrandAssetPath = string | null

export type BrandAssets = {
  jeepneyBody: BrandAssetPath
  jeepneyRoad: BrandAssetPath
  jeepneyWheels: BrandAssetPath
  landingCategoryCrisisAssistance: BrandAssetPath
  landingCategoryFinancialAssistance: BrandAssetPath
  landingCategoryMedicalAssistance: BrandAssetPath
  landingCategoryOfwAssistance: BrandAssetPath
  landingCategoryScholarship: BrandAssetPath
  landingCategoryTraining: BrandAssetPath
  landingHero: BrandAssetPath
  landingProgramMedicalAssistanceLogo: BrandAssetPath
  landingProgramScholarshipLogo: BrandAssetPath
  landingProgramTrainingLogo: BrandAssetPath
  landingSourceTrust: BrandAssetPath
  programDetailSummaryTile: BrandAssetPath
  sun: BrandAssetPath
  wovenPattern: BrandAssetPath
}

const ownerAssetUrls = {
  ...import.meta.glob<string>('../assets/{brand,patterns}/*.svg', {
    eager: true,
    import: 'default',
    query: '?url',
  }),
  ...import.meta.glob<string>('../assets/jeepney.*.svg', {
    eager: true,
    import: 'default',
    query: '?url',
  }),
  ...import.meta.glob<string>('../assets/landing/*.{jpg,jpeg,png,svg,webp}', {
    eager: true,
    import: 'default',
    query: '?url',
  }),
}

function getOwnerAsset(path: string): BrandAssetPath {
  return ownerAssetUrls[path] ?? null
}

// Owner-provided SVGs are optional; absent files leave CSS fallbacks in place.
export const brandAssets: BrandAssets = {
  jeepneyBody: getOwnerAsset('../assets/jeepney.body.svg'),
  jeepneyRoad: getOwnerAsset('../assets/jeepney.road.svg'),
  jeepneyWheels: getOwnerAsset('../assets/jeepney.wheels.svg'),
  landingCategoryCrisisAssistance: getOwnerAsset('../assets/landing/category-crisis-assistance.jpg'),
  landingCategoryFinancialAssistance: getOwnerAsset('../assets/landing/category-financial-assistance.jpg'),
  landingCategoryMedicalAssistance: getOwnerAsset('../assets/landing/category-medical-assistance.jpg'),
  landingCategoryOfwAssistance: getOwnerAsset('../assets/landing/category-ofw-assistance.jpg'),
  landingCategoryScholarship: getOwnerAsset('../assets/landing/category-scholarship.jpg'),
  landingCategoryTraining: getOwnerAsset('../assets/landing/category-training.jpg'),
  landingHero: getOwnerAsset('../assets/landing/hero.jpg'),
  landingProgramMedicalAssistanceLogo: getOwnerAsset('../assets/landing/program-medical-assistance-logo.svg'),
  landingProgramScholarshipLogo: getOwnerAsset('../assets/landing/program-scholarship-logo.svg'),
  landingProgramTrainingLogo: getOwnerAsset('../assets/landing/program-training-logo.svg'),
  landingSourceTrust: getOwnerAsset('../assets/landing/source-trust.jpg'),
  programDetailSummaryTile: getOwnerAsset('../assets/patterns/program-detail-summary-tile.svg'),
  sun: getOwnerAsset('../assets/brand/sun.svg'),
  wovenPattern: getOwnerAsset('../assets/patterns/parasayo-weave-tile.svg'),
}
