import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { TokenPurpose } from "@/generated/prisma/enums";

const HOUR = 60 * 60 * 1000;
const TTL: Record<TokenPurpose, number> = {
  verify_email: 24 * HOUR,
  reset_password: 1 * HOUR,
};

// Stops someone from using the forms to flood an inbox with emails.
const RESEND_COOLDOWN_MS = 60 * 1000;

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

/**
 * Creates a fresh single-use token for the user, replacing any earlier one of the
 * same purpose. Returns the raw token to put in the emailed link, or null if one
 * was issued less than a minute ago.
 */
export async function issueToken(
  userId: number,
  purpose: TokenPurpose,
): Promise<string | null> {
  const recent = await prisma.authToken.findFirst({
    where: {
      userId,
      purpose,
      createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
    select: { id: true },
  });
  if (recent) return null;

  const token = randomBytes(32).toString("base64url");
  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId, purpose } }),
    prisma.authToken.create({
      data: {
        userId,
        purpose,
        tokenHash: sha256(token),
        expiresAt: new Date(Date.now() + TTL[purpose]),
      },
    }),
  ]);
  return token;
}

/** Spends a token. Returns the owning user id, or null if it is unknown, expired, used, or for another purpose. */
export async function consumeToken(
  token: unknown,
  purpose: TokenPurpose,
): Promise<number | null> {
  if (typeof token !== "string" || token.length === 0 || token.length > 200) {
    return null;
  }
  const row = await prisma.authToken.findUnique({
    where: { tokenHash: sha256(token) },
  });
  if (!row || row.purpose !== purpose || row.expiresAt <= new Date()) {
    return null;
  }
  // Deleting by id is the atomic step: of two simultaneous uses, only one deletes the row.
  const { count } = await prisma.authToken.deleteMany({ where: { id: row.id } });
  return count === 1 ? row.userId : null;
}
