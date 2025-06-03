import { Redis } from "@upstash/redis"

// Initialize Redis client - this will only work on the server side
let redis: Redis | null = null

if (typeof window === "undefined") {
  redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })
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
  private readonly ANALYTICS_KEY = "nigeria:cabinet:analytics"
  private readonly LEADER_RATINGS_KEY = "nigeria:cabinet:leader_ratings"
  private readonly SHARE_ANALYTICS_KEY = "nigeria:cabinet:share_analytics"
  private readonly ACTIVE_USERS_KEY = "nigeria:cabinet:active_users"

  private getRedis(): Redis {
    if (!redis) {
      throw new Error("Redis client not initialized - this should only be called on the server")
    }
    return redis
  }

  // Safe JSON handling
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

  // Track a new rating
  async trackRating(officialId: string, rating: number, userId?: string): Promise<void> {
    try {
      const redisClient = this.getRedis()

      // Get current data safely
      const leaderKey = `${this.LEADER_RATINGS_KEY}:${officialId}`
      const currentData = await redisClient.hgetall(leaderKey)

      const currentTotal = Number(currentData?.totalRatings || 0)
      const currentAverage = Number(currentData?.averageRating || 0)
      const newTotal = currentTotal + 1
      const newAverage = (currentAverage * currentTotal + rating) / newTotal

      // Handle rating distribution safely
      let distribution = {}
      if (currentData?.ratingDistribution) {
        distribution = this.safeParse(currentData.ratingDistribution)
      }
      distribution[rating] = (distribution[rating] || 0) + 1

      // Update leader data
      await redisClient.hset(leaderKey, {
        officialId,
        averageRating: newAverage.toString(),
        totalRatings: newTotal.toString(),
        ratingDistribution: this.safeStringify(distribution),
        lastUpdated: new Date().toISOString(),
      })

      // Update global analytics
      await redisClient.hincrby(this.ANALYTICS_KEY, "totalRatings", 1)
      await redisClient.hset(this.ANALYTICS_KEY, "lastUpdated", new Date().toISOString())

      // Track active user if provided
      if (userId) {
        await redisClient.setex(`${this.ACTIVE_USERS_KEY}:${userId}`, 3600, "active")
      }

      console.log(`✅ Rating tracked: ${officialId} = ${rating}/5`)
    } catch (error) {
      console.error("❌ Failed to track rating:", error)
      throw error
    }
  }

  // Track share event
  async trackShare(platform: string, userId?: string): Promise<void> {
    try {
      const redisClient = this.getRedis()
      const shareKey = `${this.SHARE_ANALYTICS_KEY}:${platform}`

      // Increment share count
      await redisClient.hincrby(shareKey, "count", 1)
      await redisClient.hset(shareKey, "lastShared", new Date().toISOString())

      // Update global share count
      await redisClient.hincrby(this.ANALYTICS_KEY, "totalShares", 1)
      await redisClient.hset(this.ANALYTICS_KEY, "lastUpdated", new Date().toISOString())

      // Track active user
      if (userId) {
        await redisClient.setex(`${this.ACTIVE_USERS_KEY}:${userId}`, 3600, "active")
      }

      console.log(`📊 Share tracked: ${platform}`)
    } catch (error) {
      console.error("❌ Failed to track share:", error)
      throw error
    }
  }

  // Get real-time analytics
  async getAnalytics(): Promise<RealTimeAnalytics> {
    try {
      const redisClient = this.getRedis()

      // Get global data
      const globalData = await redisClient.hgetall(this.ANALYTICS_KEY)
      const activeUserKeys = await redisClient.keys(`${this.ACTIVE_USERS_KEY}:*`)

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
          const monthlyChange = Math.random() * 10 - 5 // Simulated

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

      return {
        totalRatings: Number(globalData?.totalRatings || 0),
        totalShares: Number(globalData?.totalShares || 0),
        leaderRatings,
        shareAnalytics,
        lastUpdated: globalData?.lastUpdated || new Date().toISOString(),
        activeUsers: activeUserKeys.length,
      }
    } catch (error) {
      console.error("❌ Failed to get analytics:", error)
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

  // Get leader-specific analytics
  async getLeaderAnalytics(officialId: string): Promise<LeaderRating | null> {
    try {
      const redisClient = this.getRedis()
      const data = await redisClient.hgetall(`${this.LEADER_RATINGS_KEY}:${officialId}`)

      if (!data || Object.keys(data).length === 0) {
        return null
      }

      const averageRating = Number(data.averageRating || 0)
      const totalRatings = Number(data.totalRatings || 0)
      const approvalRating = Math.round((averageRating / 5) * 100)
      const monthlyChange = Math.random() * 10 - 5 // Simulated

      return {
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
    } catch (error) {
      console.error("❌ Failed to get leader analytics:", error)
      return null
    }
  }

  // Reset analytics (admin only)
  async resetAnalytics(): Promise<void> {
    try {
      const redisClient = this.getRedis()
      const keys = await redisClient.keys("nigeria:cabinet:*")
      if (keys.length > 0) {
        await redisClient.del(...keys)
      }
      console.log("🗑️ Analytics data reset")
    } catch (error) {
      console.error("❌ Failed to reset analytics:", error)
      throw error
    }
  }
}

export const redisAnalytics = new RedisAnalyticsService()
