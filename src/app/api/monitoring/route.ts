import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { monitoring } from '@/lib/monitoring'
import { sendApiResponse, requireRole } from '@/lib/api-utils'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    logger.info('Fetching monitoring data', request)
    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Unauthorized access attempt to fetch monitoring data', request)
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Only allow admin users to view monitoring data
    const roleCheck = requireRole(request, ['ADMIN'])
    if (roleCheck) {
      logger.warn('Role check failed for fetching monitoring data', request)
      return roleCheck
    }

    const report = monitoring.generateReport()
    logger.info('Successfully fetched monitoring data', request)
    return sendApiResponse(JSON.parse(report))
  } catch (error) {
    logger.error('Error fetching monitoring data', error as Error, request)
    return sendApiResponse(undefined, 'Internal server error', 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    logger.info('Clearing monitoring data', request)
    const session = await getServerSession(authOptions)

    if (!session) {
      logger.warn('Unauthorized access attempt to clear monitoring data', request)
      return sendApiResponse(undefined, 'Unauthorized', 401)
    }

    // Only allow admin users to clear monitoring data
    const roleCheck = requireRole(request, ['ADMIN'])
    if (roleCheck) {
      logger.warn('Role check failed for clearing monitoring data', request)
      return roleCheck
    }

    monitoring.clearMetrics()
    monitoring.clearErrors()
    monitoring.clearRequestCounts()
    monitoring.clearErrorCounts()

    logger.info('Successfully cleared monitoring data', request)
    return sendApiResponse({ message: 'Monitoring data cleared successfully' })
  } catch (error) {
    logger.error('Error clearing monitoring data', error as Error, request)
    return sendApiResponse(undefined, 'Internal server error', 500)
  }
} 