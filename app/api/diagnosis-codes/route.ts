import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json(
      { ok: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json({
      ok: true,
      data: { codes: [] },
    })
  }

  const codes = await db.diagnosisCode.findMany({
    where: {
      isActive: true,
      OR: [
        { icd10Code: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      icd10Code: true,
      title: true,
    },
    take: 20,
    orderBy: { icd10Code: "asc" },
  })

  return NextResponse.json({
    ok: true,
    data: { codes },
  })
}
