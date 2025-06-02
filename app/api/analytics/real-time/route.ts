import { type NextRequest, NextResponse } from "next/server"
import { redisAnalytics } from "@/app/services/redis-analytics"

export async function GET(request: NextRequest) {
  try {
    const analytics = await redisAnalytics.getAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Real-time analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch real-time analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Generate a simple user ID for tracking
    const userId = request.headers.get("x-user-id") || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    if (type === "rating") {
      const { officialId, rating } = data
      await redisAnalytics.trackRating(officialId, rating, userId)
    } else if (type === "share") {
      const { platform } = data
      await redisAnalytics.trackShare(platform, userId)
    } else {
      return NextResponse.json({ success: false, error: "Invalid tracking type" }, { status: 400 })
    }

    // Return updated analytics
    const analytics = await redisAnalytics.getAnalytics()

    return NextResponse.json({
      success: true,
      data: analytics,
      message: `${type} tracked successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Analytics tracking error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
