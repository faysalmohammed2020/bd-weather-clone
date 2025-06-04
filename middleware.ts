import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./i18n-config";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ============ i18n Logic ============
  // Check if the pathname has a supported locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Get preferred language from Accept-Language header or use default
    const acceptLanguage = request.headers.get("accept-language") || "";
    const preferredLanguage = acceptLanguage.split(",")[0].split("-")[0];

    // Check if preferred language is supported, otherwise use default
    const matchedLocale = i18n.locales.includes(preferredLanguage as any)
      ? preferredLanguage
      : i18n.defaultLocale;

    // Redirect to the appropriate locale
    return NextResponse.redirect(
      new URL(
        `/${matchedLocale}${
          pathname.startsWith("/") ? pathname : `/${pathname}`
        }`,
        request.url
      )
    );
  }

  // ============ Authentication Logic ============
  const session = await getSessionCookie(request);

  const authRoutePrefix = ["/sign-in", "/sign-up"];
  const protectedRoutePrefix: `/${string}/`[] = ["/dashboard/"];

  const isAuthRoute = authRoutePrefix.some((prefix) =>
    pathname.startsWith(prefix)
  );

  const isProtectedRoute =
    pathname === "/dashboard" ||
    protectedRoutePrefix.some((prefix) => pathname.startsWith(prefix));

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Combined matcher from both middlewares
  matcher: [
    "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};