export const fieldClass =
  "w-full rounded-lg border border-zinc-500 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-400 dark:scheme-dark";

export const labelClass =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-400";

const disabled = "disabled:cursor-not-allowed disabled:opacity-60";

// Hover darkens: indigo-500 would drop white text below 4.5:1.
export const primaryButtonClass = `rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 ${focusRing} ${disabled}`;

// Task status actions (Start / Mark done / Reopen).
export const subtleButtonClass = `rounded-lg bg-zinc-100 px-3.5 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 ${focusRing} ${disabled}`;

// Low-emphasis actions: Edit, Delete, Cancel.
export const ghostButtonClass = `rounded-lg px-2.5 py-1.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 ${focusRing} ${disabled}`;

// Confirms a destructive action.
export const dangerButtonClass = `rounded-lg bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 ${focusRing} ${disabled}`;

// The shell for every form and message card, matching the task list cards.
export const cardClass =
  "space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm shadow-zinc-900/5 dark:border-zinc-800 dark:bg-zinc-950";

export const linkClass =
  "font-medium text-indigo-600 underline underline-offset-2 hover:decoration-2 dark:text-indigo-400";
