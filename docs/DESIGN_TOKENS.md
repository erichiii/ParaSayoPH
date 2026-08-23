# ParaSa'yo Design Tokens & Final Design Inputs

**Status:** Locked for the landing-page visual system and Program Detail desktop/mobile; pending owner-approved references for Matchmaker, Results, and remaining mobile screen layouts.  
**Decision date:** 2026-08-22  
**Authority:** Project owner

## 1. Approved visual reference register

| Surface | Reference status | Implementation direction |
|---|---|---|
| Landing — desktop | **Approved:** Build 1 landing-page concept selected on 2026-08-22 | Use this as the visual target for the landing page. It combines a deep-blue patterned hero, real Filipino photography, blue-red wordmark, filled icons, and restrained lifted cards. |
| Landing — mobile | Pending owner reference | Use the locked responsive rules in section 7 as a layout baseline, but do not call the mobile design final until it is reviewed. |
| Matchmaker | Pending owner reference | Reuse these tokens only; do not invent its final layout, imagery, or progress styling. |
| Results | Pending owner reference | Reuse these tokens only; do not invent its final card/list structure. |
| Program Detail — desktop | **Approved:** revised Program Detail reference selected on 2026-08-22 | Use the approved blue-pattern summary-band layout, raised program summary card, divider-led content column, and warm source-details rail. |
| Program Detail — mobile | **Approved:** Program Detail mobile reference selected on 2026-08-22 | Use the approved single-column arrangement, source panel placement, and touch-target treatment. |

### Landing-page visual decisions

- Hero: deep royal blue with a low-contrast woven/geometric Filipino pattern concentrated at the far right; real Filipino people fade naturally into the blue rather than sitting in a hard photo rectangle.
- Brand: the sun mark is warm yellow. `Para` is blue and `Sa'yo` is red in the wordmark; do not use the full flag palette throughout the UI.
- Imagery: real photography is the default for hero, category, and program imagery. Avoid people illustrations except for the Jeepney matching state already defined in the Design Specification.
- Icon language: use **filled** blue/navy pictograms in circular or rounded containers for trust, category, and process cues. Do not replace these with thin hollow outline icons.
- Depth: major standalone components use soft elevation. Cards must feel lifted, not glossy, heavy, or stacked inside other cards.
- Filipino identity: the pattern, sun accent, and restrained yellow/red details are supporting texture—not a dense decorative background.

### Program Detail visual decisions

- Use one shared Program Detail template. Its entry context changes the back destination and may add limited context; it does not create a second page design.
- Explore entry: label the return action `Back to explore`; show standard program and source details only.
- Results entry: label the return action `Back to your matches`. A small optional `Why this surfaced` section may appear **only** when contract-supplied qualitative match reasons exist.
- Never display a numerical match score, percentage, unsupported eligibility conclusion, or inferred profile information. When matching reasons are absent, omit the panel rather than filling it with assumptions.
- Desktop: use the consistent white navbar, a deep-blue woven pattern band, explicit back navigation, then a single raised program-summary surface with a photo slot, provider/logo slot, category, status, and last-checked date.
- Body: use a broad divider-led content column for Description, Coverage, Benefits, Requirements, and Application, plus a warm right-hand Source Details rail.
- Mobile: use a compact wordmark plus menu, then an explicit back action. Stack photo, program identity, status/date, and detail sections in that order. Place the full-width warm Source Details panel after core content, with a 44px-minimum `View source` CTA.
- Source wording: use `Source details` and `View source`. Do not label the source official or call the action `Visit official source` unless backend authority data explicitly supports that claim.
- All program imagery and agency logos remain owner-controlled slots. Never fabricate an agency logo.

## 2. Core tokens

Use these values as the project source of truth. Agents may not substitute a near match without owner approval.

```css
:root {
  /* Color */
  --color-brand-blue-700: #053476; /* hero and footer depth */
  --color-brand-blue-600: #063982; /* primary blue surface */
  --color-brand-blue-500: #265595; /* interactive blue / links */
  --color-brand-blue-300: #6A90CE; /* restrained blue detail */
  --color-brand-red-500: #E33B3B;  /* wordmark / tiny accent rules only */
  --color-brand-yellow-500: #FFC735; /* sun mark and primary hero CTA */

  --color-ink-900: #152E50; /* headings and strongest text */
  --color-ink-700: #2B476C; /* body text */
  --color-ink-500: #5F6F85; /* supporting text */
  --color-surface-canvas: #FCFBFA;
  --color-surface-default: #FFFFFF;
  --color-surface-warm: #FFF8ED; /* process / source bands */
  --color-surface-blue-soft: #EEF4FC;
  --color-border-subtle: #DBE1EA;
  --color-border-strong: #B9C8DE;

  --color-success-bg: #E8F5E9;
  --color-success-text: #267347;
  --color-focus: #FFC735;

  /* Typography */
  --font-sans: "Poppins", "Segoe UI", Arial, sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --font-size-caption: 0.75rem;  /* 12px */
  --font-size-small: 0.875rem;   /* 14px */
  --font-size-body: 1rem;        /* 16px */
  --font-size-h4: 1.125rem;      /* 18px */
  --font-size-h3: 1.5rem;        /* 24px */
  --font-size-h2: 2rem;          /* 32px */
  --font-size-h1: 3.5rem;        /* 56px */

  --line-height-tight: 1.1;
  --line-height-heading: 1.2;
  --line-height-body: 1.6;

  /* Spacing */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.5rem;   /* 24px */
  --space-6: 2rem;     /* 32px */
  --space-7: 2.5rem;   /* 40px */
  --space-8: 3rem;     /* 48px */
  --space-9: 4rem;     /* 64px */
  --space-10: 5rem;    /* 80px */
  --space-11: 6rem;    /* 96px */

  /* Shape and elevation */
  --radius-control: 0.5rem;  /* 8px */
  --radius-card: 0.75rem;    /* 12px */
  --radius-section: 1rem;    /* 16px */
  --radius-pill: 999px;
  --shadow-subtle: 0 2px 8px rgb(21 46 80 / 8%);
  --shadow-card: 0 8px 24px rgb(5 52 118 / 12%);
  --shadow-floating: 0 16px 40px rgb(5 52 118 / 16%);

  /* Layout */
  --content-max-width: 75rem; /* 1200px */
  --page-gutter-desktop: 2rem; /* 32px */
  --page-gutter-mobile: 1rem;  /* 16px */
}
```

## 3. Token usage rules

| Token group | Required use | Do not use it for |
|---|---|---|
| `brand-blue-700/600` | Hero, footer, primary navigation emphasis, filled trust-icon circles | Every card background or large body-text area |
| `brand-red-500` | The `yo` part of the wordmark, a short active-nav rule, rare emphasis | Error state, body links, or broad background fills |
| `brand-yellow-500` | Sun mark, hero primary CTA, small process accents, focus ring | Large surfaces or secondary text |
| `surface-warm` | Process and source-trust bands | All page sections |
| `shadow-card` | Opportunity cards, program cards, trust rail | Nested content, list rows, every input, or every navigation item |
| `shadow-floating` | Hero-overlap trust rail and a deliberately elevated menu/popover | Ordinary content cards |

## 4. Component baseline

| Component | Locked baseline |
|---|---|
| Navbar | White surface; thin blue/red active accent; blue CTA; blue-red ParaSa'yo wordmark with yellow sun mark. |
| Hero | `brand-blue-700` surface; 2-column desktop layout; left copy, right real-photo composition with a soft fade; no abrupt photo split. |
| Buttons | 44px minimum height; 8px radius; semibold 14–16px label. Hero primary uses yellow with navy text; default primary uses blue with white text. |
| Trust rail | White, 16px radius, `shadow-floating`; overlaps hero bottom on desktop; filled navy icon circles. |
| Opportunity cards | 12px radius, `shadow-card`; real-photo thumbnail, label, one short supporting line, and a clear arrow affordance. |
| Program cards | 12px radius, `shadow-card`; one image slot and one agency-logo slot; status badges use semantic colors and text, not color alone. |
| Process band | Warm surface, generous vertical padding, filled icon medallions, 01/02/03 sequence, thin yellow connector accents. |
| Source-trust band | Warm or blue-soft surface; source, checked-date, and transparency cues; filled icons. |
| Footer | `brand-blue-700` with a very subtle woven pattern; white text; no high-contrast decorative pattern behind links. |

## 5. Owner-controlled image and logo slots

Do not hard-code imagery inside components. Put asset selection in one content/configuration layer so the owner can replace assets without altering layout code.

| Slot key | Purpose | Recommended frame |
|---|---|---|
| `landing.hero.image` | Hero people composition | 5:4 desktop crop; allow `object-position` control |
| `landing.categories.{category}.image` | Category photo | 4:3 crop |
| `landing.programs.{program}.image` | Program photo | 4:3 crop |
| `landing.programs.{program}.agencyLogo` | Agency mark | 1:1 transparent SVG/PNG; use a neutral fallback only when absent |
| `landing.sourceTrust.image` | Optional supporting trust photo/graphic | 4:3 crop |
| `programDetail.summary.image` | Program summary photo | 4:3 desktop/mobile crop; allow `object-position` control |
| `programDetail.agencyLogo` | Provider mark | 1:1 transparent SVG/PNG; use the neutral fallback when absent |

The content layer must carry `alt`, `credit` or source note when needed, and `objectPosition`. Never invent an official agency logo; use an owner-supplied logo or an explicitly neutral fallback.

## 6. Desktop layout measurements

- Desktop content container: maximum `1200px`, with `32px` outer gutter.
- Hero: two columns from `1024px` upward; copy remains readable at approximately 52–60 characters per line.
- Hero headline: `56px / 1.1`, bold; use `40px / 1.1` below `768px`.
- Section rhythm: `80px` desktop vertical section padding; `48px` mobile.
- Standard card gap: `16px`; category grid gap: `16px` desktop and mobile.
- Trust rail: overlap the hero by approximately `28–36px` on desktop; return to normal document flow on narrow screens.

## 7. Responsive baseline

These breakpoints are locked as implementation tokens. They establish layout behavior; final mobile *screen references* remain a required owner review item.

| Range | Token | Landing behavior |
|---|---|---|
| 0–479px | `xs` | One-column reading order; 16px gutters; full-width CTAs; one category card per row. |
| 480–767px | `sm` | Two-column category grid where content remains readable; trust rail becomes a 2×2 grid. |
| 768–1023px | `md` | Hero stacks copy before image; program previews may use two columns; footer uses two columns. |
| 1024–1279px | `lg` | Full desktop navigation; hero returns to two columns; program preview grid can use three columns. |
| 1280px+ | `xl` | Use the 1200px content container and the approved desktop composition. |

At all widths:

- Preserve the blue hero and faded-photo treatment; do not swap to a white hero on mobile.
- Keep the primary CTA ahead of the secondary action and keep both easy to tap.
- Use the same filled-icon language; do not simplify it to hollow outlines.
- Do not crop a person at the eyes, face, or primary subject; use the configured `objectPosition` field.
- Do not depend on hover to expose information or navigation.

## 8. DES-01 completion gate

DES-01 is complete for the global token system and desktop Landing. Before a full product implementation starts, the owner must still approve or provide references for:

1. Matchmaker desktop and mobile screens.
2. Results desktop and mobile screens, including empty and loading states.
3. Program Detail desktop and mobile screens.
4. Landing mobile review against the responsive baseline above.

Until then, agents may implement only the landing page and reusable primitives that do not invent a page-specific layout or behavior.
