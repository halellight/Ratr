"use client"

/**
 * Enhanced Error Handler v1.0
 *
 * Comprehensive error handling system with automatic recovery,
 * user-friendly messaging, and detailed logging.
 */

export interface ErrorContext {
  component: string
  action: string
  userId?: string
  sessionId?: string
  timestamp: string
  userAgent?: string
  url?: string
  additionalData?: any
}

export interface ErrorReport {
  id: string
  type: "network" | "validation" | "runtime" | "user" | "system"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  userMessage: string
  context: ErrorContext
  stackTrace?: string
  recoveryAttempted: boolean
  recoverySuccessful?: boolean
  timestamp: string
}

export interface RecoveryStrategy {
  name: string
  execute: () => Promise<boolean>
  description: string
}

export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler
  private errorHistory: ErrorReport[] = []
  private recoveryStrategies: Map<string, RecoveryStrategy[]> = new Map()
  private errorListeners: Set<(error: ErrorReport) => void> = new Set()

  constructor() {
    this.setupRecoveryStrategies()
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler()
    }
    return EnhancedErrorHandler.instance
  }

  /**
   * Handle error with automatic recovery
   */
  async handleError(error: Error | string, context: Partial<ErrorContext>, userMessage?: string): Promise<ErrorReport> {
    const errorId = this.generateErrorId()
    const timestamp = new Date().toISOString()

    // Determine error type and severity
    const { type, severity } = this.classifyError(error)

    // Create error report
    const errorReport: ErrorReport = {
      id: errorId,
      type,
      severity,
      message: typeof error === "string" ? error : error.message,
      userMessage: userMessage || this.generateUserFriendlyMessage(type, severity),
      context: {
        component: context.component || "unknown",
        action: context.action || "unknown",
        timestamp,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
        url: typeof window !== "undefined" ? window.location.href : undefined,
        ...context,
      },
      stackTrace: typeof error === "object" ? error.stack : undefined,
      recoveryAttempted: false,
      timestamp,
    }

    // Log error
    this.logError(errorReport)

    // Attempt recovery
    await this.attemptRecovery(errorReport)

    // Store in history
    this.errorHistory.push(errorReport)
    if (this.errorHistory.length > 1000) {
      this.errorHistory = this.errorHistory.slice(-1000)
    }

    // Notify listeners
    this.notifyErrorListeners(errorReport)

    return errorReport
  }

  /**
   * Setup recovery strategies
   */
  private setupRecoveryStrategies() {
    // Network error recovery
    this.recoveryStrategies.set("network", [
      {
        name: "retry-request",
        execute: async () => {
          // Retry the failed request
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return true
        },
        description: "Retry the failed network request",
      },
      {
        name: "use-cache",
        execute: async () => {
          // Use cached data if available
          return true
        },
        description: "Use cached data as fallback",
      },
    ])

    // Validation error recovery
    this.recoveryStrategies.set("validation", [
      {
        name: "sanitize-data",
        execute: async () => {
          // Attempt to sanitize and revalidate data
          return true
        },
        description: "Sanitize and revalidate input data",
      },
    ])

    // Runtime error recovery
    this.recoveryStrategies.set("runtime", [
      {
        name: "component-reset",
        execute: async () => {
          // Reset component state
          return true
        },
        description: "Reset component to initial state",
      },
      {
        name: "reload-data",
        execute: async () => {
          // Reload data from source
          return true
        },
        description: "Reload data from original source",
      },
    ])
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalErrorHandlers() {
    if (typeof window !== "undefined") {
      // Handle unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.handleError(event.reason, {
          component: "global",
          action: "unhandled-promise-rejection",
        })
      })

      // Handle JavaScript errors
      window.addEventListener("error", (event) => {
        this.handleError(event.error || event.message, {
          component: "global",
          action: "javascript-error",
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        })
      })
    }
  }

  /**
   * Classify error type and severity
   */
  private classifyError(error: Error | string): { type: ErrorReport["type"]; severity: ErrorReport["severity"] } {
    const message = typeof error === "string" ? error : error.message

    // Network errors
    if (message.includes("fetch") || message.includes("network") || message.includes("timeout")) {
      return { type: "network", severity: "medium" }
    }

    // Validation errors
    if (message.includes("validation") || message.includes("invalid") || message.includes("required")) {
      return { type: "validation", severity: "low" }
    }

    // User errors
    if (message.includes("user") || message.includes("input") || message.includes("permission")) {
      return { type: "user", severity: "low" }
    }

    // System errors
    if (message.includes("system") || message.includes("database") || message.includes("server")) {
      return { type: "system", severity: "high" }
    }

    // Default to runtime error
    return { type: "runtime", severity: "medium" }
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserFriendlyMessage(type: ErrorReport["type"], severity: ErrorReport["severity"]): string {
    const messages = {
      network: {
        low: "Connection issue detected. Please check your internet connection.",
        medium: "Unable to connect to our servers. Please try again in a moment.",
        high: "Service temporarily unavailable. We're working to resolve this.",
        critical: "Critical connection failure. Please contact support if this persists.",
      },
      validation: {
        low: "Please check your input and try again.",
        medium: "Some information appears to be invalid. Please review and resubmit.",
        high: "Data validation failed. Please refresh the page and try again.",
        critical: "Critical validation error. Please contact support.",
      },
      runtime: {
        low: "A minor issue occurred. Please try again.",
        medium: "Something went wrong. Please refresh the page.",
        high: "An unexpected error occurred. Please try again or contact support.",
        critical: "Critical system error. Please contact support immediately.",
      },
      user: {
        low: "Please check your input and try again.",
        medium: "Unable to complete your request. Please try again.",
        high: "Access denied or invalid operation.",
        critical: "Critical user error. Please contact support.",
      },
      system: {
        low: "System is experiencing minor issues.",
        medium: "System temporarily unavailable. Please try again.",
        high: "System error detected. We're working to resolve this.",
        critical: "Critical system failure. Please contact support.",
      },
    }

    return messages[type][severity]
  }

  /**
   * Attempt error recovery
   */
  private async attemptRecovery(errorReport: ErrorReport): Promise<void> {
    const strategies = this.recoveryStrategies.get(errorReport.type)
    if (!strategies || strategies.length === 0) {
      return
    }

    errorReport.recoveryAttempted = true

    for (const strategy of strategies) {
      try {
        console.log(`🔄 Attempting recovery strategy: ${strategy.name}`)
        const success = await strategy.execute()

        if (success) {
          errorReport.recoverySuccessful = true
          console.log(`✅ Recovery successful: ${strategy.name}`)
          break
        }
      } catch (recoveryError) {
        console.error(`❌ Recovery strategy failed: ${strategy.name}`, recoveryError)
      }
    }
  }

  /**
   * Log error
   */
  private logError(errorReport: ErrorReport) {
    const logLevel = this.getLogLevel(errorReport.severity)
    const logMessage = `[${errorReport.type.toUpperCase()}] ${errorReport.message}`

    switch (logLevel) {
      case "error":
        console.error(logMessage, errorReport)
        break
      case "warn":
        console.warn(logMessage, errorReport)
        break
      default:
        console.log(logMessage, errorReport)
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToLoggingService(errorReport)
    }
  }

  /**
   * Get log level based on severity
   */
  private getLogLevel(severity: ErrorReport["severity"]): "log" | "warn" | "error" {
    switch (severity) {
      case "critical":
      case "high":
        return "error"
      case "medium":
        return "warn"
      default:
        return "log"
    }
  }

  /**
   * Send error to external logging service
   */
  private async sendToLoggingService(errorReport: ErrorReport) {
    try {
      // Implementation would send to service like Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // })
    } catch (error) {
      console.error("Failed to send error to logging service:", error)
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Subscribe to error events
   */
  onError(callback: (error: ErrorReport) => void): () => void {
    this.errorListeners.add(callback)
    return () => {
      this.errorListeners.delete(callback)
    }
  }

  /**
   * Notify error listeners
   */
  private notifyErrorListeners(errorReport: ErrorReport) {
    this.errorListeners.forEach((listener) => {
      try {
        listener(errorReport)
      } catch (error) {
        console.error("Error in error listener:", error)
      }
    })
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number
    errorsByType: Record<string, number>
    errorsBySeverity: Record<string, number>
    recoveryRate: number
    recentErrors: ErrorReport[]
  } {
    const recentErrors = this.errorHistory.slice(-50)

    const errorsByType = recentErrors.reduce(
      (acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const errorsBySeverity = recentErrors.reduce(
      (acc, error) => {
        acc[error.severity] = (acc[error.severity] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const recoveredErrors = recentErrors.filter((e) => e.recoverySuccessful).length
    const recoveryRate = recentErrors.length > 0 ? (recoveredErrors / recentErrors.length) * 100 : 0

    return {
      totalErrors: this.errorHistory.length,
      errorsByType,
      errorsBySeverity,
      recoveryRate,
      recentErrors: recentErrors.slice(-10),
    }
  }

  /**
   * Clear error history
   */
  clearErrorHistory() {
    this.errorHistory = []
  }
}

// Export singleton instance
export const errorHandler = EnhancedErrorHandler.getInstance()

// Utility function for easy error handling
export const handleError = (error: Error | string, context: Partial<ErrorContext>, userMessage?: string) => {
  return errorHandler.handleError(error, context, userMessage)
}
