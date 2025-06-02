import { NextResponse } from "next/server"

const VALID_PLATFORMS = ["twitter", "facebook", "whatsapp", "copy", "native", "other"]

// In-memory cache (replace with DB in production)
const analyticsCache = {
  lastUpdated: new Date().toISOString(),
  data: VALID_PLATFORMS.map((platform) => ({
    platform,
    count: 0,
    lastShared: "",
    trend: "stable",
    velocity: 0,
  })),
  velocityTracker: new Map<string, number[]>(),
}

// GET /api/analytics
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const sinceParam = url.searchParams.get("since")
    const clientTimestamp = sinceParam ? new Date(sinceParam) : null
    const serverTimestamp = new Date(analyticsCache.lastUpdated)

    console.log(`📡 GET /api/analytics | since: ${sinceParam}`)

    if (clientTimestamp && clientTimestamp >= serverTimestamp) {
      console.log("✅ 304 Not Modified — No new data since last request.")
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache",
          "Last-Modified": analyticsCache.lastUpdated,
          ETag: `"${analyticsCache.lastUpdated}"`,
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        data: analyticsCache.data,
        lastUpdated: analyticsCache.lastUpdated,
        serverTime: new Date().toISOString(),
        version: "19",
      },
      {
        headers: {
          "Cache-Control": "no-cache",
          "Last-Modified": analyticsCache.lastUpdated,
          ETag: `"${analyticsCache.lastUpdated}"`,
        },
      }
    )
  } catch (error) {
    console.error("❌ Error during GET /api/analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
        version: "19",
      },
      { status: 500 }
    )
  }
}

// POST /api/analytics
export async function POST(request: Request) {
  try {
    const { platform } = await request.json()

    console.log(`🚀 POST /api/analytics | platform: ${platform}`)

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid platform",
          validPlatforms: VALID_PLATFORMS,
          version: "19",
        },
        { status: 400 }
      )
    }

    const now = Date.now()
    const isoNow = new Date(now).toISOString()

    // Velocity tracking
    const timestamps = analyticsCache.velocityTracker.get(platform) || []
    timestamps.push(now)

    const oneHourAgo = now - 60 * 60 * 1000
    const recent = timestamps.filter((t) => t > oneHourAgo)
    analyticsCache.velocityTracker.set(platform, recent)

    // Trend calculation
    const calcTrend = (velocity: number, prevCount: number): string => {
      if (velocity > 2) return "up"
      if (velocity === 0 && prevCount > 0) return "down"
      return "stable"
    }

    analyticsCache.data = analyticsCache.data.map((item) =>
      item.platform === platform
        ? {
            ...item,
            count: item.count + 1,
            lastShared: isoNow,
            velocity: recent.length,
            trend: calcTrend(recent.length, item.count),
          }
        : item
    )

    analyticsCache.lastUpdated = isoNow

    console.log(`✅ Share tracked | ${platform} | velocity: ${recent.length}`)

    return NextResponse.json({
      success: true,
      message: `Tracked share on ${platform}`,
      data: analyticsCache.data,
      lastUpdated: analyticsCache.lastUpdated,
      serverTime: new Date().toISOString(),
      version: "19",
    })
  } catch (error) {
    console.error("❌ Error during POST /api/analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to record share event",
        details: error instanceof Error ? error.message : "Unknown error",
        version: "19",
      },
      { status: 500 }
    )
  }
}

// DELETE /api/analytics
export async function DELETE(request: Request) {
  try {
    console.log("🧹 DELETE /api/analytics | Resetting all analytics")

    analyticsCache.data = VALID_PLATFORMS.map((platform) => ({
      platform,
      count: 0,
      lastShared: "",
      trend: "stable",
      velocity: 0,
    }))

    analyticsCache.velocityTracker.clear()
    analyticsCache.lastUpdated = new Date().toISOString()

    return NextResponse.json({
      success: true,
      message: "Analytics reset to zero",
      lastUpdated: analyticsCache.lastUpdated,
      version: "19",
    })
  } catch (error) {
    console.error("❌ Error during DELETE /api/analytics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset analytics",
        version: "19",
      },
      { status: 500 }
    )
  }
}
