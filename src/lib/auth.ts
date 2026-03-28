import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 soat
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // O'quvchi login
    CredentialsProvider({
      id: "student-login",
      name: "Student",
      credentials: {
        phone: { label: "Telefon", type: "text" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        const student = await db.student.findUnique({
          where: { phone: credentials.phone },
        });

        if (!student) return null;
        if (student.isBlocked) return null;

        const isValid = await compare(credentials.password, student.password);
        if (!isValid) return null;

        return {
          id: student.id,
          phone: student.phone,
          firstName: student.firstName,
          lastName: student.lastName,
          role: "student" as const,
        };
      },
    }),
    // Admin login
    CredentialsProvider({
      id: "admin-login",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await db.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin) return null;

        const isValid = await compare(credentials.password, admin.password);
        if (!isValid) return null;

        return {
          id: admin.id,
          firstName: admin.fullName,
          role: admin.role as "admin" | "superadmin" | "moderator",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.phone = token.phone;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.role = token.role;
      return session;
    },
  },
};
