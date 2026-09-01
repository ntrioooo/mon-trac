# JagaJajan — Master Redesign Prompt for Claude

You are the lead product designer + senior frontend engineer responsible for redesigning the existing JagaJajan application.

The repository already contains a working application. Your job is to **redesign the UI/UX substantially while preserving working functionality and architecture unless a change is truly necessary**.

---

## 1. Read the design skills first

Before changing code, inspect:

```text
.claude/skills/
```

At minimum, read:

```text
jagajajan-design/SKILL.md
jagajajan-design/references/visual-language.md
jagajajan-design/references/components.md
jagajajan-design/references/mobile.md
jagajajan-design/references/motion.md
jagajajan-design/references/design-review.md
```

Also inspect any existing project skills relevant to:

- frontend design
- Next.js
- code review
- testing
- PWA
- data architecture

Treat the JagaJajan design skill as the source of truth for visual direction.

Do not start coding before reading the skills.

---

# 2. Rebranding rule

The current customer-facing brand is:

> **JagaJajan**

Do not use:

- MoneyTrack
- MonTrac
- Ingat Miskin
- iM

in the customer-facing UI.

Update visible branding, metadata, PWA name, app shell labels, and relevant copy to JagaJajan.

Do not rename internal technical entities unless required; avoid unnecessary business-logic refactors.

---

# 3. Primary design objective

The current application is functional but visually reads as a clean pastel finance dashboard.

Redesign it into:

> **Playful Modern Mobile UI with Soft-Retro Sticker / Editorial Doodle influence.**

The result must feel:

- playful
- friendly
- expressive
- handcrafted
- youthful
- premium enough for personal finance

It must NOT feel:

- like a generic SaaS dashboard
- like an enterprise accounting application
- like a children's app
- like an AI-generated design template
- like excessive glassmorphism
- like a generic purple fintech template

---

# 4. Reference images

Reference images are available under:

```text
.claude/skills/jagajajan-design/assets/reference-ui/
```

Study them before designing.

Extract principles from them rather than copying any one screenshot literally.

The key qualities to study are:

- pastel surfaces
- playful color blocking
- rounded shapes
- chunky typography
- hand-drawn/illustrative accents
- tactile components
- compact chips
- clear finance information
- purposeful asymmetry
- expressive empty states
- mobile-first hierarchy

---

# 5. Existing app must be inspected

Before implementation, inspect:

- current routes
- current components
- current CSS/design tokens
- current data flow
- Dexie / IndexedDB setup
- authentication
- PWA setup
- current transaction entry flow
- current charts
- current bottom navigation

Do not rewrite working business logic just because the UI is being redesigned.

---

# 6. Design planning phase

Before writing UI code, create a short internal design plan with:

### Palette

Use a warm cream canvas and expressive pastel accents.

Starting direction:

```text
Canvas Cream #FFF9ED
Ink Navy #172A63
Soft Blue #B9D7F5
Playful Pink #F4A8C7
Soft Yellow #FFD66B
Soft Mint #B8E6B1
Lilac #D8C4F1
White #FFFFFF
Expense Coral #F26A6A
Income Mint #56B88A
```

Adjust for accessibility if needed.

### Typography

Use **Plus Jakarta Sans / Jakarta Sans**.

No Inter or generic system fallback as the primary design font.

### Shape language

Combine rounded cards, pills, circles, small sticker badges, and occasional outlined doodles.

### Signature

The JagaJajan visual signature should be:

> **chunky Jakarta Sans + navy ink outlines + warm cream canvas + pastel food/money doodles + tactile rounded UI**

### Motion

Use Framer Motion selectively for tactile transitions and state changes.

---

# 7. Self-critique before coding

Before implementing the design, explicitly check whether your plan accidentally resembles a generic AI-generated design.

If it does, revise it.

Common warning signs:

- too many rounded white cards
- too many gradients
- too many shadows
- generic purple fintech palette
- every section having identical dimensions
- decorative blobs everywhere
- random emoji usage
- excessive animation

The goal is **intentional personality**, not maximum decoration.

---

# 8. Redesign priorities

Redesign in this order:

1. Global design tokens
2. Typography
3. App shell and background
4. Bottom navigation
5. Dashboard
6. Transaction list
7. Add/edit transaction sheet
8. Wallet/account UI
9. Category UI
10. Analytics/charts
11. Settings
12. Empty states
13. Loading/error states
14. PWA presentation
15. Motion polish

Do not attempt to redesign all screens independently.

Build a coherent design system and reuse it.

---

# 9. Dashboard requirements

The dashboard should feel like a playful personal money journal.

Prioritize:

- greeting
- balance/net cash flow
- income and expense
- budget progress
- wallet balances
- today's spending
- transaction count
- category spending
- recent activity

Use visual hierarchy rather than identical card grids.

Allow one strong feature card to visually anchor the page.

Use small doodles/illustrations only where they help establish the brand.

---

# 10. Add transaction requirements

This remains the most important interaction.

The user should be able to enter a transaction very quickly on a phone.

The flow should be roughly:

```text
Tap +
↓
Choose Pengeluaran/Pemasukan
↓
Amount
↓
Wallet
↓
Category
↓
Optional Note
↓
Date
↓
Save
```

Use:

- numeric keyboard
- direct amount focus
- large category tiles/chips
- compact wallet selection
- visible note/date
- sticky save action
- safe-area padding

Do not hide essential fields inside unnecessary accordions.

---

# 11. Icons

Use **Lucide React** for interface icons.

Do not introduce another icon library for ordinary UI controls.

For example:

```text
Home            → House
Activity        → ClipboardList / Receipt
Analytics       → ChartNoAxesCombined / BarChart3
Account         → UserRound
Settings        → Settings
Add             → Plus
Filter          → SlidersHorizontal
Search          → Search
Wallet          → WalletCards
Income          → ArrowDownLeft
Expense         → ArrowUpRight
Transfer        → ArrowLeftRight
```

Choose the closest semantic icon available in the installed Lucide version.

---

# 12. Animation

Use Framer Motion if it is already installed or add it only if justified.

Recommended uses:

- sheet enter/exit
- button press
- transaction insertion
- tab selection
- budget progress
- chart reveal

Do not animate everything.

Respect reduced motion.

---

# 13. Mobile requirements

Test at:

```text
360px
375px
390px
430px
```

Ensure:

- no horizontal overflow
- no clipped financial numbers
- touch targets at least 44px
- bottom navigation respects safe area
- forms do not hide save action
- charts remain readable
- long category names do not break layouts

---

# 14. Financial readability

Playful design must never reduce financial clarity.

Keep:

- amounts prominent
- `tabular-nums`
- strong income/expense semantics
- readable chart labels
- clear budget status
- clear wallet identification

Use color as a semantic aid, not the only source of meaning.

---

# 15. Implementation behavior

Work incrementally.

For each major stage:

1. Inspect current implementation.
2. Reuse existing components where sensible.
3. Update design tokens.
4. Update components.
5. Check TypeScript.
6. Run lint/build/tests.
7. Visually inspect mobile rendering.
8. Fix regressions.

Do not make hundreds of unrelated changes in one step.

---

# 16. Do not break these systems

Unless explicitly required, preserve:

- authentication
- IndexedDB/Dexie
- transaction persistence
- wallet calculations
- budget calculations
- category calculations
- reports
- backup/import/export
- PWA functionality
- offline behavior

The redesign is primarily a UI/UX change.

---

# 17. Visual QA

After implementation, inspect screenshots/rendered pages at mobile size.

Review:

- dashboard
- add transaction
- activity
- analytics
- account/settings

Look specifically for:

- generic card repetition
- weak typography
- excessive decoration
- poor spacing
- inconsistent icons
- weak hierarchy
- mobile overflow
- unreadable pastel text
- overuse of gradients/shadows

---

# 18. Final quality gate

Before declaring success:

### Brand

- JagaJajan is consistent
- Jakarta Sans is present
- visual identity is recognizable

### Playfulness

- clear personality
- subtle doodle/sticker language
- expressive but controlled
- not childish
- not template-like

### UX

- fast add transaction
- one-hand friendly
- 44px+ targets
- good safe-area handling

### Technical

- TypeScript passes
- lint passes
- build passes
- tests pass
- existing business logic remains intact

### Motion

- purposeful
- tactile
- restrained
- reduced-motion aware

### Design

Ask:

> If the logo were removed, would the application still be recognizably JagaJajan?

If the answer is no, strengthen the visual language before finishing.

---

# 19. Start

Now execute this workflow:

1. Inspect the repository.
2. Inspect `.claude/skills/`.
3. Read the JagaJajan design skill and its references.
4. Inspect the current UI implementation.
5. Inspect the provided reference images.
6. Create the redesign plan.
7. Implement the design system.
8. Redesign the application incrementally.
9. Test at mobile widths.
10. Run lint/build/tests.
11. Perform a final visual critique.
12. Fix the most important visual issues before finishing.

Do not merely describe what should be changed.

**Actually implement the redesign in the existing project.**
