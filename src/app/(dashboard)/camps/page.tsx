export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { CampsTable } from "./camps-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function CampsPage() {
  const supabase = await createClient()

  const { data: camps, error } = await supabase
    .from("camps")
    .select("*")
    .order("camp_id", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Camps</h1>
          <p className="text-muted-foreground">
            Manage all camp records in the database.
          </p>
        </div>
        <Button asChild>
          <Link href="/camps/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Camp
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">
            Error loading camps: {error.message}
          </p>
          <p className="mt-2 text-xs text-red-500">
            Make sure you have run the database migrations in Supabase.
          </p>
        </div>
      ) : (
        <CampsTable camps={camps ?? []} />
      )}
    </div>
  )
}
