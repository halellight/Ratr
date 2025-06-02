"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { analyticsService, type AnalyticsSnapshot, type SharePlatform } from "@/app/services/analytics-service"

/**
 * Enhanced Real-Time Analytics Hook v18
 *
 * This hook provides a React-friendly interface to the analytics service
 * with additional features like:
 * - Automatic subscription management
 * - Loading states
 * - Error handling
 * - Performance optimizations
 * - Velocity tracking
 * - Trend analysis
 */

interface UseRealTimeAnalyticsOptions {
  autoStart?: boolean
  pollingInterval?: number
  onUpdate?: (snapshot: AnalyticsSnapshot) => void
  onError?: (error: Error) => void
  enableVelocityTracking?: boolean
}

interface UseRealTimeAnalyticsReturn {
  snapshot: AnalyticsSnapshot | null
  isLoading: boolean
  error: string | null
  hasNewData: boolean
  isConnected: boolean
  trackShare: (platform: SharePlatform) => Promise<void>
  refresh: () => Promise<void>
  startPolling: () => void
  stopPolling: () => void
  getSummary: () => ReturnType<typeof analyticsService.getSummary>
}

export function useRealTimeAnalytics(options: UseRealTimeAnalyticsOptions = {}): UseRealTimeAnalyticsReturn {
  const { 
    autoStart = true, 
    onUpdate, 
    onError,
    enableVelocityTracking = true 
  } = options

  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNewData, setHasNewData] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Use refs to track the latest values
  const previousSnapshotRef = useRef<AnalyticsSnapshot | null>(null)
  const newDataTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle snapshot updates
  const handleSnapshotUpdate = useCallback((newSnapshot: AnalyticsSnapshot) => {
    const isNewData = previousSnapshotRef.current && 
      newSnapshot.lastUpdated !== previousSnapshotRef.current.lastUpdated

    setSnapshot(newSnapshot)
    setIsLoading(false)
    setError(null)
    setIsConnected(true)

    // Reset connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
    }
    
    // Set connection timeout (consider disconnected if no updates for 30 seconds)
    connectionTimeoutRef.current = setTimeout(() => {
      setIsConnected(false)
    }, 30000)

    if (isNewData) {
      setHasNewData(true)
      console.log("📊 New analytics data received:", {
        totalShares: newSnapshot.totalShares,
        updateCount: newSnapshot.metadata.updateCount,
      })

      // Clear previous timeout
      if (newDataTimeoutRef.current) {
        clearTimeout(newDataTimeoutRef.current)
      }

      // Reset new data indicator after 3 seconds
      newDataTimeoutRef.current = setTimeout(() => {
        setHasNewData(false)
      }, 3000)
    }

    previousSnapshotRef.current = newSnapshot

    // Call update callback if provided
    if (onUpdate) {
      onUpdate(newSnapshot)
    }
  }, [onUpdate])

  // Track share with error handling and optimistic updates
  const trackShare = useCallback(async (platform: SharePlatform): Promise<void> => {
    try {
      console.log(`📊 Tracking share: ${platform}`)
      await analyticsService.trackShare(platform)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to track share")
      setError(error.message)
      console.error("❌ Share tracking failed:", error)

      if (onError) {
        onError(error)
      }

      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null)
      }, 5000)
    }
  }, [onError])

  // Refresh data
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)
      await analyticsService.refresh()
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to refresh data")
      setError(error.message)
      setIsLoading(false)

      if (onError) {
        onError(error)
      }
    }
  }, [onError])

  // Start polling
  const startPolling = useCallback((): void => {
    analyticsService.startPolling()
  }, [])

  // Stop polling
  const stopPolling = useCallback((): void => {
    analyticsService.stopPolling()
  }, [])

  // Get summary
  const getSummary = useCallback(() => {
    return analyticsService.getSummary()
  }, [])

  // Set up subscription and polling
  useEffect(() => {
    console.log("📊 Setting up analytics subscription")
    
    // Subscribe to analytics updates
    const unsubscribe = analyticsService.subscribe(handleSnapshotUpdate)

    // Start polling if auto-start is enabled
    if (autoStart) {
      analyticsService.startPolling()
    }

    // Get initial data
    const currentSnapshot = analyticsService.getCurrentSnapshot()
    if (currentSnapshot) {
      setSnapshot(currentSnapshot)
      setIsLoading(false)
      setIsConnected(true)
      previousSnapshotRef.current = currentSnapshot
    }

    // Cleanup function
    return () => {
      console.log("📊 Cleaning up analytics subscription")
      unsubscribe()

      if (newDataTimeoutRef.current) {
        clearTimeout(newDataTimeoutRef.current)
      }

      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
      }

      // Only stop polling if we started it
      if (autoStart) {
        analyticsService.stopPolling()
      }
    }
  }, [autoStart, handleSnapshotUpdate])

  return {
    snapshot,
    isLoading,
    error,
    hasNewData,
    isConnected,
    trackShare,
    refresh,
    startPolling,
    stopPolling,
    getSummary,
  }
}

/**
 * Simplified hook for basic analytics data
 */
export function useAnalyticsData() {
  const { snapshot, isLoading, error, isConnected } = useRealTimeAnalytics()

  return {
    data: snapshot?.data || [],
    totalShares: snapshot?.totalShares || 0,
    mostPopular: snapshot?.mostPopular || null,
    lastUpdated: snapshot?.lastUpdated || null,
    isLoading,
    error,
    isConnected,
    metadata: snapshot?.metadata,
  }
}

/**
 * Hook for tracking shares with analytics
 */
export function useShareTracking() {
  const { trackShare, isConnected } = useRealTimeAnalytics()

  const trackShareWithFeedback = useCallback(async (platform: SharePlatform) => {
    if (!isConnected) {
      console.warn("⚠️ Analytics not connected, tracking locally only")
    }
    
    await trackShare(platform)
    
    // Provide user feedback
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      navigator.vibrate(50) // Haptic feedback on mobile
    }
  }, [trackShare, isConnected])

  return {
    trackShare: trackShareWithFeedback,
    isConnected,
  }
}
