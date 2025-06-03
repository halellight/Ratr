"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Universal Analytics Service v21 - Fixed Exports and Share Tracking
 *
 * This service ensures votes are properly logged and that ALL users see the SAME analytics data.
 * Uses real data only, with proper fallback mechanisms.
 */

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
  globalId: string
  isRedisConnected: boolean
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

// Universal analytics store with proper error handling
class UniversalAnalyticsStore {
  private data: UniversalAnalytics
  private listeners: Set<(data: UniversalAnalytics) => void> = new Set()
  private errorListeners: Set<(error: Error) => void> = new Set()
  private isInitialized = false
  private pollingInterval: NodeJS.Timeout | null = null
  private readonly POLLING_INTERVAL = 5000 // 5 seconds
  private lastSyncTime = 0
  private syncInProgress = false
  private isServerAvailable = false

  constructor() {
    this.data = this.getInitialData()
    this.initialize()
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
      version: "21",
      globalId: "universal",
      isRedisConnected: false,
    }
  }

  private async initialize() {
    console.log("🌍 Initializing Universal Analytics Store v21")

    // Load from localStorage immediately
    this.loadFromStorage()

    // Test server connection
    await this.testServerConnection()

    if (this.isServerAvailable) {
      // Load from server
      await this.loadFromServer()
      // Start polling for updates
      this.startPolling()
    } else {
      console.warn("⚠️ Server not available - using localStorage only mode")
    }

    this.isInitialized = true
    this.notifyListeners()
  }

  private async testServerConnection(): Promise<void> {
    try {
      console.log("🔍 Testing server connection...")

      const response = await fetch("/api/analytics/universal", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      this.isServerAvailable = response.ok
      console.log(`🔍 Server connection test: ${this.isServerAvailable ? "✅ Available" : "❌ Unavailable"}`)
    } catch (error) {
      console.warn("⚠️ Server connection test failed:", error)
      this.isServerAvailable = false
    }
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("universal-analytics-v21")
      if (stored) {
        const parsed = JSON.parse(stored)
        this.data = { ...this.getInitialData(), ...parsed }
        console.log("📊 Loaded from localStorage:", {
          totalRatings: this.data.totalRatings,
          totalShares: this.data.totalShares,
        })
      }
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
    }
  }

  private async loadFromServer() {
    if (this.syncInProgress || !this.isServerAvailable) return
    this.syncInProgress = true

    try {
      console.log("🔄 Loading analytics from server...")

      const response = await fetch("/api/analytics/universal", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          this.data = {
            ...this.getInitialData(),
            ...result.data,
            version: "21",
            isRedisConnected: result.data.isRedisConnected || false,
          }

          console.log("✅ Loaded from server:", {
            totalRatings: this.data.totalRatings,
            totalShares: this.data.totalShares,
            isRedisConnected: this.data.isRedisConnected,
          })

          this.saveToStorage()
          this.lastSyncTime = Date.now()
        }
      } else {
        console.warn("Server response not ok:", response.status, response.statusText)
        this.isServerAvailable = false
      }
    } catch (error) {
      console.error("❌ Failed to load from server:", error)
      this.isServerAvailable = false
      this.notifyError(new Error("Failed to sync with server"))
    } finally {
      this.syncInProgress = false
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("universal-analytics-v21", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  private startPolling() {
    if (this.pollingInterval || !this.isServerAvailable) return

    this.pollingInterval = setInterval(async () => {
      if (this.syncInProgress) return

      try {
        const response = await fetch("/api/analytics/universal?since=" + encodeURIComponent(this.data.lastUpdated), {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (response.status === 304) {
          // No new data
          return
        }

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Only update if data is newer
            if (result.data.lastUpdated > this.data.lastUpdated) {
              this.data = {
                ...this.getInitialData(),
                ...result.data,
                version: "21",
                isRedisConnected: result.data.isRedisConnected || false,
              }

              this.saveToStorage()
              this.notifyListeners()
              console.log("🔄 Updated from polling:", {
                totalRatings: this.data.totalRatings,
                totalShares: this.data.totalShares,
              })
            }
          }
        } else {
          console.warn("Polling failed:", response.status)
          this.isServerAvailable = false
          this.stopPolling()
        }
      } catch (error) {
        console.error("Polling error:", error)
        this.isServerAvailable = false
        this.stopPolling()
      }
    }, this.POLLING_INTERVAL)
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  subscribe(callback: (data: UniversalAnalytics) => void) {
    this.listeners.add(callback)

    if (this.isInitialized) {
      callback(this.data)
    }

    return () => {
      this.listeners.delete(callback)
    }
  }

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

  // Track rating with proper error handling
  async trackRating(officialId: string, rating: number) {
    console.log(`🗳️ Tracking vote: ${officialId} = ${rating}/5`)

    if (this.isServerAvailable) {
      try {
        // Send to server
        const response = await fetch("/api/analytics/universal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "rating",
            data: {
              officialId,
              rating,
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            // Update local data with server response
            this.data = {
              ...this.getInitialData(),
              ...result.data,
              version: "21",
              isRedisConnected: result.data.isRedisConnected || false,
            }

            this.saveToStorage()
            this.notifyListeners()

            console.log(`✅ Vote logged successfully: ${officialId} = ${rating}/5`)
            console.log(`📊 New totals - Ratings: ${this.data.totalRatings}, Shares: ${this.data.totalShares}`)
            return
          }
        } else {
          throw new Error(`Server error: ${response.status}`)
        }
      } catch (error) {
        console.error("❌ Failed to log vote to server:", error)
        this.isServerAvailable = false
        // Fall through to local storage
      }
    }

    // Fallback: update local data only
    console.log(`📱 Fallback: updating local data for ${officialId} = ${rating}/5`)
    this.updateLocalRating(officialId, rating)
    this.notifyError(new Error("Vote saved locally only - server unavailable"))
  }

  // Fallback local update (no dummy data)
  private updateLocalRating(officialId: string, rating: number) {
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
          monthlyChange: 0, // Real data only
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
      // monthlyChange stays 0 for real data
    }

    this.data.lastUpdated = new Date().toISOString()
    this.saveToStorage()
    this.notifyListeners()
  }

  // Track share
  async trackShare(platform: SharePlatform) {
    console.log(`📊 Tracking share: ${platform}`)

    if (this.isServerAvailable) {
      try {
        const response = await fetch("/api/analytics/universal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "share",
            data: {
              platform,
            },
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            this.data = {
              ...this.getInitialData(),
              ...result.data,
              version: "21",
              isRedisConnected: result.data.isRedisConnected || false,
            }

            this.saveToStorage()
            this.notifyListeners()

            console.log(`✅ Share logged: ${platform}`)
            return
          }
        }
      } catch (error) {
        console.error("❌ Failed to log share:", error)
        this.isServerAvailable = false
      }
    }

    // Fallback: local update
    this.data.totalShares += 1
    const shareIndex = this.data.shareAnalytics.findIndex((s) => s.platform === platform)
    if (shareIndex >= 0) {
      this.data.shareAnalytics[shareIndex].count += 1
      this.data.shareAnalytics[shareIndex].lastShared = new Date().toISOString()
      this.data.shareAnalytics[shareIndex].trend = "up"
      // velocity stays 0 for real data
    }

    this.data.lastUpdated = new Date().toISOString()
    this.saveToStorage()
    this.notifyListeners()
  }

  getData(): UniversalAnalytics {
    return this.data
  }

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
      isConnected: this.isServerAvailable,
    }
  }

  async refresh() {
    console.log("🔄 Forcing refresh")
    await this.testServerConnection()
    if (this.isServerAvailable) {
      await this.loadFromServer()
      this.notifyListeners()
    }
  }

  isConnected(): boolean {
    return this.isServerAvailable && Date.now() - this.lastSyncTime < 30000
  }

  getLastSyncTime(): number {
    return this.lastSyncTime
  }

  async resetAllData() {
    console.log("🗑️ Resetting all analytics data")

    if (this.isServerAvailable) {
      try {
        const response = await fetch("/api/analytics/universal", {
          method: "DELETE",
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data) {
            this.data = {
              ...this.getInitialData(),
              ...result.data,
              version: "21",
            }

            this.saveToStorage()
            this.notifyListeners()
            console.log("✅ Analytics data reset successfully")
            return
          }
        }
      } catch (error) {
        console.error("❌ Failed to reset analytics:", error)
      }
    }

    // Fallback: reset local data
    this.data = this.getInitialData()
    this.saveToStorage()
    this.notifyListeners()
  }

  cleanup() {
    this.stopPolling()
    this.listeners.clear()
    this.errorListeners.clear()
  }
}

// Global singleton instance
const universalAnalyticsStore = new UniversalAnalyticsStore()

// Cleanup on window unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    universalAnalyticsStore.cleanup()
  })
}

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

    const unsubscribeData = universalAnalyticsStore.subscribe((newData) => {
      setData(newData)
      setIsLoading(false)

      const isNewUpdate = lastUpdateRef.current !== newData.lastUpdated
      if (isNewUpdate && lastUpdateRef.current !== null) {
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)
      }

      lastUpdateRef.current = newData.lastUpdated
    })

    const unsubscribeErrors = universalAnalyticsStore.subscribeToErrors((err) => {
      setError(err)
      setTimeout(() => setError(null), 5000)
    })

    return () => {
      unsubscribeData()
      unsubscribeErrors()
    }
  }, [])

  const trackRating = useCallback(async (officialId: string, rating: number) => {
    console.log(`🗳️ Hook: tracking rating ${officialId} = ${rating}/5`)
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
    version: data?.version || "21",
    isRedisConnected: data?.isRedisConnected || false,
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

// Hook for universal share tracking - THIS WAS MISSING!
export function useUniversalShareTracking() {
  const { trackShare, isConnected, error } = useUniversalAnalytics()

  const trackShareWithFeedback = useCallback(
    async (platform: SharePlatform) => {
      console.log(`📊 Share tracking hook: ${platform}`)

      try {
        await trackShare(platform)

        // Provide user feedback
        if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
          navigator.vibrate(50)
        }

        console.log(`✅ Share tracked successfully: ${platform}`)
      } catch (err) {
        console.error(`❌ Failed to track share: ${platform}`, err)
        throw err
      }
    },
    [trackShare],
  )

  return {
    trackShare: trackShareWithFeedback,
    isConnected,
    error,
  }
}

// Export admin functions
export const resetUniversalAnalytics = () => universalAnalyticsStore.resetAllData()
export const refreshUniversalAnalytics = () => universalAnalyticsStore.refresh()
