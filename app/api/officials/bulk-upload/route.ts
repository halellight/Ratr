import { type NextRequest, NextResponse } from "next/server"
import { put, del, list } from "@vercel/blob"

// Get the blob token from environment variables
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

// Check admin authentication
function isAuthenticated(request: NextRequest) {
  const authCookie = request.cookies.get("admin-auth")
  return authCookie?.value === "authenticated"
}

export async function POST(request: NextRequest) {
  try {
    if (!BLOB_TOKEN) {
      return NextResponse.json({ error: "Blob storage not configured" }, { status: 500 })
    }

    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const officialIds = formData.getAll("officialIds") as string[]

    if (!files.length || !officialIds.length) {
      return NextResponse.json({ error: "Files and officialIds are required" }, { status: 400 })
    }

    if (files.length !== officialIds.length) {
      return NextResponse.json({ error: "Number of files must match number of officialIds" }, { status: 400 })
    }

    const results = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const officialId = officialIds[i]

      try {
        // Validate file
        if (!file.type.startsWith("image/")) {
          results.push({ officialId, success: false, error: "Not an image file" })
          continue
        }

        if (file.size > 5 * 1024 * 1024) {
          results.push({ officialId, success: false, error: "File too large" })
          continue
        }

        // Delete existing image
        try {
          const existingBlobs = await list({
            prefix: `officials/${officialId}`,
            token: BLOB_TOKEN,
          })
          for (const blob of existingBlobs.blobs) {
            await del(blob.url, { token: BLOB_TOKEN })
          }
        } catch (error) {
          console.log("No existing images to delete for", officialId)
        }

        // Upload new image
        const filename = `officials/${officialId}-${Date.now()}.${file.name.split(".").pop()}`
        const blob = await put(filename, file, {
          access: "public",
          addRandomSuffix: false,
          token: BLOB_TOKEN,
        })

        results.push({
          officialId,
          success: true,
          url: blob.url,
        })
      } catch (error) {
        console.error(`Upload failed for ${officialId}:`, error)
        results.push({
          officialId,
          success: false,
          error: "Upload failed",
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Bulk upload error:", error)
    return NextResponse.json(
      {
        error: "Bulk upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
