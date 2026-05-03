export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VoiceForm } from "../../voice-form"

interface EditAlumniStudentVoicePageProps {
  params: Promise<{ id: string }>
}

export default async function EditAlumniStudentVoicePage({
  params,
}: EditAlumniStudentVoicePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: voice, error } = await supabase
    .from("alumni_student_voices")
    .select("*")
    .eq("id", Number(id))
    .single()

  if (error || !voice) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-5xl">
      <VoiceForm voice={voice} mode="edit" />
    </div>
  )
}
