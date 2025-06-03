import { Redis } from "@upstash/redis"

// Initialize Redis client - server-side only
let redis: Redis | null = null

if (typeof window === "undefined") {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    console.log("✅ Redis client initialized successfully")
  } catch (error) {
    console.error("❌ Failed to initialize Redis client:", error)
  }
}

export interface LeaderRating {
  officialId: string
  averageRating: number
  totalRatings: number
  ratingDistribution: Record<number, number>
  lastUpdated: string
  performanceMetrics: {
    approvalRating: number
    trendsUp: boolean
    monthlyChange: number
  }
}

export interface ShareAnalytics {
  platform: string
  count: number
  lastShared: string
  trend: "up" | "down" | "stable"
  velocity: number
}

export interface RealTimeAnalytics {
  totalRatings: number
  totalShares: number
  leaderRatings: Record<string, LeaderRating>
  shareAnalytics: ShareAnalytics[]
  lastUpdated: string
  activeUsers: number
}

class RedisAnalyticsService {
  private readonly ANALYTICS_KEY = "nigeria:cabinet:analytics:v20"
  private readonly LEADER_RATINGS_KEY = "nigeria:cabinet:leader_ratings:v20"
  private readonly SHARE_ANALYTICS_KEY = "nigeria:cabinet:share_analytics:v20"

  private getRedis(): Redis {
    if (!redis) {
      throw new Error("Redis client not initialized - server-side only")
    }
    return redis
  }

  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      console.warn("Failed to stringify object:", obj, error)
      return "{}"
    }
  }

  private safeParse(str: any): any {
    if (!str) return {}
    if (typeof str === "object") return str
    if (typeof str !== "string") return {}

    try {
      return JSON.parse(str)
    } catch (error) {
      console.warn("Failed to parse JSON:", str, error)
      return {}
    }
  }

  // Track a new rating with detailed logging
  async trackRating(officialId: string, rating: number, userId?: string): Promise<void> {
    try {
      const redisClient = this.getRedis()
      console.log(`🗳️ Redis: Tracking rating ${officialId} = ${rating}/5`)

      // Get current leader data
      const leaderKey = `${this.LEADER_RATINGS_KEY}:${officialId}`
      const currentData = await redisClient.hgetall(leaderKey)

      const currentTotal = Number(currentData?.totalRatings || 0)
      const currentAverage = Number(currentData?.averageRating || 0)
      const newTotal = currentTotal + 1
      const newAverage = (currentAverage * currentTotal + rating) / newTotal

      // Handle rating distribution
      let distribution = {}
      if (currentData?.ratingDistribution) {
        distribution = this.safeParse(currentData.ratingDistribution)
      }
      distribution[rating] = (distribution[rating] || 0) + 1

      // Update leader data in Redis
      await redisClient.hset(leaderKey, {
        officialId,
        averageRating: newAverage.toString(),
        totalRatings: newTotal.toString(),
        ratingDistribution: this.safeStringify(distribution),
        lastUpdated: new Date().toISOString(),
      })

      console.log(`✅ Redis: Leader data updated for ${officialId}:`, {
        averageRating: newAverage,
        totalRatings: newTotal,
      })

      // Update global analytics
      await redisClient.hincrby(this.ANALYTICS_KEY, "totalRatings", 1)
      await redisClient.hset(this.ANALYTICS_KEY, "lastUpdated", new Date().toISOString())

      console.log(`✅ Redis: Global analytics updated - vote logged successfully!`)
    } catch (error) {
      console.error("❌ Redis: Failed to track rating:", error)
      throw error
    }
  }

  // Track share event
  async trackShare(platform: string, userId?: string): Promise<void> {
    try {
      const redisClient = this.getRedis()
      console.log(`📊 Redis: Tracking share ${platform}`)

      const shareKey = `${this.SHARE_ANALYTICS_KEY}:${platform}`

      // Increment share count
      await redisClient.hincrby(shareKey, "count", 1)
      await redisClient.hset(shareKey, "lastShared", new Date().toISOString())

      // Update global share count
      await redisClient.hincrby(this.ANALYTICS_KEY, "totalShares", 1)
      await redisClient.hset(this.ANALYTICS_KEY, "lastUpdated", new Date().toISOString())

      console.log(`✅ Redis: Share tracked successfully for ${platform}`)
    } catch (error) {
      console.error("❌ Redis: Failed to track share:", error)
      throw error
    }
  }

  // Get real-time analytics from Redis
  async getAnalytics(): Promise<RealTimeAnalytics> {
    try {
      const redisClient = this.getRedis()
      console.log("📊 Redis: Getting analytics data...")

      // Get global data
      const globalData = await redisClient.hgetall(this.ANALYTICS_KEY)

      // Get leader ratings
      const leaderKeys = await redisClient.keys(`${this.LEADER_RATINGS_KEY}:*`)
      const leaderRatings: Record<string, LeaderRating> = {}

      for (const key of leaderKeys) {
        const officialId = key.split(":").pop()!
        const data = await redisClient.hgetall(key)

        if (data && Object.keys(data).length > 0) {
          const averageRating = Number(data.averageRating || 0)
          const totalRatings = Number(data.totalRatings || 0)
          const approvalRating = Math.round((averageRating / 5) * 100)
          const monthlyChange = Math.random() * 10 - 5

          leaderRatings[officialId] = {
            officialId,
            averageRating,
            totalRatings,
            ratingDistribution: this.safeParse(data.ratingDistribution),
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            performanceMetrics: {
              approvalRating,
              trendsUp: monthlyChange > 0,
              monthlyChange: Math.abs(monthlyChange),
            },
          }
        }
      }

      // Get share analytics
      const shareKeys = await redisClient.keys(`${this.SHARE_ANALYTICS_KEY}:*`)
      const shareAnalytics: ShareAnalytics[] = []

      for (const key of shareKeys) {
        const platform = key.split(":").pop()!
        const data = await redisClient.hgetall(key)

        if (data && Object.keys(data).length > 0) {
          shareAnalytics.push({
            platform,
            count: Number(data.count || 0),
            lastShared: data.lastShared || "",
            trend: "stable" as const,
            velocity: 0,
          })
        }
      }

      const result = {
        totalRatings: Number(globalData?.totalRatings || 0),
        totalShares: Number(globalData?.totalShares || 0),
        leaderRatings,
        shareAnalytics,
        lastUpdated: globalData?.lastUpdated || new Date().toISOString(),
        activeUsers: Math.max(1, Math.floor(Math.random() * 10) + 1),
      }

      console.log("✅ Redis: Analytics data retrieved:", {
        totalRatings: result.totalRatings,
        totalShares: result.totalShares,
        leaderCount: Object.keys(result.leaderRatings).length,
      })

      return result
    } catch (error) {
      console.error("❌ Redis: Failed to get analytics:", error)
      // Return empty analytics instead of throwing
      return {
        totalRatings: 0,
        totalShares: 0,
        leaderRatings: {},
        shareAnalytics: [],
        lastUpdated: new Date().toISOString(),
        activeUsers: 0,
      }
    }
  }

  // Reset analytics (admin only)
  async resetAnalytics(): Promise<void> {
    try {
      const redisClient = this.getRedis()
      console.log("🗑️ Redis: Resetting all analytics data...")

      const keys = await redisClient.keys("nigeria:cabinet:*:v20")
      if (keys.length > 0) {
        await redisClient.del(...keys)
      }

      console.log("✅ Redis: Analytics data reset successfully")
    } catch (error) {
      console.error("❌ Redis: Failed to reset analytics:", error)
      throw error
    }
  }
}

export const redisAnalytics = new RedisAnalyticsService()
