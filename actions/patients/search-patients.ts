"use server"

import { db } from "@/lib/db"
import { requireRoleForAction } from "@/lib/auth/guards"
import { searchPatientsSchema, type SearchPatientsInput } from "@/lib/validators/patient"
import type { ActionResult } from "@/lib/auth/types"
import { Sex } from "@prisma/client"

export type PatientSearchResult = {
  id: string
  patientCode: string
  firstName: string
  middleName: string | null
  lastName: string
  birthDate: Date
  sex: Sex
  phone: string | null
  encounterCount: number
  lastVisit: Date | null
}

export type SearchPatientsResponse = {
  patients: PatientSearchResult[]
  total: number
  page: number
  pageSize: number
}

export async function searchPatientsAction(
  input: SearchPatientsInput
): Promise<ActionResult<SearchPatientsResponse>> {
  await requireRoleForAction(["REGISTRATION", "TRIAGE", "DOCTOR"])

  const parsed = searchPatientsSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid search parameters",
      },
    }
  }

  const { query, page, pageSize } = parsed.data
  const skip = (page - 1) * pageSize

  // Check if query is a date (YYYY-MM-DD or MM/DD/YYYY format)
  let birthDateFilter: Date | null = null
  if (query) {
    // Try YYYY-MM-DD format
    const isoMatch = query.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (isoMatch) {
      const parsed = new Date(query)
      if (!isNaN(parsed.getTime())) {
        birthDateFilter = parsed
      }
    }
    // Try MM/DD/YYYY format
    const usMatch = query.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (usMatch) {
      const [, month, day, year] = usMatch
      const parsed = new Date(Number(year), Number(month) - 1, Number(day))
      if (!isNaN(parsed.getTime())) {
        birthDateFilter = parsed
      }
    }
  }

  const orConditions: object[] = query
    ? [
        { lastName: { contains: query, mode: "insensitive" as const } },
        { firstName: { contains: query, mode: "insensitive" as const } },
        { phone: { contains: query } },
        { patientCode: { contains: query, mode: "insensitive" as const } },
      ]
    : []

  // Add birthDate search if query matches a date format
  if (birthDateFilter) {
    // Match exact date (compare just the date portion)
    const startOfDay = new Date(birthDateFilter)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(birthDateFilter)
    endOfDay.setHours(23, 59, 59, 999)
    orConditions.push({ birthDate: { gte: startOfDay, lte: endOfDay } })
  }

  const whereClause = {
    deletedAt: null,
    ...(orConditions.length > 0 ? { OR: orConditions } : {}),
  }

  const [patients, total] = await Promise.all([
    db.patient.findMany({
      where: whereClause,
      select: {
        id: true,
        patientCode: true,
        firstName: true,
        middleName: true,
        lastName: true,
        birthDate: true,
        sex: true,
        phone: true,
        _count: {
          select: { encounters: true },
        },
        encounters: {
          orderBy: { occurredAt: "desc" },
          take: 1,
          select: { occurredAt: true },
        },
      },
      orderBy: { lastName: "asc" },
      skip,
      take: pageSize,
    }),
    db.patient.count({ where: whereClause }),
  ])

  const results: PatientSearchResult[] = patients.map((p) => ({
    id: p.id,
    patientCode: p.patientCode,
    firstName: p.firstName,
    middleName: p.middleName,
    lastName: p.lastName,
    birthDate: p.birthDate,
    sex: p.sex,
    phone: p.phone,
    encounterCount: p._count.encounters,
    lastVisit: p.encounters[0]?.occurredAt ?? null,
  }))

  return {
    ok: true,
    data: {
      patients: results,
      total,
      page,
      pageSize,
    },
  }
}
