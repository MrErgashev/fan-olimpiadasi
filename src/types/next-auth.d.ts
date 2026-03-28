import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    role?: "student" | "admin" | "superadmin" | "moderator";
  }

  interface Session {
    user: {
      id: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      role?: "student" | "admin" | "superadmin" | "moderator";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    role?: "student" | "admin" | "superadmin" | "moderator";
  }
}
