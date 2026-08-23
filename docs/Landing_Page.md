# ParaSa’yo Landing Page — Final UX/UI Design Specification

## 1. Document Purpose

This document is the finalized design specification for the **ParaSa’yo landing page**.

It is intended to serve two purposes:

1. **Human reference** — a shared design/UX specification for the team.
2. **AI/agent context** — a precise reference for UI generation, visualization, implementation, and refinement.

The landing page is the public-facing entry point of ParaSa’yo. Its job is not to explain every technical part of the system. Its job is to communicate the product's value quickly, establish trust, express Filipino identity, and guide the user into one of the application's two primary journeys:

- **Explore opportunities**
- **Find personalized opportunities**

The landing page should feel like the **front door of a modern Philippine public-service product**, while the deeper pages provide the detailed interaction, matching, program information, and technical monitoring experience.

---

# 2. Product Context

ParaSa’yo is a discovery platform for opportunities such as:

- Scholarships
- Training and certifications
- Financial/government assistance
- Employment opportunities
- Livelihood opportunities
- Other public opportunities

The system aggregates information from public sources and organizes it into a unified experience.

The product provides two primary ways to use the system:

```text
                    PARA SA’YO
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
       EXPLORE                   PARA SA AKIN?
       Browse                     Personalized
       freely                    questionnaire
            │                         │
            ▼                         ▼
      Opportunities               Matching
```

The landing page must clearly communicate both paths without forcing every visitor through personalization.

The team's product concept explicitly allows users to browse opportunities without personalization. 

---

# 3. Core Landing Page Objective

The landing page should answer three questions within a few seconds:

### 1. What is ParaSa’yo?

A place to find public opportunities.

### 2. Why is it useful?

It brings fragmented opportunities into one easier-to-use experience and can help identify opportunities that may fit the user.

### 3. What should I do next?

The user can either:

> **Find What's For Me**

or

> **Explore Opportunities**

The landing page should therefore optimize for **clarity and action**, not information density.

---

# 4. Core Design Concept

## Final Concept

> **Find what's available. Find what's for you.**

This concept represents the two main product modes:

```text
Find what's available
        ↓
Explore

Find what's for you
        ↓
Personalized matching
```

The landing page should visually communicate this duality.

The user should not feel that ParaSa’yo is only a scholarship site, only a government directory, or only an AI matching tool.

It is a **public opportunity discovery and matching platform**.

---

# 5. Design Personality

The landing page should feel:

- Human
- Welcoming
- Filipino
- Modern
- Trustworthy
- Clear
- Light
- Purposeful
- Accessible
- Public-service oriented

It should NOT feel:

- Bureaucratic
- Corporate-heavy
- Like a government portal
- Like an e-commerce website
- Like an AI chatbot
- Like a technical dashboard
- Overly patriotic
- Visually noisy
- Childish
- Overly decorative

The landing page is allowed to have more personality than internal product pages, but that personality must support comprehension.

---

# 6. Visual Identity

## 6.1 Philippine-Inspired Palette

The visual system is inspired by the colors of the Philippine flag:

### Blue — Primary identity

Use for:

- Logo text where applicable
- Main headings
- Primary CTA
- Navigation
- Interactive elements
- Selected states
- Important UI accents

Blue should be the dominant brand color.

---

### Yellow — Warmth and emphasis

Use for:

- Philippine sun motif
- Decorative highlights
- Small accents
- Illustrative details
- Progress/highlight elements
- Visual emphasis that does not indicate danger

Yellow should add warmth without becoming the dominant page color.

---

### Red — Semantic attention

Use sparingly for:

- Warnings
- Important attention states
- Small decorative elements in Filipino patterns
- Tiny brand accents

Red must not be used for ordinary selected states because it can be interpreted as error or danger.

---

### White / light neutral — Primary canvas

White should remain the dominant background.

The landing page should NOT become a literal red-blue-yellow flag composition.

The Philippine colors work best as a **controlled visual language** rather than as equal blocks of color.

---

# 7. Philippine Cultural Identity

## Design Principle

> **Use Filipino identity as visual language, not decoration.**

The design should feel distinctly Filipino without overwhelming the user with flags, patterns, or cultural objects.

Appropriate visual language:

- Philippine sun
- Simplified Filipino geometric/textile patterns
- Subtle local architecture
- Filipino people
- Philippine community environments
- Carefully selected cultural motifs
- Illustration elements representing education, work, training, and community opportunity

Avoid excessive:

- Philippine flags
- repeated sun symbols
- patterns in every section
- decorative jeepneys without functional context
- multiple unrelated cultural motifs
- patriotic imagery that competes with the product message

The cultural identity should reinforce:

> **“This platform is designed for Filipino people and Philippine opportunities.”**

---

# 8. Visual Hierarchy Principle

The page should have one dominant visual message.

Hierarchy:

```text
Hero headline
     ↓
Primary CTA
     ↓
Hero visual
     ↓
Trust/context
     ↓
Opportunity categories
     ↓
How it works
     ↓
Featured opportunities
     ↓
Transparency / Source Health
     ↓
Footer
```

Every later section should be visually quieter than the hero.

---

# 9. Final Landing Page Architecture

```text
LANDING PAGE
│
├── Top Navigation
│
├── Hero
│   ├── Eyebrow
│   ├── Main Headline
│   ├── Supporting Copy
│   ├── Primary CTA
│   ├── Secondary CTA
│   ├── Trust Microcopy
│   └── Filipino Hero Illustration
│
├── Trust / Confidence Strip
│
├── Opportunity Categories
│
├── How ParaSa’yo Works
│
├── Programs You Can Explore
│
├── Data Transparency / Reliability
│
└── Footer
```

---

# 10. Top Navigation

## Purpose

Provide simple access to the primary product areas without overwhelming the user.

Recommended structure:

```text
☀ ParaSa’yo

Explore
Para Sa Akin?
How it works
Source Health

                         [ Find a match ]
```

## Navigation items

### Explore

Leads to the opportunity directory.

### Para Sa Akin?

Leads to the questionnaire.

### How It Works

Scrolls or navigates to the explanation section.

### Source Health

Leads to the technical/source monitoring interface.

### Find a Match

Primary navigation CTA that opens the personalized questionnaire.

---

# 11. Navigation Design

The navigation should be:

- clean
- horizontally organized on desktop
- minimal
- consistent with the internal product pages
- sticky/fixed if implementation permits
- visually separated from the content using a subtle border/shadow

The primary navigation CTA should be blue.

Example:

```text
┌─────────────────────────────────────────────────────────┐
│ ☀ ParaSa’yo     Explore   Para Sa Akin?   How it works │
│                                         Source Health   │
│                                      [ Find a match ]   │
└─────────────────────────────────────────────────────────┘
```

Do not use a large multi-level navigation.

The application is focused and should feel focused.

---

# 12. Hero Section

## Purpose

The hero is the emotional and informational centerpiece of the landing page.

It should explain the product without requiring the user to scroll.

Recommended desktop structure:

```text
┌─────────────────────────────────────────────────────────┐
│                                                         │
│ LEFT                                    RIGHT            │
│                                                         │
│ Eyebrow                               Hero illustration  │
│ Headline                                                  │
│ Supporting copy                                           │
│ Primary CTA                                               │
│ Secondary CTA                                             │
│ Trust microcopy                                           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Desktop layout can use a two-column arrangement.

Mobile should collapse into:

```text
Eyebrow
Headline
Supporting copy
Hero illustration
Primary CTA
Secondary CTA
Trust text
```

---

# 13. Hero Eyebrow

Recommended copy:

> **PUBLIC OPPORTUNITIES, MADE EASIER TO FIND**

Styling:

- uppercase or small-cap treatment
- blue dominant text
- restrained red emphasis on words such as “MADE EASIER TO FIND”
- small size relative to the main headline

The eyebrow is not the primary message.

Its purpose is to establish context before the headline.

---

# 14. Hero Headline

Preferred final direction:

> **Find what's available. Find what's for you.**

Alternative if a simpler headline is preferred:

> **Find opportunities that may fit you.**

The first option is preferred because it directly represents the two core product journeys.

The headline should be:

- large
- bold
- highly readable
- dark navy/blue
- broken into 2–3 short lines
- visually dominant

Avoid excessively long headlines.

---

# 15. Hero Supporting Copy

Recommended copy:

> **Scholarships, assistance, training, employment, and other opportunities—organized in one place and matched to what may fit you.**

The supporting copy should remain concise.

It should explain the benefit, not the implementation.

Do NOT mention:

- scraping
- APIs
- databases
- self-healing
- AI architecture
- validation pipelines

Those are implementation details and belong elsewhere.

---

# 16. Primary CTA

Recommended:

> **Find What's For Me →**

This should be the strongest button.

It opens the questionnaire.

Visual treatment:

- solid ParaSa’yo blue
- white text
- clear arrow
- rounded but restrained shape
- high contrast

The CTA should not use language implying guaranteed eligibility.

Avoid:

> Find My Eligible Programs

Prefer:

> Find What's For Me

---

# 17. Secondary CTA

Recommended:

> **Explore Opportunities →**

or:

> **Browse All Opportunities →**

This should be visually lighter than the primary CTA.

Possible treatment:

- outline button
- blue text
- subtle border
- text/arrow link

This preserves the product's non-personalized browsing path.

---

# 18. Hero Trust Microcopy

Recommended:

> **3 quick steps · About 1 minute · No sign-up required**

This should remain small and secondary.

The questionnaire specification already uses the “3 quick steps” structure.

Do not promise “About 1 minute” unless actual implementation remains close to that expectation.

---

# 19. Hero Illustration

## This is the most important visual asset on the landing page.

The hero should use a **custom ParaSa’yo illustration**, rather than relying primarily on generic stock photography.

The illustration should represent the people and opportunities the product serves.

Possible people:

- Filipino student
- Young worker
- Job seeker
- Entrepreneur/livelihood participant
- Community member

Possible contextual objects:

- books
- laptop
- certificate
- tools
- briefcase
- training materials
- community/environment cues

The illustration should suggest:

> **Education + work + opportunity + Filipino community**

It should NOT simply depict a generic person with a laptop.

---

# 20. Hero Illustration Style

Preferred:

- clean flat/vector illustration
- friendly but professional
- simplified Filipino characters
- subtle blue/yellow/red accents
- consistent line/shape language
- soft depth
- modern editorial illustration

Avoid:

- hyperrealistic stock photos
- overly cartoonish children's illustration
- 3D corporate characters
- AI-generated futuristic aesthetic
- excessive cultural props
- excessive visual complexity

---

# 21. Illustration Background / Visual Stage

A large illustration should not simply float on a blank white background.

Create a subtle visual stage behind it:

Possible treatments:

- very light blue organic shape
- soft circular halo
- subtle geometric background
- restrained Philippine textile pattern
- sun-ray motif
- soft curved shapes

The background should support the illustration while remaining lower contrast than the foreground.

The hero should never feel like a poster made entirely from decorative assets.

---

# 22. Visual Depth Principle

The landing page should have **depth without clutter**.

Depth can come from:

- layered illustration
- subtle card shadows
- soft background shapes
- spacing
- controlled borders
- large/small typography contrast
- image composition

Do not solve flatness by adding:

- gradients everywhere
- multiple floating cards
- excessive shadows
- random circles
- random blobs
- excessive decorative patterns

The goal is **intentional depth**.

---

# 23. Trust / Confidence Strip

Directly below the hero, include a compact confidence strip.

Recommended content:

```text
No sign-up required
Public agency sources
Source and last-checked details
```

Possible presentation:

```text
┌──────────────────────────────────────────────────────┐
│  👤 No sign-up     │  🏛 Public sources │  ◷ Checked │
└──────────────────────────────────────────────────────┘
```

This gives the user three important confidence signals:

1. Low friction
2. Source authority
3. Information freshness

The strip should be visually quieter than the hero.

---

# 24. Opportunity Categories

## Purpose

Immediately communicate what kind of opportunities are available.

Section heading:

> **What are you looking for?**

Recommended categories:

```text
🎓 Scholarships
🛠 Training & Certifications
💰 Financial Assistance
💼 Employment
🌱 Livelihood
🚀 Other Opportunities
```

The current design direction can use category image cards.

---

# 25. Category Card Design

Preferred structure:

```text
┌──────────────────────────┐
│                          │
│        CATEGORY IMAGE    │
│                          │
├──────────────────────────┤
│ Scholarships          →  │
│ Education funding...     │
└──────────────────────────┘
```

The image gives the category personality.

The category label remains the strongest textual element.

The arrow signals clickability.

Do not make category cards excessively tall.

---

# 26. Category Images

Images should represent the actual category.

Examples:

### Scholarships

Student / graduation / books.

### Training & Certifications

Learning environment / technical training / computer skills.

### Financial Assistance

Documents / assistance / support context.

### Employment & Livelihood

Worker / trade / business / livelihood.

Do not mix unrelated visual styles across categories.

Use one consistent image treatment:

- same aspect ratio
- same corner radius
- similar crop
- similar visual warmth
- similar color treatment

---

# 27. Category Interaction

Clicking a category should lead to Explore with an appropriate filter.

Conceptually:

```text
Scholarships
    ↓
/explore?category=scholarships

Training
    ↓
/explore?category=training
```

This makes the landing page actionable rather than purely informative.

---

# 28. How ParaSa’yo Works

## Purpose

Explain the product's process in three easy steps.

Recommended heading:

> **How ParaSa’yo works.**

Optional supporting line:

> **Finding opportunities doesn't have to be complicated.**

Recommended steps:

```text
01
Tell us about yourself

Answer a few simple questions
about your situation and goals.

       ↓

02
Get matches or explore

See opportunities that may fit you
or browse all available programs.

       ↓

03
Review & verify

Check program details and follow
the official instructions to apply.
```

---

# 29. How-It-Works Visual Design

Use three numbered circles:

```text
      01 ───────── 02 ───────── 03
```

The connecting line should be subtle.

The numbers should use the brand blue.

A small yellow accent can highlight the active/central concept, but do not make every step a different color.

The visual should communicate a simple process, not a technical architecture.

---

# 30. Why the Three Steps Matter

These three steps mirror the actual product:

```text
Tell us
   ↓
Questionnaire

Get matches or explore
   ↓
Matching / Explore

Review & verify
   ↓
Program Details → Official Source
```

This lets the landing page preview the actual product experience without overwhelming the user.

---

# 31. Featured Programs / Programs You Can Explore

## Purpose

Show that the platform contains real, concrete opportunities.

Recommended heading:

> **Programs you can explore**

Optional action:

> **View all →**

Show only a small number of example programs.

Recommended range:

- 2 cards on compact layouts
- 3–4 cards on wider layouts

Do not turn this section into a full Explore page.

---

# 32. Program Preview Card

Suggested structure:

```text
┌──────────────────────────────────────┐
│ TESDA Web Development Training       │
├──────────────────────────────────────┤
│ PROVIDER                             │
│ TESDA                                │
│                                      │
│ ● Open                               │
│ Last checked                         │
│ Aug 21, 2026                         │
│                                      │
│ View program details →               │
│                              [image] │
└──────────────────────────────────────┘
```

Information priority:

1. Program title
2. Provider
3. Status
4. Last checked
5. Action

The card should remain lighter than a full Program Details page.

---

# 33. Program Preview Image

If official program/provider imagery is available and trustworthy, it may be used.

Otherwise:

- use a provider identity/logo
- use a consistent category image
- or omit the image

Do not make images a requirement for the component.

The UI must work when no image is available.

---

# 34. Data Transparency Section

## Purpose

Establish trust around the origin and freshness of the information.

Recommended concept:

> **Know where the information comes from.**

Supporting text:

> **We show where opportunities come from and when each record was last checked, so you can make informed decisions with confidence.**

Key points:

```text
Information from Philippine public agencies

Source shown on every program page

Last-checked date shown for each record
```

The section can use a simple shield/data-source icon.

---

# 35. Source Health Connection

The landing page should introduce the existence of Source Health without turning the homepage into a technical dashboard.

Recommended supporting message:

> **Public opportunities. Monitored for reliability.**

CTA:

> **View Source Health →**

This creates a bridge:

```text
Landing
"What does ParaSa’yo do?"

       ↓

Source Health
"How does ParaSa’yo keep the data reliable?"
```

The landing page should not expose all source-health metrics.

Those belong on the Source Health page.

---

# 36. Transparency Section Visual Weight

This should be intentionally quieter than:

- Hero
- Categories
- How It Works

Use:

- white/light neutral surface
- thin borders
- subtle iconography
- restrained blue heading
- no large charts
- no large illustrations

The purpose is trust, not visual excitement.

---

# 37. Footer

The footer should provide:

### Brand

ParaSa’yo logo

Short description:

> Finding public opportunities should be simple and clear. ParaSa’yo brings opportunities from public agencies together in one place.

### Quick Links

- Explore opportunities
- Para Sa Akin?
- How it works
- Source Health

### Support

- Help center
- Contact us
- Report an issue

### Legal

- Privacy Policy
- Terms of Use

### Copyright

```text
© 2026 ParaSa’yo. All rights reserved.
```

---

# 38. Footer Visual Design

Use the established dark blue brand color.

Add a very thin red accent line at the top if desired.

The footer may contain a subtle abstract Philippine-inspired pattern/shape near the bottom corner.

However:

> **Do not introduce a completely new decorative system in the footer.**

It should use the same cultural motif language as the header and hero.

---

# 39. Decorative Pattern Rules

This is a crucial part of the final design direction.

## Use patterns in:

- navbar/header corner
- hero visual background
- section transitions
- footer accent
- small decorative edge elements

## Do NOT use patterns:

- behind long paragraphs
- behind interactive controls
- behind buttons
- behind dense program cards
- everywhere at once

### Rule:

> **Pattern should frame content, never compete with content.**

The user should notice:

> “This feels Filipino.”

not:

> “There are patterns everywhere.”

---

# 40. Recommended Pattern Density

Think of the page as:

```text
Hero
  [moderate cultural motif]

Trust strip
  [none]

Categories
  [none or minimal]

How It Works
  [none]

Programs
  [none]

Transparency
  [small motif]

Footer
  [small motif]
```

This keeps cultural identity present without visual fatigue.

---

# 41. Composition Principle

Use the Philippine-inspired elements as **anchors**, not wallpaper.

Examples:

### Good

```text
Hero artwork
+
small geometric motif in corner
```

### Good

```text
Footer
+
subtle pattern strip
```

### Bad

```text
pattern background
+
sun
+
jeepney
+
flag
+
red shapes
+
yellow shapes
+
multiple illustrations
+
heavy shadows
```

The second becomes distracting.

---

# 42. Typography

The landing page should use the same type family/system as the questionnaire, Results, Program Details, and Source Health pages.

Typography hierarchy:

```text
H1
Large, bold, expressive

H2
Strong section heading

H3
Moderate heading

Body
Readable, relaxed line height

Supporting text
Smaller but still accessible

Metadata
Small, neutral, readable
```

Do not create a separate "landing page font system."

Consistency across screens is more important.

---

# 43. Accessibility Principles

The landing page must remain usable even with the decorative elements.

Requirements:

- strong contrast
- readable body text
- sufficiently large CTA buttons
- visible keyboard focus
- clickable category cards with clear affordance
- meaningful alternative text for important images
- decorative images treated as decorative
- no information communicated only through color
- responsive behavior on mobile

The cultural illustrations should never prevent comprehension.

---

# 44. Responsive Design

## Desktop

Use:

```text
Two-column hero
Multi-column categories
Three-step How It Works
2–4 program cards
Two/three-column transparency
```

## Tablet

Collapse where necessary:

```text
Hero becomes narrower two-column
Categories reduce columns
Programs reduce columns
```

## Mobile

Recommended order:

```text
Navbar
Hero headline
Hero image
Primary CTA
Secondary CTA
Trust strip
Categories
How It Works
Programs
Transparency
Footer
```

The hero should become a single-column narrative.

Avoid shrinking desktop designs until they become cramped.

---

# 45. Mobile Navigation

Desktop:

```text
Logo | Explore | Para Sa Akin? | How It Works | Source Health | Find a match
```

Mobile:

```text
☀ ParaSa’yo                         ☰
```

The navigation can collapse into a mobile menu.

The primary "Find a match" action may remain prominently available if space permits.

---

# 46. Interaction Design

### Primary CTA

`Find What's For Me`

→ questionnaire

### Secondary CTA

`Explore Opportunities`

→ Explore

### Category card

→ filtered Explore page

### How It Works

→ informational/scroll section

### Program preview

→ Program Details

### Source Health

→ Source Health page

### Footer links

→ corresponding pages

Every major interactive element should have a clear destination.

---

# 47. Loading / Performance Considerations

Because the landing page contains imagery, do not allow the visual assets to overwhelm performance.

Use:

- optimized images
- appropriately sized hero asset
- responsive image variants where possible
- lazy loading for below-the-fold imagery
- compressed assets
- skeleton/loading behavior only where necessary

The hero image should be prioritized because it is part of the first viewport.

Below-the-fold program/category images can be loaded progressively.

---

# 48. What the Landing Page Should NOT Do

Do not turn the landing page into:

### A dashboard

Avoid metrics like:

```text
127 programs
98% extraction health
6 sources
4 repairs
```

Those belong in Source Health.

### A search page

Don't place the full search/filter system on the homepage.

### A questionnaire

Don't immediately put five profile questions on the home screen.

### A technical showcase

Don't lead with:

> self-healing scraper

Explain the technical story elsewhere.

### An e-commerce catalog

Don't use large product-grid conventions as the primary layout.

---

# 49. Why This Structure Works

The landing page follows a progressive narrative:

```text
1. HERO
   What is ParaSa’yo?

        ↓

2. TRUST
   Why should I trust/use it?

        ↓

3. CATEGORIES
   What can I find?

        ↓

4. HOW IT WORKS
   How does the product help me?

        ↓

5. EXAMPLES
   Does it actually have useful opportunities?

        ↓

6. TRANSPARENCY
   Where does the information come from?

        ↓

7. FOOTER
   Supporting navigation
```

This prevents the user from being confronted with too much information at once.

---

# 50. Final Landing Page Wireframe

```text
┌────────────────────────────────────────────────────────────┐
│ ☀ ParaSa’yo                                                │
│                                                              │
│ Explore   Para Sa Akin?   How It Works   Source Health      │
│                                      [ Find a match ]        │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ PUBLIC OPPORTUNITIES, MADE EASIER TO FIND                   │
│                                                              │
│ FIND WHAT'S AVAILABLE.                 ┌──────────────────┐ │
│ FIND WHAT'S FOR YOU.                  │                  │ │
│                                       │  Filipino        │ │
│ Scholarships, assistance,             │  illustration    │ │
│ training, employment,                 │  students /      │ │
│ and other opportunities—              │  workers /       │ │
│ organized in one place.               │  community       │ │
│                                       │                  │ │
│ [ Find What's For Me → ]              └──────────────────┘ │
│                                                              │
│ [ Explore Opportunities ]                                   │
│                                                              │
│ 3 quick steps · About 1 minute · No sign-up required        │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ No sign-up required   │ Public agency sources │ Last checked│
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ WHAT ARE YOU LOOKING FOR?                                    │
│                                                              │
│ [Scholarships] [Training] [Assistance] [Employment]          │
│ [Livelihood]   [Other Opportunities]                         │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ HOW PARASA'YO WORKS                                         │
│                                                              │
│       01 ───────── 02 ───────── 03                          │
│                                                              │
│ Tell us              Get matches        Review & verify      │
│ about yourself       or explore                               │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ PROGRAMS YOU CAN EXPLORE                           View all →│
│                                                              │
│ [ Program Card ]   [ Program Card ]   [ Program Card ]      │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ KNOW WHERE THE INFORMATION COMES FROM                       │
│                                                              │
│ Information from Philippine public agencies                  │
│ Source shown on every program page                          │
│ Last-checked date shown                                     │
│                                                              │
│                    [ View Source Health → ]                  │
│                                                              │
├────────────────────────────────────────────────────────────┤
│                                                              │
│ FOOTER                                                       │
│                                                              │
│ ParaSa'yo     Quick Links      Support                       │
│ Description   Explore          Help center                   │
│               Para Sa Akin?    Contact us                    │
│               How it works     Report an issue               │
│               Source health                                  │
│                                                              │
│ © 2026 ParaSa’yo                   Privacy · Terms           │
└────────────────────────────────────────────────────────────┘
```

---

# 51. AI Visualization Prompt

Use the following as the primary visualization reference.

> **Design a polished modern landing page for “ParaSa’yo”, a Philippine public-opportunity discovery platform. The page should feel human, trustworthy, welcoming, modern, accessible, distinctly Filipino, and lightweight. It should not look like a government portal, generic SaaS landing page, e-commerce site, AI dashboard, or overly patriotic website.**
>
> **Use a restrained Philippine-inspired palette:** deep/branded blue as the primary color, white/light neutral as the dominant background, warm yellow as an accent, and red only for small semantic or decorative emphasis.
>
> **Create a strong editorial hero section.** On desktop use a two-column composition: large headline and copy on the left, a custom Filipino illustration on the right. The hero illustration should show a diverse group of Filipino people representing students, workers, job seekers, or community members, with subtle visual references to education, training, employment, livelihood, and opportunity. Include a Philippine sun motif. The illustration should be modern flat/vector editorial artwork with consistent shapes and restrained cultural details.
>
> Hero eyebrow:
> **PUBLIC OPPORTUNITIES, MADE EASIER TO FIND**
>
> Hero headline:
> **FIND WHAT'S AVAILABLE. FIND WHAT'S FOR YOU.**
>
> Supporting text:
> **Scholarships, assistance, training, employment, and other opportunities—organized in one place and matched to what may fit you.**
>
> Primary CTA:
> **Find What's For Me →**
>
> Secondary CTA:
> **Explore Opportunities**
>
> Supporting microcopy:
> **3 quick steps · About 1 minute · No sign-up required**
>
> Below the hero, include a compact trust strip containing:
> **No sign-up required**
> **Public agency sources**
> **Source and last-checked details**
>
> Follow with a category section titled:
> **What are you looking for?**
>
> Include compact visually consistent category cards for:
> Scholarships
> Training & Certifications
> Financial Assistance
> Employment
> Livelihood
> Other Opportunities
>
> Use appropriate category imagery or simple consistent illustrations. Avoid mixing unrelated photography and illustration styles.
>
> Follow with:
> **How ParaSa’yo works.**
>
> Present three connected steps:
> **01 Tell us about yourself**
> Answer a few simple questions about your situation and goals.
>
> **02 Get matches or explore**
> See opportunities that may fit you or browse all available programs.
>
> **03 Review & verify**
> Check program details and follow the official instructions to apply.
>
> Use three blue numbered circles connected by subtle lines. Keep this section visually simple.
>
> Next, include:
> **Programs you can explore**
>
> Show only 2–4 realistic opportunity preview cards with:
> program title, provider, status, last checked date, optional relevant image, and “View program details →”.
>
> Then include a subtle transparency section:
> **Know where the information comes from.**
>
> Explain that ParaSa’yo shows public-agency sources and last-checked information. Add a secondary CTA:
> **View Source Health →**
>
> Finish with a dark blue footer containing the ParaSa’yo brand, short description, quick links, support links, privacy/terms, and copyright.
>
> **Important visual rule:** Philippine motifs such as the sun, geometric/textile patterns, and red/blue/yellow accents should be used as framing and identity elements rather than wallpaper. Use them selectively in the hero, small section transitions, header, and footer. Do not cover backgrounds in busy patterns. Do not use multiple competing cultural objects. The user should feel that the platform is Filipino before consciously noticing why, while the content remains the primary focus.
>
> Use generous white space, subtle depth, clear typography, restrained rounded cards, strong visual hierarchy, and accessible controls. The landing page should feel more expressive than the internal application screens, but never visually noisy.

---

# 52. Final Design Principles

The landing page should ultimately follow these principles:

### **1. Clarity before decoration**
The user must understand the product before noticing the decorative elements.

### **2. Filipino identity without visual overload**
Cultural motifs should create identity, not distraction.

### **3. One dominant message**
The hero should have one unmistakable purpose.

### **4. Two obvious paths**
Users can either browse or personalize.

### **5. Human-first language**
Avoid technical terminology in the primary landing experience.

### **6. Trust through transparency**
Show where the information comes from without exposing unnecessary technical details.

### **7. Visual depth through meaningful assets**
Use custom illustration, composition, spacing, and subtle shapes rather than decorative clutter.

### **8. Progressive disclosure**
Reveal more detail as the user scrolls instead of putting the entire product on the first screen.

### **9. Consistency**
The landing page must use the same visual language as the Questionnaire, Results, Program Details, and Source Health pages.

### **10. Outcome over technology**
The landing page sells the benefit:

> **Find opportunities that may fit you.**

The technical architecture proves how ParaSa’yo does it later.

---

# 53. Final Product Narrative

The completed landing page should tell this story:

```text
PUBLIC OPPORTUNITIES ARE SCATTERED
                ↓
ParaSa’yo makes them easier to find
                ↓
Choose:
   Browse everything
        OR
   Find what's for you
                ↓
Tell us a little about yourself
                ↓
Get potential matches
                ↓
Review the opportunity
                ↓
Verify with the official source
```

The visual language reinforces the message:

```text
FILIPINO
   +
HUMAN
   +
TRUSTWORTHY
   +
SIMPLE
   +
PURPOSEFUL
```

That is the finalized landing-page direction.
