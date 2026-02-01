export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CampForm } from "../../camp-form"

interface EditCampPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCampPage({ params }: EditCampPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: camp, error } = await supabase
    .from("camps")
    .select("*")
    .eq("id", parseInt(id, 10))
    .single()

  if (error || !camp) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <CampForm camp={camp} mode="edit" />
    </div>
  )
}
