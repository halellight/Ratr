import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const ACTIVE_USERS_KEY = "nigeria:cabinet:active_users"

export const activeUsers = {
  async enterSession(userId: string) {
    await redis.sadd(ACTIVE_USERS_KEY, userId)
    return await redis.scard(ACTIVE_USERS_KEY)
  },

  async leaveSession(userId: string) {
    await redis.srem(ACTIVE_USERS_KEY, userId)
    return await redis.scard(ACTIVE_USERS_KEY)
  },

  async count() {
    return await redis.scard(ACTIVE_USERS_KEY)
  },
}
