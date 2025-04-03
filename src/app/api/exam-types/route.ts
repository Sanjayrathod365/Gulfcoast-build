import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const examTypes = await prisma.examType.findMany({
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(examTypes)
  } catch (error) {
    console.error("[EXAM_TYPES_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { name, description, duration } = body

    if (!name || !duration) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const examType = await prisma.examType.create({
      data: {
        name,
        description,
        duration,
      },
    })

    return NextResponse.json(examType)
  } catch (error) {
    console.error("[EXAM_TYPES_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 