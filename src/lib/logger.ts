import { NextRequest } from 'next/server'

type LogLevel = 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  request?: {
    method: string
    url: string
    ip?: string
    userAgent?: string
  }
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify({
      ...entry,
      timestamp: new Date().toISOString()
    })
  }

  private log(level: LogLevel, message: string, request?: NextRequest, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      request: request ? {
        method: request.method,
        url: request.url,
        userAgent: request.headers.get('user-agent') || undefined
      } : undefined,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }

    // In production, you would send this to a logging service
    console.log(this.formatLog(entry))
    this.logs.push(entry)
  }

  info(message: string, request?: NextRequest) {
    this.log('info', message, request)
  }

  warn(message: string, request?: NextRequest) {
    this.log('warn', message, request)
  }

  error(message: string, error: Error, request?: NextRequest) {
    this.log('error', message, request, error)
  }

  getLogs(): LogEntry[] {
    return this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = Logger.getInstance() 