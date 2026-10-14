# Task Tracker

A personal task management app built with Next.js, TypeScript, Tailwind CSS, and Postgres (via Prisma).

## Stack
- Next.js (App Router, Server Components)
- TypeScript
- Tailwind CSS
- Prisma with Postgres (Neon on Vercel)
- NextAuth.js (credentials provider)

## Rules
- Use server components by default, client components only when needed
- All database queries go through Prisma (no raw SQL)
- Tasks are always scoped to the authenticated user
- Use Tailwind for all styling, no CSS modules

## Design
Follow design-system.md for all styling decisions. Do not deviate from the defined colors, spacing, or component styles without explicit instruction.

## Accessibility
Every change must meet WCAG 2.2 AA, in both light and dark mode. This is a requirement, not a nice-to-have: if a request or the design system would break it, say so and propose an accessible alternative instead of shipping it silently. Follow the Accessibility section of design-system.md, and:
- **Contrast:** text at least 4.5:1, including hover and focus states. Large text, icons, input borders and focus outlines at least 3:1. Check new colors with numbers, not by eye.
- **Color:** never the only signal. Pair it with text, an icon or an underline.
- **Keyboard:** everything works by keyboard, in a logical order, with a visible focus outline. When content appears or disappears (edit modes, confirmations, deletions), move focus somewhere sensible so it's never lost.
- **Names and labels:** every input has a label (visible, or `sr-only` when the context is visual), related inputs are grouped with `<fieldset>`/`<legend>`, and repeated buttons include what they act on (e.g. "Edit: Buy milk").
- **Errors and hints:** errors use `role="alert"`; fields with errors get `aria-invalid` and point to the message with `aria-describedby`; format requirements are stated up front, not only after a failed submit.
- **Semantics:** prefer native elements (`button`, `a`, `nav`, headings in order). Add ARIA only when HTML can't express it.
- **Layout:** works at 320px wide and 200% zoom without sideways scrolling. Click targets are at least 24×24px.
- **Motion:** animations respect `motion-reduce`.
- **Before finishing:** check the change against this list, and say what was checked and what couldn't be (e.g. "not tested with a screen reader").