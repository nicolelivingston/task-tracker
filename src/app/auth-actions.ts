"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  BCRYPT_COST,
  isValidEmail,
  normalizeEmail,
  passwordProblem,
} from "@/lib/credentials";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth-mail";
import { consumeToken } from "@/lib/tokens";

export type SignupState = {
  error?: string;
  // The password is deliberately never echoed back.
  values?: { email: string };
  // True once the account exists and the verification email has been sent.
  sent?: boolean;
};

// Creates the account and emails a verification link. The user is not signed in
// until they confirm their address and log in.
export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const values = { email };

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address.", values };
  }
  const problem = passwordProblem(password);
  if (problem) return { error: problem, values };
  if (password !== confirm) return { error: "Passwords do not match.", values };

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  let user;
  try {
    user = await prisma.user.create({ data: { email, passwordHash } });
  } catch (e) {
    // P2002 = unique constraint: the email is taken (also covers two signups racing).
    if (typeof e === "object" && e && "code" in e && e.code === "P2002") {
      return { error: "An account with this email already exists.", values };
    }
    throw e;
  }

  try {
    await sendVerificationEmail(user);
  } catch (e) {
    console.error("Could not send verification email", e);
    return {
      error:
        "Your account was created, but we couldn't send the verification email. Try signing in to request a new one.",
      values,
    };
  }
  return { sent: true, values };
}

export type MessageState = { error?: string; message?: string; email?: string };

// The same reply whether or not the address belongs to an account, so these
// forms can't be used to find out who has one.
const RESEND_REPLY =
  "If that account exists and isn't verified yet, we've sent a new verification link.";
const RESET_REPLY =
  "If an account exists for that email, we've sent a link to reset the password.";

export async function resendVerification(
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const email = normalizeEmail(formData.get("email"));
  if (!isValidEmail(email)) return { error: "Enter a valid email address." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    try {
      await sendVerificationEmail(user);
    } catch (e) {
      console.error("Could not send verification email", e);
    }
  }
  return { message: RESEND_REPLY, email };
}

export async function requestPasswordReset(
  _prev: MessageState,
  formData: FormData,
): Promise<MessageState> {
  const email = normalizeEmail(formData.get("email"));
  if (!isValidEmail(email)) return { error: "Enter a valid email address.", email };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    try {
      await sendPasswordResetEmail(user);
    } catch (e) {
      console.error("Could not send password reset email", e);
    }
  }
  return { message: RESET_REPLY, email };
}

export type TokenActionState = { error?: string; done?: boolean };

// Run from a button on the page rather than on page load, so mail scanners that
// pre-fetch links can't spend the token before the user clicks it.
export async function verifyEmail(
  _prev: TokenActionState,
  formData: FormData,
): Promise<TokenActionState> {
  const userId = await consumeToken(formData.get("token"), "verify_email");
  if (userId === null) {
    return { error: "This link is invalid or has expired. Sign in to get a new one." };
  }
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  return { done: true };
}

export async function resetPassword(
  _prev: TokenActionState,
  formData: FormData,
): Promise<TokenActionState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  // Validate before spending the token, so a typo doesn't burn the link.
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== confirm) return { error: "Passwords do not match." };

  const userId = await consumeToken(formData.get("token"), "reset_password");
  if (userId === null) {
    return { error: "This link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      // Receiving this email proves they control the address.
      emailVerified: user?.emailVerified ?? new Date(),
    },
  });
  return { done: true };
}
