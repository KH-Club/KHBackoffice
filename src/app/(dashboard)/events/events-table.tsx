"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Clock,
  Edit,
  Image as ImageIcon,
  MapPin,
  Megaphone,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Event, EventStatus, EventType } from "@/types/database"
import { DeleteEventButton } from "./delete-event-button"

interface EventsTableProps {
  events: Event[]
}

const typeLabels: Record<EventType, string> = {
  event: "Event",
  activity: "Activity",
  announcement: "Announcement",
}

const statusLabels: Record<EventStatus, string> = {
  upcoming: "Upcoming",
  completed: "Completed",
  announcement: "Announcement",
}

const statusStyles: Record<EventStatus, string> = {
  upcoming: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  announcement: "bg-amber-100 text-amber-700",
}

function getEventType(event: Event): EventType {
  return event.type ?? "event"
}

function getEventStatus(event: Event): EventStatus {
  if (event.status) return event.status

  if (event.type === "announcement") return "announcement"

  const eventDateKey = event.event_date.slice(0, 10)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDateKey)) return "completed"

  return eventDateKey >= todayKey ? "upcoming" : "completed"
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number)
  const date =
    year && month && day ? new Date(year, month - 1, day) : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getDeadlineLabel(value?: string | null) {
  if (!value) return "No deadline"

  const dateKey = value.slice(0, 10)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return "No deadline"

  const dayMs = 24 * 60 * 60 * 1000
  const daysLeft = Math.round(
    (new Date(`${dateKey}T00:00:00`).getTime() -
      new Date(`${todayKey}T00:00:00`).getTime()) /
      dayMs
  )

  if (daysLeft < 0) return "Closed"
  if (daysLeft === 0) return "Ends today"
  return daysLeft === 1 ? "1 day left" : `${daysLeft} days left`
}

export function EventsTable({ events }: EventsTableProps) {
  const [search, setSearch] = useState("")
  const query = search.toLowerCase()

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const type = getEventType(event)
        const status = getEventStatus(event)

        return (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          event.action_label?.toLowerCase().includes(query) ||
          event.action_url?.toLowerCase().includes(query) ||
          typeLabels[type].toLowerCase().includes(query) ||
          statusLabels[status].toLowerCase().includes(query)
        )
      }),
    [events, query]
  )

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Megaphone className="h-8 w-8 text-blue-600" />
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">
          No news or activities found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Add the first update for the public News & Activities page.
        </p>
        <Button asChild className="mt-6">
          <Link href="/events/new">Add First Item</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search title, location, category, or status..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 border-gray-200 bg-gray-50 pl-10"
          />
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {filteredEvents.length} of {events.length} items
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead>Item</TableHead>
              <TableHead className="w-36">Date</TableHead>
              <TableHead className="w-36">Deadline</TableHead>
              <TableHead className="w-32">Category</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-28">Publish</TableHead>
              <TableHead className="w-44 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.map((event, index) => {
              const type = getEventType(event)
              const status = getEventStatus(event)

              return (
                <TableRow
                  key={event.id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-20 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                        {event.img_src ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.img_src}
                            alt={`${event.title} preview`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="line-clamp-1 font-medium text-gray-900">
                          {event.title}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                          {event.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          )}
                          {event.description && (
                            <span className="line-clamp-1 max-w-sm">
                              {event.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(event.event_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700">
                      <Clock className="h-3.5 w-3.5" />
                      {getDeadlineLabel(event.end_date)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                      {typeLabels[type]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyles[status]}`}
                    >
                      {statusLabels[status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        event.is_published
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {event.is_published ? "Published" : "Draft"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/events/${event.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteEventButton
                        eventId={event.id}
                        title={event.title}
                        imageUrl={event.img_src}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">No results found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  )
}
