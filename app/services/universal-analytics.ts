"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Universal Analytics Service v20 - Fixed Redis Integration
 *
 * This service ensures votes are properly logged to Redis storage
 * and that ALL users see the SAME analytics data.
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
}

// Universal analytics store with proper API integration
class UniversalAnalyticsStore {
  private data: UniversalAnalytics
  private listeners: Set<(data: UniversalAnalytics) => void> = new Set()
  private errorListeners: Set<(error: Error) => void> = new Set()
  private isInitialized = false
  private pollingInterval: NodeJS.Timeout | null = null
  private readonly POLLING_INTERVAL = 3000 // 3 seconds
  private lastSyncTime = 0
  private syncInProgress = false

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
      version: "20",
      globalId: "universal",
    }
  }

  private async initialize() {
    console.log("🌍 Initializing Universal Analytics Store v20")

    // Load from localStorage immediately
    this.loadFromStorage()

    // Load from server/Redis
    await this.loadFromServer()

    // Start polling for updates
    this.startPolling()

    this.isInitialized = true
    this.notifyListeners()
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("universal-analytics-v20")
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
    if (this.syncInProgress) return
    this.syncInProgress = true

    try {
      console.log("🔄 Loading analytics from server/Redis...")

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
            version: "20",
          }

          console.log("✅ Loaded from server/Redis:", {
            totalRatings: this.data.totalRatings,
            totalShares: this.data.totalShares,
            lastUpdated: this.data.lastUpdated,
          })

          this.saveToStorage()
          this.lastSyncTime = Date.now()
        }
      } else {
        console.warn("Failed to load from server:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("❌ Failed to load from server:", error)
      this.notifyError(new Error("Failed to sync with server"))
    } finally {
      this.syncInProgress = false
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("universal-analytics-v20", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }

  private async saveToServer() {
    try {
      console.log("💾 Saving analytics to server/Redis...")

      const response = await fetch("/api/analytics/universal", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: this.data,
        }),
      })

      if (response.ok) {
        console.log("✅ Saved to server/Redis successfully")
        this.lastSyncTime = Date.now()
      } else {
        console.warn("Failed to save to server:", response.status)
      }
    } catch (error) {
      console.error("❌ Failed to save to server:", error)
    }
  }

  private startPolling() {
    if (this.pollingInterval) return

    this.pollingInterval = setInterval(async () => {
      if (this.syncInProgress) return

      try {
        const response = await fetch(`/api/analytics/universal?since=${this.data.lastUpdated}`, {
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
                version: "20",
              }

              this.saveToStorage()
              this.notifyListeners()
              console.log("🔄 Updated from polling:", {
                totalRatings: this.data.totalRatings,
                totalShares: this.data.totalShares,
              })
            }
          }
        }
      } catch (error) {
        console.error("Polling error:", error)
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

  // Track rating with proper Redis logging
  async trackRating(officialId: string, rating: number) {
    console.log(`🗳️ Tracking vote: ${officialId} = ${rating}/5`)

    try {
      // Send to server/Redis immediately
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
            version: "20",
          }

          this.saveToStorage()
          this.notifyListeners()

          console.log(`✅ Vote logged to Redis: ${officialId} = ${rating}/5`)
          console.log(`📊 New totals - Ratings: ${this.data.totalRatings}, Shares: ${this.data.totalShares}`)
        }
      } else {
        throw new Error(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Failed to log vote to Redis:", error)

      // Fallback: update local data only
      this.updateLocalRating(officialId, rating)
      this.notifyError(new Error("Vote saved locally only - server unavailable"))
    }
  }

  // Fallback local update
  private updateLocalRating(officialId: string, rating: number) {
    console.log(`📱 Fallback: updating local data for ${officialId} = ${rating}/5`)

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
    this.saveToStorage()
    this.notifyListeners()
  }

  // Track share with proper Redis logging
  async trackShare(platform: SharePlatform) {
    console.log(`📊 Tracking share: ${platform}`)

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
            version: "20",
          }

          this.saveToStorage()
          this.notifyListeners()

          console.log(`✅ Share logged to Redis: ${platform}`)
        }
      } else {
        throw new Error(`Server error: ${response.status}`)
      }
    } catch (error) {
      console.error("❌ Failed to log share to Redis:", error)
      this.notifyError(new Error("Share tracking failed"))
    }
  }

  getData(): UniversalAnalytics {
    return this.data
  }

  async refresh() {
    console.log("🔄 Forcing refresh from server/Redis")
    await this.loadFromServer()
    this.notifyListeners()
  }

  isConnected(): boolean {
    return Date.now() - this.lastSyncTime < 30000 // Connected if synced within 30 seconds
  }

  getLastSyncTime(): number {
    return this.lastSyncTime
  }

  async resetAllData() {
    console.log("🗑️ Resetting all analytics data")

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
            version: "20",
          }

          this.saveToStorage()
          this.notifyListeners()
          console.log("✅ Analytics data reset successfully")
        }
      }
    } catch (error) {
      console.error("❌ Failed to reset analytics:", error)
    }
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
    version: data?.version || "20",
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

// Export admin functions
export const resetUniversalAnalytics = () => universalAnalyticsStore.resetAllData()
export const refreshUniversalAnalytics = () => universalAnalyticsStore.refresh()
