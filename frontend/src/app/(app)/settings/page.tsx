"use client"

import {
  useEffect,
  useState,
} from "react"

import {
  Eye,
  EyeOff,
  Loader2,
  Monitor,
  Moon,
  Save,
  Sun,
  UserRound,
} from "lucide-react"

import { useTheme } from "next-themes"

import {
  changePassword,
  getProfile,
  getSessionPreference,
  updateProfile,
  updateSessionPreference,
} from "@/services/settings"

import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import {
  notifyTeacherProfileUpdated,
} from "@/services/auth"

import {
  useSuccessDialog,
} from "@/components/success-dialog-provider"

export default function SettingsPage() {
  const { theme, setTheme } =
    useTheme()

  const [name, setName] =
    useState("")

  const [email, setEmail] =
    useState("")

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("")

  const [
    newPassword,
    setNewPassword,
  ] = useState("")

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("")

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false)

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false)

  const [loading, setLoading] =
    useState(true)

  const [
    savingProfile,
    setSavingProfile,
  ] = useState(false)

  const [
    changingPassword,
    setChangingPassword,
  ] = useState(false)

  const [error, setError] =
    useState("")

  const {
    showSuccess,
  } = useSuccessDialog()
  
  const [
    rememberMe,
    setRememberMe,
  ] = useState(false)

  const [
    changingSessionPreference,
    setChangingSessionPreference,
  ] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      try {
        const response =
          await getProfile()

        const sessionResponse =
          await getSessionPreference()

        if (cancelled) return

        setName(
          response.teacher.name
        )

        setEmail(
          response.teacher.email
        )

        setRememberMe(
          sessionResponse.rememberMe
        )
      } catch (error) {
        if (cancelled) return

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load profile."
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleProfileSave() {
    if (
      !name.trim() ||
      !email.trim()
    ) {
      setError(
        "Name and email are required."
      )
      return
    }

    try {
      setSavingProfile(true)
      setError("")

      const response =
        await updateProfile({
          name,
          email,
        })

      setName(
        response.teacher.name
      )

      setEmail(
        response.teacher.email
      )

      notifyTeacherProfileUpdated(
        response.teacher
      )

      showSuccess(
        "Profile updated successfully."
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update profile."
      )
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleRememberMeChange(
    checked: boolean
  ) {
    try {
      setChangingSessionPreference(
        true
      )

      setError("")

      const response =
        await updateSessionPreference(
          checked
        )

      setRememberMe(
        response.rememberMe
      )

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update login preference."
      )
    } finally {
      setChangingSessionPreference(
        false
      )
    }
  }

  async function handlePasswordChange() {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please complete all password fields."
      )
      return
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New passwords do not match."
      )
      return
    }

    if (
      newPassword.length < 8
    ) {
      setError(
        "New password must contain at least 8 characters."
      )
      return
    }

    try {
      setChangingPassword(true)
      setError("")

      await changePassword({
        currentPassword,
        newPassword,
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      showSuccess(
        "Password changed successfully."
      )
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to change password."
      )
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Loading settings...
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-1 text-sm font-medium text-primary">
          Account
        </p>

        <h1 className="text-3xl font-semibold tracking-tight">
          Settings & Profile
        </h1>

        <p className="mt-1 text-base text-muted-foreground">
          Manage your account and
          EduInsight preferences.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="size-5" />
              Teacher Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Teacher Name
              </label>

              <Input
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                className="h-11"
                disabled={
                  savingProfile
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email
              </label>

              <Input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                className="h-11"
                disabled={
                  savingProfile
                }
              />
            </div>

            <Button
              onClick={
                handleProfileSave
              }
              disabled={
                savingProfile
              }
              className="gap-2"
            >
              {savingProfile ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}

              {savingProfile
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">
              Appearance
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {[
              [
                "light",
                "Light",
                Sun,
              ],
              [
                "dark",
                "Dark",
                Moon,
              ],
              [
                "system",
                "System",
                Monitor,
              ],
            ].map(
              ([
                value,
                label,
                Icon,
              ]) => {
                const selected =
                  theme === value

                return (
                  <button
                    key={
                      value as string
                    }
                    type="button"
                    onClick={() =>
                      setTheme(
                        value as string
                      )
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-5" />
                    </div>

                    <div className="flex-1">
                      <p className="font-medium">
                        {
                          label as string
                        }
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {value ===
                        "system"
                          ? "Follow your device appearance"
                          : `Always use ${String(
                              value
                            )} mode`}
                      </p>
                    </div>

                    {selected && (
                      <div className="size-2.5 rounded-full bg-primary" />
                    )}
                  </button>
                )
              }
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">
            Security
          </CardTitle>
        </CardHeader>

        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <input
              id="remember-device"
              type="checkbox"
              checked={rememberMe}
              disabled={
                changingSessionPreference
              }
              onChange={(event) =>
                void handleRememberMeChange(
                  event.target.checked
                )
              }
              className="mt-1 size-4 rounded border-border accent-primary"
            />

            <div className="space-y-1">
              <label
                htmlFor="remember-device"
                className="cursor-pointer text-sm font-medium"
              >
                Keep me signed in on this device
              </label>

              <p className="text-sm text-muted-foreground">
                When enabled, EduInsight can keep you
                signed in on this device for up to
                30 days. Disable it when using a shared
                or public computer.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t" />

        <CardContent className="max-w-xl space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Current Password
            </label>

            <div className="relative">
              <Input
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={
                  currentPassword
                }
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                className="h-11 pr-10"
                disabled={
                  changingPassword
                }
              />

              <button
                type="button"
                aria-label={
                  showCurrentPassword
                    ? "Hide current password"
                    : "Show current password"
                }
                onClick={() =>
                  setShowCurrentPassword(
                    (current) =>
                      !current
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              New Password
            </label>

            <div className="relative">
              <Input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                className="h-11 pr-10"
                disabled={
                  changingPassword
                }
              />

              <button
                type="button"
                aria-label={
                  showNewPassword
                    ? "Hide new password"
                    : "Show new password"
                }
                onClick={() =>
                  setShowNewPassword(
                    (current) =>
                      !current
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Confirm New Password
            </label>

            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              className="h-11"
              disabled={
                changingPassword
              }
            />
          </div>

          <Button
            variant="outline"
            onClick={
              handlePasswordChange
            }
            disabled={
              changingPassword
            }
            className="gap-2"
          >
            {changingPassword && (
              <Loader2 className="size-4 animate-spin" />
            )}

            {changingPassword
              ? "Changing..."
              : "Change Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}