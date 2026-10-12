import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Reachable while signed out; signed-in users are bounced away from the first two.
const AUTH_PAGES = ["/login", "/signup"];
// The emailed-link pages stay reachable either way: the person clicking may or may not be signed in.
const PUBLIC_PAGES = [...AUTH_PAGES, "/forgot-password", "/reset-password", "/verify-email"];

// Optimistic gate only: it checks that a valid session cookie exists so signed-out
// visitors never see the app shell. Server actions and data reads re-check the
// session themselves, since this is not the authorization boundary.
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  if (!token && !PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Skip NextAuth's own endpoints, Next internals, and files with an extension (public assets).
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\..*).*)"],
};
