"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  X,
  Upload,
  Save,
  Edit,
  Trash2,
  User,
  Camera,
  Loader2,
  Check,
  AlertCircle,
  LogOut,
  Cloud,
  RefreshCw,
} from "lucide-react"
import { AdminAuth } from "./admin-auth"

interface Official {
  id: string
  name: string
  fullName: string
  position: string
  image: string
  category: string
}

interface AdminPanelProps {
  officials: Official[]
  onUpdateOfficials: (officials: Official[]) => void
  onClose: () => void
}

interface UploadResult {
  officialId: string
  success: boolean
  url?: string
  error?: string
}

export function AdminPanel({ officials, onUpdateOfficials, onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [cloudImages, setCloudImages] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const bulkInputRef = useRef<HTMLInputElement>(null)

  const categories = ["Executive", "Economic Team", "Social Services", "Infrastructure", "Security"]

  // Load cloud images when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCloudImages()
    }
  }, [isAuthenticated])

  // Update officials with cloud images
  useEffect(() => {
    if (Object.keys(cloudImages).length > 0) {
      const updatedOfficials = officials.map((official) => ({
        ...official,
        image: cloudImages[official.id] || official.image,
      }))
      onUpdateOfficials(updatedOfficials)
    }
  }, [cloudImages])

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !editingOfficial) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [onClose, editingOfficial])

  const loadCloudImages = async () => {
    setIsLoadingImages(true)
    try {
      const response = await fetch("/api/officials/images")
      const data = await response.json()

      if (response.ok) {
        setCloudImages(data.images || {})
      } else {
        console.error("Failed to load cloud images:", data.error)
        if (data.error.includes("not configured")) {
          alert("⚠️ Blob storage configuration issue detected. Please check the debug panel for details.")
        }
        setCloudImages({})
      }
    } catch (error) {
      console.error("Failed to load cloud images:", error)
      alert("❌ Failed to connect to cloud storage. Please check your connection and try again.")
      setCloudImages({})
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" })
      setIsAuthenticated(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // Filter officials based on search and category
  const filteredOfficials = officials.filter((official) => {
    const matchesSearch =
      official.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || official.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle single image upload
  const handleImageUpload = async (file: File, officialId: string) => {
    setIsUploading(true)
    setUploadingId(officialId)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("officialId", officialId)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/officials/images", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      const data = await response.json()

      if (response.ok) {
        setCloudImages((prev) => ({
          ...prev,
          [officialId]: data.url,
        }))

        // Show success for a moment
        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
          setUploadingId(null)
        }, 1000)
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      if (errorMessage.includes("Access denied") || errorMessage.includes("valid token")) {
        alert(
          "🔑 Access denied: Invalid or missing blob storage token. Please check the debug panel for configuration details.",
        )
      } else if (errorMessage.includes("not configured")) {
        alert("⚙️ Blob storage is not properly configured. Please contact the administrator.")
      } else {
        alert(`❌ Upload failed: ${errorMessage}`)
      }

      setIsUploading(false)
      setUploadingId(null)
      setUploadProgress(0)
    }
  }

  // Handle image deletion
  const removeOfficialImage = async (officialId: string) => {
    if (!confirm("Are you sure you want to remove this image?")) return

    try {
      const response = await fetch(`/api/officials/images?officialId=${officialId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCloudImages((prev) => {
          const updated = { ...prev }
          delete updated[officialId]
          return updated
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || "Delete failed")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert(`❌ Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Handle bulk upload
  const handleBulkUpload = async (files: FileList) => {
    if (files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadResults([])

    try {
      const formData = new FormData()
      const selectedOfficials = filteredOfficials.slice(0, files.length)

      Array.from(files).forEach((file, index) => {
        formData.append("files", file)
        formData.append("officialIds", selectedOfficials[index].id)
      })

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 5, 90))
      }, 300)

      const response = await fetch("/api/officials/bulk-upload", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const data = await response.json()
        setUploadResults(data.results)

        // Update cloud images with successful uploads
        const newCloudImages = { ...cloudImages }
        data.results.forEach((result: UploadResult) => {
          if (result.success && result.url) {
            newCloudImages[result.officialId] = result.url
          }
        })
        setCloudImages(newCloudImages)

        setTimeout(() => {
          setUploadProgress(0)
          setIsUploading(false)
          setUploadResults([])
        }, 3000)
      } else {
        const error = await response.json()
        throw new Error(error.error || "Bulk upload failed")
      }
    } catch (error) {
      console.error("Bulk upload error:", error)
      alert(`❌ Bulk upload failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  // Update official details (local only)
  const updateOfficialDetails = (updatedOfficial: Official) => {
    const updatedOfficials = officials.map((official) =>
      official.id === updatedOfficial.id ? updatedOfficial : official,
    )
    onUpdateOfficials(updatedOfficials)
    localStorage.setItem("officialsData", JSON.stringify(updatedOfficials))
    setEditingOfficial(null)
  }

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl">Cloud Image Management</CardTitle>
            {isLoadingImages && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={loadCloudImages} disabled={isLoadingImages}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingImages ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload Progress */}
          {isUploading && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">
                  {uploadingId ? "Uploading image..." : "Bulk uploading images..."}
                </span>
                <span className="text-sm text-blue-700">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />

              {uploadResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {uploadResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {result.success ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-600" />
                      )}
                      <span className={result.success ? "text-green-700" : "text-red-700"}>
                        {officials.find((o) => o.id === result.officialId)?.name}:{" "}
                        {result.success ? "Success" : result.error}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Officials</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="category">Filter by Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cloud Storage Info */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Cloud className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Cloud Storage Status</h3>
            </div>
            <p className="text-sm text-green-700 mb-2">
              Images are stored securely in Vercel Blob and accessible globally. Changes are immediately visible to all
              users.
            </p>
            <div className="text-xs text-green-600">
              {Object.keys(cloudImages).length} images currently stored in cloud
            </div>
          </div>

          {/* Bulk Upload */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Bulk Upload to Cloud</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload multiple images at once. Images will be assigned to officials in the order shown below and stored
              in cloud storage.
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleBulkUpload(e.target.files)}
              className="hidden"
              ref={bulkInputRef}
            />
            <Button
              onClick={() => bulkInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Uploading to Cloud...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Multiple Images for Cloud Upload
                </>
              )}
            </Button>
          </div>

          {/* Officials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfficials.map((official) => {
              const hasCloudImage = cloudImages[official.id]
              const isCurrentlyUploading = uploadingId === official.id

              return (
                <Card key={official.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    {/* Official Image */}
                    <div className="relative mb-4">
                      <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={hasCloudImage || official.image || "/placeholder.svg"}
                          alt={official.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=192&width=192"
                          }}
                        />
                      </div>

                      {/* Cloud indicator */}
                      {hasCloudImage && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-green-500 text-white p-1 rounded-full">
                            <Cloud className="w-3 h-3" />
                          </div>
                        </div>
                      )}

                      {/* Upload progress overlay */}
                      {isCurrentlyUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                          <div className="bg-white rounded-lg p-4 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                            <div className="text-sm font-medium">Uploading...</div>
                            <div className="text-xs text-gray-500">{uploadProgress}%</div>
                          </div>
                        </div>
                      )}

                      {/* Image Upload Overlay */}
                      {!isCurrentlyUploading && (
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = "image/*"
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) handleImageUpload(file, official.id)
                                }
                                input.click()
                              }}
                              className="bg-white text-black hover:bg-gray-100"
                              disabled={isUploading}
                            >
                              <Camera className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                            {hasCloudImage && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => removeOfficialImage(official.id)}
                                disabled={isUploading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Official Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {official.category}
                        </Badge>
                        {hasCloudImage && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            Cloud
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{official.name}</h3>
                      <p className="text-sm text-gray-600">{official.fullName}</p>
                      <p className="text-xs text-gray-500">{official.position}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingOfficial(official)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredOfficials.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No officials found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Official Modal */}
      {editingOfficial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>Edit Official</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditingOfficial(null)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="edit-name">Display Name</Label>
                <Input
                  id="edit-name"
                  value={editingOfficial.name}
                  onChange={(e) => setEditingOfficial({ ...editingOfficial, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-fullname">Full Name</Label>
                <Input
                  id="edit-fullname"
                  value={editingOfficial.fullName}
                  onChange={(e) => setEditingOfficial({ ...editingOfficial, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Input
                  id="edit-position"
                  value={editingOfficial.position}
                  onChange={(e) => setEditingOfficial({ ...editingOfficial, position: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  value={editingOfficial.category}
                  onChange={(e) => setEditingOfficial({ ...editingOfficial, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => updateOfficialDetails(editingOfficial)} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingOfficial(null)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
