"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { ImageUpload } from "@/components/image-upload"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Camp } from "@/types/database"

interface CampFormProps {
  camp?: Camp
  mode: "create" | "edit"
}

export function CampForm({ camp, mode }: CampFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    camp_id: camp?.camp_id ?? 0,
    name: camp?.name ?? "",
    location: camp?.location ?? "",
    province: camp?.province ?? "",
    director: camp?.director ?? "",
    date: camp?.date ?? "",
    img_src: camp?.img_src ?? [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === "create") {
        const { error } = await supabase.from("camps").insert({
          camp_id: formData.camp_id,
          name: formData.name || null,
          location: formData.location,
          province: formData.province || null,
          director: formData.director,
          date: formData.date,
          img_src: formData.img_src,
        })

        if (error) throw error
        toast.success("Camp created successfully!")
      } else {
        const { error } = await supabase
          .from("camps")
          .update({
            name: formData.name || null,
            location: formData.location,
            province: formData.province || null,
            director: formData.director,
            date: formData.date,
            img_src: formData.img_src,
          })
          .eq("id", camp!.id)

        if (error) throw error
        toast.success("Camp updated successfully!")
      }

      router.push("/camps")
      router.refresh()
    } catch (err) {
      console.error("Save error:", err)
      setError(err instanceof Error ? err.message : "Failed to save camp")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/camps">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add New Camp" : `Edit Camp #${camp?.camp_id}`}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === "create"
                ? "Create a new camp record"
                : "Update camp information"}
            </p>
          </div>
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {mode === "create" ? "Create Camp" : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="camp_id">Camp ID *</Label>
                <Input
                  id="camp_id"
                  type="number"
                  step="0.5"
                  value={formData.camp_id}
                  onChange={(e) =>
                    handleChange("camp_id", parseFloat(e.target.value))
                  }
                  required
                  disabled={mode === "edit"}
                  placeholder="e.g., 54"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  required
                  placeholder="e.g., ธ.ค. 2568"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Camp Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., ค่ายหอ@กาญจนบุรี"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Director *</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => handleChange("director", e.target.value)}
                required
                placeholder="e.g., ชื่อ นามสกุล"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Full Address *</Label>
              <Textarea
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
                placeholder="e.g., ร.ร.บ้านหนองหัวคู ต.หนองหัวคู อ.บ้านผือ จ.อุดรธานี"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => handleChange("province", e.target.value)}
                placeholder="e.g., Udon Thani"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Camp Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            campId={formData.camp_id || 0}
            dbRecordId={mode === "edit" ? camp?.id : undefined}
            images={formData.img_src}
            onImagesChange={(images) => handleChange("img_src", images)}
            maxImages={10}
          />
        </CardContent>
      </Card>
    </form>
  )
}
