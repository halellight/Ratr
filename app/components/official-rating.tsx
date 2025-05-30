"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Star, ThumbsUp, ThumbsDown, Meh } from "lucide-react"

interface Official {
  id: string
  name: string
  fullName: string
  position: string
  image: string
  category: string
}

interface OfficialRatingProps {
  official: Official
  onRate: (officialId: string, rating: number) => void
  currentIndex: number
  totalCount: number
}

const ratingLabels = [
  { value: 1, label: "Very Poor", icon: ThumbsDown, color: "text-red-500" },
  { value: 2, label: "Poor", icon: ThumbsDown, color: "text-red-400" },
  { value: 3, label: "Fair", icon: Meh, color: "text-yellow-500" },
  { value: 4, label: "Good", icon: ThumbsUp, color: "text-green-400" },
  { value: 5, label: "Excellent", icon: ThumbsUp, color: "text-green-500" },
]

export function OfficialRating({ official, onRate, currentIndex, totalCount }: OfficialRatingProps) {
  const [rating, setRating] = useState([3])
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)

  const currentRating = hoveredStar || rating[0]
  const currentLabel = ratingLabels.find((label) => label.value === currentRating)
  const IconComponent = currentLabel?.icon || Meh

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <Badge variant="outline" className="text-sm">
              {currentIndex + 1} of {totalCount}
            </Badge>
          </div>

          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200 overflow-hidden shadow-lg">
            <img
              src={official.image || "/placeholder.svg"}
              alt={official.fullName}
              className="w-full h-full object-cover"
            />
          </div>

          <Badge className="mb-3">{official.category}</Badge>
          <CardTitle className="text-2xl mb-2">{official.fullName}</CardTitle>
          <p className="text-gray-600">{official.position}</p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Star Rating */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">How would you rate their performance?</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setRating([star])}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${star <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <IconComponent className={`w-6 h-6 ${currentLabel?.color}`} />
              <span className={`text-lg font-medium ${currentLabel?.color}`}>{currentLabel?.label}</span>
            </div>
          </div>

          {/* Slider Alternative */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Very Poor</span>
              <span>Excellent</span>
            </div>
            <Slider value={rating} onValueChange={setRating} max={5} min={1} step={1} className="w-full" />
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => onRate(official.id, rating[0])}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            size="lg"
          >
            {currentIndex === totalCount - 1 ? "Finish Rating" : "Next Official"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
