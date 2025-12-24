"use client"

import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"
import { authenticate } from "@/app/auth/actions-login" // Will create this next
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, Loader2 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 text-center items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function LoginForm() {
  // Using simple form submission for now to match NextAuth credentials flow
  // Need to handle client-side form submission to call signIn

  // Actually, standard NextAuth pattern with Server Actions is nuanced. 
  // I will use a simple client-side handler calling signIn() for simplicity and reliability.

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // I can't call signIn directly here if I want nice error handling without redirect loop issues sometimes. 
    // But let's try the standard `signIn` import from `next-auth/react` (Wait, I only installed `next-auth@beta` which is v5).
    // v5 uses server actions or `signIn` from `@/auth`.
    // I will implement the action in `actions-login.ts` properly using the `signIn` exported from `@/lib/auth`.
  }

  // REVISION: I will use a Server Action `authenticate` in `actions-login.ts`

  return (
    <form action={authenticate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="m@example.com" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
        </div>
        <Input id="password" name="password" type="password" required />
      </div>
      <LoginButton />
    </form>
  )
}

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Sign in
    </Button>
  )
}
