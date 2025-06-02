import { NextResponse } from "next/server"

/**
 * Real Analytics API Endpoint v18
 *
 * This endpoint supports real-time analytics with actual user data only:
 * 1. No dummy data or simulation
 * 2. Starts with zero data, builds from real interactions
 * 3. Conditional requests using timestamps to minimize data transfer
 * 4. POST support for tracking share events
 * 5. Proper HTTP status codes (304 for no changes)
 * 6. Error handling and validation
 * 7. Velocity tracking and trend analysis
 */

// In-memory cache for real analytics data
// In production, this would be replaced with a proper database
const analyticsCache = {
  lastUpdated: new Date().toISOString(),
  data: [
    { platform: "twitter", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "facebook", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "whatsapp", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "copy", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "native", count: 0, lastShared: "", trend: "stable", velocity: 0 },
    { platform: "other", count: 0, lastShared: "", trend: "stable", velocity: 0 },
  ],
  velocityTracker: new Map(),
}

// Remove all simulation code - no dummy data generation

/**
 * GET /api/analytics
 *
 * Supports conditional requests using the 'since' query parameter
 * Returns 304 Not Modified if no updates since the provided timestamp
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const since = url.searchParams.get("since")

    console.log(`📊 Analytics GET request, since: ${since}`)

    // If client provides a timestamp and no updates since then, return 304 Not Modified
    if (since && new Date(since) >= new Date(analyticsCache.lastUpdated)) {
      console.log("📊 Returning 304 Not Modified - no new data")
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache, must-revalidate",
          "Last-Modified": analyticsCache.lastUpdated,
          ETag: `"${analyticsCache.lastUpdated}"`,
        },
      })
    }

    // Return current data (starts at zero, builds from real interactions)
    const response = {
      success: true,
      data: analyticsCache.data,
      lastUpdated: analyticsCache.lastUpdated,
      serverTime: new Date().toISOString(),
      version: "18",
    }

    console.log(`📊 Returning real analytics data: ${analyticsCache.data.length} platforms`)

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-cache, must-revalidate",
        "Last-Modified": analyticsCache.lastUpdated,
        ETag: `"${analyticsCache.lastUpdated}"`,
      },
    })
  } catch (error) {
    console.error("❌ Error fetching analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
        version: "18",
      },
      { status: 500 },
    )
  }
}

/**
 * POST /api/analytics
 *
 * Track a real share event and update analytics data
 * Only updates when users actually share content
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { platform } = body

    console.log(`📊 Tracking REAL share event: ${platform}`)

    // Validate platform parameter
    const validPlatforms = ["twitter", "facebook", "whatsapp", "copy", "native", "other"]
    if (!platform || !validPlatforms.includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid platform",
          validPlatforms,
          version: "18",
        },
        { status: 400 },
      )
    }

    // Update the analytics data with real user interaction
    const now = new Date().toISOString()
    const nowTimestamp = Date.now()

    // Update velocity tracking for real shares
    const platformVelocity = analyticsCache.velocityTracker.get(platform) || []
    platformVelocity.push(nowTimestamp)

    // Keep only last hour for velocity calculation
    const oneHourAgo = nowTimestamp - 60 * 60 * 1000
    const recentActivity = platformVelocity.filter((ts: number) => ts > oneHourAgo)
    analyticsCache.velocityTracker.set(platform, recentActivity)

    // Calculate trend based on recent activity
    const calculateTrend = (currentVelocity: number, previousCount: number): string => {
      if (currentVelocity > 2) return "up" // More than 2 shares per hour = trending up
      if (currentVelocity === 0 && previousCount > 0) return "down" // No recent activity
      return "stable"
    }

    analyticsCache.data = analyticsCache.data.map((item) => {
      if (item.platform === platform) {
        const newCount = item.count + 1
        const newVelocity = recentActivity.length
        const newTrend = calculateTrend(newVelocity, item.count)

        return {
          ...item,
          count: newCount,
          lastShared: now,
          trend: newTrend,
          velocity: newVelocity,
        }
      }
      return item
    })

    analyticsCache.lastUpdated = now

    // Log the real share event
    console.log(`✅ REAL share tracked: ${platform} at ${now} (velocity: ${recentActivity.length})`)

    return NextResponse.json({
      success: true,
      data: analyticsCache.data,
      lastUpdated: analyticsCache.lastUpdated,
      serverTime: new Date().toISOString(),
      message: `Real share tracked for ${platform}`,
      version: "18",
    })
  } catch (error) {
    console.error("❌ Error updating analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
        version: "18",
      },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/analytics
 *
 * Reset analytics data (admin only)
 * Useful for testing or data cleanup
 */
export async function DELETE(request: Request) {
  try {
    console.log("🗑️ Resetting analytics data to zero")

    // Check for admin authentication in production
    // const authHeader = request.headers.get('authorization')
    // if (!isValidAdminToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Reset all data to zero
    analyticsCache.data = analyticsCache.data.map((item) => ({
      ...item,
      count: 0,
      lastShared: "",
      trend: "stable",
      velocity: 0,
    }))

    analyticsCache.velocityTracker.clear()
    analyticsCache.lastUpdated = new Date().toISOString()

    console.log("✅ Analytics data reset to zero - ready for real user interactions")

    return NextResponse.json({
      success: true,
      message: "Analytics data reset to zero",
      lastUpdated: analyticsCache.lastUpdated,
      version: "18",
    })
  } catch (error) {
    console.error("❌ Error resetting analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset analytics data",
        version: "18",
      },
      { status: 500 },
    )
  }
}
