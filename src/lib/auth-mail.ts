import { issueToken } from "@/lib/tokens";
import { sendMail } from "@/lib/mail";

type Recipient = { id: number; email: string };

function link(path: string, token: string) {
  const base = (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

/** Emails a verification link. Does nothing if one was sent in the last minute. */
export async function sendVerificationEmail({ id, email }: Recipient) {
  const token = await issueToken(id, "verify_email");
  if (!token) return;
  await sendMail({
    to: email,
    subject: "Confirm your email for Task Tracker",
    text: `Confirm your email address to finish setting up your account:\n\n${link("/verify-email", token)}\n\nThis link expires in 24 hours. If you didn't create an account, ignore this email.`,
  });
}

/** Emails a password reset link. Does nothing if one was sent in the last minute. */
export async function sendPasswordResetEmail({ id, email }: Recipient) {
  const token = await issueToken(id, "reset_password");
  if (!token) return;
  await sendMail({
    to: email,
    subject: "Reset your Task Tracker password",
    text: `Use this link to choose a new password:\n\n${link("/reset-password", token)}\n\nThis link expires in 1 hour and works once. If you didn't ask for this, ignore this email; your password hasn't changed.`,
  });
}
