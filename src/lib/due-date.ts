// Browser-side helpers for the due date fields. The form has a date input and a
// free-text time input; these turn them into what the server expects.

const pad = (n: number) => String(n).padStart(2, "0");

// Reads 12-hour ("2:30 PM", "2:30pm", "2pm", "12 a.m.") or 24-hour ("14:30",
// "1430", "9") times. Returns 24-hour parts, or null if it isn't a valid time.
export function parseTime(text: string): { hours: number; minutes: number } | null {
  const twelve = /^(\d{1,2})(?:[:.]?(\d{2}))?\s*([ap])\.?\s*(?:m\.?)?$/i.exec(text.trim());
  if (twelve) {
    const hours = Number(twelve[1]);
    const minutes = Number(twelve[2] ?? 0);
    if (hours < 1 || hours > 12 || minutes > 59) return null;
    const pm = twelve[3].toLowerCase() === "p";
    return { hours: (hours % 12) + (pm ? 12 : 0), minutes };
  }
  const twentyFour = /^(\d{1,2})(?:[:.]?(\d{2}))?$/.exec(text.trim());
  if (twentyFour) {
    const hours = Number(twentyFour[1]);
    const minutes = Number(twentyFour[2] ?? 0);
    if (hours > 23 || minutes > 59) return null;
    return { hours, minutes };
  }
  return null;
}

// 24-hour parts as "2:30 PM".
export function formatTime({ hours, minutes }: { hours: number; minutes: number }) {
  return `${hours % 12 || 12}:${pad(minutes)} ${hours < 12 ? "AM" : "PM"}`;
}

// Splits "YYYY-MM-DDTHH:mm" into the date input's value and a 12-hour time, for
// pre-filling the fields.
export function splitDateTimeLocal(value: string | undefined) {
  if (!value) return { date: "", time: "" };
  const time = parseTime(value.slice(11, 16));
  return { date: value.slice(0, 10), time: time ? formatTime(time) : "" };
}

// Before submitting: combines the date and time fields into "dueAt"
// ("YYYY-MM-DDTHH:mm", so errors can echo it back) and adds "dueAtIso", the exact
// moment in UTC. Only the browser knows the user's zone, so it's pinned here.
export function prepareDueAt(formData: FormData) {
  const date = String(formData.get("dueDate") ?? "");
  const time = parseTime(String(formData.get("dueTime") ?? ""));
  const local = date && time ? `${date}T${pad(time.hours)}:${pad(time.minutes)}` : "";
  formData.set("dueAt", local);

  const dueAt = local ? new Date(local) : null;
  if (dueAt && !Number.isNaN(dueAt.getTime())) {
    formData.set("dueAtIso", dueAt.toISOString());
  }
}

// An ISO timestamp as "YYYY-MM-DDTHH:mm" in the browser's zone, for pre-filling
// the edit form.
export function toDateTimeLocal(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
