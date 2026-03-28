import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin sahifalarini himoyalash
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      if (!token || (token.role !== "admin" && token.role !== "superadmin" && token.role !== "moderator")) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    // Student sahifalarini himoyalash
    if (pathname.startsWith("/dashboard")) {
      if (!token || token.role !== "student") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Public sahifalar
        if (
          pathname === "/" ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/admin/login" ||
          pathname.startsWith("/results") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/public")
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
