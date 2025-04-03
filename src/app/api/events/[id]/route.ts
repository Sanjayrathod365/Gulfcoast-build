import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const event = await prisma.event.findUnique({
      where: {
        id: params.id
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("[EVENT_GET] Error", error)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, start, end, description, type, assignedToId } = body

    if (!title || !start || !end) {
      return NextResponse.json(
        { error: "Title, start date, and end date are required" },
        { status: 400 }
      )
    }

    const event = await prisma.event.update({
      where: {
        id: params.id
      },
      data: {
        title,
        start: new Date(start),
        end: new Date(end),
        description,
        type,
        assignedToId
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("[EVENT_PUT] Error", error)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    await prisma.event.delete({
      where: {
        id: params.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[EVENT_DELETE] Error", error)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
} 