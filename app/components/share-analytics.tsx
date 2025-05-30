"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download, RefreshCw } from "lucide-react"

interface ShareData {
  platform: string
  count: number
  lastShared: string
}

interface ShareAnalyticsProps {
  shareStats: ShareData[]
  onClose: () => void
}

export function ShareAnalytics({ shareStats, onClose }: ShareAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"all" | "week" | "month">("all")

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

  // Filter stats based on time range
  const filteredStats = shareStats.filter((stat) => {
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
  })

  // Calculate total shares
  const totalShares = filteredStats.reduce((sum, stat) => sum + stat.count, 0)

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
    const headers = ["Platform", "Shares", "Last Shared"]
    const rows = shareStats.map((stat) => [
      formatPlatformName(stat.platform),
      stat.count.toString(),
      stat.lastShared ? formatDate(stat.lastShared) : "Never",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "share-analytics.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-2xl">Share Analytics</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Time range filter */}
          <div className="flex items-center justify-between mb-6">
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
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Shares</p>
                <p className="text-2xl font-bold">{totalShares}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Most Popular</p>
                <p className="text-2xl font-bold">
                  {totalShares > 0 ? formatPlatformName(sortedStats[0].platform) : "None"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Last Shared</p>
                <p className="text-lg font-medium">
                  {sortedStats.some((stat) => stat.lastShared)
                    ? formatDate(
                        sortedStats
                          .filter((stat) => stat.lastShared)
                          .sort((a, b) => new Date(b.lastShared).getTime() - new Date(a.lastShared).getTime())[0]
                          .lastShared,
                      )
                    : "Never"}
                </p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-4">
            {totalShares === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">No sharing data available yet</p>
                <p className="text-gray-400 text-sm mt-2">Share your ratings to see analytics</p>
              </div>
            ) : (
              sortedStats.map((stat) => (
                <div key={stat.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getPlatformColor(stat.platform)} mr-2`}></div>
                      <span className="font-medium">{formatPlatformName(stat.platform)}</span>
                    </div>
                    <span className="text-gray-700">{stat.count} shares</span>
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

          {/* Tips */}
          <div className="mt-8 border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-2">Sharing Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• WhatsApp is typically the most effective platform for sharing in Nigeria</li>
              <li>• Share during peak hours (8-10am and 7-10pm) for maximum visibility</li>
              <li>• Adding your personal comment along with the rating increases engagement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
