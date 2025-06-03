"use client"

// Simple Redis client that works directly from the browser
// This uses the KV REST API directly to avoid server-side issues

export class RedisClient {
  private baseUrl: string
  private token: string
  private fallbackMode = false

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_KV_REST_API_URL || process.env.KV_REST_API_URL || ""
    this.token = process.env.NEXT_PUBLIC_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || ""

    // Check if we have valid credentials
    if (!this.baseUrl || !this.token) {
      console.warn("⚠️ Redis credentials not available, using fallback mode")
      this.fallbackMode = true
    }
  }

  // Helper to make authenticated requests to KV REST API
  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (this.fallbackMode) {
      throw new Error("Redis not available")
    }

    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Redis API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Redis request failed:", error)
      throw error
    }
  }

  // Get a value
  async get(key: string): Promise<any> {
    try {
      const result = await this.makeRequest(`/get/${key}`)
      return result.result
    } catch (error) {
      console.warn(`Failed to get ${key} from Redis:`, error)
      return null
    }
  }

  // Set a value
  async set(key: string, value: any): Promise<boolean> {
    try {
      await this.makeRequest(`/set/${key}`, {
        method: "POST",
        body: JSON.stringify({ value }),
      })
      return true
    } catch (error) {
      console.warn(`Failed to set ${key} in Redis:`, error)
      return false
    }
  }

  // Increment a value
  async incr(key: string): Promise<number> {
    try {
      const result = await this.makeRequest(`/incr/${key}`, {
        method: "POST",
      })
      return result.result
    } catch (error) {
      console.warn(`Failed to increment ${key} in Redis:`, error)
      return 0
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<any> {
    try {
      const result = await this.makeRequest(`/hget/${key}/${field}`)
      return result.result
    } catch (error) {
      console.warn(`Failed to hget ${key}/${field} from Redis:`, error)
      return null
    }
  }

  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      await this.makeRequest(`/hset/${key}/${field}`, {
        method: "POST",
        body: JSON.stringify({ value }),
      })
      return true
    } catch (error) {
      console.warn(`Failed to hset ${key}/${field} in Redis:`, error)
      return false
    }
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    try {
      const result = await this.makeRequest(`/hgetall/${key}`)
      return result.result || {}
    } catch (error) {
      console.warn(`Failed to hgetall ${key} from Redis:`, error)
      return {}
    }
  }

  // Check if Redis is available
  async isAvailable(): Promise<boolean> {
    if (this.fallbackMode) return false

    try {
      await this.makeRequest("/ping")
      return true
    } catch (error) {
      console.warn("Redis not available:", error)
      this.fallbackMode = true
      return false
    }
  }
}

// Export a singleton instance
export const redisClient = new RedisClient()
