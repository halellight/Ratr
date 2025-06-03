import { type NextRequest, NextResponse } from "next/server"

// Simple in-memory storage for demo purposes
const analyticsData = {
  totalRatings: 0,
  totalShares: 0,
  leaderRatings: {} as Record<string, any>,
  shareAnalytics: [] as any[],
  lastUpdated: new Date().toISOString(),
  activeUsers: 0,
}

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: analyticsData,
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

    if (type === "rating") {
      const { officialId, rating } = data

      // Update analytics data
      analyticsData.totalRatings += 1

      if (!analyticsData.leaderRatings[officialId]) {
        analyticsData.leaderRatings[officialId] = {
          officialId,
          averageRating: rating,
          totalRatings: 1,
          ratingDistribution: { [rating]: 1 },
          lastUpdated: new Date().toISOString(),
          performanceMetrics: {
            approvalRating: Math.round((rating / 5) * 100),
            trendsUp: rating > 3,
            monthlyChange: Math.random() * 5,
          },
        }
      } else {
        const current = analyticsData.leaderRatings[officialId]
        const newTotal = current.totalRatings + 1
        const newAverage = (current.averageRating * current.totalRatings + rating) / newTotal

        current.averageRating = newAverage
        current.totalRatings = newTotal
        current.ratingDistribution[rating] = (current.ratingDistribution[rating] || 0) + 1
        current.lastUpdated = new Date().toISOString()
        current.performanceMetrics.approvalRating = Math.round((newAverage / 5) * 100)
      }

      analyticsData.lastUpdated = new Date().toISOString()
    } else if (type === "share") {
      const { platform } = data
      analyticsData.totalShares += 1

      const existingShare = analyticsData.shareAnalytics.find((s) => s.platform === platform)
      if (existingShare) {
        existingShare.count += 1
        existingShare.lastShared = new Date().toISOString()
      } else {
        analyticsData.shareAnalytics.push({
          platform,
          count: 1,
          lastShared: new Date().toISOString(),
          trend: "up",
          velocity: 1,
        })
      }

      analyticsData.lastUpdated = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: analyticsData,
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
