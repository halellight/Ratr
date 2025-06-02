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

interface UseRealTimeAnalyticsOptions {
  autoStart?: boolean
  pollingInterval?: number
  onUpdate?: (data: RealTimeAnalytics) => void
  onError?: (error: Error) => void
}

export function useRealTimeAnalytics(options: UseRealTimeAnalyticsOptions = {}) {
  const { autoStart = true, pollingInterval = 5000, onUpdate, onError } = options

  const [data, setData] = useState<RealTimeAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [hasNewData, setHasNewData] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastUpdateRef = useRef<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch("/api/analytics/real-time")

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        const newData = result.data
        setData(newData)
        setIsConnected(true)
        setError(null)

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
      } else {
        throw new Error(result.error || "Failed to fetch analytics")
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error.message)
      setIsConnected(false)

      if (onError) {
        onError(error)
      }

      console.error("❌ Analytics fetch error:", error)
    } finally {
      setIsLoading(false)
    }
  }, [onUpdate, onError])

  const trackRating = useCallback(async (officialId: string, rating: number) => {
    try {
      const response = await fetch("/api/analytics/real-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("userId") || `user_${Date.now()}`,
        },
        body: JSON.stringify({
          type: "rating",
          data: { officialId, rating },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)

        console.log(`✅ Rating tracked: ${officialId} = ${rating}/5`)
      } else {
        throw new Error(result.error || "Failed to track rating")
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      console.error("❌ Rating tracking error:", error)
      throw error
    }
  }, [])

  const trackShare = useCallback(async (platform: SharePlatform) => {
    try {
      const response = await fetch("/api/analytics/real-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": localStorage.getItem("userId") || `user_${Date.now()}`,
        },
        body: JSON.stringify({
          type: "share",
          data: { platform },
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setHasNewData(true)
        setTimeout(() => setHasNewData(false), 3000)

        console.log(`📊 Share tracked: ${platform}`)
      } else {
        throw new Error(result.error || "Failed to track share")
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      console.error("❌ Share tracking error:", error)
      throw error
    }
  }, [])

  const startPolling = useCallback(() => {
    if (intervalRef.current) return

    fetchAnalytics() // Initial fetch
    intervalRef.current = setInterval(fetchAnalytics, pollingInterval)
    console.log("🚀 Started real-time analytics polling")
  }, [fetchAnalytics, pollingInterval])

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      console.log("⏹️ Stopped real-time analytics polling")
    }
  }, [])

  useEffect(() => {
    if (autoStart) {
      startPolling()
    }

    return () => {
      stopPolling()
    }
  }, [autoStart, startPolling, stopPolling])

  return {
    data,
    isLoading,
    error,
    isConnected,
    hasNewData,
    trackRating,
    trackShare,
    refresh: fetchAnalytics,
    startPolling,
    stopPolling,
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
  const [data, setData] = useState<LeaderRating | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLeaderAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/leaders/${officialId}/analytics`)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success) {
          setData(result.data)
          setError(null)
        } else {
          throw new Error(result.error || "Failed to fetch leader analytics")
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error")
        setError(error.message)
        console.error("❌ Leader analytics error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (officialId) {
      fetchLeaderAnalytics()
    }
  }, [officialId])

  return { data, isLoading, error }
}
