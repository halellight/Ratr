"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Share2, TrendingUp, Clock, Activity, Zap, Database, Wifi, Star, Award } from "lucide-react"
import { useUniversalAnalyticsData } from "@/app/services/universal-analytics"
import { useRealTimeAnalytics } from "@/app/services/real-time-analytics"
import { RealTimeActivityFeed } from "@/app/components/real-time-activity-feed"
import { getAllLeaderBiographies } from "@/app/data/leader-biographies"
import Link from "next/link"

function AnalyticsContent() {
  // Get both universal and real-time analytics
  const universalData = useUniversalAnalyticsData()
  const { stats: realTimeStats, isInitialized } = useRealTimeAnalytics()

  // Use real-time data when available, fallback to universal
  const displayData = {
    totalRatings: realTimeStats?.totalRatings ?? universalData.totalRatings,
    totalShares: realTimeStats?.totalShares ?? universalData.totalShares,
    activeUsers: realTimeStats?.activeUsers ?? universalData.activeUsers,
    leaderRatings: realTimeStats?.leaderRatings ?? universalData.leaderRatings,
    shareAnalytics: universalData.shareAnalytics,
    isConnected: (realTimeStats?.connectionStatus === "connected") || universalData.isConnected,
    lastUpdated: realTimeStats?.lastUpdate ?? universalData.lastUpdated,
    strategy: realTimeStats?.strategy ?? "universal",
    latency: realTimeStats?.latency ?? 0,
    isRedisConnected: universalData.isRedisConnected,
  }

  // Calculate real metrics from actual data
  const engagementRate =
    displayData.totalRatings > 0 ? ((displayData.totalShares / displayData.totalRatings) * 100).toFixed(1) : "0"

  const averageRating =
    displayData.totalRatings > 0 && Object.keys(displayData.leaderRatings).length > 0
      ? (
        Object.values(displayData.leaderRatings).reduce((sum, leader) => sum + leader.averageRating, 0) /
        Object.keys(displayData.leaderRatings).length
      ).toFixed(1)
      : null

  // Get top rated leaders from real data
  const topRatedLeaders = Object.values(displayData.leaderRatings)
    .filter((leader) => leader.totalRatings >= 3) // Only show leaders with at least 3 ratings
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5)

  // Get most active leaders (by rating count)
  const mostActiveLeaders = Object.values(displayData.leaderRatings)
    .sort((a, b) => b.totalRatings - a.totalRatings)
    .slice(0, 5)

  // Calculate category statistics from real data
  const categoryStats = getAllLeaderBiographies().reduce(
    (acc, leader) => {
      const leaderData = displayData.leaderRatings[leader.id]
      if (leaderData) {
        if (!acc[leader.category]) {
          acc[leader.category] = { totalRatings: 0, totalLeaders: 0, averageRating: 0 }
        }
        acc[leader.category].totalRatings += leaderData.totalRatings
        acc[leader.category].totalLeaders += 1
        acc[leader.category].averageRating += leaderData.averageRating
      }
      return acc
    },
    {} as Record<string, { totalRatings: number; totalLeaders: number; averageRating: number }>,
  )

  // Calculate final category averages
  Object.keys(categoryStats).forEach((category) => {
    if (categoryStats[category].totalLeaders > 0) {
      categoryStats[category].averageRating =
        categoryStats[category].averageRating / categoryStats[category].totalLeaders
    }
  })

  // Sort categories by total ratings
  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a], [, b]) => b.totalRatings - a.totalRatings)
    .slice(0, 5)

  // Get most popular share platforms from real data
  const popularPlatforms = displayData.shareAnalytics
    .filter((platform) => platform.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

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

  const getConnectionStatusColor = () => {
    if (!isInitialized) return "text-gray-500"
    if (realTimeStats?.connectionStatus === "connected") {
      return realTimeStats.strategy === "websocket" ? "text-green-600" : "text-blue-600"
    }
    return "text-red-500"
  }

  const getConnectionStatusText = () => {
    if (!isInitialized) return "Initializing..."
    if (realTimeStats?.connectionStatus === "connected") {
      return realTimeStats.strategy === "websocket" ? "Real-time (WebSocket)" : "Live (Polling)"
    }
    return "Offline"
  }

  const formatPlatformName = (platform: string) => {
    switch (platform) {
      case "twitter":
        return "Twitter/X"
      case "facebook":
        return "Facebook"
      case "whatsapp":
        return "WhatsApp"
      case "copy":
        return "Copy Link"
      case "native":
        return "Native Share"
      default:
        return platform
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time insights into Nigerian Cabinet ratings</p>
          </div>
          <Link href="/">
            <Button variant="outline">← Back to Ratings</Button>
          </Link>
        </div>

        {/* Connection Status Banner */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {realTimeStats?.strategy === "websocket" ? (
                    <Zap className={`w-5 h-5 ${getConnectionStatusColor()}`} />
                  ) : (
                    <Wifi className={`w-5 h-5 ${getConnectionStatusColor()}`} />
                  )}
                  <span className={`font-medium ${getConnectionStatusColor()}`}>{getConnectionStatusText()}</span>
                </div>
                {displayData.isRedisConnected && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">Redis Connected</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                {realTimeStats?.latency && (
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    <span>{realTimeStats.latency}ms</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatLastUpdated(displayData.lastUpdated)}</span>
                </div>
                <Badge variant={displayData.isConnected ? "default" : "secondary"}>
                  {displayData.isRedisConnected ? "Redis" : displayData.strategy}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Ratings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.totalRatings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(displayData.leaderRatings).length} unique leaders rated
            </p>
          </CardContent>
        </Card>

        {/* Total Shares */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.totalShares.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {popularPlatforms.length > 0
                ? `Top: ${formatPlatformName(popularPlatforms[0].platform)}`
                : "No shares yet"}
            </p>
          </CardContent>
        </Card>

        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently online</p>
          </CardContent>
        </Card>

        {/* Engagement Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{engagementRate}%</div>
            <p className="text-xs text-muted-foreground">Shares per rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Real-Time Activity Feed */}
        <RealTimeActivityFeed maxEvents={20} showUserIds={false} autoScroll={true} className="h-fit" />

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Database Connection */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${displayData.isRedisConnected ? "bg-green-500" : "bg-yellow-500"}`}
                />
                <span className="font-medium">Database</span>
              </div>
              <Badge variant={displayData.isRedisConnected ? "default" : "secondary"}>
                {displayData.isRedisConnected ? "Redis Connected" : "Fallback Mode"}
              </Badge>
            </div>

            {/* Real-Time Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${realTimeStats?.connectionStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}
                />
                <span className="font-medium">Real-Time Updates</span>
              </div>
              <Badge variant={realTimeStats?.connectionStatus === "connected" ? "default" : "secondary"}>
                {getConnectionStatusText()}
              </Badge>
            </div>

            {/* Performance Metrics */}
            {realTimeStats?.latency && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Response Time</span>
                  <span className="font-medium">{realTimeStats.latency}ms</span>
                </div>
                <Progress value={Math.min((realTimeStats.latency / 1000) * 100, 100)} className="h-2" />
                <p className="text-xs text-gray-500">
                  {realTimeStats.latency < 100 ? "Excellent" : realTimeStats.latency < 300 ? "Good" : "Fair"}{" "}
                  performance
                </p>
              </div>
            )}

            {/* Data Freshness */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Last Update</span>
              </div>
              <span className="text-sm text-gray-600">{formatLastUpdated(displayData.lastUpdated)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data-Driven Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Rated Leaders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Top Rated Leaders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topRatedLeaders.length > 0 ? (
              <div className="space-y-3">
                {topRatedLeaders.map((leader, index) => {
                  const biography = getAllLeaderBiographies().find((bio) => bio.id === leader.officialId)
                  return (
                    <div key={leader.officialId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-medium text-sm">{biography?.fullName || leader.officialId}</p>
                          <p className="text-xs text-gray-500">{leader.totalRatings} ratings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{leader.averageRating.toFixed(1)}/5</p>
                        <p className="text-xs text-gray-500">{leader.performanceMetrics.approvalRating}%</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No ratings yet</p>
                <p className="text-xs">Start rating leaders to see top performers</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Category Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedCategories.length > 0 ? (
              <div className="space-y-3">
                {sortedCategories.map(([category, stats]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-600">{stats.averageRating.toFixed(1)}/5</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(stats.averageRating / 5) * 100} className="flex-1 h-2" />
                      <span className="text-xs text-gray-500">{stats.totalRatings}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No category data yet</p>
                <p className="text-xs">Rate leaders to see category performance</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Share Platform Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            {popularPlatforms.length > 0 ? (
              <div className="space-y-3">
                {popularPlatforms.map((platform) => (
                  <div key={platform.platform} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{formatPlatformName(platform.platform)}</span>
                      <span className="text-sm text-gray-600">{platform.count} shares</span>
                    </div>
                    <Progress
                      value={(platform.count / Math.max(...popularPlatforms.map((p) => p.count))) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Share2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No shares yet</p>
                <p className="text-xs">Share your ratings to see platform analytics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Data Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{Object.keys(displayData.leaderRatings).length}</p>
              <p className="text-sm text-gray-600">Leaders Rated</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{averageRating ? `${averageRating}/5` : "N/A"}</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{sortedCategories.length}</p>
              <p className="text-sm text-gray-600">Active Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{popularPlatforms.length}</p>
              <p className="text-sm text-gray-600">Share Platforms Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div>Loading analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  )
}
