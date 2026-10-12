// Rules shared by signup (which creates accounts) and login (which looks them up),
// so an email is always stored and matched in the same form.

export const MIN_PASSWORD = 8;
// bcrypt only reads the first 72 bytes of its input; longer passwords would
// silently be truncated, so they are rejected instead.
export const MAX_PASSWORD_BYTES = 72;
export const BCRYPT_COST = 12;

// The `error` code login returns when the password is right but the email is unconfirmed.
export const EMAIL_NOT_VERIFIED = "EmailNotVerified";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

export function normalizeEmail(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL && EMAIL_PATTERN.test(email);
}

/** Returns a message for the first problem with the password, or null if it is acceptable. */
export function passwordProblem(password: string): string | null {
  if (password.length < MIN_PASSWORD) {
    return `Password must be at least ${MIN_PASSWORD} characters.`;
  }
  if (new TextEncoder().encode(password).length > MAX_PASSWORD_BYTES) {
    return `Password must be ${MAX_PASSWORD_BYTES} bytes or fewer.`;
  }
  return null;
}
