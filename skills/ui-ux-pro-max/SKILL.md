---
name: ui-ux-pro-max
description: Design intelligence for professional UI/UX. Activates for UI build/design/create/review requests. Generates complete design systems with style, colors, typography, and anti-patterns for 161 product categories across 13 tech stacks.
origin: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
---

# UI/UX Pro Max — Design Intelligence

Use this skill for any UI/UX task: building, designing, reviewing, or improving interfaces. Automatically generates a complete design system tailored to the product type before writing code.

## Design System Generator

When a UI request arrives, run 5 parallel lookups and output a design system block before generating code:

```
TARGET: <Product Name> — RECOMMENDED DESIGN SYSTEM
─────────────────────────────────────────────────
PATTERN:    <Landing page pattern + structure>
STYLE:      <UI style + keywords + best-for>
COLORS:     Primary / Secondary / CTA / Background / Text
TYPOGRAPHY: <Font pairing> — mood + Google Fonts link
KEY EFFECTS: <Animations and interactions>
AVOID:      <Anti-patterns for this industry>
CHECKLIST:
  [ ] No emojis as icons (use SVG: Heroicons/Lucide)
  [ ] cursor-pointer on all clickable elements
  [ ] Hover states with smooth transitions (150-300ms)
  [ ] Text contrast 4.5:1 minimum (light mode)
  [ ] Focus states visible for keyboard nav
  [ ] prefers-reduced-motion respected
  [ ] Responsive: 375px, 768px, 1024px, 1440px
```

## 67 UI Styles

### General (49)

| Style | Best For |
|-------|----------|
| Minimalism & Swiss Style | Enterprise, dashboards, documentation |
| Neumorphism | Health/wellness, meditation |
| Glassmorphism | Modern SaaS, financial dashboards |
| Brutalism | Design portfolios, artistic projects |
| Claymorphism | Educational, children's apps, SaaS |
| Aurora UI | Modern SaaS, creative agencies |
| Liquid Glass | Premium SaaS, high-end e-commerce |
| Neubrutalism | Gen Z brands, startups |
| Bento Box Grid | Dashboards, product pages, portfolios |
| Dark Mode (OLED) | Night-mode apps, coding platforms |
| AI-Native UI | AI products, chatbots, copilots |
| Soft UI Evolution | Modern enterprise, SaaS |
| Cyberpunk UI | Gaming, tech, crypto |
| Organic Biophilic | Wellness, sustainability |
| Spatial UI (VisionOS) | VR/AR, spatial computing |
| HUD / Sci-Fi FUI | Cybersecurity, space tech |
| Motion-Driven | Portfolio, storytelling |
| Micro-interactions | Mobile, touchscreen UIs |
| Retro-Futurism | Gaming, entertainment, music |
| Y2K Aesthetic | Fashion, music, Gen Z |
| Memphis Design | Creative agencies, youth brands |
| Pixel Art | Indie games, retro tools |
| E-Ink / Paper | Reading apps, newspapers |
| Editorial Grid / Magazine | News, blogs, magazines |
| Vintage Analog / Retro Film | Photography, vinyl brands |

### Landing Page (8)

| Style | Best For |
|-------|----------|
| Hero-Centric | Products with strong visual identity |
| Conversion-Optimized | Lead generation, sales |
| Feature-Rich Showcase | SaaS, complex products |
| Minimal & Direct | Simple products, apps |
| Social Proof-Focused | Services, B2C |
| Interactive Product Demo | Software, tools |
| Trust & Authority | B2B, enterprise |
| Storytelling-Driven | Brands, agencies, nonprofits |

### BI/Analytics Dashboard (10)

Data-Dense, Heat Map, Executive, Real-Time Monitoring, Drill-Down, Comparative, Predictive, User Behavior, Financial, Sales Intelligence.

## 161 Industry Rules (sample)

| Vertical | Categories |
|----------|-----------|
| Tech & SaaS | SaaS, Micro SaaS, B2B, Developer Tool, AI/Chatbot, Cybersecurity |
| Finance | Fintech, Banking, Insurance, Personal Finance, Invoice & Billing |
| Healthcare | Medical Clinic, Pharmacy, Dental, Mental Health, Medication |
| E-commerce | General, Luxury, Marketplace, Subscription Box, Food Delivery |
| Services | Beauty/Spa, Restaurant, Hotel, Legal, Home Services, Booking |
| Creative | Portfolio, Agency, Photography, Gaming, Music Streaming |
| Lifestyle | Habit Tracker, Recipe, Meditation, Weather, Diary, Mood Tracker |

Each rule includes: recommended pattern, style priority, color mood, typography mood, key effects, and anti-patterns.

## Design Priority Rules (1–10)

| Priority | Category | Examples |
|----------|----------|---------|
| CRITICAL | Accessibility | Contrast 4.5:1, focus states, keyboard nav |
| CRITICAL | Touch & Interaction | 44px targets, tap feedback |
| HIGH | Performance | Lazy loading, layout stability, image opt |
| HIGH | Style Consistency | Icon systems, visual language |
| HIGH | Layout & Responsive | Mobile-first, 375/768/1024/1440px |
| HIGH | Navigation | Structure, deep linking, state preservation |
| MEDIUM | Typography & Color | Hierarchy, semantic tokens |
| MEDIUM | Animation | 150–300ms, ease-out, reduced-motion |
| MEDIUM | Forms & Feedback | Validation, error messages |
| LOW | Charts & Data | Accessibility, formatting |

## 57 Font Pairings (sample)

| Pairing | Mood | Best For |
|---------|------|---------|
| Cormorant Garamond / Montserrat | Elegant, sophisticated | Luxury, wellness, beauty |
| Inter / Inter | Clean, neutral | SaaS, dashboards, enterprise |
| Playfair Display / Source Sans Pro | Editorial, premium | Blogs, magazines, agencies |
| Space Grotesk / DM Sans | Modern, techy | Tech startups, AI products |
| Fraunces / Libre Franklin | Warm, trustworthy | Finance, healthcare |

## 13 Supported Stacks

React, Next.js, Astro, Vue, Nuxt.js, Nuxt UI, Svelte, SwiftUI, React Native, Flutter, HTML+Tailwind (default), shadcn/ui, Jetpack Compose.

Default to **HTML + Tailwind** unless the user specifies a stack.

## Usage Examples

```
Build a landing page for my SaaS product
Create a healthcare analytics dashboard
Design a dark-mode fintech banking app
Make a portfolio site with glassmorphism
Build an e-commerce product page for luxury goods
```

## Design System Persistence

For multi-session projects, generate a `design-system/MASTER.md` with all design tokens, and page-specific overrides in `design-system/pages/<page>.md`. When building a specific page:

1. Check `design-system/pages/<page>.md` for overrides
2. Fall back to `design-system/MASTER.md`
3. Never contradict the Master unless an override file says so

## Common Anti-Patterns to Avoid

- AI purple/pink gradients for banking or healthcare
- Emojis as icons (use SVG icon sets: Heroicons, Lucide)
- Harsh animations for wellness/spa contexts
- Dark mode for medical or children's apps
- Missing hover states on interactive elements
- Buttons without cursor-pointer
- Text below 4.5:1 contrast ratio
- Touch targets below 44px on mobile
