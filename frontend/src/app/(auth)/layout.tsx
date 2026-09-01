import Image from "next/image"
import { ThemeToggle } from "@/components/common/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[-120px] top-[-100px] size-[360px] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-120px] right-[-100px] size-[360px] rounded-full bg-secondary/30 blur-3xl" />
      </div>

      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-lg space-y-7">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-20 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <Image
                src="/images/logo/EduInsight.png"
                alt="EduInsight logo"
                width={68}
                height={68}
                className="size-16 object-contain"
                priority
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            EduInsight
          </h1>

          <p className="mt-1 text-base text-muted-foreground">
            Academic Performance Monitoring System
          </p>
        </div>

        {children}
      </div>
    </main>
  )
}