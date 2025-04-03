import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const procedures = await prisma.procedure.findMany({
      where: {
        scheduleDate: {
          not: undefined,
        },
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        exam: {
          select: {
            id: true,
            name: true,
          },
        },
        facility: {
          select: {
            id: true,
            name: true,
          },
        },
        physician: {
          select: {
            id: true,
            name: true,
          },
        },
        status: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        {
          scheduleDate: 'asc',
        },
        {
          scheduleTime: 'asc',
        },
      ],
    });

    // Format the procedures to ensure consistent date/time format
    const formattedProcedures = procedures.map(proc => {
      if (!proc.scheduleDate) {
        return null;
      }

      try {
        const scheduleDate = new Date(proc.scheduleDate);
        return {
          ...proc,
          scheduleDate: scheduleDate.toISOString().split('T')[0],
          scheduleTime: proc.scheduleTime || '00:00:00',
        };
      } catch (error) {
        console.error('Error formatting procedure date:', error);
        return null;
      }
    }).filter(Boolean); // Remove any null values

    console.log('Formatted procedures:', formattedProcedures); // Debug log

    return NextResponse.json(formattedProcedures);
  } catch (error) {
    console.error("[PROCEDURES_SCHEDULED_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 