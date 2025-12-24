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

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      if (trigger === "update" && session?.user) {
        // Allow updating session (e.g. after onboarding)
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
