import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Status {
  id: string
  name: string
  description: string | null
  color: string
  createdAt: Date
  updatedAt: Date
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const search = searchParams.get('search') || ''
    const color = searchParams.get('color') || ''

    // Build where clause for search and filters
    const where = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
              ]
            }
          : {},
        color ? { color: { equals: color, mode: 'insensitive' } } : {}
      ]
    }

    // Get all statuses for export
    const statuses = await prisma.status.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    // Format data based on requested format
    let responseData: string
    let contentType: string

    switch (format) {
      case 'csv':
        const headers = ['Name', 'Description', 'Color']
        const rows = statuses.map((status: Status) => [
          status.name,
          status.description,
          status.color
        ])
        responseData = [
          headers.join(','),
          ...rows.map((row: string[]) => row.join(','))
        ].join('\n')
        contentType = 'text/csv'
        break
      case 'json':
      default:
        responseData = JSON.stringify(statuses, null, 2)
        contentType = 'application/json'
    }

    return new NextResponse(responseData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="statuses.${format}"`
      }
    })
  } catch (error) {
    console.error('Error exporting statuses:', error)
    return NextResponse.json(
      { message: 'Error exporting statuses' },
      { status: 500 }
    )
  }
} 