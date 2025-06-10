"use client"

import { useCallback, useEffect, useRef, useState } from "react"

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

class UniversalAnalyticsStore {
  private data: UniversalAnalytics
  private listeners: Set<(data: UniversalAnalytics) => void> = new Set()
  private errorListeners: Set<(error: Error) => void> = new Set()
  private isInitialized = false
  private lastSyncTime = 0

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
    try {
      const stored = localStorage.getItem("universal-analytics-v21")
      if (stored) {
        this.data = { ...this.getInitialData(), ...JSON.parse(stored) }
      }
    } catch {}

    this.isInitialized = true
    this.notifyListeners()

    if (typeof window !== "undefined") {
      this.listenToEvents()
    }
  }

  private listenToEvents() {
    const eventSource = new EventSource("/api/analytics/stream")

    eventSource.addEventListener("rating", (e: any) => {
      try {
        const data = JSON.parse(e.data)
        this.applyRatingDelta(data)
      } catch (err) {
        console.warn("Invalid rating event:", err)
      }
    })

    eventSource.addEventListener("share", (e: any) => {
      try {
        const data = JSON.parse(e.data)
        this.applyShareDelta(data)
      } catch (err) {
        console.warn("Invalid share event:", err)
      }
    })

    eventSource.addEventListener("user", (e: any) => {
      try {
        const data = JSON.parse(e.data)
        this.data.activeUsers = data.activeUsers
        this.notifyListeners()
      } catch (err) {
        console.warn("Invalid user event:", err)
      }
    })
  }

  private applyRatingDelta(data: { officialId: string; averageRating: number; totalRatings: number }) {
    this.patchRating(data.officialId, {
      averageRating: data.averageRating,
      totalRatings: data.totalRatings,
    })
  }

  private applyShareDelta(data: { platform: string; totalShares: number }) {
    const index = this.data.shareAnalytics.findIndex((s) => s.platform === data.platform)
    if (index !== -1) {
      this.data.shareAnalytics[index].count += 1
      this.data.shareAnalytics[index].lastShared = new Date().toISOString()
    }
    this.patchShares(data.totalShares)
  }

  patchRating(officialId: string, data: { averageRating: number; totalRatings: number }) {
    if (!this.data.leaderRatings[officialId]) {
      this.data.leaderRatings[officialId] = {
        officialId,
        averageRating: data.averageRating,
        totalRatings: data.totalRatings,
        ratingDistribution: {},
        lastUpdated: new Date().toISOString(),
        performanceMetrics: {
          approvalRating: Math.round((data.averageRating / 5) * 100),
          trendsUp: data.averageRating > 3,
          monthlyChange: 0,
        },
      }
    } else {
      const leader = this.data.leaderRatings[officialId]
      leader.averageRating = data.averageRating
      leader.totalRatings = data.totalRatings
      leader.performanceMetrics.approvalRating = Math.round((data.averageRating / 5) * 100)
      leader.performanceMetrics.trendsUp = data.averageRating > 3
      leader.lastUpdated = new Date().toISOString()
    }
    this.data.lastUpdated = new Date().toISOString()
    this.notifyListeners()
  }

  patchShares(totalShares: number) {
    this.data.totalShares = totalShares
    this.data.lastUpdated = new Date().toISOString()
    this.notifyListeners()
  }

  patchActiveUsers(userCount: number) {
    this.data.activeUsers = userCount
    this.notifyListeners()
  }

  subscribe(callback: (data: UniversalAnalytics) => void) {
    this.listeners.add(callback)
    if (this.isInitialized) callback(this.data)
    return () => this.listeners.delete(callback)
  }

  subscribeToErrors(callback: (error: Error) => void) {
    this.errorListeners.add(callback)
    return () => this.errorListeners.delete(callback)
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this.data))
  }

  private notifyError(err: Error) {
    this.errorListeners.forEach((cb) => cb(err))
  }

  async trackRating(officialId: string, rating: number) {
    try {
      await fetch("/api/analytics/universal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rating", data: { officialId, rating } }),
      })
    } catch (err) {
      this.notifyError(new Error("Failed to track rating"))
    }
  }

  async trackShare(platform: SharePlatform) {
    try {
      await fetch("/api/analytics/universal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "share", data: { platform } }),
      })
    } catch (err) {
      this.notifyError(new Error("Failed to track share"))
    }
  }

  resetAllData() {
    this.data = this.getInitialData()
    this.notifyListeners()
  }

  getSummary(): AnalyticsSummary {
    const trending = this.data.shareAnalytics
      .filter((s) => s.trend === "up")
      .sort((a, b) => b.velocity - a.velocity)
      .map((s) => s.platform as SharePlatform)

    const mostPopular =
      this.data.totalShares > 0
        ? this.data.shareAnalytics.reduce((max, s) => (s.count > max.count ? s : max)).platform
        : null

    return {
      totalShares: this.data.totalShares,
      totalRatings: this.data.totalRatings,
      mostPopular,
      trending,
      lastUpdate: this.data.lastUpdated,
      activeUsers: this.data.activeUsers,
      isConnected: true,
    }
  }
}

export const universalAnalyticsStore = new UniversalAnalyticsStore()

export function useUniversalAnalytics() {
  const [data, setData] = useState<UniversalAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const unsub = universalAnalyticsStore.subscribe(setData)
    const errUnsub = universalAnalyticsStore.subscribeToErrors(setError)
    setIsLoading(false)
    return () => {
      unsub()
      errUnsub()
    }
  }, [])

  return {
    data,
    isLoading,
    error,
    summary: data ? universalAnalyticsStore.getSummary() : null,
    trackRating: universalAnalyticsStore.trackRating.bind(universalAnalyticsStore),
    trackShare: universalAnalyticsStore.trackShare.bind(universalAnalyticsStore),
    reset: universalAnalyticsStore.resetAllData.bind(universalAnalyticsStore),
  }
}

export function useUniversalAnalyticsData() {
  const { data, isLoading, error } = useUniversalAnalytics()
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
  }
}

export function useUniversalLeaderAnalytics(officialId: string) {
  const { data } = useUniversalAnalytics()
  return {
    data: data?.leaderRatings[officialId] || null,
    isLoading: !data,
    error: null,
  }
}

export function useUniversalShareTracking() {
  const { trackShare, error } = useUniversalAnalytics()
  const trackShareWithFeedback = useCallback(async (platform: SharePlatform) => {
    await trackShare(platform)
    if (typeof window !== "undefined" && navigator?.vibrate) navigator.vibrate(50)
  }, [trackShare])

  return {
    trackShare: trackShareWithFeedback,
    error,
  }
}
