"use client"

import { useState } from "react"
import {
  Monitor,
  Moon,
  Save,
  Sun,
  UserRound,
} from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const [name, setName] = useState("Teacher")
  const [email, setEmail] = useState("teacher@example.com")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)

    setTimeout(() => {
      setSaved(false)
    }, 2500)
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
          Manage your account and EduInsight preferences.
        </p>
      </div>

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
                onChange={(e) => setName(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Email
              </label>

              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>

            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="size-4" />
              Save Changes
            </Button>

            {saved && (
              <p className="text-sm font-medium text-secondary-foreground">
                Profile updated successfully.
              </p>
            )}
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
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
              ["system", "System", Monitor],
            ].map(([value, label, Icon]) => {
              const selected = theme === value

              return (
                <button
                  key={value as string}
                  type="button"
                  onClick={() => setTheme(value as string)}
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
                      {label as string}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {value === "system"
                        ? "Follow your device appearance"
                        : `Always use ${String(value)} mode`}
                    </p>
                  </div>

                  {selected && (
                    <div className="size-2.5 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-lg">
            Security
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Button variant="outline">
            Change Password
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}