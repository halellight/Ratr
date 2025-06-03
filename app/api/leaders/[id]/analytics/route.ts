import { type NextRequest, NextResponse } from "next/server"
import { redisAnalytics } from "@/app/services/redis-analytics"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const analytics = await redisAnalytics.getLeaderAnalytics(id)

    if (!analytics) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No analytics data available for this leader",
      })
    }

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Leader analytics error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch leader analytics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
