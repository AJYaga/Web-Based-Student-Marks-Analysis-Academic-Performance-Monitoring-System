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

export default function ForgotPasswordPage() {
  return (
    <Card className="glass-strong shadow-xl">
      <CardHeader className="text-center">
        <CardTitle>Reset password</CardTitle>

        <CardDescription>
          Enter your registered email address
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4">
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

          <Button className="h-11 w-full text-base font-medium" type="submit">
            Send Reset Link
          </Button>

          <p className="text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}