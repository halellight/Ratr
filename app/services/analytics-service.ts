"use client"

import React from "react"

/**
 * Real-Time Analytics Service v18 - Real Data Only
 *
 * This service provides a centralized way to manage analytics data with real-time updates.
 * It uses an optimized polling strategy with the following benefits:
 *
 * 1. EFFICIENCY: Conditional requests using ETags/timestamps to minimize data transfer
 * 2. SCALABILITY: Configurable polling intervals and automatic backoff on errors
 * 3. MAINTAINABILITY: Clean separation of concerns with event-driven architecture
 * 4. RELIABILITY: Automatic retry logic and graceful degradation
 * 5. REAL DATA ONLY: No dummy data, starts from zero and builds with real interactions
 *
 * Why Polling over WebSockets:
 * - Simpler infrastructure requirements (no persistent connections)
 * - Better compatibility with serverless architectures (Vercel)
 * - Easier to implement caching and CDN strategies
 * - More resilient to network interruptions
 * - Lower server resource usage for moderate traffic
 * - Better mobile device battery life
 */

export type SharePlatform = "twitter" | "facebook" | "whatsapp" | "copy" | "native" | "other"

export interface ShareData {
  platform: SharePlatform
  count: number
  lastShared: string
  trend?: "up" | "down" | "stable"
  velocity?: number // shares per hour
}

export interface AnalyticsSnapshot {
  data: ShareData[]
  lastUpdated: string
  totalShares: number
  mostPopular: SharePlatform | null
  metadata: {
    serverTime: string
    version: string
    updateCount: number
  }
}

export interface AnalyticsServiceConfig {
  pollingInterval: number
  maxRetries: number
  backoffMultiplier: number
  enableLocalStorage: boolean
  enableServerSync: boolean
  enableVelocityTracking: boolean
  maxCacheAge: number
}

class AnalyticsService {
  private config: AnalyticsServiceConfig
  private currentSnapshot: AnalyticsSnapshot | null = null
  private lastServerUpdate: string | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private retryCount = 0
  private listeners: Set<(snapshot: AnalyticsSnapshot) => void> = new Set()
  private isPolling = false
  private updateCount = 0
  private velocityTracker: Map<SharePlatform, number[]> = new Map()

  constructor(config: Partial<AnalyticsServiceConfig> = {}) {
    this.config = {
      pollingInterval: 5000, // 5 seconds default
      maxRetries: 3,
      backoffMultiplier: 1.5,
      enableLocalStorage: true,
      enableServerSync: true,
      enableVelocityTracking: true,
      maxCacheAge: 300000, // 5 minutes
      ...config,
    }

    // Initialize velocity tracking
    this.initializeVelocityTracking()

    // Load from localStorage if available (real data only)
    this.loadFromLocalStorage()

    // Bind methods to preserve context
    this.trackShare = this.trackShare.bind(this)
    this.refresh = this.refresh.bind(this)
  }

  /**
   * Subscribe to analytics updates
   */
  subscribe(callback: (snapshot: AnalyticsSnapshot) => void): () => void {
    this.listeners.add(callback)

    // Immediately call with current data if available
    if (this.currentSnapshot) {
      callback(this.currentSnapshot)
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * Start real-time polling
   */
  startPolling(): void {
    if (this.isPolling) return

    this.isPolling = true
    console.log("🚀 Starting real-time analytics polling (real data only)")

    // Initial poll
    this.poll()

    this.pollingInterval = setInterval(() => {
      this.poll()
    }, this.config.pollingInterval)
  }

  /**
   * Stop real-time polling
   */
  stopPolling(): void {
    this.isPolling = false

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
      console.log("⏹️ Stopped analytics polling")
    }
  }

  /**
   * Track a share event with immediate UI update
   */
  async trackShare(platform: SharePlatform): Promise<void> {
    try {
      console.log(`📊 Tracking REAL share: ${platform}`)

      // Update local data immediately for responsive UI
      this.updateLocalData(platform)

      // Track velocity if enabled
      if (this.config.enableVelocityTracking) {
        this.trackVelocity(platform)
      }

      // Sync with server if enabled
      if (this.config.enableServerSync) {
        await this.syncWithServer(platform)
      }
    } catch (error) {
      console.error("❌ Failed to track share:", error)
      // Continue with local update even if server sync fails
    }
  }

  /**
   * Get current analytics snapshot
   */
  getCurrentSnapshot(): AnalyticsSnapshot | null {
    return this.currentSnapshot
  }

  /**
   * Force refresh from server
   */
  async refresh(): Promise<void> {
    console.log("🔄 Forcing analytics refresh")
    await this.poll()
  }

  /**
   * Get analytics summary
   */
  getSummary(): {
    totalShares: number
    mostPopular: string | null
    trending: SharePlatform[]
    lastUpdate: string | null
  } {
    if (!this.currentSnapshot) {
      return {
        totalShares: 0,
        mostPopular: null,
        trending: [],
        lastUpdate: null,
      }
    }

    const trending = this.currentSnapshot.data
      .filter((item) => item.trend === "up")
      .sort((a, b) => (b.velocity || 0) - (a.velocity || 0))
      .map((item) => item.platform)

    return {
      totalShares: this.currentSnapshot.totalShares,
      mostPopular: this.currentSnapshot.mostPopular,
      trending,
      lastUpdate: this.currentSnapshot.lastUpdated,
    }
  }

  /**
   * Private method to poll for updates
   */
  private async poll(): Promise<void> {
    try {
      const url = this.lastServerUpdate
        ? `/api/analytics?since=${encodeURIComponent(this.lastServerUpdate)}`
        : "/api/analytics"

      const response = await fetch(url, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      // Handle 304 Not Modified - no new data
      if (response.status === 304) {
        this.retryCount = 0 // Reset retry count on successful request
        console.log("📊 No new analytics data (304)")
        return
      }

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        console.log("📊 Received real analytics data:", result.data.length, "platforms")
        this.updateSnapshot(result.data, result.lastUpdated, result.serverTime)
        this.lastServerUpdate = result.lastUpdated
        this.retryCount = 0
      }
    } catch (error) {
      console.error("❌ Polling error:", error)
      this.handlePollingError()
    }
  }

  /**
   * Handle polling errors with exponential backoff
   */
  private handlePollingError(): void {
    this.retryCount++

    if (this.retryCount >= this.config.maxRetries) {
      console.warn("⚠️ Max retries reached, stopping polling")
      this.stopPolling()
      return
    }

    // Implement exponential backoff
    const backoffDelay = this.config.pollingInterval * Math.pow(this.config.backoffMultiplier, this.retryCount)
    console.log(`⏳ Retrying in ${backoffDelay}ms (attempt ${this.retryCount}/${this.config.maxRetries})`)

    setTimeout(() => {
      if (this.isPolling) {
        this.poll()
      }
    }, backoffDelay)
  }

  /**
   * Update local data immediately for responsive UI
   */
  private updateLocalData(platform: SharePlatform): void {
    if (!this.currentSnapshot) {
      this.initializeSnapshot()
    }

    const now = new Date().toISOString()
    const updatedData = this.currentSnapshot!.data.map((item) => {
      if (item.platform === platform) {
        const newCount = item.count + 1
        return {
          ...item,
          count: newCount,
          lastShared: now,
          trend: this.calculateTrend(item.count, newCount),
          velocity: this.getVelocity(platform),
        }
      }
      return item
    })

    this.updateSnapshot(updatedData, now, now)
    this.saveToLocalStorage()
  }

  /**
   * Sync with server
   */
  private async syncWithServer(platform: SharePlatform): Promise<void> {
    const response = await fetch("/api/analytics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ platform }),
    })

    if (!response.ok) {
      throw new Error(`Server sync failed: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.data) {
      this.updateSnapshot(result.data, result.lastUpdated, result.serverTime)
      this.lastServerUpdate = result.lastUpdated
    }
  }

  /**
   * Update the current snapshot and notify listeners
   */
  private updateSnapshot(data: ShareData[], lastUpdated: string, serverTime: string): void {
    this.updateCount++

    const totalShares = data.reduce((sum, item) => sum + item.count, 0)
    const mostPopular =
      totalShares > 0 ? data.reduce((max, item) => (item.count > max.count ? item : max)).platform : null

    this.currentSnapshot = {
      data,
      lastUpdated,
      totalShares,
      mostPopular,
      metadata: {
        serverTime,
        version: "18",
        updateCount: this.updateCount,
      },
    }

    // Notify all listeners
    this.listeners.forEach((callback) => {
      try {
        callback(this.currentSnapshot!)
      } catch (error) {
        console.error("❌ Error in analytics listener:", error)
      }
    })
  }

  /**
   * Initialize snapshot with zero data (real data only)
   */
  private initializeSnapshot(): void {
    const defaultData: ShareData[] = [
      { platform: "twitter", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "facebook", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "whatsapp", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "copy", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "native", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "other", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    ]

    console.log("📊 Initializing analytics with zero data - ready for real interactions")
    this.updateSnapshot(defaultData, new Date().toISOString(), new Date().toISOString())
  }

  /**
   * Calculate trend based on previous and current values
   */
  private calculateTrend(previous: number, current: number): "up" | "down" | "stable" {
    if (current > previous) return "up"
    if (current < previous) return "down"
    return "stable"
  }

  /**
   * Initialize velocity tracking
   */
  private initializeVelocityTracking(): void {
    const platforms: SharePlatform[] = ["twitter", "facebook", "whatsapp", "copy", "native", "other"]
    platforms.forEach((platform) => {
      this.velocityTracker.set(platform, [])
    })
  }

  /**
   * Track velocity (shares per hour)
   */
  private trackVelocity(platform: SharePlatform): void {
    const now = Date.now()
    const timestamps = this.velocityTracker.get(platform) || []

    // Add current timestamp
    timestamps.push(now)

    // Keep only timestamps from the last hour
    const oneHourAgo = now - 60 * 60 * 1000
    const recentTimestamps = timestamps.filter((ts) => ts > oneHourAgo)

    this.velocityTracker.set(platform, recentTimestamps)
  }

  /**
   * Get velocity for a platform
   */
  private getVelocity(platform: SharePlatform): number {
    const timestamps = this.velocityTracker.get(platform) || []
    return timestamps.length // shares in the last hour
  }

  /**
   * Load data from localStorage (real data only)
   */
  private loadFromLocalStorage(): void {
    if (!this.config.enableLocalStorage || typeof window === "undefined") return

    try {
      const saved = localStorage.getItem("rateYourLeadersAnalyticsV18")
      if (saved) {
        const parsed = JSON.parse(saved)

        // Check if data is not too old
        const dataAge = Date.now() - new Date(parsed.lastUpdated).getTime()
        if (dataAge < this.config.maxCacheAge) {
          this.updateSnapshot(parsed.data, parsed.lastUpdated, parsed.metadata?.serverTime || parsed.lastUpdated)
          console.log("📊 Loaded real analytics from localStorage")
        } else {
          console.log("📊 Cached analytics data too old, will refresh from server")
        }
      } else {
        console.log("📊 No cached analytics data found, starting fresh")
      }
    } catch (error) {
      console.error("❌ Failed to load from localStorage:", error)
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToLocalStorage(): void {
    if (!this.config.enableLocalStorage || typeof window === "undefined" || !this.currentSnapshot) return

    try {
      localStorage.setItem("rateYourLeadersAnalyticsV18", JSON.stringify(this.currentSnapshot))
    } catch (error) {
      console.error("❌ Failed to save to localStorage:", error)
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()

// Export hook for React components
export function useAnalytics() {
  const [snapshot, setSnapshot] = React.useState<AnalyticsSnapshot | null>(analyticsService.getCurrentSnapshot())

  React.useEffect(() => {
    const unsubscribe = analyticsService.subscribe(setSnapshot)
    analyticsService.startPolling()

    return () => {
      unsubscribe()
      analyticsService.stopPolling()
    }
  }, [])

  return {
    snapshot,
    trackShare: analyticsService.trackShare,
    refresh: analyticsService.refresh,
    getSummary: analyticsService.getSummary,
  }
}
