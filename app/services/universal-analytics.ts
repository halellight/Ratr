"use client"

import { useCallback } from "react"

import { useEffect } from "react"

import { useRef } from "react"

import { useState } from "react"

/**
 * Universal Analytics Service v19 - Globally Accessible Data
 *
 * This service ensures that ALL users see the SAME analytics data
 * regardless of their role, permissions, or session state.
 *
 * Features:
 * - Universal data access (no user-specific filtering)
 * - Global state synchronization
 * - Real-time updates for all users
 * - Consistent data across all interfaces
 * - Automatic fallback mechanisms
 * - Cross-session data persistence
 */

import { redisClient } from "./redis-client"

export type SharePlatform = "twitter" | "facebook" | "whatsapp" | "copy" | "native" | "other"

export interface LeaderRating {
  officialId: string
  averageRating: number
  totalRatings: number
  ratingDistribution: Record<number, number>
  lastUpdated: string
  performanceMetrics: {
    approvalRating: number
    trendsUp: boolean
    monthlyChange: number
  }
}

export interface ShareAnalytics {
  platform: string
  count: number
  lastShared: string
  trend: "up" | "down" | "stable"
  velocity: number
}

export interface UniversalAnalytics {
  totalRatings: number
  totalShares: number
  leaderRatings: Record<string, LeaderRating>
  shareAnalytics: ShareAnalytics[]
  lastUpdated: string
  activeUsers: number
  serverTime: string
  version: string
  globalId: string // Unique identifier for this data set
}

export interface AnalyticsSummary {
  totalShares: number
  totalRatings: number
  mostPopular: string | null
  trending: SharePlatform[]
  lastUpdate: string | null
  activeUsers: number
  isConnected: boolean
}

// Global analytics store - accessible to ALL users universally
class UniversalAnalyticsStore {
  private data: UniversalAnalytics
  private listeners: Set<(data: UniversalAnalytics) => void> = new Set()
  private errorListeners: Set<(error: Error) => void> = new Set()
  private isInitialized = false
  private isRedisAvailable = false
  private pollingInterval: NodeJS.Timeout | null = null
  private heartbeatInterval: NodeJS.Timeout | null = null
  private readonly REDIS_KEY = "nigeria:cabinet:universal:analytics"
  private readonly ACTIVE_USERS_KEY = "nigeria:cabinet:active:users"
  private readonly POLLING_INTERVAL = 3000 // 3 seconds for real-time feel
  private readonly HEARTBEAT_INTERVAL = 30000 // 30 seconds
  private sessionId: string
  private lastSyncTime = 0
  private syncInProgress = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.data = this.getInitialData()
    this.initialize()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getInitialData(): UniversalAnalytics {
    return {
      totalRatings: 0,
      totalShares: 0,
      leaderRatings: {},
      shareAnalytics: [
        { platform: "twitter", count: 0, lastShared: "", trend: "stable", velocity: 0 },
        { platform: "facebook", count: 0, lastShared: "", trend: "stable", velocity: 0 },
        { platform: "whatsapp", count: 0, lastShared: "", trend: "stable", velocity: 0 },
        { platform: "copy", count: 0, lastShared: "", trend: "stable", velocity: 0 },
        { platform: "native", count: 0, lastShared: "", trend: "stable", velocity: 0 },
        { platform: "other", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      ],
      lastUpdated: new Date().toISOString(),
      activeUsers: 1,
      serverTime: new Date().toISOString(),
      version: "19",
      globalId: "universal",
    }
  }

  private async initialize() {
    console.log("🌍 Initializing Universal Analytics Store")

    // Load from localStorage immediately for instant display
    this.loadFromStorage()

    // Check Redis availability
    this.isRedisAvailable = await redisClient.isAvailable()

    if (this.isRedisAvailable) {
      console.log("🔄 Redis available - enabling global data sync")
      await this.loadFromRedis()
      this.startPolling()
      this.startHeartbeat()
    } else {
      console.warn("⚠️ Redis not available - using localStorage only")
    }

    this.isInitialized = true
    this.notifyListeners()
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("universal-analytics-v19")
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with initial data to ensure all fields exist
        this.data = { ...this.getInitialData(), ...parsed }
        console.log("📊 Loaded universal analytics from localStorage")
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
  }

  private async loadFromRedis() {
    if (this.syncInProgress) return
    this.syncInProgress = true

    try {
      const redisData = await redisClient.get(this.REDIS_KEY)
      if (redisData) {
        const parsedData = typeof redisData === "string" ? JSON.parse(redisData) : redisData

        // Ensure we have all required fields
        this.data = {
          ...this.getInitialData(),
          ...parsedData,
          serverTime: new Date().toISOString(),
          version: "19",
          globalId: "universal",
        }

        console.log("🌍 Loaded universal analytics from Redis:", {
          totalRatings: this.data.totalRatings,
          totalShares: this.data.totalShares,
          lastUpdated: this.data.lastUpdated,
        })

        this.saveToStorage()
        this.lastSyncTime = Date.now()
      } else {
        // Initialize Redis with current data
        await this.saveToRedis()
        console.log("🌍 Initialized Redis with universal analytics data")
      }
    } catch (error) {
      console.error("Failed to load from Redis:", error)
      this.notifyError(new Error("Failed to sync with global data"))
    } finally {
      this.syncInProgress = false
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("universal-analytics-v19", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  private async saveToRedis() {
    if (!this.isRedisAvailable || this.syncInProgress) return

    try {
      this.data.serverTime = new Date().toISOString()
      await redisClient.set(this.REDIS_KEY, JSON.stringify(this.data))
      console.log("🌍 Saved universal analytics to Redis")
      this.lastSyncTime = Date.now()
    } catch (error) {
      console.error("Failed to save to Redis:", error)
      this.isRedisAvailable = false
      this.notifyError(new Error("Lost connection to global data"))
    }
  }

  private startPolling() {
    if (this.pollingInterval) return

    this.pollingInterval = setInterval(async () => {
      if (!this.isRedisAvailable || this.syncInProgress) return

      try {
        const redisData = await redisClient.get(this.REDIS_KEY)
        if (redisData) {
          const parsedData = typeof redisData === "string" ? JSON.parse(redisData) : redisData

          // Only update if the data is newer
          if (parsedData.lastUpdated > this.data.lastUpdated) {
            this.data = {
              ...this.getInitialData(),
              ...parsedData,
              serverTime: new Date().toISOString(),
              version: "19",
              globalId: "universal",
            }

            this.saveToStorage()
            this.notifyListeners()
            console.log("🔄 Universal analytics updated from global sync")
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
        this.isRedisAvailable = false
      }
    }, this.POLLING_INTERVAL)
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) return

    // Register this session as active
    this.updateActiveUsers()

    this.heartbeatInterval = setInterval(() => {
      this.updateActiveUsers()
    }, this.HEARTBEAT_INTERVAL)
  }

  private async updateActiveUsers() {
    if (!this.isRedisAvailable) return

    try {
      // Set session as active with expiration
      await redisClient.set(`${this.ACTIVE_USERS_KEY}:${this.sessionId}`, "active")

      // Get all active sessions (this is approximate)
      // In a real implementation, you'd use Redis SCAN or a proper set
      this.data.activeUsers = Math.max(1, Math.floor(Math.random() * 10) + 1) // Simulated for demo
    } catch (error) {
      console.error("Failed to update active users:", error)
    }
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // Public subscription method - accessible to ALL users
  subscribe(callback: (data: UniversalAnalytics) => void) {
    this.listeners.add(callback)

    // Immediately provide current data
    if (this.isInitialized) {
      callback(this.data)
    }

    return () => {
      this.listeners.delete(callback)
    }
  }

  // Subscribe to errors
  subscribeToErrors(callback: (error: Error) => void) {
    this.errorListeners.add(callback)
    return () => {
      this.errorListeners.delete(callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.data)
      } catch (error) {
        console.error("Error in analytics listener:", error)
      }
    })
  }

  private notifyError(error: Error) {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error)
      } catch (err) {
        console.error("Error in error listener:", err)
      }
    })
  }

  // Universal tracking methods - updates global data for ALL users
  async trackRating(officialId: string, rating: number) {
    console.log(`🌍 Tracking universal rating: ${officialId} = ${rating}/5`)

    // Update local data immediately
    this.data.totalRatings += 1

    if (!this.data.leaderRatings[officialId]) {
      this.data.leaderRatings[officialId] = {
        officialId,
        averageRating: rating,
        totalRatings: 1,
        ratingDistribution: { [rating]: 1 },
        lastUpdated: new Date().toISOString(),
        performanceMetrics: {
          approvalRating: Math.round((rating / 5) * 100),
          trendsUp: rating > 3,
          monthlyChange: Math.random() * 5,
        },
      }
    } else {
      const current = this.data.leaderRatings[officialId]
      const newTotal = current.totalRatings + 1
      const newAverage = (current.averageRating * current.totalRatings + rating) / newTotal

      current.averageRating = newAverage
      current.totalRatings = newTotal
      current.ratingDistribution[rating] = (current.ratingDistribution[rating] || 0) + 1
      current.lastUpdated = new Date().toISOString()
      current.performanceMetrics.approvalRating = Math.round((newAverage / 5) * 100)
      current.performanceMetrics.trendsUp = newAverage > 3
    }

    this.data.lastUpdated = new Date().toISOString()

    // Save to both storage mechanisms
    this.saveToStorage()
    if (this.isRedisAvailable) {
      await this.saveToRedis()
    }

    this.notifyListeners()
    console.log(`✅ Universal rating tracked - Total: ${this.data.totalRatings}`)
  }

  async trackShare(platform: SharePlatform) {
    console.log(`🌍 Tracking universal share: ${platform}`)

    // Update local data immediately
    this.data.totalShares += 1

    const shareIndex = this.data.shareAnalytics.findIndex((s) => s.platform === platform)
    if (shareIndex >= 0) {
      this.data.shareAnalytics[shareIndex].count += 1
      this.data.shareAnalytics[shareIndex].lastShared = new Date().toISOString()
      this.data.shareAnalytics[shareIndex].trend = "up"
      this.data.shareAnalytics[shareIndex].velocity += 1
    }

    this.data.lastUpdated = new Date().toISOString()

    // Save to both storage mechanisms
    this.saveToStorage()
    if (this.isRedisAvailable) {
      await this.saveToRedis()
    }

    this.notifyListeners()
    console.log(`📊 Universal share tracked - Total: ${this.data.totalShares}`)
  }

  // Get current universal data - accessible to ALL users
  getData(): UniversalAnalytics {
    return this.data
  }

  // Get analytics summary - accessible to ALL users
  getSummary(): AnalyticsSummary {
    const trending = this.data.shareAnalytics
      .filter((item) => item.trend === "up")
      .sort((a, b) => (b.velocity || 0) - (a.velocity || 0))
      .map((item) => item.platform as SharePlatform)

    const mostPopular =
      this.data.totalShares > 0
        ? this.data.shareAnalytics.reduce((max, item) => (item.count > max.count ? item : max)).platform
        : null

    return {
      totalShares: this.data.totalShares,
      totalRatings: this.data.totalRatings,
      mostPopular,
      trending,
      lastUpdate: this.data.lastUpdated,
      activeUsers: this.data.activeUsers,
      isConnected: this.isRedisAvailable,
    }
  }

  // Force refresh from global source
  async refresh() {
    console.log("🔄 Forcing universal analytics refresh")
    if (this.isRedisAvailable) {
      await this.loadFromRedis()
      this.notifyListeners()
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.isRedisAvailable
  }

  // Get last sync time
  getLastSyncTime(): number {
    return this.lastSyncTime
  }

  // Admin function to reset all data
  async resetAllData() {
    console.log("🗑️ Resetting ALL universal analytics data")
    this.data = this.getInitialData()
    this.saveToStorage()
    if (this.isRedisAvailable) {
      await this.saveToRedis()
    }
    this.notifyListeners()
  }

  // Cleanup method
  cleanup() {
    this.stopPolling()
    this.listeners.clear()
    this.errorListeners.clear()
  }
}

// Global singleton instance - accessible to ALL users
const universalAnalyticsStore = new UniversalAnalyticsStore()

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    universalAnalyticsStore.cleanup()
  })
}

// Export the universal store
export { universalAnalyticsStore }

// Universal hook for accessing analytics data
export function useUniversalAnalytics() {
  const [data, setData] = useState<UniversalAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasNewData, setHasNewData] = useState(false)

  const lastUpdateRef = useRef<string | null>(null)

  useEffect(() => {
    console.log("🌍 Setting up universal analytics subscription")

    // Subscribe to data updates
    const unsubscribeData = universalAnalyticsStore.subscribe((newData) => {
      setData(newData)
      setIsLoading(false)

      // Check if this is new data
      const isNewUpdate = lastUpdateRef.current !== newData.lastUpdated
      if (isNewUpdate && lastUpdateRef.current !== null) {
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)
      }

      lastUpdateRef.current = newData.lastUpdated
    })

    // Subscribe to errors
    const unsubscribeErrors = universalAnalyticsStore.subscribeToErrors((err) => {
      setError(err)
      setTimeout(() => setError(null), 5000) // Clear error after 5 seconds
    })

    return () => {
      unsubscribeData()
      unsubscribeErrors()
    }
  }, [])

  const trackRating = useCallback(async (officialId: string, rating: number) => {
    try {
      await universalAnalyticsStore.trackRating(officialId, rating)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to track rating"))
    }
  }, [])

  const trackShare = useCallback(async (platform: SharePlatform) => {
    try {
      await universalAnalyticsStore.trackShare(platform)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to track share"))
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      await universalAnalyticsStore.refresh()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh data"))
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    hasNewData,
    isConnected: universalAnalyticsStore.isConnected(),
    lastSyncTime: universalAnalyticsStore.getLastSyncTime(),
    summary: data ? universalAnalyticsStore.getSummary() : null,
    trackRating,
    trackShare,
    refresh,
  }
}

// Simplified hook for basic universal data access
export function useUniversalAnalyticsData() {
  const { data, isLoading, error, isConnected } = useUniversalAnalytics()

  return {
    totalRatings: data?.totalRatings || 0,
    totalShares: data?.totalShares || 0,
    leaderRatings: data?.leaderRatings || {},
    shareAnalytics: data?.shareAnalytics || [],
    activeUsers: data?.activeUsers || 0,
    lastUpdated: data?.lastUpdated || null,
    serverTime: data?.serverTime || null,
    version: data?.version || "19",
    isLoading,
    error,
    isConnected,
  }
}

// Hook for leader-specific universal analytics
export function useUniversalLeaderAnalytics(officialId: string) {
  const { data } = useUniversalAnalytics()

  const leaderData = data?.leaderRatings[officialId] || null

  return {
    data: leaderData,
    isLoading: !data,
    error: null,
  }
}

// Hook for universal share tracking
export function useUniversalShareTracking() {
  const { trackShare, isConnected } = useUniversalAnalytics()

  const trackShareWithFeedback = useCallback(
    async (platform: SharePlatform) => {
      await trackShare(platform)

      // Provide user feedback
      if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
        navigator.vibrate(50)
      }
    },
    [trackShare],
  )

  return {
    trackShare: trackShareWithFeedback,
    isConnected,
  }
}

// Export admin functions
export const resetUniversalAnalytics = () => universalAnalyticsStore.resetAllData()
export const refreshUniversalAnalytics = () => universalAnalyticsStore.refresh()
