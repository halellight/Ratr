import { type NextRequest, NextResponse } from "next/server"
import { redisAnalytics } from "@/app/services/redis-analytics"

/**
 * Real-Time Analytics API Endpoint
 *
 * Handles real-time analytics updates for both polling and WebSocket fallback.
 * Provides efficient batching and compression for optimal performance.
 */

interface RealTimeEvent {
  type: "rating" | "share" | "user_join" | "user_leave"
  data: any
  timestamp: string
  userId?: string
  sessionId: string
}

interface ActiveSession {
  userId: string
  sessionId: string
  lastSeen: number
  userAgent?: string
}

// In-memory session tracking (in production, use Redis)
const activeSessions = new Map<string, ActiveSession>()
const recentEvents: RealTimeEvent[] = []
const MAX_EVENTS = 100
const SESSION_TIMEOUT = 5 * 60 * 1000 // 5 minutes

/**
 * Clean up expired sessions
 */
function cleanupSessions(): void {
  const now = Date.now()
  const expiredSessions: string[] = []

  activeSessions.forEach((session, sessionId) => {
    if (now - session.lastSeen > SESSION_TIMEOUT) {
      expiredSessions.push(sessionId)
    }
  })

  expiredSessions.forEach((sessionId) => {
    activeSessions.delete(sessionId)
  })
}

/**
 * Add event to recent events
 */
function addEvent(event: RealTimeEvent): void {
  recentEvents.unshift(event)

  // Keep only recent events
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.splice(MAX_EVENTS)
  }
}

/**
 * GET /api/analytics/real-time
 *
 * Returns current analytics state and recent events for polling clients
 */
export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  console.log(`🔄 [${requestId}] Real-time GET request`)

  try {
    const sessionId = request.headers.get("X-Session-ID")
    const userId = request.headers.get("X-User-ID")
    const userAgent = request.headers.get("User-Agent")

    // Update session activity
    if (sessionId && userId) {
      activeSessions.set(sessionId, {
        userId,
        sessionId,
        lastSeen: Date.now(),
        userAgent,
      })
    }

    // Cleanup expired sessions
    cleanupSessions()

    // Get analytics data
    let analyticsData
    try {
      analyticsData = await redisAnalytics.getAnalytics()
      console.log(`✅ [${requestId}] Got Redis data:`, {
        totalRatings: analyticsData.totalRatings,
        totalShares: analyticsData.totalShares,
      })
    } catch (error) {
      console.warn(`⚠️ [${requestId}] Redis failed, using fallback`)
      analyticsData = {
        totalRatings: 0,
        totalShares: 0,
        leaderRatings: {},
        shareAnalytics: [],
        lastUpdated: new Date().toISOString(),
        activeUsers: 1,
      }
    }

    // Get recent events since last request
    const since = request.nextUrl.searchParams.get("since")
    let filteredEvents = recentEvents

    if (since) {
      const sinceTime = new Date(since).getTime()
      filteredEvents = recentEvents.filter((event) => new Date(event.timestamp).getTime() > sinceTime)
    }

    const response = {
      success: true,
      data: {
        ...analyticsData,
        activeUsers: activeSessions.size,
        connectionType: "polling",
        serverTime: new Date().toISOString(),
      },
      events: filteredEvents.slice(0, 20), // Last 20 events
      meta: {
        activeSessions: activeSessions.size,
        totalEvents: recentEvents.length,
        requestId,
      },
    }

    console.log(`📊 [${requestId}] Returning real-time data:`, {
      totalRatings: response.data.totalRatings,
      totalShares: response.data.totalShares,
      activeUsers: response.data.activeUsers,
      eventsCount: response.events.length,
    })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Request-ID": requestId,
      },
    })
  } catch (error) {
    console.error(`❌ [${requestId}] Real-time GET error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get real-time data",
        details: error instanceof Error ? error.message : "Unknown error",
        requestId,
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/analytics/real-time
 *
 * Handles batched events from polling clients
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  console.log(`📤 [${requestId}] Real-time POST request`)

  try {
    const body = await request.json()
    const { events } = body

    const sessionId = request.headers.get("X-Session-ID")
    const userId = request.headers.get("X-User-ID")

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid events data",
          requestId,
        },
        { status: 400 },
      )
    }

    console.log(`📤 [${requestId}] Processing ${events.length} events from ${userId}`)

    // Process each event
    for (const event of events) {
      try {
        if (event.type === "rating" && event.data?.officialId && event.data?.rating) {
          // Track rating
          await redisAnalytics.trackRating(event.data.officialId, event.data.rating, userId)

          // Add to recent events
          addEvent({
            ...event,
            userId,
            sessionId: sessionId || "unknown",
          })

          console.log(`🗳️ [${requestId}] Tracked rating: ${event.data.officialId} = ${event.data.rating}/5`)
        } else if (event.type === "share" && event.data?.platform) {
          // Track share
          await redisAnalytics.trackShare(event.data.platform, userId)

          // Add to recent events
          addEvent({
            ...event,
            userId,
            sessionId: sessionId || "unknown",
          })

          console.log(`📊 [${requestId}] Tracked share: ${event.data.platform}`)
        } else if (event.type === "user_join") {
          // Handle user join
          if (sessionId && userId) {
            activeSessions.set(sessionId, {
              userId,
              sessionId,
              lastSeen: Date.now(),
              userAgent: request.headers.get("User-Agent") || undefined,
            })

            addEvent({
              type: "user_join",
              data: { userId },
              timestamp: new Date().toISOString(),
              userId,
              sessionId,
            })

            console.log(`👋 [${requestId}] User joined: ${userId}`)
          }
        }
      } catch (eventError) {
        console.error(`❌ [${requestId}] Failed to process event:`, event, eventError)
      }
    }

    // Update session activity
    if (sessionId && userId) {
      activeSessions.set(sessionId, {
        userId,
        sessionId,
        lastSeen: Date.now(),
        userAgent: request.headers.get("User-Agent") || undefined,
      })
    }

    // Get updated analytics
    let updatedAnalytics
    try {
      updatedAnalytics = await redisAnalytics.getAnalytics()
    } catch (error) {
      console.warn(`⚠️ [${requestId}] Failed to get updated analytics:`, error)
      updatedAnalytics = {
        totalRatings: 0,
        totalShares: 0,
        leaderRatings: {},
        shareAnalytics: [],
        lastUpdated: new Date().toISOString(),
        activeUsers: activeSessions.size,
      }
    }

    const response = {
      success: true,
      data: {
        ...updatedAnalytics,
        activeUsers: activeSessions.size,
        serverTime: new Date().toISOString(),
      },
      processed: events.length,
      message: `Processed ${events.length} events successfully`,
      requestId,
    }

    console.log(`✅ [${requestId}] Processed events successfully:`, {
      eventsProcessed: events.length,
      totalRatings: response.data.totalRatings,
      totalShares: response.data.totalShares,
      activeUsers: response.data.activeUsers,
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error(`❌ [${requestId}] Real-time POST error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process real-time events",
        details: error instanceof Error ? error.message : "Unknown error",
        requestId,
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/analytics/real-time
 *
 * Admin endpoint to reset real-time data
 */
export async function DELETE(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  console.log(`🗑️ [${requestId}] Real-time DELETE request`)

  try {
    // Clear sessions and events
    activeSessions.clear()
    recentEvents.splice(0, recentEvents.length)

    // Reset analytics
    await redisAnalytics.resetAnalytics()

    console.log(`✅ [${requestId}] Real-time data reset successfully`)

    return NextResponse.json({
      success: true,
      message: "Real-time data reset successfully",
      requestId,
    })
  } catch (error) {
    console.error(`❌ [${requestId}] Real-time DELETE error:`, error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset real-time data",
        details: error instanceof Error ? error.message : "Unknown error",
        requestId,
      },
      { status: 500 },
    )
  }
}
