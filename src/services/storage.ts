import { createClient } from "@/lib/supabase/client"
import imageCompression from "browser-image-compression"

const BUCKET_NAME = "camps"
const MAX_FILE_SIZE_MB = 5 // Supabase bucket limit

/**
 * Convert camp ID to folder-safe name
 * e.g., 53.5 -> "53-5", 54 -> "54"
 */
export function getCampFolderName(campId: number): string {
  return campId.toString().replace(".", "-")
}

/**
 * Get public URL for a camp image
 */
export function getCampImageUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Compress image if it exceeds the max file size
 */
async function compressImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  const fileSizeMB = file.size / (1024 * 1024)
  
  // If file is already under limit, return as-is
  if (fileSizeMB <= MAX_FILE_SIZE_MB) {
    console.log(`File ${file.name} is ${formatFileSize(file.size)}, no compression needed`)
    return file
  }

  console.log(`Compressing ${file.name} from ${formatFileSize(file.size)}...`)

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: MAX_FILE_SIZE_MB - 0.5, // Target slightly under limit
      maxWidthOrHeight: 2048, // Max dimension
      useWebWorker: true,
      onProgress: (percent) => {
        onProgress?.(percent)
      },
    })

    console.log(`Compressed ${file.name} to ${formatFileSize(compressedFile.size)}`)
    return compressedFile
  } catch (error) {
    console.error("Compression failed:", error)
    throw new Error(`Failed to compress image: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

/**
 * Upload a camp image to Supabase Storage
 * Automatically compresses images larger than 5MB
 */
export async function uploadCampImage(
  file: File,
  campId: number,
  fileName?: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createClient()

  try {
    // Step 1: Compress if needed
    const fileSizeMB = file.size / (1024 * 1024)
    let processedFile = file

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      onProgress?.("compressing", 0)
      processedFile = await compressImage(file, (percent) => {
        onProgress?.("compressing", percent)
      })
      onProgress?.("compressing", 100)
    }

    // Step 2: Upload
    onProgress?.("uploading", 0)

    // Convert camp ID to folder-safe name (e.g., 53.5 -> 53-5)
    const folderName = getCampFolderName(campId)

    // Generate file name if not provided
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const name = fileName || `${Date.now()}.${ext}`
    const path = `main/${folderName}/${name}`

    onProgress?.("uploading", 30)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, processedFile, {
        cacheControl: "3600",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: uploadError.message }
    }

    onProgress?.("uploading", 100)

    // Get public URL
    const url = getCampImageUrl(path)

    return { url, path }
  } catch (error) {
    console.error("Upload failed:", error)
    return { error: error instanceof Error ? error.message : "Upload failed" }
  }
}

/**
 * Delete a camp image from Supabase Storage
 */
export async function deleteCampImage(imageUrl: string): Promise<boolean> {
  const supabase = createClient()

  try {
    // Extract path from URL
    const url = new URL(imageUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/camps\/(.+)/)
    
    if (!pathMatch) {
      console.warn("Could not extract path from URL:", imageUrl)
      return false
    }

    const path = pathMatch[1]

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

    if (error) {
      console.error("Delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete failed:", error)
    return false
  }
}

/**
 * List all images for a camp
 */
export async function listCampImages(campId: number): Promise<string[]> {
  const supabase = createClient()
  const folderName = getCampFolderName(campId)

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(`main/${folderName}`)

  if (error) {
    console.error("List error:", error)
    return []
  }

  if (!data) {
    return []
  }

  return data
    .filter((file) => !file.name.startsWith("."))
    .map((file) => getCampImageUrl(`main/${folderName}/${file.name}`))
}
