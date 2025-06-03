import { put, head, del } from "@vercel/blob"

export interface BlobAnalyticsData {
  totalRatings: number
  totalShares: number
  leaderRatings: Record<string, any>
  shareAnalytics: any[]
  lastUpdated: string
  version: string
  backupTimestamp: string
}

class BlobAnalyticsService {
  private readonly BLOB_PATH = "analytics/nigeria-cabinet-analytics-v21.json"

  // Store analytics data to Vercel Blob
  async storeAnalytics(data: BlobAnalyticsData): Promise<boolean> {
    try {
      console.log("💾 Blob: Storing analytics data...")

      const blobData = {
        ...data,
        backupTimestamp: new Date().toISOString(),
        version: "v21",
      }

      const blob = await put(this.BLOB_PATH, JSON.stringify(blobData, null, 2), {
        access: "public",
        contentType: "application/json",
      })

      console.log("✅ Blob: Analytics data stored successfully:", blob.url)
      return true
    } catch (error) {
      console.error("❌ Blob: Failed to store analytics:", error)
      return false
    }
  }

  // Retrieve analytics data from Vercel Blob
  async getAnalytics(): Promise<BlobAnalyticsData | null> {
    try {
      console.log("📥 Blob: Retrieving analytics data...")

      // Check if blob exists
      try {
        await head(this.BLOB_PATH)
      } catch (error) {
        console.log("📝 Blob: No existing analytics data found")
        return null
      }

      // Fetch the data
      const response = await fetch(`https://blob.vercel-storage.com/${this.BLOB_PATH}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Blob: Analytics data retrieved successfully")

      return data
    } catch (error) {
      console.error("❌ Blob: Failed to retrieve analytics:", error)
      return null
    }
  }

  // Delete analytics data from Vercel Blob
  async deleteAnalytics(): Promise<boolean> {
    try {
      console.log("🗑️ Blob: Deleting analytics data...")

      await del(this.BLOB_PATH)

      console.log("✅ Blob: Analytics data deleted successfully")
      return true
    } catch (error) {
      console.error("❌ Blob: Failed to delete analytics:", error)
      return false
    }
  }

  // Check if analytics data exists in blob
  async hasAnalytics(): Promise<boolean> {
    try {
      await head(this.BLOB_PATH)
      return true
    } catch (error) {
      return false
    }
  }

  // Get blob info (size, last modified, etc.)
  async getBlobInfo() {
    try {
      const info = await head(this.BLOB_PATH)
      return {
        size: info.size,
        lastModified: info.uploadedAt,
        url: info.url,
      }
    } catch (error) {
      return null
    }
  }
}

export const blobAnalytics = new BlobAnalyticsService()
