"use client"

/**
 * Performance Optimizer v1.0
 *
 * Advanced performance optimization system with caching,
 * lazy loading, and resource management.
 */

export interface PerformanceConfig {
  cacheSize: number
  cacheTTL: number // Time to live in milliseconds
  enableLazyLoading: boolean
  enableResourceOptimization: boolean
  enableMetrics: boolean
  batchSize: number
  debounceDelay: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

export interface PerformanceMetrics {
  cacheHitRate: number
  averageResponseTime: number
  memoryUsage: number
  renderTime: number
  apiCallCount: number
  errorRate: number
  throughput: number // operations per second
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private cache: Map<string, CacheEntry<any>> = new Map()
  private config: PerformanceConfig
  private metrics: PerformanceMetrics
  private requestQueue: Array<() => Promise<any>> = []
  private isProcessingQueue = false
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      cacheSize: 1000,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      enableLazyLoading: true,
      enableResourceOptimization: true,
      enableMetrics: true,
      batchSize: 10,
      debounceDelay: 300,
      ...config,
    }

    this.metrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      apiCallCount: 0,
      errorRate: 0,
      throughput: 0,
    }

    this.startMetricsCollection()
  }

  static getInstance(config?: Partial<PerformanceConfig>): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer(config)
    }
    return PerformanceOptimizer.instance
  }

  /**
   * Cache management
   */
  setCache<T>(key: string, data: T, ttl?: number): void {
    // Clean cache if it's getting too large
    if (this.cache.size >= this.config.cacheSize) {
      this.cleanCache()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.cacheTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
    }

    this.cache.set(key, entry)
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    entry.accessCount++
    entry.lastAccessed = Date.now()

    return entry.data as T
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now()
    const entriesToDelete: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        entriesToDelete.push(key)
      }
    }

    // If still too many entries, remove least recently used
    if (this.cache.size - entriesToDelete.length >= this.config.cacheSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)

      const additionalToDelete = sortedEntries
        .slice(0, Math.floor(this.config.cacheSize * 0.2)) // Remove 20% of oldest entries
        .map(([key]) => key)

      entriesToDelete.push(...additionalToDelete)
    }

    entriesToDelete.forEach((key) => this.cache.delete(key))
  }

  /**
   * Optimized API call with caching and batching
   */
  async optimizedApiCall<T>(url: string, options: RequestInit = {}, cacheKey?: string, cacheTTL?: number): Promise<T> {
    const startTime = performance.now()
    const key = cacheKey || `${url}_${JSON.stringify(options)}`

    // Try cache first
    const cachedData = this.getCache<T>(key)
    if (cachedData) {
      this.updateMetrics("cache_hit", performance.now() - startTime)
      return cachedData
    }

    try {
      // Make API call
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      // Cache the result
      this.setCache(key, data, cacheTTL)

      this.updateMetrics("api_success", performance.now() - startTime)
      return data
    } catch (error) {
      this.updateMetrics("api_error", performance.now() - startTime)
      throw error
    }
  }

  /**
   * Debounced function execution
   */
  debounce<T extends (...args: any[]) => any>(key: string, func: T, delay?: number): (...args: Parameters<T>) => void {
    const debounceDelay = delay || this.config.debounceDelay

    return (...args: Parameters<T>) => {
      // Clear existing timer
      const existingTimer = this.debounceTimers.get(key)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set new timer
      const timer = setTimeout(() => {
        func(...args)
        this.debounceTimers.delete(key)
      }, debounceDelay)

      this.debounceTimers.set(key, timer)
    }
  }

  /**
   * Batch processing for multiple operations
   */
  async batchProcess<T, R>(items: T[], processor: (batch: T[]) => Promise<R[]>, batchSize?: number): Promise<R[]> {
    const size = batchSize || this.config.batchSize
    const results: R[] = []

    for (let i = 0; i < items.length; i += size) {
      const batch = items.slice(i, i + size)
      const batchResults = await processor(batch)
      results.push(...batchResults)

      // Small delay between batches to prevent overwhelming
      if (i + size < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }

    return results
  }

  /**
   * Lazy loading implementation
   */
  createLazyLoader<T>(
    loader: () => Promise<T>,
    placeholder?: T,
  ): {
    load: () => Promise<T>
    isLoaded: () => boolean
    getValue: () => T | undefined
  } {
    let isLoaded = false
    let value: T | undefined = placeholder
    let loadPromise: Promise<T> | null = null

    return {
      load: async () => {
        if (isLoaded && value !== undefined) {
          return value
        }

        if (loadPromise) {
          return loadPromise
        }

        loadPromise = loader().then((result) => {
          value = result
          isLoaded = true
          loadPromise = null
          return result
        })

        return loadPromise
      },
      isLoaded: () => isLoaded,
      getValue: () => value,
    }
  }

  /**
   * Resource optimization
   */
  optimizeImages(
    imageUrl: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: "webp" | "jpeg" | "png"
    } = {},
  ): string {
    if (!this.config.enableResourceOptimization) {
      return imageUrl
    }

    // If it's a placeholder image, add optimization parameters
    if (imageUrl.includes("placeholder.svg")) {
      const params = new URLSearchParams()
      if (options.width) params.set("width", options.width.toString())
      if (options.height) params.set("height", options.height.toString())

      return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}${params.toString()}`
    }

    // For other images, you could integrate with image optimization services
    return imageUrl
  }

  /**
   * Memory management
   */
  cleanupMemory(): void {
    // Clear expired cache entries
    this.cleanCache()

    // Clear completed debounce timers
    for (const [key, timer] of this.debounceTimers.entries()) {
      if (!timer) {
        this.debounceTimers.delete(key)
      }
    }

    // Force garbage collection if available
    if (typeof window !== "undefined" && "gc" in window) {
      ;(window as any).gc()
    }
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(type: "cache_hit" | "api_success" | "api_error", responseTime: number): void {
    if (!this.config.enableMetrics) return

    switch (type) {
      case "cache_hit":
        this.metrics.cacheHitRate = this.calculateCacheHitRate()
        break
      case "api_success":
        this.metrics.apiCallCount++
        this.metrics.averageResponseTime = this.updateAverageResponseTime(responseTime)
        break
      case "api_error":
        this.metrics.apiCallCount++
        this.metrics.errorRate = this.calculateErrorRate()
        break
    }

    this.metrics.memoryUsage = this.getMemoryUsage()
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const totalAccesses = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.accessCount, 0)

    if (totalAccesses === 0) return 0

    const hits = Array.from(this.cache.values()).filter((entry) => entry.accessCount > 0).length

    return (hits / this.cache.size) * 100
  }

  /**
   * Update average response time
   */
  private updateAverageResponseTime(newTime: number): number {
    const currentAvg = this.metrics.averageResponseTime
    const count = this.metrics.apiCallCount

    return (currentAvg * (count - 1) + newTime) / count
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    // This would need to track errors separately
    // For now, return a placeholder
    return 0
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof window !== "undefined" && "memory" in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024 // MB
    }
    return 0
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) return

    setInterval(() => {
      this.metrics.memoryUsage = this.getMemoryUsage()
      this.metrics.cacheHitRate = this.calculateCacheHitRate()
    }, 10000) // Update every 10 seconds
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      cacheHitRate: 0,
      averageResponseTime: 0,
      memoryUsage: 0,
      renderTime: 0,
      apiCallCount: 0,
      errorRate: 0,
      throughput: 0,
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number
    hitRate: number
    totalEntries: number
    expiredEntries: number
  } {
    const now = Date.now()
    const expiredEntries = Array.from(this.cache.values()).filter((entry) => now - entry.timestamp > entry.ttl).length

    return {
      size: this.cache.size,
      hitRate: this.calculateCacheHitRate(),
      totalEntries: this.cache.size,
      expiredEntries,
    }
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()
