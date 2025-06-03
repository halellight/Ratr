import { NextResponse } from "next/server"

/**
 * Universal Analytics API Endpoint v21
 *
 * Fallback system that works without Redis if environment variables are missing.
 * Uses in-memory storage as fallback, no dummy data.
 */

// In-memory fallback storage (real data only)
let fallbackAnalyticsData = {
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
  version: "21",
  globalId: "universal",
  isRedisConnected: false,
}

// Check if Redis is properly configured
function isRedisConfigured(): boolean {
  const hasUrl = process.env.KV_REST_API_URL && process.env.KV_REST_API_URL.trim() !== ""
  const hasToken = process.env.KV_REST_API_TOKEN && process.env.KV_REST_API_TOKEN.trim() !== ""
  return hasUrl && hasToken
}

// Try to import Redis service only if configured
let redisAnalytics: any = null
if (isRedisConfigured()) {
  try {
    const redisModule = require("@/app/services/redis-analytics")
    redisAnalytics = redisModule.redisAnalytics
    console.log("✅ Redis analytics service loaded")
  } catch (error) {
    console.warn("⚠️ Failed to load Redis analytics service:", error)
  }
} else {
  console.warn("⚠️ Redis not configured - using fallback storage")
}

/**
 * GET /api/analytics/universal
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const since = url.searchParams.get("since")

    console.log(`🌍 GET /api/analytics/universal - since: ${since}`)

    let analyticsData = fallbackAnalyticsData

    // Try Redis if available
    if (redisAnalytics) {
      try {
        console.log("📊 Attempting to get data from Redis...")
        analyticsData = await redisAnalytics.getAnalytics()
        analyticsData.isRedisConnected = true
        console.log("✅ Got data from Redis:", {
          totalRatings: analyticsData.totalRatings,
          totalShares: analyticsData.totalShares,
        })
      } catch (error) {
        console.warn("⚠️ Redis failed, using fallback:", error)
        analyticsData = fallbackAnalyticsData
        analyticsData.isRedisConnected = false
      }
    }

    // Check if client has latest data
    if (since && new Date(since) >= new Date(analyticsData.lastUpdated)) {
      console.log("🌍 Returning 304 Not Modified - client has latest data")
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache, must-revalidate",
          "Last-Modified": analyticsData.lastUpdated,
        },
      })
    }

    // Update server time
    analyticsData.serverTime = new Date().toISOString()
    analyticsData.version = "21"

    return NextResponse.json({
      success: true,
      data: analyticsData,
      message: redisAnalytics ? "Data from Redis" : "Data from fallback storage",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ GET /api/analytics/universal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/analytics/universal
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log(`🌍 POST /api/analytics/universal - type: ${type}`, data)

    let success = false

    if (type === "rating" && data?.officialId && data?.rating) {
      console.log(`🗳️ Logging vote: ${data.officialId} = ${data.rating}/5`)

      // Try Redis first
      if (redisAnalytics) {
        try {
          await redisAnalytics.trackRating(data.officialId, data.rating)
          console.log(`✅ Vote logged to Redis successfully!`)
          success = true
        } catch (error) {
          console.warn("⚠️ Redis tracking failed:", error)
        }
      }

      // Fallback to in-memory storage
      if (!success) {
        console.log(`📱 Using fallback storage for vote`)
        fallbackAnalyticsData.totalRatings += 1

        if (!fallbackAnalyticsData.leaderRatings[data.officialId]) {
          fallbackAnalyticsData.leaderRatings[data.officialId] = {
            officialId: data.officialId,
            averageRating: data.rating,
            totalRatings: 1,
            ratingDistribution: { [data.rating]: 1 },
            lastUpdated: new Date().toISOString(),
            performanceMetrics: {
              approvalRating: Math.round((data.rating / 5) * 100),
              trendsUp: data.rating > 3,
              monthlyChange: 0, // Real data only
            },
          }
        } else {
          const current = fallbackAnalyticsData.leaderRatings[data.officialId]
          const newTotal = current.totalRatings + 1
          const newAverage = (current.averageRating * current.totalRatings + data.rating) / newTotal

          current.averageRating = newAverage
          current.totalRatings = newTotal
          current.ratingDistribution[data.rating] = (current.ratingDistribution[data.rating] || 0) + 1
          current.lastUpdated = new Date().toISOString()
          current.performanceMetrics.approvalRating = Math.round((newAverage / 5) * 100)
          current.performanceMetrics.trendsUp = newAverage > 3
        }

        fallbackAnalyticsData.lastUpdated = new Date().toISOString()
        success = true
      }
    } else if (type === "share" && data?.platform) {
      console.log(`📊 Logging share: ${data.platform}`)

      // Try Redis first
      if (redisAnalytics) {
        try {
          await redisAnalytics.trackShare(data.platform)
          console.log(`✅ Share logged to Redis successfully!`)
          success = true
        } catch (error) {
          console.warn("⚠️ Redis share tracking failed:", error)
        }
      }

      // Fallback to in-memory storage
      if (!success) {
        console.log(`📱 Using fallback storage for share`)
        fallbackAnalyticsData.totalShares += 1

        const shareIndex = fallbackAnalyticsData.shareAnalytics.findIndex((s) => s.platform === data.platform)
        if (shareIndex >= 0) {
          fallbackAnalyticsData.shareAnalytics[shareIndex].count += 1
          fallbackAnalyticsData.shareAnalytics[shareIndex].lastShared = new Date().toISOString()
          fallbackAnalyticsData.shareAnalytics[shareIndex].trend = "up"
        }

        fallbackAnalyticsData.lastUpdated = new Date().toISOString()
        success = true
      }
    }

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking data",
          received: { type, data },
        },
        { status: 400 },
      )
    }

    // Get updated analytics
    let updatedAnalytics = fallbackAnalyticsData
    if (redisAnalytics) {
      try {
        updatedAnalytics = await redisAnalytics.getAnalytics()
        updatedAnalytics.isRedisConnected = true
      } catch (error) {
        console.warn("⚠️ Failed to get updated Redis data:", error)
        updatedAnalytics.isRedisConnected = false
      }
    }

    updatedAnalytics.serverTime = new Date().toISOString()
    updatedAnalytics.version = "21"

    console.log(`📊 Updated analytics:`, {
      totalRatings: updatedAnalytics.totalRatings,
      totalShares: updatedAnalytics.totalShares,
      isRedisConnected: updatedAnalytics.isRedisConnected,
    })

    return NextResponse.json({
      success: true,
      data: updatedAnalytics,
      message: `${type} tracked successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ POST /api/analytics/universal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track analytics event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/analytics/universal
 */
export async function DELETE(request: Request) {
  try {
    console.log("🗑️ DELETE /api/analytics/universal - resetting data")

    // Reset Redis if available
    if (redisAnalytics) {
      try {
        await redisAnalytics.resetAnalytics()
        console.log("✅ Redis data reset")
      } catch (error) {
        console.warn("⚠️ Redis reset failed:", error)
      }
    }

    // Reset fallback data
    fallbackAnalyticsData = {
      totalRatings: 0,
      totalShares: 0,
      leaderRatings: {},
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
      version: "21",
      globalId: "universal",
      isRedisConnected: redisAnalytics !== null,
    }

    console.log("✅ Analytics data reset successfully")

    return NextResponse.json({
      success: true,
      data: fallbackAnalyticsData,
      message: "Analytics data reset successfully",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ DELETE /api/analytics/universal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
export const dynamic = "force-dynamic" // Always fresh data, no caching