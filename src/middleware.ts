import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function authSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    // On Vercel (HTTPS), Auth.js sets `__Secure-authjs.session-token`.
    // getToken defaults to the non-prefixed name unless secureCookie is true.
    const secureCookie =
      req.nextUrl.protocol === "https:" || process.env.VERCEL === "1";

    const token = await getToken({
      req,
      secret: authSecret(),
      secureCookie,
    });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
