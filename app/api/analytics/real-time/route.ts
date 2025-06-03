import { type NextRequest, NextResponse } from "next/server"

// This API is now just a placeholder since we're using client-side storage
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      totalRatings: 0,
      totalShares: 0,
      leaderRatings: {},
      shareAnalytics: [],
      lastUpdated: new Date().toISOString(),
      activeUsers: 0,
    },
    timestamp: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      totalRatings: 0,
      totalShares: 0,
      leaderRatings: {},
      shareAnalytics: [],
      lastUpdated: new Date().toISOString(),
      activeUsers: 0,
    },
    message: "Tracked successfully",
    timestamp: new Date().toISOString(),
  })
}
