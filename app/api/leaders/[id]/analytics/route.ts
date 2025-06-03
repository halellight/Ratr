import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return NextResponse.json({
    success: true,
    data: {
      officialId: id,
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: {},
      lastUpdated: new Date().toISOString(),
      performanceMetrics: {
        approvalRating: 0,
        trendsUp: false,
        monthlyChange: 0,
      },
    },
  })
}
