"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  RefreshCw,
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Wifi,
  WifiOff,
  Share2,
  Users,
} from "lucide-react"
import { useUniversalAnalytics, useUniversalAnalyticsData } from "@/app/services/universal-analytics"
import Link from "next/link"
import { getAllLeaderBiographies } from "@/app/data/leader-biographies"

/**
 * Universal Analytics Dashboard v21 - Live Data Updates
 *
 * Features:
 * - Real-time data updates with universal analytics system
 * - Connection status monitoring
 * - Live data synchronization across all users
 * - Export functionality
 * - Responsive design
 * - Error handling and loading states
 * - Performance metrics
 * - Uses the new universal analytics system for live updates
 */

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month">("all")

  // Use the new universal analytics system for live data
  const { data, isLoading, error, hasNewData, isConnected, refresh, summary } = useUniversalAnalytics()

  // Get additional analytics data
  const {
    totalRatings,
    totalShares,
    shareAnalytics,
    leaderRatings,
    activeUsers,
    lastUpdated,
    version,
    isRedisConnected,
  } = useUniversalAnalyticsData()

  // Format platform names for display
  const formatPlatformName = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "Twitter/X"
      case "facebook":
        return "Facebook"
      case "whatsapp":
        return "WhatsApp"
      case "copy":
        return "Copy to Clipboard"
      case "native":
        return "Native Share"
      case "other":
        return "Other"
      default:
        return platform
    }
  }

  // Get color for platform
  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "bg-blue-500"
      case "facebook":
        return "bg-blue-600"
      case "whatsapp":
        return "bg-green-500"
      case "copy":
        return "bg-gray-500"
      case "native":
        return "bg-purple-500"
      case "other":
        return "bg-orange-500"
      default:
        return "bg-gray-400"
    }
  }

  // Get trend icon with velocity
  const getTrendIcon = (trend: string, velocity?: number) => {
    const velocityText = velocity ? ` (${velocity}/hr)` : ""

    switch (trend) {
      case "up":
        return (
          <div className="flex items-center gap-1 text-green-500" title={`Trending up${velocityText}`}>
            <TrendingUp className="w-4 h-4" />
            {velocity && velocity > 0 && <span className="text-xs">{velocity}</span>}
          </div>
        )
      case "down":
        return (
          <div className="flex items-center gap-1 text-red-500" title={`Trending down${velocityText}`}>
            <TrendingDown className="w-4 h-4" />
          </div>
        )
      default:
        return <Minus className="w-4 h-4 text-gray-400" title="Stable" />
    }
  }

  // Filter stats based on time range
  const filteredStats =
    shareAnalytics?.filter((stat) => {
      if (timeRange === "all" || !stat.lastShared) return true

      const lastShared = new Date(stat.lastShared)
      const now = new Date()

      if (timeRange === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return lastShared >= oneWeekAgo
      }

      if (timeRange === "month") {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return lastShared >= oneMonthAgo
      }

      return true
    }) || []

  // Calculate total shares from filtered data
  const filteredTotalShares = filteredStats.reduce((sum, stat) => sum + stat.count, 0)

  // Sort stats by count (descending)
  const sortedStats = [...filteredStats].sort((a, b) => b.count - a.count)

  // Calculate max count for scaling bars
  const maxCount = Math.max(...sortedStats.map((stat) => stat.count), 1)

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Never"
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Export data as CSV
  const exportCSV = () => {
    if (!shareAnalytics) return

    const headers = ["Platform", "Shares", "Last Shared", "Trend", "Velocity (per hour)"]
    const rows = shareAnalytics.map((stat) => [
      formatPlatformName(stat.platform),
      stat.count.toString(),
      stat.lastShared ? formatDate(stat.lastShared) : "Never",
      stat.trend || "stable",
      (stat.velocity || 0).toString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `universal-analytics-v21-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/" className="text-green-600 hover:text-green-700 text-sm">
              ← Back to Rating
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Universal Analytics Dashboard</h1>
          <p className="text-gray-600">Live data updates - Universal access for all users</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Connection Status */}
          <div className={`flex items-center gap-2 text-sm ${isConnected ? "text-green-600" : "text-red-600"}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isConnected ? "Connected" : "Disconnected"}</span>
            {isRedisConnected && <Badge className="bg-green-500 text-white text-xs">Redis</Badge>}
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div
              className={`flex items-center gap-2 text-sm ${
                hasNewData ? "text-green-600 animate-pulse" : "text-gray-500"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {hasNewData ? "Just updated!" : "Last updated:"} {formatDate(lastUpdated)}
              </span>
              {hasNewData && <Badge className="bg-green-500 text-white">Live</Badge>}
            </div>
          )}

          {/* Version Info */}
          <div className="text-xs text-gray-400">v{version} • Universal Access</div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Error:</span>
            <span>{error.message}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Time Range:</span>
          <div className="flex rounded-md overflow-hidden border">
            <Button
              variant={timeRange === "all" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setTimeRange("all")}
            >
              All Time
            </Button>
            <Button
              variant={timeRange === "month" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setTimeRange("month")}
            >
              Month
            </Button>
            <Button
              variant={timeRange === "week" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setTimeRange("week")}
            >
              Week
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={!shareAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>

          <Button variant="outline" size="sm" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className={`${hasNewData ? "border-green-500 shadow-lg" : ""} transition-all duration-300`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-500" />
              Total Shares
              {hasNewData && <Badge className="bg-green-500">Updated</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? <Skeleton className="h-10 w-20" /> : filteredTotalShares.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2">Real user interactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? <Skeleton className="h-10 w-20" /> : totalRatings.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2">Leader evaluations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Popular Platform</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-32" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">
                    {filteredTotalShares > 0 ? formatPlatformName(sortedStats[0]?.platform || "none") : "None yet"}
                  </div>
                  {filteredTotalShares > 0 &&
                    sortedStats[0]?.trend &&
                    getTrendIcon(sortedStats[0].trend, sortedStats[0].velocity)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {filteredTotalShares > 0 && sortedStats[0]
                    ? `${sortedStats[0].count.toLocaleString()} shares (${Math.round((sortedStats[0].count / filteredTotalShares) * 100)}%)`
                    : "Start sharing to see data"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? <Skeleton className="h-10 w-20" /> : activeUsers.toLocaleString()}
            </div>
            <p className="text-sm text-gray-500 mt-2">Currently online</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className={`mb-8 ${hasNewData ? "border-green-500" : ""} transition-all duration-300`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Share Distribution by Platform</span>
            <div className="flex items-center gap-2">
              {hasNewData && <Badge className="bg-green-500">Live Data</Badge>}
              {isConnected && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Connected
                </Badge>
              )}
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Universal Access
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))
            ) : filteredTotalShares === 0 ? (
              <div className="text-center py-12">
                <Share2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No sharing data yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  This dashboard shows real user interactions only. Share your ratings to see live analytics!
                </p>
                <div className="mt-4">
                  <Link href="/" passHref>
                    <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                      Start Rating & Sharing
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              sortedStats.map((stat) => (
                <div key={stat.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getPlatformColor(stat.platform)}`}></div>
                      <span className="font-medium">{formatPlatformName(stat.platform)}</span>
                      {stat.trend && getTrendIcon(stat.trend, stat.velocity)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{stat.count.toLocaleString()} shares</span>
                      {stat.velocity && stat.velocity > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {stat.velocity}/hr
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`${getPlatformColor(stat.platform)} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">Last shared: {formatDate(stat.lastShared)}</div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leader Analytics Section */}
      <Card className={`mb-8 ${hasNewData ? "border-green-500" : ""} transition-all duration-300`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Leader Performance Analytics</span>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Real-Time Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderRatings && Object.keys(leaderRatings).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(leaderRatings)
                .sort(([, a], [, b]) => b.averageRating - a.averageRating)
                .slice(0, 6)
                .map(([officialId, rating]) => {
                  const biography = getAllLeaderBiographies().find((bio) => bio.id === officialId)
                  return (
                    <Card key={officialId} className="border-2 hover:border-green-200 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{biography?.fullName || officialId}</CardTitle>
                          <Badge variant={rating.performanceMetrics.trendsUp ? "default" : "secondary"}>
                            {rating.performanceMetrics.trendsUp ? "↗" : "↘"} {rating.performanceMetrics.approvalRating}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{biography?.position}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Average Rating</span>
                            <span className="text-2xl font-bold text-green-600">
                              {rating.averageRating.toFixed(1)}/5
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Total Ratings</span>
                            <span className="font-semibold">{rating.totalRatings.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(rating.averageRating / 5) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            Last updated: {new Date(rating.lastUpdated).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No leader ratings yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Start rating leaders to see their performance analytics here!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips and Documentation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>About Universal Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Universal Access:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All users see the same data globally</li>
                  <li>• Real-time synchronization across sessions</li>
                  <li>• No user-specific filtering or permissions</li>
                  <li>• Data updates instantly for everyone</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">How it works:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Data updates automatically every 5 seconds</li>
                  <li>• Share actions are tracked immediately</li>
                  <li>• Redis storage with localStorage fallback</li>
                  <li>• Connection status monitoring</li>
                  <li>• Cross-browser data synchronization</li>
                  <li>• Real data only, no simulation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">To see analytics data:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Complete the cabinet rating process</li>
                  <li>• Share your results on social media</li>
                  <li>• Each share is immediately tracked</li>
                  <li>• Return here to see live updates</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Understanding Metrics:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• All numbers represent real user interactions</li>
                  <li>• Data is shared globally across all users</li>
                  <li>• Live updates show real-time activity</li>
                  <li>• Connection status shows data sync health</li>
                </ul>
              </div>

              <div className="mt-4">
                <Link href="/" passHref>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Share2 className="w-4 h-4 mr-2" />
                    Start Rating to Generate Data
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsPage
