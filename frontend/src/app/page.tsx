import { ThemeToggle } from "@/components/common/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">
              EduInsight
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Design System
            </h1>

            <p className="text-muted-foreground">
              Light, dark and system theme preview.
            </p>
          </div>

          <ThemeToggle />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass interactive">
            <CardHeader>
              <CardTitle>Total Students</CardTitle>
              <CardDescription>
                Currently registered
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">
                40
              </p>
            </CardContent>
          </Card>

          <Card className="glass interactive">
            <CardHeader>
              <CardTitle>Class Average</CardTitle>
              <CardDescription>
                Current examination
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">
                78.4%
              </p>
            </CardContent>
          </Card>

          <Card className="glass interactive">
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
              <CardDescription>
                Below performance threshold
              </CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-3xl font-semibold">
                4
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button>
            Primary Action
          </Button>

          <Button variant="secondary">
            Secondary
          </Button>

          <Button variant="outline">
            Outline
          </Button>

          <Button variant="destructive">
            Delete
          </Button>
        </div>
      </div>
    </main>
  )
}