import { NextResponse } from "next/server";

/**
 * Universal Analytics API Endpoint v21
 * Fallback system that works without Redis if environment variables are missing.
 * Uses in-memory storage as fallback, no dummy data.
 */

// In-memory fallback storage
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
};

function isRedisConfigured(): boolean {
  const hasUrl = process.env.KV_REST_API_URL?.trim() !== "";
  const hasToken = process.env.KV_REST_API_TOKEN?.trim() !== "";
  return hasUrl && hasToken;
}

let redisAnalytics: any = null;
if (isRedisConfigured()) {
  try {
    const redisModule = require("@/app/services/redis-analytics");
    redisAnalytics = redisModule.redisAnalytics;
    console.log("✅ Redis analytics service loaded");
  } catch (error) {
    console.warn("⚠️ Failed to load Redis analytics service:", error);
  }
} else {
  console.warn("⚠️ Redis not configured - using fallback storage");
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const since = url.searchParams.get("since");

    console.log(`🌍 GET /api/analytics/universal - since: ${since}`);

    let analyticsData = fallbackAnalyticsData;

    if (redisAnalytics) {
      try {
        analyticsData = await redisAnalytics.getAnalytics();
        analyticsData.isRedisConnected = true;
      } catch (error) {
        console.warn("⚠️ Redis failed, using fallback:", error);
        analyticsData = fallbackAnalyticsData;
        analyticsData.isRedisConnected = false;
      }
    }

    if (since && new Date(since) >= new Date(analyticsData.lastUpdated)) {
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "no-cache, must-revalidate",
          "Last-Modified": analyticsData.lastUpdated,
        },
      });
    }

    analyticsData.serverTime = new Date().toISOString();
    analyticsData.version = "21";

    return NextResponse.json({
      success: true,
      data: analyticsData,
      message: redisAnalytics ? "Data from Redis" : "Data from fallback storage",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ GET /api/analytics/universal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log(`🌍 POST /api/analytics/universal - type: ${type}`, data);

    let success = false;

    if (type === "rating" && data?.officialId && data?.rating) {
      if (redisAnalytics) {
        try {
          await redisAnalytics.trackRating(data.officialId, data.rating);
          success = true;
        } catch (error) {
          console.warn("⚠️ Redis tracking failed:", error);
        }
      }

      if (!success) {
        fallbackAnalyticsData.totalRatings += 1;
        const entry = fallbackAnalyticsData.leaderRatings[data.officialId];

        if (!entry) {
          fallbackAnalyticsData.leaderRatings[data.officialId] = {
            officialId: data.officialId,
            averageRating: data.rating,
            totalRatings: 1,
            ratingDistribution: { [data.rating]: 1 },
            lastUpdated: new Date().toISOString(),
            performanceMetrics: {
              approvalRating: Math.round((data.rating / 5) * 100),
              trendsUp: data.rating > 3,
              monthlyChange: 0,
            },
          };
        } else {
          const newTotal = entry.totalRatings + 1;
          const newAverage =
            (entry.averageRating * entry.totalRatings + data.rating) / newTotal;

          entry.averageRating = newAverage;
          entry.totalRatings = newTotal;
          entry.ratingDistribution[data.rating] =
            (entry.ratingDistribution[data.rating] || 0) + 1;
          entry.lastUpdated = new Date().toISOString();
          entry.performanceMetrics.approvalRating = Math.round(
            (newAverage / 5) * 100
          );
          entry.performanceMetrics.trendsUp = newAverage > 3;
        }

        fallbackAnalyticsData.lastUpdated = new Date().toISOString();
        success = true;
      }
    } else if (type === "share" && data?.platform) {
      if (redisAnalytics) {
        try {
          await redisAnalytics.trackShare(data.platform);
          success = true;
        } catch (error) {
          console.warn("⚠️ Redis share tracking failed:", error);
        }
      }

      if (!success) {
        fallbackAnalyticsData.totalShares += 1;

        const index = fallbackAnalyticsData.shareAnalytics.findIndex(
          (s) => s.platform === data.platform
        );
        if (index >= 0) {
          const item = fallbackAnalyticsData.shareAnalytics[index];
          item.count += 1;
          item.lastShared = new Date().toISOString();
          item.trend = "up";
        }

        fallbackAnalyticsData.lastUpdated = new Date().toISOString();
        success = true;
      }
    }

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tracking data",
          received: { type, data },
        },
        { status: 400 }
      );
    }

    let updatedAnalytics = fallbackAnalyticsData;
    if (redisAnalytics) {
      try {
        updatedAnalytics = await redisAnalytics.getAnalytics();
        updatedAnalytics.isRedisConnected = true;
      } catch (error) {
        console.warn("⚠️ Failed to get updated Redis data:", error);
        updatedAnalytics.isRedisConnected = false;
      }
    }

    updatedAnalytics.serverTime = new Date().toISOString();
    updatedAnalytics.version = "21";

    return NextResponse.json({
      success: true,
      data: updatedAnalytics,
      message: `${type} tracked successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ POST /api/analytics/universal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to track analytics event",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    console.log("🗑️ DELETE /api/analytics/universal - resetting data");

    if (redisAnalytics) {
      try {
        await redisAnalytics.resetAnalytics();
        console.log("✅ Redis data reset");
      } catch (error) {
        console.warn("⚠️ Redis reset failed:", error);
      }
    }

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
    };

    return NextResponse.json({
      success: true,
      data: fallbackAnalyticsData,
      message: "Analytics data reset",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ DELETE /api/analytics/universal error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset analytics data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
