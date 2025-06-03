import { Redis } from "@upstash/redis"
import { blobAnalytics, type BlobAnalyticsData } from "./blob-analytics"

// Initialize Redis client with proper error handling
let redis: Redis | null = null

if (typeof window === "undefined") {
  try {
    const url = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN

    if (!url || !token || url.trim() === "" || token.trim() === "") {
      console.warn("⚠️ Redis environment variables not properly configured")
      console.warn("KV_REST_API_URL:", url ? "✅ Set" : "❌ Missing")
      console.warn("KV_REST_API_TOKEN:", token ? "✅ Set" : "❌ Missing")
    } else {
      redis = new Redis({
        url: url.trim(),
        token: token.trim(),
      })
      console.log("✅ Redis client initialized successfully")
    }
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
  private readonly ANALYTICS_KEY = "nigeria:cabinet:analytics:v21"
  private readonly LEADER_RATINGS_KEY = "nigeria:cabinet:leader_ratings:v21"
  private readonly SHARE_ANALYTICS_KEY = "nigeria:cabinet:share_analytics:v21"
  private lastBackupTime = 0
  private readonly BACKUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

  private getRedis(): Redis {
    if (!redis) {
      throw new Error("Redis client not initialized - check environment variables")
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

  // Backup data to Vercel Blob
  private async backupToBlob(): Promise<void> {
    try {
      const now = Date.now()
      if (now - this.lastBackupTime < this.BACKUP_INTERVAL) {
        return // Skip if backed up recently
      }

      console.log("💾 Starting backup to Vercel Blob...")
      const data = await this.getAnalytics()

      const blobData: BlobAnalyticsData = {
        totalRatings: data.totalRatings,
        totalShares: data.totalShares,
        leaderRatings: data.leaderRatings,
        shareAnalytics: data.shareAnalytics,
        lastUpdated: data.lastUpdated,
        version: "v21",
        backupTimestamp: new Date().toISOString(),
      }

      const success = await blobAnalytics.storeAnalytics(blobData)
      if (success) {
        this.lastBackupTime = now
        console.log("✅ Backup to Vercel Blob completed successfully")
      }
    } catch (error) {
      console.error("❌ Failed to backup to Blob:", error)
    }
  }

  // Restore data from Vercel Blob
  private async restoreFromBlob(): Promise<boolean> {
    try {
      console.log("📥 Attempting to restore from Vercel Blob...")
      const blobData = await blobAnalytics.getAnalytics()

      if (!blobData) {
        console.log("📝 No backup data found in Vercel Blob")
        return false
      }

      console.log("🔄 Restoring data from Blob backup...")
      const redisClient = this.getRedis()

      // Restore global analytics
      await redisClient.hset(this.ANALYTICS_KEY, {
        totalRatings: blobData.totalRatings.toString(),
        totalShares: blobData.totalShares.toString(),
        lastUpdated: blobData.lastUpdated,
      })

      // Restore leader ratings
      for (const [officialId, rating] of Object.entries(blobData.leaderRatings)) {
        const leaderKey = `${this.LEADER_RATINGS_KEY}:${officialId}`
        await redisClient.hset(leaderKey, {
          officialId,
          averageRating: rating.averageRating.toString(),
          totalRatings: rating.totalRatings.toString(),
          ratingDistribution: this.safeStringify(rating.ratingDistribution),
          lastUpdated: rating.lastUpdated,
        })
      }

      // Restore share analytics
      for (const shareData of blobData.shareAnalytics) {
        const shareKey = `${this.SHARE_ANALYTICS_KEY}:${shareData.platform}`
        await redisClient.hset(shareKey, {
          count: shareData.count.toString(),
          lastShared: shareData.lastShared || "",
        })
      }

      console.log("✅ Data restored from Vercel Blob successfully")
      return true
    } catch (error) {
      console.error("❌ Failed to restore from Blob:", error)
      return false
    }
  }

  // Track a new rating
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

      // Backup to Blob after significant changes
      await this.backupToBlob()
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

      // Backup to Blob after significant changes
      await this.backupToBlob()
    } catch (error) {
      console.error("❌ Redis: Failed to track share:", error)
      throw error
    }
  }

  // Get real-time analytics from Redis (with Blob fallback)
  async getAnalytics(): Promise<RealTimeAnalytics> {
    try {
      const redisClient = this.getRedis()
      console.log("📊 Redis: Getting analytics data...")

      // Get global data
      const globalData = await redisClient.hgetall(this.ANALYTICS_KEY)

      // If Redis is empty, try to restore from Blob
      if (!globalData || Object.keys(globalData).length === 0) {
        console.log("📝 Redis appears empty, attempting restore from Blob...")
        const restored = await this.restoreFromBlob()
        if (restored) {
          // Retry getting data after restore
          const restoredGlobalData = await redisClient.hgetall(this.ANALYTICS_KEY)
          if (restoredGlobalData && Object.keys(restoredGlobalData).length > 0) {
            console.log("✅ Data successfully restored from Blob")
            return this.getAnalytics() // Recursive call after restore
          }
        }
      }

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

          leaderRatings[officialId] = {
            officialId,
            averageRating,
            totalRatings,
            ratingDistribution: this.safeParse(data.ratingDistribution),
            lastUpdated: data.lastUpdated || new Date().toISOString(),
            performanceMetrics: {
              approvalRating,
              trendsUp: averageRating > 3,
              monthlyChange: 0,
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

      // Ensure all platforms are represented
      const platforms = ["twitter", "facebook", "whatsapp", "copy", "native", "other"]
      platforms.forEach((platform) => {
        if (!shareAnalytics.find((s) => s.platform === platform)) {
          shareAnalytics.push({
            platform,
            count: 0,
            lastShared: "",
            trend: "stable",
            velocity: 0,
          })
        }
      })

      const result = {
        totalRatings: Number(globalData?.totalRatings || 0),
        totalShares: Number(globalData?.totalShares || 0),
        leaderRatings,
        shareAnalytics,
        lastUpdated: globalData?.lastUpdated || new Date().toISOString(),
        activeUsers: 1,
      }

      console.log("✅ Redis: Analytics data retrieved:", {
        totalRatings: result.totalRatings,
        totalShares: result.totalShares,
        leaderCount: Object.keys(result.leaderRatings).length,
      })

      return result
    } catch (error) {
      console.error("❌ Redis: Failed to get analytics:", error)

      // If Redis fails completely, try to get data from Blob
      console.log("🔄 Attempting to get data directly from Blob...")
      const blobData = await blobAnalytics.getAnalytics()
      if (blobData) {
        console.log("✅ Retrieved data from Blob as fallback")
        return {
          totalRatings: blobData.totalRatings,
          totalShares: blobData.totalShares,
          leaderRatings: blobData.leaderRatings,
          shareAnalytics: blobData.shareAnalytics,
          lastUpdated: blobData.lastUpdated,
          activeUsers: 1,
        }
      }

      throw error
    }
  }

  // Reset analytics (admin only) - also clears Blob
  async resetAnalytics(): Promise<void> {
    try {
      const redisClient = this.getRedis()
      console.log("🗑️ Redis: Resetting all analytics data...")

      const keys = await redisClient.keys("nigeria:cabinet:*:v21")
      if (keys.length > 0) {
        await redisClient.del(...keys)
      }

      // Also delete from Blob
      await blobAnalytics.deleteAnalytics()

      console.log("✅ Redis & Blob: Analytics data reset successfully")
    } catch (error) {
      console.error("❌ Redis: Failed to reset analytics:", error)
      throw error
    }
  }

  // Manual backup trigger
  async manualBackup(): Promise<boolean> {
    try {
      await this.backupToBlob()
      return true
    } catch (error) {
      console.error("❌ Manual backup failed:", error)
      return false
    }
  }

  // Get backup info
  async getBackupInfo() {
    return await blobAnalytics.getBlobInfo()
  }
}

export const redisAnalytics = new RedisAnalyticsService()
