import type { NextAuthConfig } from "next-auth";

// Edge-compatible config (no Node.js specific imports like bcrypt, mongoose)
// This is used ONLY by the middleware
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
