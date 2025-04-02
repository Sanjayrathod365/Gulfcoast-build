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
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const task = await prisma.task.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!task) {
      return new NextResponse("Task not found", { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const { title, description, status, priority, dueDate } = body

    if (!title) {
      return new NextResponse("Title is required", { status: 400 })
    }

    const task = await prisma.task.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASK_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    await prisma.task.delete({
      where: {
        id: params.id,
      },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASK_DELETE]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 