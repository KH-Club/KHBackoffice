"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Image as ImageIcon, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { AlumniStudentVoice } from "@/types/database"
import { DeleteVoiceButton } from "./delete-voice-button"

interface VoicesTableProps {
  voices: AlumniStudentVoice[]
}

export function VoicesTable({ voices }: VoicesTableProps) {
  const [search, setSearch] = useState("")
  const query = search.toLowerCase()

  const filteredVoices = voices.filter(
    (voice) =>
      voice.name.toLowerCase().includes(query) ||
      voice.role.toLowerCase().includes(query) ||
      voice.quote.toLowerCase().includes(query) ||
      voice.relation?.toLowerCase().includes(query) ||
      voice.camp_year?.toLowerCase().includes(query)
  )

  if (voices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">
          No voices found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Add the first alumni or student voice for the public homepage.
        </p>
        <Button asChild className="mt-6">
          <Link href="/alumni-student-voices/new">Add First Voice</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, role, or quote..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 border-gray-200 bg-gray-50 pl-10"
          />
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
          {filteredVoices.length} of {voices.length} voices
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-20">Order</TableHead>
              <TableHead>Voice</TableHead>
              <TableHead>Quote</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-48 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVoices.map((voice, index) => (
              <TableRow key={voice.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                <TableCell>
                  <span className="font-mono text-sm text-gray-600">
                    {voice.display_order}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {voice.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={voice.image_url}
                          alt={voice.image_alt || `${voice.name} portrait`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{voice.name}</p>
                      <p className="text-sm text-gray-500">{voice.role}</p>
                      {(voice.relation || voice.camp_year) && (
                        <p className="text-xs text-gray-400">
                          {[voice.relation, voice.camp_year]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="line-clamp-2 text-sm text-gray-600">
                    {voice.quote}
                  </p>
                </TableCell>
                <TableCell>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      voice.is_published
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {voice.is_published ? "Published" : "Draft"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/alumni-student-voices/${voice.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <DeleteVoiceButton
                      voiceId={voice.id}
                      voiceName={voice.name}
                      imageUrl={voice.image_url}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredVoices.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">No results found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
            Clear search
          </Button>
        </div>
      )}
    </div>
  )
}
