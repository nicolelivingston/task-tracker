import bcrypt from "bcryptjs";
import { connection } from "next/server";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { EMAIL_NOT_VERIFIED, normalizeEmail } from "@/lib/credentials";

// Compared against when the email is unknown, so a login attempt costs the same
// bcrypt work whether or not the account exists.
const DUMMY_HASH = "$2b$12$PqtIXlNdyNUoFf1fUSIgo.Yqd7eydE9ZY1JTruBpEA0XaMYUG8.sy";

export const authOptions: NextAuthOptions = {
  // Stateless JWT cookie: no session table, and the proxy can read it without the DB.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        const matches = await bcrypt.compare(
          password,
          user?.passwordHash ?? DUMMY_HASH,
        );
        if (!user || !matches) return null;
        // Checked only after the password, so this can't be used to probe which emails exist.
        // NextAuth hands the message to the client as `error`.
        if (!user.emailVerified) throw new Error(EMAIL_NOT_VERIFIED);

        return { id: String(user.id), email: user.email };
      },
    }),
  ],
  callbacks: {
    // NextAuth stores the user id in the token's `sub`; expose it on the session.
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};

/**
 * The current session, or null. Reads the request's cookies, so under
 * Cache Components callers must render behind a <Suspense> boundary.
 */
export async function getSession() {
  // getServerSession generates a CSRF token with randomBytes before it touches
  // cookies, which Cache Components rejects during prerender. Defer to request time first.
  await connection();
  return getServerSession(authOptions);
}

/** The signed-in user's id, or null. Same <Suspense> requirement as getSession. */
export async function getUserId(): Promise<number | null> {
  const session = await getSession();
  const id = Number(session?.user?.id);
  return Number.isInteger(id) ? id : null;
}
