import { type NextRequest, NextResponse } from "next/server"
import { put, del, list } from "@vercel/blob"

// Get the blob token from environment variables
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!BLOB_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN environment variable is not set")
}

// Check admin authentication
function isAuthenticated(request: NextRequest) {
  const authCookie = request.cookies.get("admin-auth")
  return authCookie?.value === "authenticated"
}

// Upload or update an official's image
export async function POST(request: NextRequest) {
  try {
    if (!BLOB_TOKEN) {
      return NextResponse.json({ error: "Blob storage not configured" }, { status: 500 })
    }

    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const officialId = formData.get("officialId") as string

    if (!file || !officialId) {
      return NextResponse.json({ error: "File and officialId are required" }, { status: 400 })
    }

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Delete existing image if it exists
    try {
      const existingBlobs = await list({
        prefix: `officials/${officialId}`,
        token: BLOB_TOKEN,
      })
      for (const blob of existingBlobs.blobs) {
        await del(blob.url, { token: BLOB_TOKEN })
      }
    } catch (error) {
      console.log("No existing images to delete or delete failed:", error)
    }

    // Upload new image
    const filename = `officials/${officialId}-${Date.now()}.${file.name.split(".").pop()}`
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
      token: BLOB_TOKEN,
    })

    return NextResponse.json({
      success: true,
      url: blob.url,
      officialId,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Delete an official's image
export async function DELETE(request: NextRequest) {
  try {
    if (!BLOB_TOKEN) {
      return NextResponse.json({ error: "Blob storage not configured" }, { status: 500 })
    }

    if (!isAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const officialId = searchParams.get("officialId")

    if (!officialId) {
      return NextResponse.json({ error: "officialId is required" }, { status: 400 })
    }

    // Delete all images for this official
    const existingBlobs = await list({
      prefix: `officials/${officialId}`,
      token: BLOB_TOKEN,
    })

    for (const blob of existingBlobs.blobs) {
      await del(blob.url, { token: BLOB_TOKEN })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      {
        error: "Delete failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Get all official images
export async function GET() {
  try {
    if (!BLOB_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN not found")
      return NextResponse.json(
        {
          error: "Blob storage not configured",
          images: {},
        },
        { status: 500 },
      )
    }

    const blobs = await list({
      prefix: "officials/",
      token: BLOB_TOKEN,
    })

    const images = blobs.blobs.reduce(
      (acc, blob) => {
        const filename = blob.pathname.split("/").pop() || ""
        const officialId = filename.split("-")[0]
        if (officialId) {
          acc[officialId] = blob.url
        }
        return acc
      },
      {} as Record<string, string>,
    )

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Fetch error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch images",
        details: error instanceof Error ? error.message : "Unknown error",
        images: {},
      },
      { status: 500 },
    )
  }
}
