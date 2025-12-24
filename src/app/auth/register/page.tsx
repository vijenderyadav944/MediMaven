"use client"

import Link from "next/link"
import * as React from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast" // I need to install toast or createsit. Shadcn default is `use-toast`.

// Since I haven't installed toast explicitly (wait, I did not run the toast add command), I will mock it or install it. 
// I'll assume simple alerts for now or install toast in the next step. I'll stick to simple state.

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData) as any

    const result = await registerUser(data)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      // Success
      router.push("/auth/login?registered=true")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 text-center items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <Stethoscope className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to get started with MediMaven
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>

            {error && (
              <div className="text-sm text-destructive font-medium text-center">
                {error}
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
