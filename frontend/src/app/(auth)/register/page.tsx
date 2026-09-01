import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  return (
    <Card className="glass-strong shadow-xl">
      <CardHeader className="text-center">
        <CardTitle>Create account</CardTitle>

        <CardDescription>
          Register as an EduInsight teacher
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Teacher name</Label>

            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              autoComplete="name"
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              placeholder="teacher@example.com"
              autoComplete="email"
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>

            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm password
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              className="h-11 text-base"
            />
          </div>

          <Button className="h-11 w-full text-base font-medium" type="submit">
            Create Account
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}