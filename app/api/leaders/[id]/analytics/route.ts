import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Simple fallback data for demo
    const mockData = {
      officialId: id,
      averageRating: 3.5 + Math.random() * 1.5,
      totalRatings: Math.floor(Math.random() * 100) + 10,
      ratingDistribution: {
        1: Math.floor(Math.random() * 10),
        2: Math.floor(Math.random() * 15),
        3: Math.floor(Math.random() * 20),
        4: Math.floor(Math.random() * 25),
        5: Math.floor(Math.random() * 30),
      },
      lastUpdated: new Date().toISOString(),
      performanceMetrics: {
        approvalRating: Math.floor(Math.random() * 40) + 60,
        trendsUp: Math.random() > 0.5,
        monthlyChange: Math.random() * 10,
      },
    }

    return NextResponse.json({
      success: true,
      data: mockData,
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
