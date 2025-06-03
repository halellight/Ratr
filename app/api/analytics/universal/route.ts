import { NextResponse } from "next/server"

/**
 * Universal Analytics API Endpoint v19
 *
 * This endpoint provides UNIVERSAL access to analytics data.
 * ALL users see the SAME data regardless of permissions or roles.
 *
 * Features:
 * - No user authentication required for viewing data
 * - Global data accessible to everyone
 * - Real-time synchronization
 * - Consistent data format
 * - Universal tracking capabilities
 */

// Global in-memory store for universal analytics
// In production, this would be replaced with Redis/Database
const universalAnalyticsData = {
  totalRatings: 0,
  totalShares: 0,
  leaderRatings: {} as Record<string, any>,
  shareAnalytics: [
    { platform: "twitter", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "facebook", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "whatsapp", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "copy", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "native", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "other", count: 0, lastShared: "", trend: "stable", velocity: 0 },
  ],
  lastUpdated: new Date().toISOString(),
  activeUsers: 1,
  serverTime: new Date().toISOString(),
  version: "19",
  globalId: "universal",
}

/**
 * GET /api/analytics/universal
 *
 * Returns universal analytics data accessible to ALL users
 * No authentication or permission checks
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const since = url.searchParams.get("since")

    console.log(`🌍 Universal analytics GET request, since: ${since}`)

    // Check if client has latest data (conditional request)
    if (since && new Date(since) >= new Date(universalAnalyticsData.lastUpdated)) {
      console.log("🌍 Returning 304 Not Modified - client has latest universal data")
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache, must-revalidate",
          "Last-Modified": universalAnalyticsData.lastUpdated,
          ETag: `"universal-${universalAnalyticsData.lastUpdated}"`,
          "X-Universal-Access": "true",
        },
      })
    }

    // Update server time and active users estimate
    universalAnalyticsData.serverTime = new Date().toISOString()
    universalAnalyticsData.activeUsers = Math.max(1, Math.floor(Math.random() * 15) + 1)

    const response = {
      success: true,
      data: universalAnalyticsData,
      message: "Universal analytics data - accessible to all users",
      timestamp: new Date().toISOString(),
      universalAccess: true,
    }

    console.log(`🌍 Returning universal analytics data:`, {
      totalRatings: universalAnalyticsData.totalRatings,
      totalShares: universalAnalyticsData.totalShares,
      activeUsers: universalAnalyticsData.activeUsers,
    })

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
        "Last-Modified": universalAnalyticsData.lastUpdated,
        ETag: `"universal-${universalAnalyticsData.lastUpdated}"`,
        "X-Universal-Access": "true",
        "X-Data-Version": "19",
      },
    })
  } catch (error) {
    console.error("❌ Universal analytics GET error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch universal analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
        universalAccess: true,
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/analytics/universal
 *
 * Track events in universal analytics - accessible to ALL users
 * No authentication required for tracking
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log(`🌍 Universal analytics tracking:`, { type, data })

    const now = new Date().toISOString()

    if (type === "rating" && data?.officialId && data?.rating) {
      // Track rating universally
      universalAnalyticsData.totalRatings += 1

      if (!universalAnalyticsData.leaderRatings[data.officialId]) {
        universalAnalyticsData.leaderRatings[data.officialId] = {
          officialId: data.officialId,
          averageRating: data.rating,
          totalRatings: 1,
          ratingDistribution: { [data.rating]: 1 },
          lastUpdated: now,
          performanceMetrics: {
            approvalRating: Math.round((data.rating / 5) * 100),
            trendsUp: data.rating > 3,
            monthlyChange: Math.random() * 5,
          },
        }
      } else {
        const current = universalAnalyticsData.leaderRatings[data.officialId]
        const newTotal = current.totalRatings + 1
        const newAverage = (current.averageRating * current.totalRatings + data.rating) / newTotal

        current.averageRating = newAverage
        current.totalRatings = newTotal
        current.ratingDistribution[data.rating] = (current.ratingDistribution[data.rating] || 0) + 1
        current.lastUpdated = now
        current.performanceMetrics.approvalRating = Math.round((newAverage / 5) * 100)
        current.performanceMetrics.trendsUp = newAverage > 3
      }

      console.log(`✅ Universal rating tracked: ${data.officialId} = ${data.rating}/5`)
    } else if (type === "share" && data?.platform) {
      // Track share universally
      universalAnalyticsData.totalShares += 1

      const shareIndex = universalAnalyticsData.shareAnalytics.findIndex((s) => s.platform === data.platform)
      if (shareIndex >= 0) {
        universalAnalyticsData.shareAnalytics[shareIndex].count += 1
        universalAnalyticsData.shareAnalytics[shareIndex].lastShared = now
        universalAnalyticsData.shareAnalytics[shareIndex].trend = "up"
        universalAnalyticsData.shareAnalytics[shareIndex].velocity += 1
      }

      console.log(`📊 Universal share tracked: ${data.platform}`)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking data",
          universalAccess: true,
        },
        { status: 400 },
      )
    }

    // Update timestamps
    universalAnalyticsData.lastUpdated = now
    universalAnalyticsData.serverTime = now

    return NextResponse.json({
      success: true,
      data: universalAnalyticsData,
      message: `Universal ${type} tracked successfully`,
      timestamp: now,
      universalAccess: true,
    })
  } catch (error) {
    console.error("❌ Universal analytics POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track universal analytics event",
        details: error instanceof Error ? error.message : "Unknown error",
        universalAccess: true,
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/analytics/universal
 *
 * Reset universal analytics data (admin function)
 * This affects ALL users globally
 */
export async function DELETE(request: Request) {
  try {
    console.log("🗑️ Resetting universal analytics data")

    // Reset all data to initial state
    universalAnalyticsData.totalRatings = 0
    universalAnalyticsData.totalShares = 0
    universalAnalyticsData.leaderRatings = {}
    universalAnalyticsData.shareAnalytics = [
      { platform: "twitter", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "facebook", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "whatsapp", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "copy", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "native", count: 0, lastShared: "", trend: "stable", velocity: 0 },
      { platform: "other", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    ]
    universalAnalyticsData.lastUpdated = new Date().toISOString()
    universalAnalyticsData.serverTime = new Date().toISOString()

    console.log("✅ Universal analytics data reset - affects all users globally")

    return NextResponse.json({
      success: true,
      message: "Universal analytics data reset successfully",
      data: universalAnalyticsData,
      universalAccess: true,
    })
  } catch (error) {
    console.error("❌ Universal analytics DELETE error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset universal analytics data",
        universalAccess: true,
      },
      { status: 500 },
    )
  }
}
