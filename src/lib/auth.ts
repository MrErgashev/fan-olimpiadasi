import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { randomUUID } from "crypto";
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

        // Check if temporary block has expired
        if (student.isBlocked && student.blockedUntil && new Date() > student.blockedUntil) {
          await db.student.update({
            where: { id: student.id },
            data: { isBlocked: false, blockedAt: null, blockedReason: null, blockedUntil: null },
          });
        } else if (student.isBlocked) {
          return null;
        }

        const isValid = await compare(credentials.password, student.password);
        if (!isValid) return null;

        // Yangi sessiya yaratish — eski sessiyalarni o'chirish (1 qurilma = 1 sessiya)
        const sessionToken = randomUUID();
        await db.$transaction([
          db.activeSession.deleteMany({ where: { studentId: student.id } }),
          db.activeSession.create({
            data: {
              studentId: student.id,
              sessionToken,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
          }),
        ]);

        // Muddati o'tgan sessiyalarni tozalash (fire-and-forget)
        db.activeSession.deleteMany({
          where: { expiresAt: { lt: new Date() } },
        }).catch(() => {});

        return {
          id: student.id,
          phone: student.phone,
          firstName: student.firstName,
          lastName: student.lastName,
          role: "student" as const,
          sessionToken,
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
        token.sessionToken = user.sessionToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Student sessiyalarini bazadan validatsiya qilish
      if (token.role === "student" && token.sessionToken) {
        const activeSession = await db.activeSession.findUnique({
          where: { sessionToken: token.sessionToken },
        });
        if (!activeSession) {
          // Sessiya bekor qilingan (boshqa qurilmada login qilingan)
          session.user.id = "";
          session.user.role = undefined;
          return session;
        }
      }

      session.user.id = token.id;
      session.user.phone = token.phone;
      session.user.firstName = token.firstName;
      session.user.lastName = token.lastName;
      session.user.role = token.role;
      session.user.sessionToken = token.sessionToken;
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Student chiqishda bazadan sessiyani o'chirish
      if (token?.role === "student" && token?.sessionToken) {
        await db.activeSession.deleteMany({
          where: { sessionToken: token.sessionToken as string },
        }).catch(() => {});
      }
    },
  },
};
