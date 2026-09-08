"use client"

import { useState } from "react"
import Link from "next/link"

import { forgotPassword } from "@/services/auth"

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
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setMessage("")
    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    try {
      setIsSubmitting(true)

      const response = await forgotPassword({
        email: email.trim(),
      })

      setMessage(
        response.message ||
          "If an account exists for this email, a password reset link has been sent."
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send password reset link."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-strong shadow-xl">
      <CardHeader className="text-center">
        <CardTitle>Reset password</CardTitle>

        <CardDescription>
          Enter your registered email address
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="email">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              placeholder="teacher@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>

          {message && (
            <div
              role="status"
              className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-300"
            >
              {message}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <Button
            className="h-11 w-full text-base font-medium"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Sending..."
              : "Send Reset Link"}
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