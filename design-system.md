# Design System

Describes the app as built. Shared classes live in `src/components/styles.ts`; reuse them rather than copying class strings.

## Theme
- Light and dark follow the OS (`prefers-color-scheme`). There is no manual toggle.
- Every color class has a `dark:` counterpart. Add both when styling anything new.

## Colors
Palette: Tailwind **zinc** for neutrals, **indigo** for actions, **amber** / **emerald** / **red** for status.

| Role | Light | Dark |
| --- | --- | --- |
| Page background | #FFFFFF | #0A0A0A |
| Card background | `bg-white` | `bg-zinc-950` |
| Card border | `border-zinc-200/80` | `border-zinc-800` |
| Divider (inside cards) | `border-zinc-100` | `border-zinc-800` |
| Text primary (headings, titles) | `text-zinc-900` | `text-zinc-100` |
| Text body (descriptions) | `text-zinc-600` | `text-zinc-400` |
| Labels, due date | `text-zinc-700` | `text-zinc-300` |
| Text secondary (subtitles, metadata) | `text-zinc-500` | `text-zinc-400` |
| Primary action | `bg-indigo-600`, hover `bg-indigo-500` | same |
| Links | `text-indigo-600` | `text-indigo-400` |
| Focus outline | `outline-indigo-600` | `outline-indigo-400` |
| Overdue | `text-red-700` (icon `text-red-500`) | `text-red-400` |
| Form errors | `text-red-600` | `text-red-400` |

## Typography
- Font: Arial / Helvetica (set on `body` in `globals.css`).
- Page title: `text-2xl font-semibold tracking-tight`
- Section heading: `text-sm font-medium uppercase tracking-wide`, secondary color
- Card title: `text-base font-semibold leading-snug`
- Body / descriptions: `text-sm leading-relaxed`
- Metadata (completed time): `text-xs`, secondary color

## Layout & spacing
- Every page: `px-4 py-12 sm:py-16`. Task page is `max-w-2xl`, auth pages (sign in, sign up, password, verify) `max-w-sm`.
- Title → subtitle `mt-1`; header → form `mt-8`; form → task list section `mt-10`; section heading `mb-3`
- Between task cards: `space-y-4`
- Inside forms: `space-y-4` between fields, `space-y-1.5` between a label and its input

## Components
- **Task card:** `rounded-2xl border bg-white p-5 shadow-sm shadow-zinc-900/5`. Hover lifts it to `shadow-md`; in dark mode there's no shadow, and the border lightens to `zinc-700` on hover.
- **Form / message card** (`cardClass`): the task card without the hover effect, plus `space-y-4`. Used by the new task form and every auth form and confirmation message.
- **Primary button** (`primaryButtonClass`): `rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white`, disabled at `opacity-60`. Full width on auth forms; auto width for "Add task".
- **Outline button** (Sign out): `rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100`
- **Subtle button** (task status actions): `rounded-lg bg-zinc-100 px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200`
- **Input** (`fieldClass`): `rounded-lg border border-zinc-500 bg-white px-3 py-2 text-sm`, focus `border-indigo-500 ring-2 ring-indigo-500/30`. Dark: `bg-zinc-900`, native controls in dark scheme.
- **Label** (`labelClass`): `text-sm font-medium`. Mark optional fields with a `font-normal` secondary-color "(optional)".
- **Link** (`linkClass`): `font-medium underline underline-offset-2 hover:decoration-2`
- **Warning callout:** `rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900`. Its button is underlined, with an amber focus outline.
- **Empty state:** `rounded-2xl border border-dashed border-zinc-300 bg-white/50 p-10 text-center text-sm`
- **Loading skeleton:** three `h-36 rounded-2xl bg-zinc-100 animate-pulse` blocks

### Status badges
`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset`, with a `size-1.5` colored dot before the label.

| Status | Label | Light | Dark | Dot |
| --- | --- | --- | --- | --- |
| todo | To do | `bg-zinc-100 text-zinc-700 ring-zinc-500/20` | `bg-zinc-800 text-zinc-300` | `bg-zinc-400` |
| in_progress | In progress | `bg-amber-50 text-amber-800 ring-amber-600/20` | `bg-amber-500/10 text-amber-300` | `bg-amber-500` |
| done | Done | `bg-emerald-50 text-emerald-800 ring-emerald-600/20` | `bg-emerald-500/10 text-emerald-300` | `bg-emerald-500` |

## Task cards
- **Top row:** title on the left, status badge on the right.
- **Done tasks:** the title is secondary-colored with a line through it.
- **Description:** below the title, if there is one.
- **Footer**, separated by a divider:
  - **Due:** a calendar icon and the due date and time. When a task is overdue, the line turns red and starts with "Overdue ·".
  - **Completed:** the date and time the task was marked done. Shown only for done tasks.
  - **Status action:** Start / Mark done / Reopen, on the right, as a subtle button.
- Created dates are not shown.
- **Order:** earliest due first; tasks without a due date go last.
- **Date format:** `Oct 13, 2026, 12:00 PM`, in the viewer's time zone.

## Accessibility (WCAG 2.1 AA)
- Text contrast is at least 4.5:1 in both themes, so secondary text is never lighter than `zinc-500` (light) or `zinc-400` (dark).
- Input borders are at least 3:1 against the background (`zinc-500`).
- Never use color as the only signal. Badges have text labels, overdue tasks say "Overdue", and links are always underlined.
- Every interactive element shows a visible focus outline (`focus-visible:outline-2 outline-offset-2`).
- Repeated buttons include the task in their accessible name, e.g. `aria-label="Start: Buy milk"`.
- Form errors use `role="alert"`. While an error shows, each input is marked `aria-invalid` and points at the error with `aria-describedby`.
- Password fields with a minimum length say so up front ("At least 8 characters."), linked with `aria-describedby`.
- Animations respect `motion-reduce`. Loading placeholders are `aria-hidden`, with a screen-reader-only "Loading tasks…" status.
