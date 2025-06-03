"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Wifi, WifiOff, Globe, Activity } from "lucide-react"
import { useUniversalAnalyticsData } from "@/app/services/universal-analytics"

export function UniversalAnalyticsHeader() {
  const { totalShares, totalRatings, activeUsers, isConnected, lastUpdated, version } = useUniversalAnalyticsData()

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

  return (
    <div className="bg-green-600 text-white py-2 sm:py-3 border-b border-green-700">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
          {/* Logo/Title */}
          <Link href="/" className="font-bold text-base sm:text-lg hover:text-green-100 transition-colors">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              Nigerian Cabinet Rating
            </div>
          </Link>

          {/* Universal Analytics Display - Responsive */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            {/* Total Ratings */}
            <div className="flex items-center gap-1 sm:gap-2">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{totalRatings.toLocaleString()}</span>
              <span className="hidden sm:inline">ratings</span>
            </div>

            {/* Total Shares */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{totalShares.toLocaleString()}</span>
              <span className="hidden sm:inline">shares</span>
            </div>

            {/* Active Users */}
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-medium">{activeUsers}</span>
              <span className="hidden sm:inline">active</span>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
              ) : (
                <WifiOff className="w-3 h-3 sm:w-4 sm:h-4 text-red-300" />
              )}
              <Badge variant={isConnected ? "secondary" : "destructive"} className="text-xs px-1 sm:px-2 py-0.5">
                {isConnected ? "Global" : "Local"}
              </Badge>
            </div>

            {/* Last Updated */}
            <div className="hidden md:flex items-center gap-1 text-xs text-green-200">
              <span>Updated:</span>
              <span>{formatLastUpdated(lastUpdated)}</span>
            </div>

            {/* Version Badge */}
            <Badge variant="outline" className="text-xs text-green-200 border-green-400 hidden lg:inline-flex">
              v{version}
            </Badge>

            {/* Analytics Link */}
            <Link href="/analytics" className="hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-green-100 hover:bg-green-700 h-auto py-1 px-2 text-xs"
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

        {/* Mobile Last Updated */}
        <div className="md:hidden text-center text-xs text-green-200 mt-1">
          Updated: {formatLastUpdated(lastUpdated)} • {isConnected ? "Global Data" : "Local Data"}
        </div>
      </div>
    </div>
  )
}
