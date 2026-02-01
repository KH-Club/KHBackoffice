import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export default function EventsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Manage upcoming and past events.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            The events management feature is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This page will allow you to:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Create and manage events</li>
            <li>Set event dates and locations</li>
            <li>Upload event images</li>
            <li>Publish or unpublish events</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
