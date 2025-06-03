import { type NextRequest, NextResponse } from "next/server"
import { redisAnalytics } from "@/app/services/redis-analytics"
import { blobAnalytics } from "@/app/services/blob-analytics"

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminPassword = process.env.ADMIN_PASSWORD
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const providedPassword = authHeader.replace("Bearer ", "")
    if (providedPassword !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const { action } = await request.json()

    switch (action) {
      case "backup":
        const success = await redisAnalytics.manualBackup()
        return NextResponse.json({
          success,
          message: success ? "Backup completed successfully" : "Backup failed",
        })

      case "info":
        const backupInfo = await redisAnalytics.getBackupInfo()
        const hasBackup = await blobAnalytics.hasAnalytics()
        return NextResponse.json({
          hasBackup,
          backupInfo,
          message: hasBackup ? "Backup exists" : "No backup found",
        })

      case "restore":
        // This would trigger a restore on next data fetch
        return NextResponse.json({
          message: "Restore will happen automatically on next data access",
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Backup API error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminPassword = process.env.ADMIN_PASSWORD
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const providedPassword = authHeader.replace("Bearer ", "")
    if (providedPassword !== adminPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const backupInfo = await redisAnalytics.getBackupInfo()
    const hasBackup = await blobAnalytics.hasAnalytics()

    return NextResponse.json({
      hasBackup,
      backupInfo,
      status: hasBackup ? "Backup available" : "No backup found",
    })
  } catch (error) {
    console.error("Backup info error:", error)
    return NextResponse.json(
      {
        error: "Failed to get backup info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
