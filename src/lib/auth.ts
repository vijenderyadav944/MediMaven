import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/lib/models/User";
import { z } from "zod";
import type { NextAuthConfig } from "next-auth";

async function getUser(email: string) {
  try {
    await connectToDatabase();
    return await User.findOne({ email });
  } catch (error) {
    throw new Error("Failed to fetch user.");
  }
}

// Edge-compatible config (no Node.js specific imports like bcrypt, mongoose)
// This is used by the middleware
export const authConfigEdge = {
  providers: [],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnPatientDashboard = nextUrl.pathname.startsWith('/patient');
      const isOnDoctorDashboard = nextUrl.pathname.startsWith('/doctor');
      const isOnAdminDashboard = nextUrl.pathname.startsWith('/admin');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');
      const isOnSession = nextUrl.pathname.startsWith('/session');

      // Protected routes that require authentication
      const isProtectedRoute = isOnDashboard || isOnPatientDashboard || isOnDoctorDashboard || isOnAdminDashboard || isOnSession;

      // 1. Redirect unauthenticated users trying to access protected routes
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirects to login
      }

      // 2. Redirect logged-in users trying to access auth pages (login/register)
      if (isLoggedIn && isOnAuth) {
        const role = (auth.user as any).role || 'patient';
        // Redirect to specific dashboard based on role
        if (role === 'admin') return Response.redirect(new URL('/admin/dashboard', nextUrl));
        if (role === 'doctor') return Response.redirect(new URL('/doctor/dashboard', nextUrl));
        return Response.redirect(new URL('/patient/dashboard', nextUrl));
      }

      return true;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

// Full config with credentials provider (used in route handlers, NOT middleware)
export const authConfig = {
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password || "");

          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAuth = nextUrl.pathname.startsWith('/auth');

      // 1. Redirect unauthenticated users trying to access dashboard
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirects to login
      }

      // 2. Redirect logged-in users trying to access auth pages (login/register)
      if (isLoggedIn && isOnAuth) {
        const role = (auth.user as any).role || 'patient';
        // Redirect to specific dashboard based on role
        if (role === 'admin') return Response.redirect(new URL('/admin/dashboard', nextUrl));
        if (role === 'doctor') return Response.redirect(new URL('/doctor/dashboard', nextUrl));
        return Response.redirect(new URL('/patient/dashboard', nextUrl));
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session?.user) {
        token.role = session.user.role;
        token.onboardingCompleted = session.user.onboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
