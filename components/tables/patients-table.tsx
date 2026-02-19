"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  PaginationState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Eye, Pencil, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react"
import type { PatientSearchResult } from "@/actions/patients"

const columnHelper = createColumnHelper<PatientSearchResult>()

function formatDate(date: Date | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getSexBadgeVariant(sex: string): "default" | "secondary" | "outline" {
  switch (sex) {
    case "MALE":
      return "default"
    case "FEMALE":
      return "secondary"
    default:
      return "outline"
  }
}

interface PatientsTableProps {
  patients: PatientSearchResult[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onStartEncounter?: (patientId: string) => void
  isLoading?: boolean
  canEdit?: boolean
  canStartEncounter?: boolean
}

export function PatientsTable({
  patients,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onStartEncounter,
  isLoading = false,
  canEdit = false,
  canStartEncounter = false,
}: PatientsTableProps) {
  const router = useRouter()

  const columns = [
    columnHelper.accessor("patientCode", {
      header: "Patient Code",
      cell: (info) => (
        <span className="font-mono text-sm">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor(
      (row) =>
        `${row.lastName}, ${row.firstName}${row.middleName ? ` ${row.middleName.charAt(0)}.` : ""}`,
      {
        id: "name",
        header: "Name",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }
    ),
    columnHelper.accessor("birthDate", {
      header: "Birthdate",
      cell: (info) => {
        const date = info.getValue()
        const age = calculateAge(date)
        return (
          <span>
            {formatDate(date)}{" "}
            <span className="text-muted-foreground">({age}y)</span>
          </span>
        )
      },
    }),
    columnHelper.accessor("sex", {
      header: "Sex",
      cell: (info) => (
        <Badge variant={getSexBadgeVariant(info.getValue())}>
          {info.getValue().charAt(0)}
        </Badge>
      ),
    }),
    columnHelper.accessor("phone", {
      header: "Phone",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("lastVisit", {
      header: "Last Visit",
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/patients/${info.row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            {canEdit && (
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/patients/${info.row.original.id}?edit=true`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {canStartEncounter && onStartEncounter && (
              <DropdownMenuItem
                onClick={() => onStartEncounter(info.row.original.id)}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Encounter
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]

  const table = useReactTable({
    data: patients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  })

  const totalPages = Math.ceil(total / pageSize)
  const startRecord = (page - 1) * pageSize + 1
  const endRecord = Math.min(page * pageSize, total)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {["Patient Code", "Name", "Birthdate", "Sex", "Phone", "Last Visit", ""].map(
                  (header) => (
                    <TableHead key={header}>{header}</TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No patients found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Showing {startRecord}-{endRecord} of {total}
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
