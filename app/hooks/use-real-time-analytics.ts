"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { redisClient } from "../services/redis-client"

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

export interface RealTimeAnalytics {
  totalRatings: number
  totalShares: number
  leaderRatings: Record<string, LeaderRating>
  shareAnalytics: ShareAnalytics[]
  lastUpdated: string
  activeUsers: number
}

// Global analytics store with Redis + localStorage persistence
class AnalyticsStore {
  private data: RealTimeAnalytics
  private listeners: Set<(data: RealTimeAnalytics) => void> = new Set()
  private isInitialized = false
  private isRedisAvailable = false
  private pollingInterval: NodeJS.Timeout | null = null
  private readonly REDIS_KEY = "nigeria:cabinet:analytics"
  private readonly POLLING_INTERVAL = 5000 // 5 seconds

  constructor() {
    this.data = this.getInitialData()
    this.initialize()
  }

  private getInitialData(): RealTimeAnalytics {
    return {
      totalRatings: 0,
      totalShares: 0,
      leaderRatings: {},
      shareAnalytics: [],
      lastUpdated: new Date().toISOString(),
      activeUsers: 1,
    }
  }

  private async initialize() {
    // Try to load from localStorage first for immediate display
    this.loadFromStorage()

    // Check if Redis is available
    this.isRedisAvailable = await redisClient.isAvailable()

    if (this.isRedisAvailable) {
      console.log("🔄 Redis available, loading global data")
      await this.loadFromRedis()
      this.startPolling()
    } else {
      console.warn("⚠️ Redis not available, using localStorage only")
    }

    this.isInitialized = true
    this.notify()
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("nigerian-cabinet-analytics")
      if (stored) {
        const parsed = JSON.parse(stored)
        this.data = { ...this.getInitialData(), ...parsed }
        console.log("📊 Loaded analytics from localStorage:", this.data)
      }
    } catch (error) {
      console.error("Failed to load analytics from localStorage:", error)
    }
  }

  private async loadFromRedis() {
    try {
      const redisData = await redisClient.get(this.REDIS_KEY)
      if (redisData) {
        // Merge with initial data to ensure all fields exist
        this.data = { ...this.getInitialData(), ...JSON.parse(redisData) }
        console.log("📊 Loaded analytics from Redis:", this.data)
        this.saveToStorage() // Sync to localStorage
      } else {
        // If no data in Redis yet, save our current data
        await this.saveToRedis()
      }
    } catch (error) {
      console.error("Failed to load analytics from Redis:", error)
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("nigerian-cabinet-analytics", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save analytics to localStorage:", error)
    }
  }

  private async saveToRedis() {
    if (!this.isRedisAvailable) return

    try {
      await redisClient.set(this.REDIS_KEY, JSON.stringify(this.data))
      console.log("📊 Saved analytics to Redis")
    } catch (error) {
      console.error("Failed to save analytics to Redis:", error)
      this.isRedisAvailable = false
    }
  }

  private startPolling() {
    if (this.pollingInterval) return

    this.pollingInterval = setInterval(async () => {
      if (!this.isRedisAvailable) return

      try {
        const redisData = await redisClient.get(this.REDIS_KEY)
        if (redisData) {
          const parsedData = JSON.parse(redisData)

          // Only update if the data is newer
          if (parsedData.lastUpdated > this.data.lastUpdated) {
            this.data = parsedData
            this.saveToStorage() // Sync to localStorage
            this.notify()
            console.log("📊 Updated analytics from Redis polling")
          }
        }
      } catch (error) {
        console.error("Failed to poll analytics from Redis:", error)
      }
    }, this.POLLING_INTERVAL)
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  subscribe(callback: (data: RealTimeAnalytics) => void) {
    this.listeners.add(callback)

    // Immediately call with current data
    if (this.isInitialized) {
      callback(this.data)
    }

    return () => {
      this.listeners.delete(callback)
    }
  }

  private notify() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.data)
      } catch (error) {
        console.error("Error in analytics listener:", error)
      }
    })
  }

  async trackRating(officialId: string, rating: number) {
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

    console.log(`✅ Rating tracked: ${officialId} = ${rating}/5 (Total: ${this.data.totalRatings})`)
    this.notify()
  }

  async trackShare(platform: SharePlatform) {
    this.data.totalShares += 1

    const existingShare = this.data.shareAnalytics.find((s) => s.platform === platform)
    if (existingShare) {
      existingShare.count += 1
      existingShare.lastShared = new Date().toISOString()
      existingShare.trend = "up"
      existingShare.velocity += 1
    } else {
      this.data.shareAnalytics.push({
        platform,
        count: 1,
        lastShared: new Date().toISOString(),
        trend: "up",
        velocity: 1,
      })
    }

    this.data.lastUpdated = new Date().toISOString()

    // Save to both storage mechanisms
    this.saveToStorage()
    if (this.isRedisAvailable) {
      await this.saveToRedis()
    }

    console.log(`📊 Share tracked: ${platform} (Total: ${this.data.totalShares})`)
    this.notify()
  }

  getData() {
    return this.data
  }

  async reset() {
    this.data = this.getInitialData()
    this.saveToStorage()
    if (this.isRedisAvailable) {
      await this.saveToRedis()
    }
    this.notify()
    console.log("🔄 Analytics data reset")
  }

  cleanup() {
    this.stopPolling()
  }
}

// Global instance
const analyticsStore = new AnalyticsStore()

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    analyticsStore.cleanup()
  })
}

interface UseRealTimeAnalyticsOptions {
  autoStart?: boolean
  pollingInterval?: number
  onUpdate?: (data: RealTimeAnalytics) => void
  onError?: (error: Error) => void
}

export function useRealTimeAnalytics(options: UseRealTimeAnalyticsOptions = {}) {
  const { onUpdate, onError } = options

  const [data, setData] = useState<RealTimeAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [hasNewData, setHasNewData] = useState(false)

  const lastUpdateRef = useRef<string | null>(null)

  const trackRating = useCallback(
    async (officialId: string, rating: number) => {
      try {
        await analyticsStore.trackRating(officialId, rating)
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        console.error("❌ Rating tracking error:", error)
        if (onError) onError(error)
      }
    },
    [onError],
  )

  const trackShare = useCallback(
    async (platform: SharePlatform) => {
      try {
        await analyticsStore.trackShare(platform)
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        console.error("❌ Share tracking error:", error)
        if (onError) onError(error)
      }
    },
    [onError],
  )

  const refresh = useCallback(() => {
    const currentData = analyticsStore.getData()
    setData(currentData)
    setIsLoading(false)
    setError(null)
    setIsConnected(true)
  }, [])

  useEffect(() => {
    console.log("📊 Setting up analytics subscription")

    const unsubscribe = analyticsStore.subscribe((newData) => {
      setData(newData)
      setIsLoading(false)
      setError(null)
      setIsConnected(true)

      // Check if this is new data
      const isNewUpdate = lastUpdateRef.current !== newData.lastUpdated
      if (isNewUpdate && lastUpdateRef.current !== null) {
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)
      }

      lastUpdateRef.current = newData.lastUpdated

      if (onUpdate) {
        onUpdate(newData)
      }
    })

    return () => {
      console.log("📊 Cleaning up analytics subscription")
      unsubscribe()
    }
  }, [onUpdate])

  return {
    data,
    isLoading,
    error,
    isConnected,
    hasNewData,
    trackRating,
    trackShare,
    refresh,
    startPolling: () => {}, // No-op since polling is handled internally
    stopPolling: () => {}, // No-op since polling is handled internally
  }
}

// Simplified hook for basic analytics data
export function useAnalyticsData() {
  const { data, isLoading, error, isConnected } = useRealTimeAnalytics()

  return {
    totalRatings: data?.totalRatings || 0,
    totalShares: data?.totalShares || 0,
    leaderRatings: data?.leaderRatings || {},
    shareAnalytics: data?.shareAnalytics || [],
    activeUsers: data?.activeUsers || 0,
    lastUpdated: data?.lastUpdated || null,
    isLoading,
    error,
    isConnected,
  }
}

// Hook for leader-specific analytics
export function useLeaderAnalytics(officialId: string) {
  const { data } = useRealTimeAnalytics()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const leaderData = data?.leaderRatings[officialId] || null

  return { data: leaderData, isLoading, error }
}

// Hook for tracking shares with analytics
export function useShareTracking() {
  const { trackShare, isConnected } = useRealTimeAnalytics()

  const trackShareWithFeedback = useCallback(
    async (platform: SharePlatform) => {
      await trackShare(platform)

      // Provide user feedback
      if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
        navigator.vibrate(50) // Haptic feedback on mobile
      }
    },
    [trackShare],
  )

  return {
    trackShare: trackShareWithFeedback,
    isConnected,
  }
}

// Export the store for admin functions
export const resetAnalytics = () => analyticsStore.reset()
