import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

export default NextAuth(authConfig).auth;

export const config = {
  // Exclude public assets, public pages.
  // We WANT to run middleware on /auth pages to redirect logged-in users.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
