"use client";

import { useId, type FocusEvent, type FormEvent } from "react";
import { fieldClass, labelClass } from "@/components/styles";
import { formatTime, parseTime, splitDateTimeLocal } from "@/lib/due-date";

const TIME_HINT = "Use 12- or 24-hour time, like 2:30 PM or 14:30.";

// Date picker plus a free-text time, so times always read as AM/PM whatever the
// browser's locale, while still accepting 24-hour input. Uncontrolled, so React's
// form reset clears it after a task is added. Submit through prepareDueAt().
export function DueDateTimeFields({
  defaultValue,
  invalid,
  errorId,
}: {
  // "YYYY-MM-DDTHH:mm"
  defaultValue?: string;
  invalid?: boolean;
  errorId?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const { date, time } = splitDateTimeLocal(defaultValue);

  // Flags times that can't be read, so the browser blocks submitting and says why.
  function check(input: HTMLInputElement) {
    const ok = !input.value.trim() || parseTime(input.value) !== null;
    input.setCustomValidity(ok ? "" : "Enter a time like 2:30 PM or 14:30.");
  }

  function tidy(event: FocusEvent<HTMLInputElement>) {
    const parsed = parseTime(event.currentTarget.value);
    if (parsed) event.currentTarget.value = formatTime(parsed);
    check(event.currentTarget);
  }

  const describedBy = [hintId, invalid ? errorId : null].filter(Boolean).join(" ");

  return (
    <fieldset className="space-y-1.5">
      <legend className={labelClass}>Due date and time</legend>
      <div className="grid gap-3 sm:grid-cols-[3fr_2fr]">
        <div>
          <label htmlFor={`${id}-date`} className="sr-only">
            Due date
          </label>
          <input
            id={`${id}-date`}
            name="dueDate"
            type="date"
            required
            defaultValue={date}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? errorId : undefined}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor={`${id}-time`} className="sr-only">
            Due time
          </label>
          <input
            id={`${id}-time`}
            name="dueTime"
            type="text"
            autoComplete="off"
            required
            placeholder="2:30 PM"
            defaultValue={time}
            onInput={(e: FormEvent<HTMLInputElement>) => check(e.currentTarget)}
            onBlur={tidy}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={fieldClass}
          />
        </div>
      </div>
      <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
        {TIME_HINT}
      </p>
    </fieldset>
  );
}
