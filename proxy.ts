import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

const i18nMiddleware = createMiddleware(routing);

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isAuthenticated = Boolean(request.auth?.user?.id);
  const isAuthRoute = /\/(sign-in|sign-up)\/?$/.test(pathname);
  const isProtectedRoute = /\/dashboard(?:\/|$)/.test(pathname);
  const locale = routing.locales.find(
    (candidate) =>
      pathname === `/${candidate}` || pathname.startsWith(`/${candidate}/`),
  );
  const localizedPath = (path: string) =>
    locale ? `/${locale}${path}` : path;
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0];
  const host = forwardedHost ?? request.headers.get("host") ?? request.nextUrl.host;
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0];
  const protocol = forwardedProtocol ?? request.nextUrl.protocol.replace(":", "");
  const redirectUrl = (path: string) => new URL(path, `${protocol}://${host}`);

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(
      redirectUrl(localizedPath("/sign-in")),
    );
  }
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(
      redirectUrl(localizedPath("/dashboard")),
    );
  }

  return i18nMiddleware(request);
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
