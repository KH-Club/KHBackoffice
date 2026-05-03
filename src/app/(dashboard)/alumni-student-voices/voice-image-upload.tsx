"use client"

import { ChangeEvent, useState } from "react"
import { CheckCircle, Image as ImageIcon, Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"
import {
  deleteAlumniStudentVoiceImage,
  formatFileSize,
  uploadAlumniStudentVoiceImage,
} from "@/services/storage"
import { Button } from "@/components/ui/button"

interface VoiceImageUploadProps {
  imageUrl: string
  onImageChange: (url: string) => void
}

type UploadStage = "idle" | "compressing" | "uploading" | "done" | "error"

export function VoiceImageUpload({
  imageUrl,
  onImageChange,
}: VoiceImageUploadProps) {
  const [stage, setStage] = useState<UploadStage>("idle")
  const [progress, setProgress] = useState(0)
  const [fileSize, setFileSize] = useState<string | null>(null)

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    setFileSize(formatFileSize(file.size))
    setStage("uploading")
    setProgress(0)

    const result = await uploadAlumniStudentVoiceImage(
      file,
      undefined,
      (nextStage, nextProgress) => {
        setStage(nextStage as UploadStage)
        setProgress(nextProgress)
      }
    )

    if ("error" in result) {
      setStage("error")
      toast.error(result.error)
      return
    }

    setStage("done")
    onImageChange(result.url)
    toast.success("Voice image uploaded")
  }

  const handleRemove = async () => {
    if (imageUrl) {
      await deleteAlumniStudentVoiceImage(imageUrl)
    }

    onImageChange("")
    setStage("idle")
    setProgress(0)
    setFileSize(null)
  }

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="group relative aspect-square max-w-56 overflow-hidden rounded-xl border bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Alumni/student voice portrait preview"
            className="h-full w-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemove}
            className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </Button>
        </div>
      ) : (
        <label className="flex max-w-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center transition-colors hover:border-gray-300 hover:bg-gray-100">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={stage === "compressing" || stage === "uploading"}
            onChange={handleUpload}
          />
          {stage === "compressing" || stage === "uploading" ? (
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <span className="mt-3 text-sm font-medium text-gray-700">
            Upload portrait
          </span>
          <span className="mt-1 text-xs text-gray-500">
            JPG, PNG, WebP, or GIF
          </span>
        </label>
      )}

      {(stage === "compressing" || stage === "uploading" || stage === "done") && (
        <div className="max-w-56 rounded-lg border bg-gray-50 p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="capitalize">{stage}</span>
            {fileSize && <span>{fileSize}</span>}
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all ${
                stage === "done" ? "bg-emerald-500" : "bg-blue-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {stage === "done" && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle className="h-3 w-3" />
              Uploaded
            </p>
          )}
        </div>
      )}

      {stage === "error" && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <ImageIcon className="h-4 w-4" />
          Upload failed. Try another image.
        </p>
      )}
    </div>
  )
}
