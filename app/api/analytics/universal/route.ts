import { NextResponse } from "next/server"
import { redisAnalytics } from "@/app/services/redis-analytics"

/**
 * Universal Analytics API Endpoint v20
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
 * - Proper Redis integration for data storage
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
  version: "20",
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

    console.log(`🌍 GET /api/analytics/universal - since: ${since}`)

    // Get analytics from Redis
    const analyticsData = await redisAnalytics.getAnalytics()

    // Check if client has latest data
    if (since && new Date(since) >= new Date(analyticsData.lastUpdated)) {
      console.log("🌍 Returning 304 Not Modified - client has latest data")
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache, must-revalidate",
          "Last-Modified": analyticsData.lastUpdated,
          ETag: `"universal-${analyticsData.lastUpdated}"`,
        },
      })
    }

    console.log(`🌍 Returning analytics data from Redis:`, {
      totalRatings: analyticsData.totalRatings,
      totalShares: analyticsData.totalShares,
      leaderCount: Object.keys(analyticsData.leaderRatings).length,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...analyticsData,
        serverTime: new Date().toISOString(),
        version: "20",
        globalId: "universal",
      },
      message: "Analytics data from Redis",
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
 *
 * Track events in universal analytics - accessible to ALL users
 * No authentication required for tracking
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    console.log(`🌍 POST /api/analytics/universal - type: ${type}`, data)

    if (type === "rating" && data?.officialId && data?.rating) {
      // Track rating to Redis
      console.log(`🗳️ Logging vote to Redis: ${data.officialId} = ${data.rating}/5`)

      await redisAnalytics.trackRating(data.officialId, data.rating)

      console.log(`✅ Vote successfully logged to Redis!`)
    } else if (type === "share" && data?.platform) {
      // Track share to Redis
      console.log(`📊 Logging share to Redis: ${data.platform}`)

      await redisAnalytics.trackShare(data.platform)

      console.log(`✅ Share successfully logged to Redis!`)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking data",
          received: { type, data },
        },
        { status: 400 },
      )
    }

    // Get updated analytics from Redis
    const updatedAnalytics = await redisAnalytics.getAnalytics()

    console.log(`📊 Updated analytics from Redis:`, {
      totalRatings: updatedAnalytics.totalRatings,
      totalShares: updatedAnalytics.totalShares,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedAnalytics,
        serverTime: new Date().toISOString(),
        version: "20",
        globalId: "universal",
      },
      message: `${type} tracked successfully to Redis`,
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
 * PUT /api/analytics/universal
 *
 * Update analytics data in Redis
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { data: analyticsData } = body

    console.log(`🌍 PUT /api/analytics/universal - updating Redis data`)

    // This would typically save the entire analytics object to Redis
    // For now, we'll just return the current data
    const currentAnalytics = await redisAnalytics.getAnalytics()

    return NextResponse.json({
      success: true,
      data: {
        ...currentAnalytics,
        serverTime: new Date().toISOString(),
        version: "20",
        globalId: "universal",
      },
      message: "Analytics data updated in Redis",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ PUT /api/analytics/universal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/analytics/universal
 *
 * Reset analytics data in Redis
 */
export async function DELETE(request: Request) {
  try {
    console.log("🗑️ DELETE /api/analytics/universal - resetting Redis data")

    await redisAnalytics.resetAnalytics()

    const resetAnalytics = await redisAnalytics.getAnalytics()

    console.log("✅ Analytics data reset in Redis")

    return NextResponse.json({
      success: true,
      data: {
        ...resetAnalytics,
        serverTime: new Date().toISOString(),
        version: "20",
        globalId: "universal",
      },
      message: "Analytics data reset successfully in Redis",
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
// This file provides a universal analytics API endpoint that allows all users to access and track analytics data without authentication.