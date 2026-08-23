import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { brandAssets } from '../../data/brandAssets'
import { SectionContainer } from './SectionContainer'

type FooterBrandStyles = CSSProperties & Record<`--${string}`, string>

const footerBrandStyles: FooterBrandStyles = {
  ...(brandAssets.sun
    ? {
        '--ps-site-footer-sun-image': `url("${brandAssets.sun}")`,
        '--ps-site-footer-sun-center-display': 'none',
      }
    : {}),
  ...(brandAssets.wovenPattern
    ? {
        '--ps-site-footer-weave-image': `url("${brandAssets.wovenPattern}")`,
      }
    : {}),
}

export function SiteFooter() {
  return (
    <footer className="ps-site-footer" style={footerBrandStyles}>
      <SectionContainer className="ps-site-footer__inner">
        <div className="ps-site-footer__brand">
          <div className="ps-site-footer__wordmark">
            <span aria-hidden="true" className="ps-site-footer__sun" />
            <span>
              <span className="ps-site-footer__para">Para</span>
              <span className="ps-site-footer__sayo">Sa'yo</span>
            </span>
          </div>
          <p>Explore public programs and support opportunities in one place.</p>
        </div>

        <nav aria-label="Footer navigation" className="ps-site-footer__nav">
          <Link to="/explore">Explore</Link>
          <Link to="/matchmaker">Para Sa Akin?</Link>
          <Link to="/matchmaker">Find a match</Link>
        </nav>
      </SectionContainer>
    </footer>
  )
}
