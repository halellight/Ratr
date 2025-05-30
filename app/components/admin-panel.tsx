"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input" 
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Upload, Save, Edit, Trash2, Settings, User, Camera, Loader2 } from "lucide-react"

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

export function AdminPanel({ officials, onUpdateOfficials, onClose }: AdminPanelProps) {
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = ["Executive", "Economic Team", "Social Services", "Infrastructure", "Security"]

  // Filter officials based on search and category
  const filteredOfficials = officials.filter((official) => {
    const matchesSearch =
      official.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      official.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || official.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, officialId: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    setIsUploading(true)
    setUploadingId(officialId)

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      updateOfficialImage(officialId, imageUrl)
      setIsUploading(false)
      setUploadingId(null)
    }
    reader.readAsDataURL(file)
  }

  // Update official image
  const updateOfficialImage = (officialId: string, imageUrl: string) => {
    const updatedOfficials = officials.map((official) =>
      official.id === officialId ? { ...official, image: imageUrl } : official,
    )
    onUpdateOfficials(updatedOfficials)

    // Save to localStorage
    localStorage.setItem("officialsData", JSON.stringify(updatedOfficials))
  }

  // Remove official image
  const removeOfficialImage = (officialId: string) => {
    updateOfficialImage(officialId, "/placeholder.svg?height=120&width=120")
  }

  // Update official details
  const updateOfficialDetails = (updatedOfficial: Official) => {
    const updatedOfficials = officials.map((official) =>
      official.id === updatedOfficial.id ? updatedOfficial : official,
    )
    onUpdateOfficials(updatedOfficials)
    localStorage.setItem("officialsData", JSON.stringify(updatedOfficials))
    setEditingOfficial(null)
  }

  // Bulk image upload
  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    let processed = 0
    const totalFiles = Math.min(files.length, filteredOfficials.length)

    Array.from(files).forEach((file, index) => {
      if (index < filteredOfficials.length) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string
          updateOfficialImage(filteredOfficials[index].id, imageUrl)
          processed++
          if (processed === totalFiles) {
            setIsUploading(false)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-green-600" />
            <CardTitle className="text-2xl">Manage Official Photos</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
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
                aria-label="Filter by Category"
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

          {/* Bulk Upload */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Bulk Upload</h3>
            <p className="text-sm text-gray-600 mb-3">
              Upload multiple images at once. Images will be assigned to officials in the order shown below.
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBulkUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Multiple Images
                </>
              )}
            </Button>
          </div>

          {/* Officials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOfficials.map((official) => (
              <Card key={official.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Official Image */}
                  <div className="relative mb-4">
                    <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={official.image || "/placeholder.svg"}
                        alt={official.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=192&width=192"
                        }}
                      />
                    </div>

                    {/* Image Upload Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.createElement("input")
                            input.type = "file"
                            input.accept = "image/*"
                            input.onchange = (e) => handleImageUpload(e as any, official.id)
                            input.click()
                          }}
                          className="bg-white text-black hover:bg-gray-100"
                          disabled={isUploading && uploadingId === official.id}
                        >
                          {isUploading && uploadingId === official.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Camera className="h-4 w-4 mr-1" />
                              Upload
                            </>
                          )}
                        </Button>
                        {official.image !== "/placeholder.svg?height=120&width=120" && (
                          <Button size="sm" variant="destructive" onClick={() => removeOfficialImage(official.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Official Details */}
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      {official.category}
                    </Badge>
                    <h3 className="font-semibold text-lg">{official.name}</h3>
                    <p className="text-sm text-gray-600">{official.fullName}</p>
                    <p className="text-xs text-gray-500">{official.position}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" onClick={() => setEditingOfficial(official)} className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
