"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import type { Event, EventStatus, EventType } from "@/types/database"
import { EventImageUpload } from "./event-image-upload"

interface EventFormProps {
  mode: "create" | "edit"
  event?: Event
}

const typeOptions: { label: string; value: EventType }[] = [
  { label: "Event", value: "event" },
  { label: "Activity", value: "activity" },
  { label: "Announcement", value: "announcement" },
]

const statusOptions: { label: string; value: EventStatus }[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Announcement", value: "announcement" },
]

function toDateInputValue(value?: string) {
  if (!value) return ""
  return value.slice(0, 10)
}

function isDateAfter(firstDate: string, secondDate: string) {
  if (!firstDate || !secondDate) return false
  return firstDate > secondDate
}

export function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    event_date: toDateInputValue(event?.event_date),
    start_date: toDateInputValue(event?.start_date ?? event?.event_date),
    end_date: toDateInputValue(event?.end_date ?? undefined),
    location: event?.location ?? "",
    img_src: event?.img_src ?? "",
    type: event?.type ?? ("event" as EventType),
    status: event?.status ?? ("upcoming" as EventStatus),
    action_label: event?.action_label ?? "",
    action_url: event?.action_url ?? "",
    is_published: event?.is_published ?? false,
  })

  const handleChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!formData.title.trim()) return "Title is required."
    if (!formData.event_date) return "Date is required."
    if (isDateAfter(formData.start_date, formData.end_date)) {
      return "Start date cannot be after the end date or deadline."
    }
    return null
  }

  const handleSubmit = async (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault()
    setError(null)

    if (isImageUploading) {
      setError("Wait until the image upload finishes before saving.")
      return
    }

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      event_date: formData.event_date,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      location: formData.location.trim() || null,
      img_src: formData.img_src.trim() || null,
      type: formData.type,
      status: formData.status,
      action_label: formData.action_label.trim() || null,
      action_url: formData.action_url.trim() || null,
      is_published: formData.is_published,
    }

    try {
      if (mode === "create") {
        const { error } = await supabase.from("events").insert(payload)

        if (error) throw error
        toast.success("News/activity item created successfully")
      } else {
        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", event!.id)

        if (error) throw error
        toast.success("News/activity item updated successfully")
      }

      router.push("/events")
      router.refresh()
    } catch (err) {
      console.error("Save news/activity error:", err)
      setError(err instanceof Error ? err.message : "Failed to save item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/events">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add News or Activity" : "Edit News or Activity"}
            </h1>
            <p className="text-sm text-gray-500">
              Publish updates for the public News & Activities page.
            </p>
          </div>
        </div>
        <Button type="submit" disabled={loading || isImageUploading}>
          {loading || isImageUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isImageUploading
            ? "Uploading Image"
            : mode === "create"
              ? "Create Item"
              : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(inputEvent) =>
                  handleChange("title", inputEvent.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(inputEvent) =>
                  handleChange("description", inputEvent.target.value)
                }
                rows={8}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="event_date">Display Date *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(inputEvent) =>
                    handleChange("event_date", inputEvent.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(inputEvent) =>
                    handleChange("start_date", inputEvent.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_date">End / Deadline</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(inputEvent) =>
                    handleChange("end_date", inputEvent.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(inputEvent) =>
                  handleChange("location", inputEvent.target.value)
                }
                placeholder="e.g., Camp site, online, or campus"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="action_label">Action Label</Label>
                <Input
                  id="action_label"
                  value={formData.action_label}
                  onChange={(inputEvent) =>
                    handleChange("action_label", inputEvent.target.value)
                  }
                  placeholder="e.g., Apply Now, Register, Read More"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="action_url">Action URL</Label>
                <Input
                  id="action_url"
                  value={formData.action_url}
                  onChange={(inputEvent) =>
                    handleChange("action_url", inputEvent.target.value)
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Category</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(inputEvent) =>
                    handleChange("type", inputEvent.target.value as EventType)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {typeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(inputEvent) =>
                    handleChange("status", inputEvent.target.value as EventStatus)
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(inputEvent) =>
                    handleChange("is_published", inputEvent.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>
                  <span className="block font-medium">Published</span>
                  <span className="text-gray-500">
                    Published items appear on KHWebpage.
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <EventImageUpload
                imageUrl={formData.img_src}
                onImageChange={(url) => handleChange("img_src", url)}
                onUploadStateChange={setIsImageUploading}
              />
              <p className="text-xs text-gray-500">
                Images upload to the news-activities Storage bucket and save as
                the public card image.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
