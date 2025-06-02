import { redis } from "@/lib/redis";

const VALID_PLATFORMS = ["twitter", "facebook", "whatsapp", "copy", "native", "other"] as const;
type Platform = (typeof VALID_PLATFORMS)[number];
type ShareData = {
  platform: Platform;
  count: number;
  lastShared: string;
  trend: string;
  velocity: number;
};

const ANALYTICS_KEY = "analytics:v19";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const since = url.searchParams.get("since");

  const analytics = await redis.get<{
    data: ShareData[];
    lastUpdated: string;
    velocityTracker: Record<Platform, number[]>;
  }>(ANALYTICS_KEY);

  if (!analytics) {
    return NextResponse.json({ success: true, data: [], lastUpdated: new Date().toISOString(), version: "19" });
  }

  if (since && new Date(since) >= new Date(analytics.lastUpdated)) {
    return new Response(null, { status: 304 });
  }

  return NextResponse.json({
    success: true,
    data: analytics.data,
    lastUpdated: analytics.lastUpdated,
    serverTime: new Date().toISOString(),
    version: "19",
  });
}

export async function POST(request: Request) {
  const { platform }: { platform: Platform } = await request.json();
  if (!VALID_PLATFORMS.includes(platform)) {
    return NextResponse.json({ success: false, error: "Invalid platform" }, { status: 400 });
  }

  const now = Date.now();
  const isoNow = new Date(now).toISOString();
  const oneHourAgo = now - 60 * 60 * 1000;

  const snapshot = await redis.get<any>(ANALYTICS_KEY);
  const velocityTracker = snapshot?.velocityTracker || {};
  const timestamps: number[] = [...(velocityTracker[platform] || []), now];
  const recent = timestamps.filter(t => t > oneHourAgo);
  velocityTracker[platform] = recent;

  let data: ShareData[] = snapshot?.data || VALID_PLATFORMS.map(p => ({
    platform: p,
    count: 0,
    lastShared: "",
    trend: "stable",
    velocity: 0,
  }));

  data = data.map(item =>
    item.platform === platform
      ? {
          ...item,
          count: item.count + 1,
          lastShared: isoNow,
          velocity: recent.length,
          trend: recent.length > 2 ? "up" : recent.length === 0 && item.count > 0 ? "down" : "stable",
        }
      : item
  );

  const newSnapshot = {
    data,
    lastUpdated: isoNow,
    velocityTracker,
  };

  await redis.set(ANALYTICS_KEY, newSnapshot);

  return NextResponse.json({
    success: true,
    message: "Tracked share",
    data,
    lastUpdated: isoNow,
    version: "19",
  });
}
import { NextResponse } from "next/server";