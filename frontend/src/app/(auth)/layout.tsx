import Image from "next/image"
import { ThemeToggle } from "@/components/common/theme-toggle"
 
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative h-dvh overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 size-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>
 
      {/* Theme Toggle */}
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>
 
      {/* Split Screen */}
      <div className="relative grid h-dvh lg:grid-cols-2">
 
        {/* ================= LEFT SIDE ================= */}
        <section className="relative hidden h-dvh overflow-hidden bg-primary/[0.04] lg:flex">
          <div className="flex h-full w-full flex-col justify-center px-8 xl:px-12 2xl:px-16">
 
            {/* Logo */}
            <div className="mb-8 flex justify-center">
  <Image
    src="/images/logo/EduInsight.png"
    alt="EduInsight logo"
    width={280}
    height={280}
    className="h-auto w-60 object-contain xl:w-64"
    priority
  />
</div>
 
            {/* Heading */}
            <div className="max-w-2xl">
              <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
                Academic Performance
                <span className="block text-primary">
                  Monitoring System
                </span>
              </h1>
 
              {/* Blue underline */}
              <div className="mt-5 h-1.5 w-20 rounded-full bg-primary" />
 
              {/* Description */}
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground xl:text-lg">
                EduInsight helps educators monitor, analyze, and improve
                student academic performance through meaningful insights
                and data-driven decisions.
              </p>
            </div>
 
          </div>
        </section>
 
        {/* ================= RIGHT SIDE ================= */}
        <section className="flex h-dvh items-center justify-center overflow-hidden px-4 py-8 sm:px-8 lg:px-10">
 
          <div className="w-full max-w-xl">
            {children}
          </div>
 
        </section>
 
      </div>
    </main>
  )
}