import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const response = i18nMiddleware(request);
  return authMiddleware(request, response);
}

async function authMiddleware(request: NextRequest, response: NextResponse) {
  const session = getSessionCookie(request);

  const { pathname } = request.nextUrl;

  type RoutePrefix = `/${string}/`;
  const authRoutePrefix = ["/sign-in", "/sign-up"];
  const protectedRoutePrefix: RoutePrefix[] = ["/dashboard/"];

  const isAuthRoute = authRoutePrefix.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isProtectedRoute =
    pathname === "/dashboard" ||
    pathname.endsWith("/dashboard") ||
    protectedRoutePrefix.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
