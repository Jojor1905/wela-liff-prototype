# Wela Design Foundation

## Visual direction

Wela should feel like a private appointment with a premium skincare advisor: composed, editorial, warm, and clinically responsible. The interface balances quiet luxury with practical clarity.

The primary experience is mobile-first. Desktop layouts should preserve the focused, intimate reading width rather than expand into a dashboard.

Core visual qualities:

- Premium editorial composition
- Quiet luxury with restrained detail
- Warm clinical credibility
- Generous negative space
- Strong, readable English hierarchy
- Calm, direct interactions

## Colour tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--color-burgundy-900` | `#4B1727` | Primary brand, high-emphasis text |
| `--color-burgundy-800` | `#621F35` | Primary button default |
| `--color-burgundy-700` | `#7A2B43` | Primary button hover |
| `--color-cream-50` | `#FCF9F4` | Main page background |
| `--color-cream-100` | `#F7F0E7` | Warm surface and tonal section |
| `--color-blush-100` | `#F2DFDC` | Gentle decorative accent |
| `--color-blush-200` | `#E8CBC8` | Borders and highlighted surfaces |
| `--color-taupe-300` | `#C9B9AB` | Dividers and disabled boundaries |
| `--color-taupe-500` | `#89786E` | Supporting text |
| `--color-charcoal-900` | `#292323` | Primary body text |
| `--color-white` | `#FFFFFF` | Elevated cards and reversed text |
| `--color-focus` | `#8B4B5E` | Accessible focus ring |

Semantic tokens should map to the palette:

- Background: cream 50
- Surface: white
- Subtle surface: cream 100
- Primary text: charcoal 900
- Muted text: taupe 500
- Brand/action: burgundy 800
- Border: blush 200 or taupe 300

Do not introduce high-saturation status colours unless a future functional need requires them. Status colour must always be accompanied by text or an icon.

## Typography hierarchy

Use Cormorant Garamond for selective editorial display headings and Inter for interface and body copy. Cormorant Garamond italic is reserved for the primary Welcome heading and intentionally literary hero moments; normal Cormorant Garamond may be used for important editorial headings. Controls, navigation, consent, product information, labels, data, and privacy copy always use Inter.

- Brand mark: 20–22 px, medium weight, wide letter spacing for Latin text
- Display heading: 42–49 px mobile, 48–56 px larger screens, 500–600 weight, tight 0.98–1.13 line height, and restrained negative letter spacing no tighter than `-0.04em`
- Screen heading: 28–32 px, 600 weight
- Section heading: 20–24 px, 600 weight
- Body large: 17–18 px, 400 weight, 1.7–1.8 line height
- Body: 15–16 px, 400 weight, 1.65–1.75 line height
- Label: 12–13 px, 500–600 weight, modest letter spacing
- Button: 16 px, 600 weight

English editorial copy uses sentence case by default. Keep headings concise, paragraphs short, and line lengths comfortable. Use high-scale italic serif only where it establishes editorial hierarchy; avoid applying serif or italic styling to functional interface copy. Avoid aggressive negative letter spacing, dense all-bold paragraphs, generic SaaS language, overly technical AI terminology, and excessive marketing adjectives.

## Spacing system

Use a 4 px base unit:

| Token | Value |
| --- | --- |
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-10` | `40px` |
| `--space-12` | `48px` |
| `--space-16` | `64px` |
| `--space-20` | `80px` |

Mobile page gutters begin at 24 px. Key sections should use 40–64 px vertical separation. Touch targets must be at least 44 px high, with 48–56 px preferred.

## Border radius

- Small controls and tags: 8 px
- Inputs and buttons: 14 px
- Cards: 20 px
- Large editorial panels: 28 px
- Pills: 999 px, reserved for compact labels or status

Avoid making every surface pill-shaped. Radius should communicate structure, not decoration.

## Shadows

Shadows are warm, broad, and low contrast:

- Card: `0 12px 40px rgba(75, 23, 39, 0.08)`
- Elevated: `0 20px 60px rgba(41, 35, 35, 0.12)`
- Button: `0 8px 24px rgba(75, 23, 39, 0.16)`

Use borders and tonal surfaces before adding shadow. Do not stack multiple dramatic shadows.

## Button styles

**Primary**

- Solid burgundy background with cream or white text
- Minimum 52 px height; full-width on core mobile steps
- Clear hover, pressed, keyboard-focus, and disabled states
- One primary action per view

**Secondary**

- Text button or quiet outlined button
- Burgundy or charcoal text
- Underline or tonal feedback on hover
- Must remain visibly subordinate to the primary action

Button copy should be short, direct English in sentence case, and describe the next action. Do not use urgency or pressure.

## Card styles

- White or soft cream surface
- 1 px warm border where separation is needed
- 20–28 px radius
- 20–28 px internal padding on mobile
- Clear heading, concise content, and a single obvious purpose

Product and routine cards should explain role and priority before promotional detail. Avoid dense metric grids and generic dashboard tiles.

## Motion principles

- Motion should clarify hierarchy, progress, or state change.
- Prefer opacity and small vertical transitions of 8–12 px.
- Standard transitions should last 160–240 ms with gentle easing.
- Longer simulated-analysis motion may be calm but must not imitate biometric scanning.
- Respect `prefers-reduced-motion` by removing non-essential animation.
- Never delay access to important copy for decorative choreography.

## Prohibited visual patterns

- Neon blue or electric colour schemes
- Purple “AI” gradients or aurora backgrounds
- Holograms, robots, circuitry, or technology mascots
- Facial scanning frames, lasers, target points, heat maps, or diagnostic overlays
- Excessive glassmorphism, blur, transparency, or floating panels
- Generic AI dashboards, chat interfaces, or metric-heavy admin layouts
- False clinical precision, health scores, or unvalidated percentages
- Before-and-after imagery used to shame appearance
- Fear-based ageing messages, countdowns, scarcity, or alarmist warnings
- Decorative complexity that reduces readability
