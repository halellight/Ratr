"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Wifi,
  WifiOff,
  Globe,
  Activity,
  Zap,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
} from "lucide-react"
import { useRealTimeAnalytics } from "@/app/services/real-time-analytics"
import { useEffect, useState } from "react"

export function RealTimeAnalyticsHeader() {
  const { stats, isInitialized } = useRealTimeAnalytics()
  const [pulseClass, setPulseClass] = useState("")

  // Add pulse animation when data updates
  useEffect(() => {
    if (stats?.lastUpdate) {
      setPulseClass("animate-pulse")
      const timer = setTimeout(() => setPulseClass(""), 1000)
      return () => clearTimeout(timer)
    }
  }, [stats?.lastUpdate])

  const formatLastUpdated = (timestamp: string | null) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const getConnectionIcon = () => {
    if (!isInitialized || !stats) return <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />

    switch (stats.connectionStatus) {
      case "connected":
        if (stats.strategy === "websocket") {
          return <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
        }
        return <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
      case "connecting":
        return <Signal className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 animate-pulse" />
      case "error":
        return <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
      default:
        return <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
    }
  }

  const getLatencyIcon = () => {
    if (!stats?.latency) return null

    if (stats.latency < 100) {
      return <SignalHigh className="w-3 h-3 text-green-500" />
    } else if (stats.latency < 300) {
      return <SignalMedium className="w-3 h-3 text-yellow-500" />
    } else {
      return <SignalLow className="w-3 h-3 text-red-500" />
    }
  }

  const getConnectionBadgeVariant = () => {
    if (!stats) return "secondary"

    switch (stats.connectionStatus) {
      case "connected":
        return stats.strategy === "websocket" ? "default" : "secondary"
      case "connecting":
        return "outline"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getConnectionText = () => {
    if (!isInitialized || !stats) return "Connecting..."

    switch (stats.connectionStatus) {
      case "connected":
        return stats.strategy === "websocket" ? "Real-time" : "Live"
      case "connecting":
        return "Connecting"
      case "error":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm text-black py-2 sm:py-3 border-b  border-gray-200 shadow-sm fixed top-2 z-50 rounded-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Title */}
          <Link href="/" className="font-bold text-base sm:text-lg hover:text-green-400 transition-colors">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              
            </div>
          </Link>

          {/* Real-Time Analytics Display - Responsive */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            {/* Total Ratings with pulse animation */}
            <div className={`flex items-center gap-1 sm:gap-2 ${pulseClass}`}>
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{stats?.totalRatings?.toLocaleString() || 0}</span>
              <span className="hidden sm:inline">ratings</span>
            </div>

            {/* Total Shares with pulse animation */}
            <div className={`flex items-center gap-1 sm:gap-2 ${pulseClass}`}>
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{stats?.totalShares?.toLocaleString() || 0}</span>
              <span className="hidden sm:inline">shares</span>
            </div>

            {/* Active Users */}
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{stats?.activeUsers || 0}</span>
              <span className="hidden sm:inline">active</span>
            </div>

            {/* Connection Status with Real-time Indicator */}
            <div className="flex items-center gap-1">
              {getConnectionIcon()}
              <Badge
                variant={getConnectionBadgeVariant()}
                className="text-xs px-1 sm:px-2 py-0.5 flex items-center gap-1"
              >
                {getConnectionText()}
                {stats?.strategy === "websocket" && <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />}
              </Badge>
            </div>

            {/* Latency Indicator (Desktop only) */}
            {stats?.latency && (
              <div className="hidden lg:flex items-center gap-1 text-xs text-green-200">
                {getLatencyIcon()}
                <span>{stats.latency}ms</span>
              </div>
            )}

            {/* Last Updated */}
            <div className="hidden md:flex items-center gap-1 text-xs text-green-400">
              <span>Updated:</span>
              <span>{formatLastUpdated(stats?.lastUpdate || null)}</span>
            </div>

            {/* Strategy Badge (Desktop only) */}
            {stats?.strategy && (
              <Badge variant="outline" className="text-xs text-green-200 border-green-400 hidden lg:inline-flex">
                {stats.strategy === "websocket" ? "WebSocket" : "Polling"}
              </Badge>
            )}

            {/* Analytics Link */}
            <Link href="/analytics" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-white bg-green-400 h-auto py-1 px-2 text-xs"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                Analytics
              </Button>
            </Link>

            {/* Mobile Analytics Link */}
            <Link href="/analytics" className="sm:hidden">
              <BarChart3 className="w-4 h-4 hover:text-green-100" />
            </Link>
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="md:hidden text-center text-xs text-green-400 mt-1 flex items-center justify-center gap-2">
          <span>Updated: {formatLastUpdated(stats?.lastUpdate || null)}</span>
          <span>•</span>
          <span>{getConnectionText()}</span>
          {stats?.latency && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                {getLatencyIcon()}
                {stats.latency}ms
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
