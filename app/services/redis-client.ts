"use client"

export class RedisClient {
  private baseUrl: string
  private token: string
  private fallbackMode = false

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ""
    this.token = process.env.NEXT_PUBLIC_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ""

    if (!this.baseUrl || !this.token) {
      console.warn("⚠️ Redis credentials not available, using fallback mode")
      this.fallbackMode = true
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (this.fallbackMode) throw new Error("Redis not available")

    try {
      const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`
      const res = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      })

      if (!res.ok) throw new Error(`Redis API error: ${res.status} ${res.statusText}`)
      return await res.json()
    } catch (error) {
      console.error("Redis request failed:", error)
      throw error
    }
  }

  // Simple GET
  async get(key: string): Promise<any> {
    try {
      const result = await this.makeRequest(`/get/${key}`)
      return result.result
    } catch (error) {
      console.warn(`Failed to get ${key}:`, error)
      return null
    }
  }

  // Simple SET
  async set(key: string, value: any): Promise<boolean> {
    try {
      const result = await this.makeRequest(`/set/${key}`, {
        method: "POST",
        body: JSON.stringify({ value: typeof value === "string" ? value : JSON.stringify(value) }),
      })
      return !!result
    } catch (error) {
      console.warn(`Failed to set ${key}:`, error)
      return false
    }
  }

  // INCR
  async incr(key: string): Promise<number> {
    try {
      const result = await this.makeRequest(`/incr/${key}`, {
        method: "POST",
      })
      return result.result
    } catch (error) {
      console.warn(`Failed to increment ${key}:`, error)
      return 0
    }
  }

  // HGET
  async hget(key: string, field: string): Promise<any> {
    try {
      const result = await this.makeRequest(`/hget/${key}/${field}`)
      return result.result
    } catch (error) {
      console.warn(`Failed to hget ${key}/${field}:`, error)
      return null
    }
  }

  // HSET
  async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      const result = await this.makeRequest(`/hset/${key}/${field}`, {
        method: "POST",
        body: JSON.stringify({ value: typeof value === "string" ? value : JSON.stringify(value) }),
      })
      return !!result
    } catch (error) {
      console.warn(`Failed to hset ${key}/${field}:`, error)
      return false
    }
  }

  // HGETALL
  async hgetall(key: string): Promise<Record<string, any>> {
    try {
      const result = await this.makeRequest(`/hgetall/${key}`)
      return result.result || {}
    } catch (error) {
      console.warn(`Failed to hgetall ${key}:`, error)
      return {}
    }
  }

  // Availability check using `get _test`
  async isAvailable(): Promise<boolean> {
    if (this.fallbackMode) return false

    try {
      await this.get("_test")
      return true
    } catch {
      this.fallbackMode = true
      return false
    }
  }
}

export const redisClient = new RedisClient()
