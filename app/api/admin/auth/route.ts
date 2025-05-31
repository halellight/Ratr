import { type NextRequest, NextResponse } from "next/server"

// Simple admin authentication - in production, use proper auth
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      const response = NextResponse.json({ success: true })
      // Set a simple auth cookie (in production, use proper JWT)
      response.cookies.set("admin-auth", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })
      return response
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get("admin-auth")

  if (authCookie?.value === "authenticated") {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  response.cookies.delete("admin-auth")
  return response
}
