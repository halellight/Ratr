import { NextResponse } from "next/server"
import { activeUsers } from "@/app/services/active-users"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const user = searchParams.get("user")
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 })

  const count = await activeUsers.enterSession(user)
  return NextResponse.json({ active: count })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const user = searchParams.get("user")
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 })

  const count = await activeUsers.leaveSession(user)
  return NextResponse.json({ active: count })
}
