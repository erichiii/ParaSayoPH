import { Link } from 'react-router'
import { brandAssets } from '../../data/brandAssets'
import type { CSSProperties } from 'react'

type BrandWordmarkStyles = CSSProperties & Record<`--${string}`, string>

export function BrandWordmark() {
  const style: BrandWordmarkStyles = {
    ...(brandAssets.sun
      ? {
          '--ps-explore-sun-image': `url("${brandAssets.sun}")`,
          '--ps-explore-sun-center-display': 'none',
        }
      : {}),
  }

  return (
    <Link aria-label="ParaSa'yo home" className="ps-explore-wordmark" style={style} to="/">
      <span aria-hidden="true" className="ps-explore-wordmark__sun" />
      <span>
        <span className="ps-explore-wordmark__para">Para</span>
        <span className="ps-explore-wordmark__sayo">Sa&apos;yo</span>
      </span>
    </Link>
  )
}
