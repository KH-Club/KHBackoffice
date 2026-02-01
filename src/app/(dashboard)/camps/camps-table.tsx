"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Camp } from "@/types/database"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Search,
  Image,
  MapPin,
  User,
} from "lucide-react"

interface CampsTableProps {
  camps: Camp[]
}

export function CampsTable({ camps }: CampsTableProps) {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filteredCamps = camps.filter(
    (camp) =>
      camp.name?.toLowerCase().includes(search.toLowerCase()) ||
      camp.location.toLowerCase().includes(search.toLowerCase()) ||
      camp.director.toLowerCase().includes(search.toLowerCase()) ||
      camp.camp_id.toString().includes(search)
  )

  if (camps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Image className="h-8 w-8 text-gray-400" />
        </div>
        <p className="mt-4 text-lg font-medium text-gray-900">
          No camps found
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Run the seed.sql script in Supabase or add your first camp.
        </p>
        <Button asChild className="mt-6">
          <Link href="/camps/new">Add First Camp</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Stats Bar */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, location, or director..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 border-gray-200 bg-gray-50 pl-10 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
            {filteredCamps.length} of {camps.length} camps
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80">
              <TableHead className="w-24 font-semibold text-gray-700">
                Camp ID
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Name</TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Director
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700">Date</TableHead>
              <TableHead className="w-24 text-center font-semibold text-gray-700">
                <div className="flex items-center justify-center gap-1">
                  <Image className="h-4 w-4" />
                  Images
                </div>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCamps.map((camp, index) => (
              <TableRow
                key={camp.id}
                onClick={() => router.push(`/camps/${camp.id}`)}
                className={`cursor-pointer transition-colors hover:bg-blue-50/50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
              >
                <TableCell>
                  <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1 text-sm font-bold text-white shadow-sm">
                    #{camp.camp_id}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-gray-900">
                    {camp.name || (
                      <span className="text-gray-400 italic">No name</span>
                    )}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs">
                  <span className="line-clamp-2 text-sm text-gray-600">
                    {camp.location || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-700">{camp.director || "-"}</span>
                </TableCell>
                <TableCell>
                  <span className="whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600">
                    {camp.date || "-"}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {(camp.img_src?.length ?? 0) > 0 ? (
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      {camp.img_src?.length}
                    </span>
                  ) : (
                    <span className="text-gray-400">0</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-gray-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/camps/${camp.id}`}
                          className="flex items-center"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/camps/${camp.id}/edit`}
                          className="flex items-center"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty search results */}
      {filteredCamps.length === 0 && camps.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <Search className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-4 font-medium text-gray-900">No results found</p>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search terms
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearch("")}
          >
            Clear search
          </Button>
        </div>
      )}
    </div>
  )
}
