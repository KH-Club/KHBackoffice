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
import { deleteAlumniStudentVoiceImage } from "@/services/storage"
import type { AlumniStudentVoice } from "@/types/database"
import { VoiceImageUpload } from "./voice-image-upload"

interface VoiceFormProps {
  mode: "create" | "edit"
  voice?: AlumniStudentVoice
}

const MAX_PUBLISHED_VOICES = 3

export function VoiceForm({ mode, voice }: VoiceFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [isImageUploading, setIsImageUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: voice?.name ?? "",
    role: voice?.role ?? "",
    relation: voice?.relation ?? "",
    camp_year: voice?.camp_year ?? "",
    quote: voice?.quote ?? "",
    image_url: voice?.image_url ?? "",
    image_alt: voice?.image_alt ?? "",
    display_order: voice?.display_order ?? 0,
    is_published: voice?.is_published ?? false,
  })

  const handleChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validate = () => {
    if (!formData.name.trim()) return "Name is required."
    if (!formData.role.trim()) return "Role is required."
    if (!formData.quote.trim()) return "Quote is required."
    return null
  }

  const validatePublishedLimit = async () => {
    if (!formData.is_published) return null

    let query = supabase
      .from("alumni_student_voices")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)

    if (mode === "edit" && voice) {
      query = query.neq("id", voice.id)
    }

    const { count, error } = await query

    if (error) return error.message

    if ((count ?? 0) >= MAX_PUBLISHED_VOICES) {
      return `Only ${MAX_PUBLISHED_VOICES} voices can be published for the public Camp Voices section. Unpublish another voice first or save this one as a draft.`
    }

    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (isImageUploading) {
      setError("Wait until the portrait upload finishes before saving.")
      return
    }

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    const publishLimitError = await validatePublishedLimit()
    if (publishLimitError) {
      setError(publishLimitError)
      setLoading(false)
      return
    }

    const payload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      relation: formData.relation.trim() || null,
      camp_year: formData.camp_year.trim() || null,
      quote: formData.quote.trim(),
      image_url: formData.image_url.trim() || null,
      image_alt: formData.image_alt.trim() || null,
      display_order: formData.display_order,
      is_published: formData.is_published,
    }

    try {
      if (mode === "create") {
        const { error } = await supabase
          .from("alumni_student_voices")
          .insert(payload)

        if (error) throw error
        toast.success("Voice created successfully")
      } else {
        const { error } = await supabase
          .from("alumni_student_voices")
          .update(payload)
          .eq("id", voice!.id)

        if (error) throw error

        if (voice?.image_url && voice.image_url !== payload.image_url) {
          const deleted = await deleteAlumniStudentVoiceImage(voice.image_url)

          if (!deleted) {
            toast.warning(
              "Voice saved, but the previous portrait could not be removed from storage."
            )
          }
        }

        toast.success("Voice updated successfully")
      }

      router.push("/alumni-student-voices")
      router.refresh()
    } catch (err) {
      console.error("Save voice error:", err)
      setError(err instanceof Error ? err.message : "Failed to save voice")
    } finally {
      setLoading(false)
    }
  }

  const isSubmitDisabled = loading || isImageUploading
  let submitLabel = "Save Changes"

  if (isImageUploading) {
    submitLabel = "Uploading Portrait"
  } else if (mode === "create") {
    submitLabel = "Create Voice"
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/alumni-student-voices">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add Alumni/Student Voice" : "Edit Voice"}
            </h1>
            <p className="text-sm text-gray-500">
              Publish up to 3 short stories that appear in the public Camp
              Voices section.
            </p>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitDisabled}>
          {isSubmitDisabled ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {submitLabel}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(event) => handleChange("role", event.target.value)}
                  placeholder="e.g., Alumni, Student Volunteer"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="relation">Relation</Label>
                <Input
                  id="relation"
                  value={formData.relation}
                  onChange={(event) =>
                    handleChange("relation", event.target.value)
                  }
                  placeholder="e.g., Current volunteer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="camp_year">Camp Year</Label>
                <Input
                  id="camp_year"
                  value={formData.camp_year}
                  onChange={(event) =>
                    handleChange("camp_year", event.target.value)
                  }
                  placeholder="e.g., Academic year 2567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote">Quote *</Label>
              <Textarea
                id="quote"
                value={formData.quote}
                onChange={(event) => handleChange("quote", event.target.value)}
                rows={6}
                required
              />
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
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(event) =>
                    handleChange("display_order", Number(event.target.value))
                  }
                />
              </div>

              <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(event) =>
                    handleChange("is_published", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span>
                  <span className="block font-medium">Published</span>
                  <span className="text-gray-500">
                    KHWebpage shows the first 3 published voices by display
                    order.
                  </span>
                </span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Portrait</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <VoiceImageUpload
                imageUrl={formData.image_url}
                onImageChange={(url) => handleChange("image_url", url)}
                onUploadStateChange={setIsImageUploading}
              />
              <div className="space-y-2">
                <Label htmlFor="image_alt">Image Alt Text</Label>
                <Input
                  id="image_alt"
                  value={formData.image_alt}
                  onChange={(event) =>
                    handleChange("image_alt", event.target.value)
                  }
                  placeholder="Describe the portrait"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
