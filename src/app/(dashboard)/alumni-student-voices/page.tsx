export const dynamic = "force-dynamic"

import Link from "next/link"
import { MessageSquareQuote, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { VoicesTable } from "./voices-table"

export default async function AlumniStudentVoicesPage() {
  const supabase = await createClient()

  const { data: voices, error } = await supabase
    .from("alumni_student_voices")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <MessageSquareQuote className="h-8 w-8" />
            Alumni/Student Voices
          </h1>
          <p className="text-muted-foreground">
            Manage the 3 published stories shown in KHWebpage Camp Voices.
          </p>
        </div>
        <Button asChild>
          <Link href="/alumni-student-voices/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Voice
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Error loading alumni/student voices: {error.message}
          </p>
          <p className="mt-2 text-xs text-red-500">
            Create the alumni_student_voices table and storage bucket from
            docs/alumni-student-voices.md.
          </p>
        </div>
      ) : (
        <VoicesTable voices={voices ?? []} />
      )}
    </div>
  )
}
