"use client"

import { useState, useEffect, useRef, useCallback } from "react"

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

// Global analytics store with localStorage persistence
class AnalyticsStore {
  private data: RealTimeAnalytics
  private listeners: Set<(data: RealTimeAnalytics) => void> = new Set()
  private isInitialized = false

  constructor() {
    this.data = this.getInitialData()
    this.loadFromStorage()
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

  private loadFromStorage() {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("nigerian-cabinet-analytics")
      if (stored) {
        const parsed = JSON.parse(stored)
        this.data = { ...this.getInitialData(), ...parsed }
        console.log("📊 Loaded analytics from storage:", this.data)
      }
    } catch (error) {
      console.error("Failed to load analytics from storage:", error)
    }
    this.isInitialized = true
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem("nigerian-cabinet-analytics", JSON.stringify(this.data))
    } catch (error) {
      console.error("Failed to save analytics to storage:", error)
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
    this.data.lastUpdated = new Date().toISOString()
    this.saveToStorage()
    this.listeners.forEach((callback) => {
      try {
        callback(this.data)
      } catch (error) {
        console.error("Error in analytics listener:", error)
      }
    })
  }

  trackRating(officialId: string, rating: number) {
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

    console.log(`✅ Rating tracked: ${officialId} = ${rating}/5 (Total: ${this.data.totalRatings})`)
    this.notify()
  }

  trackShare(platform: SharePlatform) {
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

    console.log(`📊 Share tracked: ${platform} (Total: ${this.data.totalShares})`)
    this.notify()
  }

  getData() {
    return this.data
  }

  reset() {
    this.data = this.getInitialData()
    this.saveToStorage()
    this.notify()
    console.log("🔄 Analytics data reset")
  }
}

// Global instance
const analyticsStore = new AnalyticsStore()

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
        analyticsStore.trackRating(officialId, rating)
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
        analyticsStore.trackShare(platform)
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
    startPolling: () => {}, // No-op since we don't need polling
    stopPolling: () => {}, // No-op since we don't need polling
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
