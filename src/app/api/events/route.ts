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

    const events = await prisma.event.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        examType: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        start: "asc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("[EVENTS_GET]", error)
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
    const { title, start, end, description, type, assignedToId, examTypeId, patientId } = body

    if (!title || !start || !end) {
      return new NextResponse("Missing required fields", { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        start: new Date(start),
        end: new Date(end),
        description,
        type,
        assignedToId,
        examTypeId,
        patientId,
        status: "scheduled",
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        examType: {
          select: {
            id: true,
            name: true,
            duration: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("[EVENTS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 