export type BrandAssetPath = string | null

export type BrandAssets = {
  jeepneyBody: BrandAssetPath
  jeepneyRoad: BrandAssetPath
  jeepneyWheels: BrandAssetPath
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
}

function getOwnerAsset(path: string): BrandAssetPath {
  return ownerAssetUrls[path] ?? null
}

// Owner-provided SVGs are optional; absent files leave CSS fallbacks in place.
export const brandAssets: BrandAssets = {
  jeepneyBody: getOwnerAsset('../assets/jeepney.body.svg'),
  jeepneyRoad: getOwnerAsset('../assets/jeepney.road.svg'),
  jeepneyWheels: getOwnerAsset('../assets/jeepney.wheels.svg'),
  programDetailSummaryTile: getOwnerAsset('../assets/patterns/program-detail-summary-tile.svg'),
  sun: getOwnerAsset('../assets/brand/sun.svg'),
  wovenPattern: getOwnerAsset('../assets/patterns/parasayo-weave-tile.svg'),
}
