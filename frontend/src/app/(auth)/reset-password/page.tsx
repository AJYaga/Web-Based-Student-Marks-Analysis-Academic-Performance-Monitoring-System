"use client"

import {
  Suspense,
  useEffect,
  useState,
} from "react"
import Link from "next/link"
import {
  useRouter,
  useSearchParams,
} from "next/navigation"

import {
  resetPassword,
  validateResetToken,
} from "@/services/auth"

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

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const token =
    searchParams.get("token") || ""

  const [password, setPassword] =
    useState("")
  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [isValidating, setIsValidating] =
    useState(true)
  const [isValid, setIsValid] =
    useState(false)
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [message, setMessage] =
    useState("")
  const [error, setError] =
    useState("")

  useEffect(() => {
    let cancelled = false

    async function validate() {
      if (!token) {
        if (!cancelled) {
          setError(
            "Password reset link is missing or invalid."
          )
          setIsValidating(false)
        }

        return
      }

      try {
        await validateResetToken(token)

        if (!cancelled) {
          setIsValid(true)
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "This password reset link is invalid or has expired."
          )
        }
      } finally {
        if (!cancelled) {
          setIsValidating(false)
        }
      }
    }

    validate()

    return () => {
      cancelled = true
    }
  }, [token])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    setError("")
    setMessage("")

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      )
      return
    }

    try {
      setIsSubmitting(true)

      const response =
        await resetPassword({
          token,
          password,
        })

      setMessage(
        response.message ||
          "Password reset successfully."
      )

      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidating) {
    return (
      <Card className="glass-strong shadow-xl">
        <CardHeader className="text-center">
          <CardTitle>
            Checking reset link
          </CardTitle>

          <CardDescription>
            Please wait while we verify
            your password reset link.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!isValid) {
    return (
      <Card className="glass-strong shadow-xl">
        <CardHeader className="text-center">
          <CardTitle>
            Invalid reset link
          </CardTitle>

          <CardDescription>
            {error ||
              "This password reset link is invalid or has expired."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button
            className="h-11 w-full"
            render={
              <Link href="/forgot-password" />
            }
            nativeButton={false}
          >
            Request New Reset Link
          </Button>

          <p className="mt-4 text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-strong shadow-xl">
      <CardHeader className="text-center">
        <CardTitle>
          Create new password
        </CardTitle>

        <CardDescription>
          Enter and confirm your new
          EduInsight password.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="password">
              New Password
            </Label>

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              disabled={isSubmitting}
              className="h-11 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password
            </Label>

            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
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
              ? "Resetting..."
              : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card className="glass-strong shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>
              Loading
            </CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}