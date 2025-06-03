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

  // Track a new rating
  async trackRating(officialId: string, rating: number, userId?: string): Promise<void> {
    try {
      const redisClient = this.getRedis()
      const pipeline = redisClient.pipeline()

      // Update leader-specific ratings
      const leaderKey = `${this.LEADER_RATINGS_KEY}:${officialId}`
      const currentData = (await redisClient.hgetall(leaderKey)) as any

      const totalRatings = (currentData?.totalRatings || 0) + 1
      const currentAverage = currentData?.averageRating || 0
      const newAverage = (currentAverage * (totalRatings - 1) + rating) / totalRatings

      // Update rating distribution
      const distribution = currentData?.ratingDistribution ? JSON.parse(currentData.ratingDistribution) : {}
      distribution[rating] = (distribution[rating] || 0) + 1

      pipeline.hset(leaderKey, {
        averageRating: newAverage,
        totalRatings,
        ratingDistribution: JSON.stringify(distribution),
        lastUpdated: new Date().toISOString(),
      })

      // Update global analytics
      pipeline.hincrby(this.ANALYTICS_KEY, "totalRatings", 1)
      pipeline.hset(this.ANALYTICS_KEY, "lastUpdated", new Date().toISOString())

      // Track active user if provided
      if (userId) {
        pipeline.setex(`${this.ACTIVE_USERS_KEY}:${userId}`, 3600, "active")
      }

      await pipeline.exec()

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
      const pipeline = redisClient.pipeline()
      const shareKey = `${this.SHARE_ANALYTICS_KEY}:${platform}`

      // Increment share count
      pipeline.hincrby(shareKey, "count", 1)
      pipeline.hset(shareKey, "lastShared", new Date().toISOString())

      // Update velocity tracking (shares in last hour)
      const velocityKey = `${shareKey}:velocity`
      const now = Date.now()
      pipeline.zadd(velocityKey, { score: now, member: now.toString() })
      pipeline.zremrangebyscore(velocityKey, 0, now - 3600000) // Remove entries older than 1 hour
      pipeline.expire(velocityKey, 3600) // Expire velocity data after 1 hour

      // Update global share count
      pipeline.hincrby(this.ANALYTICS_KEY, "totalShares", 1)
      pipeline.hset(this.ANALYTICS_KEY, "lastUpdated", new Date().toISOString())

      // Track active user
      if (userId) {
        pipeline.setex(`${this.ACTIVE_USERS_KEY}:${userId}`, 3600, "active")
      }

      await pipeline.exec()

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
      const [globalData, activeUserKeys] = await Promise.all([
        redisClient.hgetall(this.ANALYTICS_KEY),
        redisClient.keys(`${this.ACTIVE_USERS_KEY}:*`),
      ])

      // Get leader ratings
      const leaderKeys = await redisClient.keys(`${this.LEADER_RATINGS_KEY}:*`)
      const leaderRatings: Record<string, LeaderRating> = {}

      for (const key of leaderKeys) {
        const officialId = key.split(":").pop()!
        const data = (await redisClient.hgetall(key)) as any

        if (data && Object.keys(data).length > 0) {
          // Calculate performance metrics
          const averageRating = Number.parseFloat(data.averageRating || "0")
          const approvalRating = Math.round((averageRating / 5) * 100)
          const monthlyChange = Math.random() * 10 - 5 // Simulated for now

          leaderRatings[officialId] = {
            officialId,
            averageRating,
            totalRatings: Number.parseInt(data.totalRatings || "0"),
            ratingDistribution: data.ratingDistribution ? JSON.parse(data.ratingDistribution) : {},
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
        const data = (await redisClient.hgetall(key)) as any

        if (data && Object.keys(data).length > 0) {
          // Get velocity (shares in last hour)
          const velocityKey = `${key}:velocity`
          const velocityCount = await redisClient.zcard(velocityKey)

          shareAnalytics.push({
            platform,
            count: Number.parseInt(data.count || "0"),
            lastShared: data.lastShared || "",
            trend: velocityCount > 2 ? "up" : velocityCount === 0 ? "down" : "stable",
            velocity: velocityCount,
          })
        }
      }

      return {
        totalRatings: Number.parseInt((globalData?.totalRatings as string) || "0"),
        totalShares: Number.parseInt((globalData?.totalShares as string) || "0"),
        leaderRatings,
        shareAnalytics,
        lastUpdated: (globalData?.lastUpdated as string) || new Date().toISOString(),
        activeUsers: activeUserKeys.length,
      }
    } catch (error) {
      console.error("❌ Failed to get analytics:", error)
      throw error
    }
  }

  // Get leader-specific analytics
  async getLeaderAnalytics(officialId: string): Promise<LeaderRating | null> {
    try {
      const redisClient = this.getRedis()
      const data = (await redisClient.hgetall(`${this.LEADER_RATINGS_KEY}:${officialId}`)) as any

      if (!data || Object.keys(data).length === 0) {
        return null
      }

      const averageRating = Number.parseFloat(data.averageRating || "0")
      const approvalRating = Math.round((averageRating / 5) * 100)
      const monthlyChange = Math.random() * 10 - 5 // Simulated for now

      return {
        officialId,
        averageRating,
        totalRatings: Number.parseInt(data.totalRatings || "0"),
        ratingDistribution: data.ratingDistribution ? JSON.parse(data.ratingDistribution) : {},
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
