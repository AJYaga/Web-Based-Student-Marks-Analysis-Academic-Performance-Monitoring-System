"use client"

import { Bell, Search } from "lucide-react"

import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-3 border-b border-border/70 bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <SidebarTrigger />

      <div className="hidden h-5 w-px bg-border sm:block" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-medium text-foreground">
          EduInsight
        </p>

        <p className="hidden truncate text-sm text-muted-foreground sm:block">
          Academic Performance Monitoring
        </p>
      </div>

      <div className="hidden w-full max-w-xs md:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            placeholder="Search..."
            className="h-9 bg-background/70 pl-9"
            aria-label="Search EduInsight"
          />
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
      </Button>

      <ThemeToggle />

      <Button
        variant="ghost"
        className="size-9 rounded-full p-0"
        aria-label="Open profile menu"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          T
        </span>
      </Button>
    </header>
  )
}