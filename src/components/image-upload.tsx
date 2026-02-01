"use client"

import { useState, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle } from "lucide-react"
import { uploadCampImage, deleteCampImage, formatFileSize } from "@/services/storage"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface ImageUploadProps {
  campId: number
  /** Database record ID (for auto-save in edit mode) */
  dbRecordId?: number
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
}

interface UploadProgress {
  fileName: string
  stage: "compressing" | "uploading" | "done" | "error"
  progress: number
  error?: string
  originalSize?: number
}

export function ImageUpload({
  campId,
  dbRecordId,
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  /**
   * Auto-save img_src to database (only in edit mode when dbRecordId is provided)
   */
  const saveImagesToDatabase = useCallback(
    async (newImages: string[]) => {
      if (!dbRecordId) {
        console.log("No dbRecordId provided, skipping auto-save")
        return
      }

      try {
        const supabase = createClient()
        console.log("Saving images to database:", { dbRecordId, newImages })

        const { error } = await supabase
          .from("camps")
          .update({ img_src: newImages })
          .eq("id", dbRecordId)

        if (error) {
          console.error("Failed to save images to database:", error)
          toast.error("Failed to save images to database")
        } else {
          console.log("Images saved to database successfully")
          toast.success("Images saved")
        }
      } catch (err) {
        console.error("Database save error:", err)
        toast.error("Failed to save images")
      }
    },
    [dbRecordId]
  )

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (campId === 0) {
        alert("Please enter a Camp ID first before uploading images.")
        return
      }

      const filesToUpload = Array.from(files).slice(0, maxImages - images.length)
      if (filesToUpload.length === 0) return

      setUploading(true)
      setUploadProgress(
        filesToUpload.map((f) => ({
          fileName: f.name,
          stage: "uploading" as const,
          progress: 0,
          originalSize: f.size,
        }))
      )

      const newUrls: string[] = []

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i]

        try {
          const result = await uploadCampImage(
            file,
            campId,
            `${Date.now()}-${i}.${file.name.split(".").pop()}`,
            (stage, progress) => {
              setUploadProgress((prev) =>
                prev.map((p, idx) =>
                  idx === i
                    ? { ...p, stage: stage as "compressing" | "uploading", progress }
                    : p
                )
              )
            }
          )

          if ("url" in result) {
            newUrls.push(result.url)
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, stage: "done", progress: 100 } : p
              )
            )
          } else {
            setUploadProgress((prev) =>
              prev.map((p, idx) =>
                idx === i ? { ...p, stage: "error", error: result.error } : p
              )
            )
          }
        } catch (error) {
          setUploadProgress((prev) =>
            prev.map((p, idx) =>
              idx === i
                ? {
                  ...p,
                  stage: "error",
                  error: error instanceof Error ? error.message : "Upload failed",
                }
                : p
            )
          )
        }
      }

      // Update images after all uploads complete
      if (newUrls.length > 0) {
        const updatedImages = [...images, ...newUrls]
        onImagesChange(updatedImages)
        // Auto-save to database in edit mode
        await saveImagesToDatabase(updatedImages)
      }

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress([])
        setUploading(false)
      }, 2000)
    },
    [campId, images, maxImages, onImagesChange, saveImagesToDatabase]
  )

  const handleRemove = useCallback(
    async (index: number) => {
      const imageToRemove = images[index]

      // Try to delete from storage
      const deleted = await deleteCampImage(imageToRemove)
      console.log("Delete from storage:", { imageToRemove, deleted })

      // Remove from list
      const newImages = images.filter((_, i) => i !== index)
      onImagesChange(newImages)

      // Auto-save to database in edit mode
      await saveImagesToDatabase(newImages)
    },
    [images, onImagesChange, saveImagesToDatabase]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      handleUpload(e.dataTransfer.files)
    },
    [handleUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragOver
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
          } ${uploading ? "pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={uploading || images.length >= maxImages}
        />

        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-700">
              {uploading ? "Uploading images..." : "Drop images here or click to upload"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {images.length}/{maxImages} images
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2 rounded-lg border bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">Upload Progress</p>
          {uploadProgress.map((progress, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium">{progress.fileName}</span>
                  <span className="text-gray-500">
                    {progress.originalSize && formatFileSize(progress.originalSize)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full transition-all duration-300 ${progress.stage === "error"
                        ? "bg-red-500"
                        : progress.stage === "done"
                          ? "bg-green-500"
                          : progress.stage === "compressing"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                        }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <span className="w-24 text-xs text-gray-500">
                    {progress.stage === "error" ? (
                      <span className="text-red-600">Failed</span>
                    ) : progress.stage === "done" ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" /> Done
                      </span>
                    ) : progress.stage === "compressing" ? (
                      <span className="text-amber-600">Compressing...</span>
                    ) : (
                      "Uploading..."
                    )}
                  </span>
                </div>
                {progress.error && (
                  <p className="mt-1 text-xs text-red-600">{progress.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Camp image ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback for broken images
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image number badge */}
              <div className="absolute bottom-2 left-2 rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white">
                {index + 1}
              </div>
            </div>
          ))}

          {/* Add more placeholder */}
          {images.length < maxImages && !uploading && (
            <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 transition-colors hover:border-gray-300 hover:bg-gray-100">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleUpload(e.target.files)}
                className="hidden"
                disabled={uploading}
              />
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <ImageIcon className="h-8 w-8" />
                <span className="text-xs">Add more</span>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, WebP, GIF • Large images are automatically compressed
      </p>
    </div>
  )
}
