"use client"

/**
 * System Validator v1.0
 *
 * Comprehensive validation service for data integrity,
 * performance monitoring, and error detection across the entire application.
 */

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  performance: PerformanceMetrics
  timestamp: string
}

export interface ValidationError {
  code: string
  message: string
  severity: "critical" | "high" | "medium" | "low"
  component: string
  data?: any
}

export interface ValidationWarning {
  code: string
  message: string
  component: string
  suggestion: string
}

export interface PerformanceMetrics {
  responseTime: number
  memoryUsage: number
  renderTime: number
  apiCalls: number
  cacheHitRate: number
}

export class SystemValidator {
  private static instance: SystemValidator
  private validationHistory: ValidationResult[] = []
  private performanceBaseline: PerformanceMetrics

  constructor() {
    this.performanceBaseline = {
      responseTime: 200, // ms
      memoryUsage: 50, // MB
      renderTime: 16, // ms (60fps)
      apiCalls: 10, // per minute
      cacheHitRate: 90, // percentage
    }
  }

  static getInstance(): SystemValidator {
    if (!SystemValidator.instance) {
      SystemValidator.instance = new SystemValidator()
    }
    return SystemValidator.instance
  }

  /**
   * Validate rating data
   */
  validateRating(officialId: string, rating: number): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const startTime = performance.now()

    // Critical validations
    if (!officialId || typeof officialId !== "string") {
      errors.push({
        code: "INVALID_OFFICIAL_ID",
        message: "Official ID is required and must be a string",
        severity: "critical",
        component: "rating-validator",
        data: { officialId },
      })
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      errors.push({
        code: "INVALID_RATING_VALUE",
        message: "Rating must be an integer between 1 and 5",
        severity: "critical",
        component: "rating-validator",
        data: { rating },
      })
    }

    // Pattern detection for suspicious activity
    if (this.detectSuspiciousRatingPattern(officialId, rating)) {
      warnings.push({
        code: "SUSPICIOUS_PATTERN",
        message: "Unusual rating pattern detected",
        component: "pattern-detector",
        suggestion: "Monitor for potential abuse",
      })
    }

    const endTime = performance.now()

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      performance: {
        responseTime: endTime - startTime,
        memoryUsage: this.getMemoryUsage(),
        renderTime: 0,
        apiCalls: 1,
        cacheHitRate: 100,
      },
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Validate analytics data
   */
  validateAnalyticsData(data: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const startTime = performance.now()

    // Data structure validation
    if (!data || typeof data !== "object") {
      errors.push({
        code: "INVALID_DATA_STRUCTURE",
        message: "Analytics data must be a valid object",
        severity: "critical",
        component: "analytics-validator",
      })
      return this.createValidationResult(false, errors, warnings, startTime)
    }

    // Required fields validation
    const requiredFields = ["totalRatings", "totalShares", "activeUsers"]
    for (const field of requiredFields) {
      if (!(field in data) || typeof data[field] !== "number" || data[field] < 0) {
        errors.push({
          code: "MISSING_REQUIRED_FIELD",
          message: `Required field '${field}' is missing or invalid`,
          severity: "high",
          component: "analytics-validator",
          data: { field, value: data[field] },
        })
      }
    }

    // Data consistency checks
    if (data.totalRatings && data.leaderRatings) {
      const calculatedTotal = Object.values(data.leaderRatings).reduce(
        (sum: number, leader: any) => sum + (leader.totalRatings || 0),
        0,
      )

      if (Math.abs(data.totalRatings - calculatedTotal) > 10) {
        warnings.push({
          code: "DATA_INCONSISTENCY",
          message: "Total ratings don't match sum of individual leader ratings",
          component: "consistency-checker",
          suggestion: "Verify data synchronization between sources",
        })
      }
    }

    // Performance thresholds
    if (data.totalRatings > 100000) {
      warnings.push({
        code: "HIGH_VOLUME_DATA",
        message: "High volume of ratings detected",
        component: "performance-monitor",
        suggestion: "Consider implementing data pagination",
      })
    }

    return this.createValidationResult(errors.length === 0, errors, warnings, startTime)
  }

  /**
   * Validate UI component state
   */
  validateComponentState(componentName: string, state: any): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const startTime = performance.now()

    // Component-specific validations
    switch (componentName) {
      case "OfficialRating":
        this.validateOfficialRatingState(state, errors, warnings)
        break
      case "ResultsCard":
        this.validateResultsCardState(state, errors, warnings)
        break
      case "AnalyticsPage":
        this.validateAnalyticsPageState(state, errors, warnings)
        break
      default:
        warnings.push({
          code: "UNKNOWN_COMPONENT",
          message: `Unknown component: ${componentName}`,
          component: "component-validator",
          suggestion: "Add validation rules for this component",
        })
    }

    return this.createValidationResult(errors.length === 0, errors, warnings, startTime)
  }

  private validateOfficialRatingState(state: any, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!state.official || !state.official.id) {
      errors.push({
        code: "MISSING_OFFICIAL_DATA",
        message: "Official data is required",
        severity: "critical",
        component: "OfficialRating",
      })
    }

    if (state.currentIndex < 0 || state.currentIndex >= state.totalCount) {
      errors.push({
        code: "INVALID_INDEX",
        message: "Current index is out of bounds",
        severity: "high",
        component: "OfficialRating",
        data: { currentIndex: state.currentIndex, totalCount: state.totalCount },
      })
    }
  }

  private validateResultsCardState(state: any, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!state.ratings || Object.keys(state.ratings).length === 0) {
      warnings.push({
        code: "NO_RATINGS_DATA",
        message: "No ratings data available",
        component: "ResultsCard",
        suggestion: "Ensure user has completed rating process",
      })
    }

    if (!state.officials || state.officials.length === 0) {
      errors.push({
        code: "MISSING_OFFICIALS_DATA",
        message: "Officials data is required",
        severity: "high",
        component: "ResultsCard",
      })
    }
  }

  private validateAnalyticsPageState(state: any, errors: ValidationError[], warnings: ValidationWarning[]) {
    if (!state.displayData) {
      errors.push({
        code: "MISSING_DISPLAY_DATA",
        message: "Display data is required",
        severity: "critical",
        component: "AnalyticsPage",
      })
    }

    if (state.displayData && !state.displayData.isConnected) {
      warnings.push({
        code: "CONNECTION_ISSUE",
        message: "Analytics connection is not established",
        component: "AnalyticsPage",
        suggestion: "Check network connectivity and service status",
      })
    }
  }

  /**
   * Detect suspicious rating patterns
   */
  private detectSuspiciousRatingPattern(officialId: string, rating: number): boolean {
    // Implementation for pattern detection
    // This could include rate limiting, duplicate detection, etc.
    return false // Placeholder
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ("memory" in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  /**
   * Create validation result
   */
  private createValidationResult(
    isValid: boolean,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    startTime: number,
  ): ValidationResult {
    const endTime = performance.now()

    const result: ValidationResult = {
      isValid,
      errors,
      warnings,
      performance: {
        responseTime: endTime - startTime,
        memoryUsage: this.getMemoryUsage(),
        renderTime: 0,
        apiCalls: 0,
        cacheHitRate: 100,
      },
      timestamp: new Date().toISOString(),
    }

    // Store in history (keep last 100)
    this.validationHistory.push(result)
    if (this.validationHistory.length > 100) {
      this.validationHistory = this.validationHistory.slice(-100)
    }

    return result
  }

  /**
   * Get validation history
   */
  getValidationHistory(): ValidationResult[] {
    return [...this.validationHistory]
  }

  /**
   * Get system health summary
   */
  getSystemHealth(): {
    overall: "healthy" | "warning" | "critical"
    errorRate: number
    averageResponseTime: number
    recentIssues: ValidationError[]
  } {
    const recentResults = this.validationHistory.slice(-20) // Last 20 validations
    const totalValidations = recentResults.length

    if (totalValidations === 0) {
      return {
        overall: "healthy",
        errorRate: 0,
        averageResponseTime: 0,
        recentIssues: [],
      }
    }

    const errorCount = recentResults.filter((r) => !r.isValid).length
    const errorRate = (errorCount / totalValidations) * 100

    const averageResponseTime = recentResults.reduce((sum, r) => sum + r.performance.responseTime, 0) / totalValidations

    const recentIssues = recentResults
      .flatMap((r) => r.errors)
      .filter((e) => e.severity === "critical" || e.severity === "high")
      .slice(-10) // Last 10 critical/high issues

    let overall: "healthy" | "warning" | "critical" = "healthy"
    if (errorRate > 20 || recentIssues.length > 5) {
      overall = "critical"
    } else if (errorRate > 5 || recentIssues.length > 2) {
      overall = "warning"
    }

    return {
      overall,
      errorRate,
      averageResponseTime,
      recentIssues,
    }
  }
}

// Export singleton instance
export const systemValidator = SystemValidator.getInstance()
