"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Activity, Star, Share2, User, Clock, TrendingUp, Eye, EyeOff } from "lucide-react"
import { useRealTimeEvents, type RealTimeEvent } from "@/app/services/real-time-analytics"

interface ActivityFeedProps {
  maxEvents?: number
  showUserIds?: boolean
  autoScroll?: boolean
  className?: string
}

export function RealTimeActivityFeed({
  maxEvents = 20,
  showUserIds = false,
  autoScroll = true,
  className = "",
}: ActivityFeedProps) {
  const { events } = useRealTimeEvents()
  const [isVisible, setIsVisible] = useState(true)
  const [displayEvents, setDisplayEvents] = useState<RealTimeEvent[]>([])

  useEffect(() => {
    setDisplayEvents(events.slice(0, maxEvents))
  }, [events, maxEvents])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)

    if (diffSecs < 10) return "Just now"
    if (diffSecs < 60) return `${diffSecs}s ago`
    if (diffMins < 60) return `${diffMins}m ago`
    return date.toLocaleTimeString()
  }

  const getEventIcon = (event: RealTimeEvent) => {
    switch (event.type) {
      case "rating":
        return <Star className="w-4 h-4 text-yellow-500" />
      case "share":
        return <Share2 className="w-4 h-4 text-blue-500" />
      case "user_join":
        return <User className="w-4 h-4 text-green-500" />
      case "user_leave":
        return <User className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getEventDescription = (event: RealTimeEvent) => {
    switch (event.type) {
      case "rating":
        const rating = event.data?.rating
        const officialId = event.data?.officialId
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating)
        return (
          <div className="flex items-center gap-2">
            <span>Rated {officialId?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
            <span className="text-yellow-500 font-mono">{stars}</span>
            <Badge variant="outline" className="text-xs">
              {rating}/5
            </Badge>
          </div>
        )

      case "share":
        const platform = event.data?.platform
        return (
          <div className="flex items-center gap-2">
            <span>Shared on {platform}</span>
            <Badge variant="secondary" className="text-xs">
              {platform}
            </Badge>
          </div>
        )

      case "user_join":
        return <span>User joined the session</span>

      case "user_leave":
        return <span>User left the session</span>

      default:
        return <span>Unknown activity</span>
    }
  }

  const getEventColor = (event: RealTimeEvent) => {
    switch (event.type) {
      case "rating":
        return "border-l-yellow-500"
      case "share":
        return "border-l-blue-500"
      case "user_join":
        return "border-l-green-500"
      case "user_leave":
        return "border-l-red-500"
      default:
        return "border-l-gray-500"
    }
  }

  if (!isVisible) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Real-Time Activity
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Real-Time Activity
            {displayEvents.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {displayEvents.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Live</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {displayEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Activity will appear here in real-time</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayEvents.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 transition-colors ${getEventColor(event)}`}
              >
                <div className="flex-shrink-0 mt-0.5">{getEventIcon(event)}</div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{getEventDescription(event)}</div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(event.timestamp)}</span>

                    {showUserIds && event.userId && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{event.userId.slice(-8)}</span>
                      </>
                    )}

                    {event.sessionId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-xs">{event.sessionId.slice(-6)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {displayEvents.length >= maxEvents && (
          <div className="text-center mt-4 pt-4 border-t">
            <p className="text-sm text-gray-500">Showing last {maxEvents} events</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
