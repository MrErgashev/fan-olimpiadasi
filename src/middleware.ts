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

    // Admin API larini himoyalash
    if (pathname.startsWith("/api/admin")) {
      if (!token || (token.role !== "admin" && token.role !== "superadmin" && token.role !== "moderator")) {
        return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
      }
    }

    // Student sahifalarini himoyalash
    if (pathname.startsWith("/dashboard")) {
      if (!token || token.role !== "student") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Student API larini himoyalash
    if (pathname.startsWith("/api/student")) {
      if (!token || token.role !== "student") {
        return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
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
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/student/:path*",
  ],
};
