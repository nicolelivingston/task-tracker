import nodemailer from "nodemailer";

type Mail = { to: string; subject: string; text: string };

// Configure with SMTP_URL (e.g. smtps://user:pass@smtp.example.com) and MAIL_FROM.
// Without SMTP_URL, development prints emails to the server console instead, so the
// flow can be tried without a mail provider. Production never falls back silently.
export async function sendMail({ to, subject, text }: Mail) {
  const smtpUrl = process.env.SMTP_URL;

  if (!smtpUrl) {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.MAIL_TRANSPORT !== "console"
    ) {
      throw new Error("SMTP_URL is not set, so email cannot be sent.");
    }
    console.log(`\n[mail] To: ${to}\n[mail] Subject: ${subject}\n\n${text}\n`);
    return;
  }

  await nodemailer.createTransport(smtpUrl).sendMail({
    from: process.env.MAIL_FROM ?? "Task Tracker <no-reply@localhost>",
    to,
    subject,
    text,
  });
}
