export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  Pencil,
  MapPin,
  User,
  Calendar,
  Hash,
  Image as ImageIcon,
} from "lucide-react"
import { DeleteCampButton } from "./delete-button"

interface CampDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function CampDetailPage({ params }: CampDetailPageProps) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/camps">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-lg font-bold text-white">
                #{camp.camp_id}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">
                {camp.name || "Unnamed Camp"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">{camp.date}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/camps/${camp.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteCampButton campId={camp.id} campName={camp.name || `Camp #${camp.camp_id}`} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Camp Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Camp ID</p>
                    <p className="font-semibold">{camp.camp_id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="font-semibold">{camp.date || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Director</p>
                    <p className="font-semibold">{camp.director || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-amber-100 p-2">
                    <MapPin className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Province</p>
                    <p className="font-semibold">{camp.province || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Full Location
                    </p>
                    <p className="font-semibold">{camp.location || "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Camp Images ({camp.img_src?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {camp.img_src && camp.img_src.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {camp.img_src.map((src, index) => (
                    <a
                      key={index}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Camp ${camp.camp_id} image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                        {index + 1}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
                  <ImageIcon className="h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-sm text-gray-500">No images uploaded</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={`/camps/${camp.id}/edit`}>Add Images</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/camps/${camp.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Camp
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <a
                  href={`${process.env.NEXT_PUBLIC_WEBSITE_URL}/camp/${camp.camp_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View on Website
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Database ID</p>
                <p className="font-mono">{camp.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Created</p>
                <p>{new Date(camp.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{new Date(camp.updated_at).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
