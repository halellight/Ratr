import { Redis } from "@upstash/redis"

export async function GET(req: Request) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  const write = (event: string, data: any) => {
    return writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
  }

  const ratingSub = redis.subscribe("analytics:rating", {
    async message(data) {
      await write("rating", data)
    },
  })

  const shareSub = redis.subscribe("analytics:share", {
    async message(data) {
      await write("share", data)
    },
  })

  const activeSub = redis.subscribe("analytics:active", {
    async message(data) {
      await write("active", data)
    },
  })

  req.signal.addEventListener("abort", async () => {
    await ratingSub.unsubscribe()
    await shareSub.unsubscribe()
    await activeSub.unsubscribe()
    writer.close()
  })

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
export async function POST(req: Request) {
  const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  })

  const body = await req.json()
  const { type, data } = body

  if (type === "rating") {
    await redis.publish("analytics:rating", data)
  } else if (type === "share") {
    await redis.publish("analytics:share", data)
  } else if (type === "active") {
    await redis.publish("analytics:active", data)
  } else {
    return new Response("Invalid event type", { status: 400 })
  }

  return new Response(null, { status: 204 })
}