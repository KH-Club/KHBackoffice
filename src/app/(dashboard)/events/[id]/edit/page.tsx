export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../../event-form"

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-5xl">
      <EventForm event={event} mode="edit" />
    </div>
  )
}
