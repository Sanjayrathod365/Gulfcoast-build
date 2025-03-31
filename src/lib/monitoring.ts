import { NextRequest } from 'next/server'

interface PerformanceMetric {
  name: string
  value: number
  timestamp: string
  tags?: Record<string, string>
}

interface ErrorReport {
  name: string
  message: string
  stack?: string
  timestamp: string
  request?: {
    method: string
    url: string
    userAgent?: string
  }
  tags?: Record<string, string>
}

class Monitoring {
  private static instance: Monitoring
  private metrics: PerformanceMetric[] = []
  private errors: ErrorReport[] = []
  private requestCounts: Map<string, number> = new Map()
  private errorCounts: Map<string, number> = new Map()

  private constructor() {}

  static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring()
    }
    return Monitoring.instance
  }

  // Performance monitoring
  recordMetric(name: string, value: number, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags
    }
    this.metrics.push(metric)
    console.log(`[Metric] ${name}: ${value}`, tags)
  }

  // Error monitoring
  recordError(error: Error, request?: NextRequest, tags?: Record<string, string>) {
    const errorReport: ErrorReport = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      request: request ? {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent') || undefined
      } : undefined,
      tags
    }
    this.errors.push(errorReport)
    console.error(`[Error] ${error.name}: ${error.message}`, tags)

    // Update error counts
    const errorKey = `${error.name}:${error.message}`
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1)
  }

  // Request monitoring
  recordRequest(request: NextRequest) {
    const key = `${request.method}:${request.url}`
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1)
  }

  // Get monitoring data
  getMetrics(): PerformanceMetric[] {
    return this.metrics
  }

  getErrors(): ErrorReport[] {
    return this.errors
  }

  getRequestCounts(): Map<string, number> {
    return this.requestCounts
  }

  getErrorCounts(): Map<string, number> {
    return this.errorCounts
  }

  // Clear monitoring data
  clearMetrics() {
    this.metrics = []
  }

  clearErrors() {
    this.errors = []
  }

  clearRequestCounts() {
    this.requestCounts.clear()
  }

  clearErrorCounts() {
    this.errorCounts.clear()
  }

  // Generate monitoring report
  generateReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: {
        total: this.metrics.length,
        byName: this.metrics.reduce((acc, metric) => {
          acc[metric.name] = (acc[metric.name] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      errors: {
        total: this.errors.length,
        byName: this.errorCounts
      },
      requests: {
        total: Array.from(this.requestCounts.values()).reduce((a, b) => a + b, 0),
        byEndpoint: Object.fromEntries(this.requestCounts)
      }
    }
    return JSON.stringify(report, null, 2)
  }
}

export const monitoring = Monitoring.getInstance() 