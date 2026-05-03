export const dynamic = "force-dynamic"

import Link from "next/link"
import { CalendarDays, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { EventsTable } from "./events-table"

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date", { ascending: false })
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <CalendarDays className="h-8 w-8 text-primary" />
            News & Activities
          </h1>
          <p className="text-muted-foreground">
            Manage public camp updates, upcoming events, completed activities,
            and announcements.
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Error loading news and activities: {error.message}
          </p>
          <p className="mt-2 text-xs text-red-500">
            Apply the setup SQL in docs/news-activities.md if the events table
            has not been updated yet.
          </p>
        </div>
      ) : (
        <EventsTable events={events ?? []} />
      )}
    </div>
  )
}
