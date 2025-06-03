"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import {
  universalAnalyticsStore,
  type UniversalAnalytics,
  type AnalyticsSummary,
} from "../services/universal-analytics"

interface UniversalAnalyticsContextType {
  data: UniversalAnalytics | null
  summary: AnalyticsSummary | null
  isLoading: boolean
  error: Error | null
  isConnected: boolean
  hasNewData: boolean
  trackRating: (officialId: string, rating: number) => Promise<void>
  trackShare: (platform: string) => Promise<void>
  refresh: () => Promise<void>
}

const UniversalAnalyticsContext = createContext<UniversalAnalyticsContextType | undefined>(undefined)

export function UniversalAnalyticsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UniversalAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasNewData, setHasNewData] = useState(false)

  const lastUpdateRef = useRef<string | null>(null)

  useEffect(() => {
    console.log("🌍 Universal Analytics Provider initialized")

    // Subscribe to data updates
    const unsubscribeData = universalAnalyticsStore.subscribe((newData) => {
      setData(newData)
      setIsLoading(false)

      const isNewUpdate = lastUpdateRef.current !== newData.lastUpdated
      if (isNewUpdate && lastUpdateRef.current !== null) {
        setHasNewData(true)
        // Reset hasNewData after 3 seconds
        setTimeout(() => setHasNewData(false), 3000)
      }
      lastUpdateRef.current = newData.lastUpdated
    })

    // Subscribe to error events
    const unsubscribeErrors = universalAnalyticsStore.subscribeToErrors((err) => {
      setError(err)
      setTimeout(() => setError(null), 5000)
    })

    return () => {
      unsubscribeData()
      unsubscribeErrors()
    }
  }, [])

  // Track a rating event
  const trackRating = async (officialId: string, rating: number) => {
    try {
      await universalAnalyticsStore.trackRating(officialId, rating)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to track rating"))
    }
  }

  // Track a share event
  const trackShare = async (platform: string) => {
    try {
      await universalAnalyticsStore.trackShare(platform as any)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to track share"))
    }
  }

  // Refresh analytics data manually
  const refresh = async () => {
    try {
      await universalAnalyticsStore.refresh()
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to refresh analytics data"))
    }
  }

  // Generate summary from the latest data
  const summary = data ? universalAnalyticsStore.getSummary() : null

  const value: UniversalAnalyticsContextType = {
    data,
    summary,
    isLoading,
    error,
    isConnected: universalAnalyticsStore.isConnected(),
    hasNewData,
    trackRating,
    trackShare,
    refresh,
  }

  return (
    <UniversalAnalyticsContext.Provider value={value}>
      {children}
    </UniversalAnalyticsContext.Provider>
  )
}

export function useUniversalAnalyticsContext() {
  const context = useContext(UniversalAnalyticsContext)
  if (!context) {
    throw new Error("useUniversalAnalyticsContext must be used within UniversalAnalyticsProvider")
  }
  return context
}
