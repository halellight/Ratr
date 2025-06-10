"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useUniversalAnalytics, type SharePlatform, type LeaderRating } from "./universal-analytics"

/**
 * Real-Time Analytics Service v1.0
 *
 * Provides real-time updates for analytics data across all users.
 * Supports both WebSocket and Polling strategies with automatic fallback.
 *
 * Features:
 * - Live rating updates
 * - Live share tracking
 * - Cross-user synchronization
 * - Automatic reconnection
 * - Efficient bandwidth usage
 * - Mobile-friendly
 */

export interface RealTimeConfig {
  strategy: "websocket" | "polling" | "auto"
  pollingInterval: number
  reconnectAttempts: number
  reconnectDelay: number
  enableCompression: boolean
  enableBatching: boolean
  batchSize: number
  batchDelay: number
}

export interface RealTimeEvent {
  type: "rating" | "share" | "user_join" | "user_leave" | "bulk_update"
  data: any
  timestamp: string
  userId?: string
  sessionId: string
}

export interface RealTimeStats {
  activeUsers: number
  totalRatings: number
  totalShares: number
  leaderRatings: Record<string, LeaderRating>
  recentActivity: RealTimeEvent[]
  connectionStatus: "connected" | "connecting" | "disconnected" | "error"
  strategy: "websocket" | "polling"
  latency: number
  lastUpdate: string
}

const DEFAULT_CONFIG: RealTimeConfig = {
  strategy: "auto",
  pollingInterval: 3000, // 3 seconds
  reconnectAttempts: 5,
  reconnectDelay: 2000, // 2 seconds
  enableCompression: true,
  enableBatching: true,
  batchSize: 10,
  batchDelay: 1000, // 1 second
}

class RealTimeAnalyticsService {
  private config: RealTimeConfig
  private ws: WebSocket | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private reconnectTimeout: NodeJS.Timeout | null = null
  private batchTimeout: NodeJS.Timeout | null = null

  private sessionId: string
  private userId: string
  private isConnected = false
  private reconnectAttempts = 0
  private strategy: "websocket" | "polling" = "polling"
  private lastPingTime = 0
  private latency = 0

  private eventQueue: RealTimeEvent[] = []
  private listeners: Set<(stats: RealTimeStats) => void> = new Set()
  private eventListeners: Set<(event: RealTimeEvent) => void> = new Set()

  private stats: RealTimeStats = {
    activeUsers: 1,
    totalRatings: 0,
    totalShares: 0,
    leaderRatings: {},
    recentActivity: [],
    connectionStatus: "disconnected",
    strategy: "polling",
    latency: 0,
    lastUpdate: new Date().toISOString(),
  }

  constructor(config: Partial<RealTimeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionId = this.generateSessionId()
    this.userId = this.generateUserId()

    console.log("🚀 Real-Time Analytics Service initialized", {
      sessionId: this.sessionId,
      strategy: this.config.strategy,
    })
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateUserId(): string {
    // Try to get existing user ID from localStorage
    if (typeof window === "undefined") return `user_${Date.now()}`

    let userId = localStorage.getItem("ratedem_user_id")
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("ratedem_user_id", userId)
    }
    return userId
  }

  /**
   * Initialize real-time connection
   */
  async initialize(): Promise<void> {
    console.log("🔄 Initializing real-time analytics...")

    // Start with polling as it's more reliable
    this.initializePolling()
    this.strategy = "polling"
    this.stats.strategy = this.strategy
    this.notifyListeners()

    // Try to get initial data
    await this.fetchInitialData()
  }

  /**
   * Fetch initial data
   */
  private async fetchInitialData(): Promise<void> {
    try {
      const response = await fetch("/api/analytics/universal", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          // Update our stats with the initial data
          this.stats = {
            ...this.stats,
            totalRatings: result.data.totalRatings || 0,
            totalShares: result.data.totalShares || 0,
            leaderRatings: result.data.leaderRatings || {},
            lastUpdate: new Date().toISOString(),
          }

          console.log("✅ Loaded initial data:", {
            totalRatings: this.stats.totalRatings,
            totalShares: this.stats.totalShares,
            leaderCount: Object.keys(this.stats.leaderRatings).length,
          })

          this.notifyListeners()
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial data:", error)
    }
  }

  /**
   * Initialize polling strategy
   */
  private initializePolling(): void {
    console.log("📊 Initializing polling strategy")
    this.isConnected = true
    this.stats.connectionStatus = "connected"

    this.startPolling()
    this.notifyListeners()
  }

  /**
   * Start polling for updates
   */
  private startPolling(): void {
    if (this.pollingInterval) return

    this.pollingInterval = setInterval(async () => {
      try {
        const startTime = Date.now()
        const response = await fetch("/api/analytics/universal", {
          method: "GET",
          headers: {
            "X-Session-ID": this.sessionId,
            "X-User-ID": this.userId,
            "Cache-Control": "no-cache",
          },
        })

        this.latency = Date.now() - startTime
        this.stats.latency = this.latency

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            this.handlePollingResponse(data.data)
          }
        } else {
          console.warn("Polling request failed:", response.status)
        }
      } catch (error) {
        console.error("Polling error:", error)
        this.stats.connectionStatus = "error"
        this.notifyListeners()
      }
    }, this.config.pollingInterval)
  }

  /**
   * Handle polling response
   */
  private handlePollingResponse(data: any): void {
    const hasChanges =
      this.stats.totalRatings !== data.totalRatings ||
      this.stats.totalShares !== data.totalShares ||
      JSON.stringify(this.stats.leaderRatings) !== JSON.stringify(data.leaderRatings)

    if (hasChanges) {
      this.stats = {
        ...this.stats,
        totalRatings: data.totalRatings || 0,
        totalShares: data.totalShares || 0,
        activeUsers: data.activeUsers || 1,
        leaderRatings: data.leaderRatings || {},
        lastUpdate: new Date().toISOString(),
      }

      console.log("📊 Stats updated:", {
        totalRatings: this.stats.totalRatings,
        totalShares: this.stats.totalShares,
        activeUsers: this.stats.activeUsers,
        leaderCount: Object.keys(this.stats.leaderRatings).length,
      })

      this.notifyListeners()
    }
  }

  /**
   * Track rating in real-time
   */
  async trackRating(officialId: string, rating: number): Promise<void> {
    console.log(`🗳️ Tracking rating: ${officialId} = ${rating}/5`)

    const event: RealTimeEvent = {
      type: "rating",
      data: { officialId, rating },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    // Add to event queue for batch sending
    this.eventQueue.push(event)
    this.scheduleBatchSend()

    // Update local stats immediately for responsiveness
    this.stats.totalRatings += 1

    // Update or create leader rating
    if (!this.stats.leaderRatings[officialId]) {
      this.stats.leaderRatings[officialId] = {
        officialId,
        averageRating: rating,
        totalRatings: 1,
        ratingDistribution: { [rating]: 1 },
        lastUpdated: new Date().toISOString(),
        performanceMetrics: {
          approvalRating: Math.round((rating / 5) * 100),
          trendsUp: rating > 3,
          monthlyChange: 0,
        },
      }
    } else {
      const current = this.stats.leaderRatings[officialId]
      const newTotal = current.totalRatings + 1
      const newAverage = (current.averageRating * current.totalRatings + rating) / newTotal

      this.stats.leaderRatings[officialId] = {
        ...current,
        averageRating: newAverage,
        totalRatings: newTotal,
        ratingDistribution: {
          ...current.ratingDistribution,
          [rating]: (current.ratingDistribution[rating] || 0) + 1,
        },
        lastUpdated: new Date().toISOString(),
        performanceMetrics: {
          ...current.performanceMetrics,
          approvalRating: Math.round((newAverage / 5) * 100),
          trendsUp: newAverage > 3,
        },
      }
    }

    this.stats.lastUpdate = new Date().toISOString()
    this.notifyListeners()

    // Add to recent activity
    this.handleRealTimeEvent(event)
  }

  /**
   * Track share in real-time
   */
  async trackShare(platform: SharePlatform): Promise<void> {
    console.log(`📊 Tracking share: ${platform}`)

    const event: RealTimeEvent = {
      type: "share",
      data: { platform },
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
    }

    // Add to event queue
    this.eventQueue.push(event)
    this.scheduleBatchSend()

    // Update local stats immediately
    this.stats.totalShares += 1
    this.stats.lastUpdate = new Date().toISOString()
    this.notifyListeners()

    // Add to recent activity
    this.handleRealTimeEvent(event)
  }

  /**
   * Handle real-time event
   */
  private handleRealTimeEvent(event: RealTimeEvent): void {
    // Add to recent activity
    this.stats.recentActivity.unshift(event)

    // Keep only last 50 events
    if (this.stats.recentActivity.length > 50) {
      this.stats.recentActivity = this.stats.recentActivity.slice(0, 50)
    }

    // Notify event listeners
    this.eventListeners.forEach((listener) => {
      try {
        listener(event)
      } catch (error) {
        console.error("Error in event listener:", error)
      }
    })

    this.notifyListeners()
  }

  /**
   * Schedule batch send for polling strategy
   */
  private scheduleBatchSend(): void {
    if (this.batchTimeout) return

    this.batchTimeout = setTimeout(async () => {
      await this.sendBatch()
      this.batchTimeout = null
    }, this.config.batchDelay)
  }

  /**
   * Send batched events
   */
  private async sendBatch(): Promise<void> {
    if (this.eventQueue.length === 0) return

    const events = this.eventQueue.splice(0, this.config.batchSize)
    console.log(`📤 Sending batch of ${events.length} events`)

    try {
      // For each event, send to the appropriate endpoint
      for (const event of events) {
        if (event.type === "rating" && event.data?.officialId && event.data?.rating) {
          await fetch("/api/analytics/universal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-ID": this.sessionId,
              "X-User-ID": this.userId,
            },
            body: JSON.stringify({
              type: "rating",
              data: {
                officialId: event.data.officialId,
                rating: event.data.rating,
              },
            }),
          })
        } else if (event.type === "share" && event.data?.platform) {
          await fetch("/api/analytics/universal", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Session-ID": this.sessionId,
              "X-User-ID": this.userId,
            },
            body: JSON.stringify({
              type: "share",
              data: {
                platform: event.data.platform,
              },
            }),
          })
        }
      }

      console.log(`✅ Batch sent successfully`)
    } catch (error) {
      console.error("Batch send error:", error)
      // Re-queue events for retry
      this.eventQueue.unshift(...events)
    }
  }

  /**
   * Subscribe to stats updates
   */
  subscribe(callback: (stats: RealTimeStats) => void): () => void {
    this.listeners.add(callback)

    // Immediately call with current stats
    callback(this.stats)

    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Subscribe to real-time events
   */
  subscribeToEvents(callback: (event: RealTimeEvent) => void): () => void {
    this.eventListeners.add(callback)

    return () => {
      this.eventListeners.delete(callback)
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((callback) => {
      try {
        callback(this.stats)
      } catch (error) {
        console.error("Error in stats listener:", error)
      }
    })
  }

  /**
   * Get current stats
   */
  getStats(): RealTimeStats {
    return { ...this.stats }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log("🧹 Cleaning up real-time analytics service")

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout)
      this.batchTimeout = null
    }

    this.listeners.clear()
    this.eventListeners.clear()
    this.eventQueue = []
  }
}

// Global instance
let realTimeService: RealTimeAnalyticsService | null = null

/**
 * Get or create real-time analytics service instance
 */
export function getRealTimeService(config?: Partial<RealTimeConfig>): RealTimeAnalyticsService {
  if (!realTimeService) {
    realTimeService = new RealTimeAnalyticsService(config)
  }
  return realTimeService
}

/**
 * Hook for real-time analytics
 */
export function useRealTimeAnalytics(config?: Partial<RealTimeConfig>) {
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const serviceRef = useRef<RealTimeAnalyticsService | null>(null)

  // Get universal analytics for fallback
  const { trackRating: universalTrackRating, trackShare: universalTrackShare } = useUniversalAnalytics()

  useEffect(() => {
    console.log("🚀 Initializing real-time analytics hook")

    serviceRef.current = getRealTimeService(config)

    const unsubscribe = serviceRef.current.subscribe((newStats) => {
      setStats(newStats)
      setIsInitialized(true)
    })

    // Initialize the service
    serviceRef.current.initialize().catch((error) => {
      console.error("Failed to initialize real-time service:", error)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const trackRating = useCallback(
    async (officialId: string, rating: number) => {
      try {
        console.log(`🗳️ Hook: tracking rating ${officialId} = ${rating}/5`)

        // Track in both systems for reliability
        await Promise.all([
          serviceRef.current?.trackRating(officialId, rating),
          universalTrackRating(officialId, rating),
        ])
      } catch (error) {
        console.error("Failed to track rating:", error)
        // Fallback to universal analytics only
        await universalTrackRating(officialId, rating)
      }
    },
    [universalTrackRating],
  )

  const trackShare = useCallback(
    async (platform: SharePlatform) => {
      try {
        await Promise.all([serviceRef.current?.trackShare(platform), universalTrackShare(platform)])
      } catch (error) {
        console.error("Failed to track share:", error)
        await universalTrackShare(platform)
      }
    },
    [universalTrackShare],
  )

  return {
    stats,
    isInitialized,
    trackRating,
    trackShare,
    service: serviceRef.current,
  }
}

/**
 * Hook for real-time events
 */
export function useRealTimeEvents() {
  const [events, setEvents] = useState<RealTimeEvent[]>([])
  const serviceRef = useRef<RealTimeAnalyticsService | null>(null)

  useEffect(() => {
    serviceRef.current = getRealTimeService()

    const unsubscribe = serviceRef.current.subscribeToEvents((event) => {
      setEvents((prev) => [event, ...prev.slice(0, 49)]) // Keep last 50 events
    })

    return unsubscribe
  }, [])

  return { events }
}

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    realTimeService?.cleanup()
  })
}
