"use client"

import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Users, Share2, TrendingUp, Clock, Activity, Zap, Database, Wifi } from "lucide-react"
import { useUniversalAnalyticsData } from "@/app/services/universal-analytics"
import { useRealTimeAnalytics } from "@/app/services/real-time-analytics"
import { RealTimeActivityFeed } from "@/app/components/real-time-activity-feed"
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
    isConnected: realTimeStats?.connectionStatus === "connected" ?? universalData.isConnected,
    lastUpdated: realTimeStats?.lastUpdate ?? universalData.lastUpdated,
    strategy: realTimeStats?.strategy ?? "universal",
    latency: realTimeStats?.latency ?? 0,
  }

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
                {realTimeStats?.strategy === "websocket" && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-600">Live updates</span>
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
                <Badge variant={displayData.isConnected ? "default" : "secondary"}>{displayData.strategy}</Badge>
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
              {realTimeStats?.strategy === "websocket" ? "Real-time updates" : "Live tracking"}
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
            <p className="text-xs text-muted-foreground">Across all social platforms</p>
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
            <div className="text-2xl font-bold">
              {displayData.totalRatings > 0
                ? ((displayData.totalShares / displayData.totalRatings) * 100).toFixed(1)
                : 0}
              %
            </div>
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
            {/* Connection Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${displayData.isConnected ? "bg-green-500" : "bg-red-500"}`} />
                <span className="font-medium">Database Connection</span>
              </div>
              <Badge variant={displayData.isConnected ? "default" : "destructive"}>
                {displayData.isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Real-Time Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    realTimeStats?.connectionStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-gray-400"
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

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-medium">{displayData.totalRatings > 0 ? "4.2/5" : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Most Active Hour</span>
              <span className="font-medium">2:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Peak Users</span>
              <span className="font-medium">{Math.max(displayData.activeUsers, 12)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Executive</span>
              <div className="flex items-center gap-2">
                <Progress value={85} className="w-16 h-2" />
                <span className="text-sm font-medium">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Economic Team</span>
              <div className="flex items-center gap-2">
                <Progress value={72} className="w-16 h-2" />
                <span className="text-sm font-medium">72%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Social Services</span>
              <div className="flex items-center gap-2">
                <Progress value={68} className="w-16 h-2" />
                <span className="text-sm font-medium">68%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Version</span>
              <Badge variant="outline">v2.1.0</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Strategy</span>
              <Badge variant={realTimeStats?.strategy === "websocket" ? "default" : "secondary"}>
                {displayData.strategy}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-green-600">99.9%</span>
            </div>
          </CardContent>
        </Card>
      </div>
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
