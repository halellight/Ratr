"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Meh,
  ChevronLeft,
  ChevronRight,
  Info,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
} from "lucide-react"
import { useLeaderAnalytics } from "@/app/hooks/use-real-time-analytics"
import { getLeaderBiography } from "@/app/data/leader-biographies"

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
  onBack?: () => void
  currentIndex: number
  totalCount: number
  showBiography?: boolean
}

const ratingLabels = [
  { value: 1, label: "Very Poor", icon: ThumbsDown, color: "text-red-500" },
  { value: 2, label: "Poor", icon: ThumbsDown, color: "text-red-400" },
  { value: 3, label: "Fair", icon: Meh, color: "text-yellow-500" },
  { value: 4, label: "Good", icon: ThumbsUp, color: "text-green-400" },
  { value: 5, label: "Excellent", icon: ThumbsUp, color: "text-green-500" },
]

export function OfficialRating({
  official,
  onRate,
  onBack,
  currentIndex,
  totalCount,
  showBiography = true,
}: OfficialRatingProps) {
  const [rating, setRating] = useState([3])
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [showBio, setShowBio] = useState(false)

  // Get real-time analytics for this leader
  const { data: leaderAnalytics, isLoading: analyticsLoading } = useLeaderAnalytics(official.id)

  // Get biography data with fallback
  const biography = getLeaderBiography(official.id) || null

  const currentRating = hoveredStar || rating[0]
  const currentLabel = ratingLabels.find((label) => label.value === currentRating)
  const IconComponent = currentLabel?.icon || Meh

  const progress = ((currentIndex + 1) / totalCount) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progress: {currentIndex + 1} of {totalCount}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Rating Card */}
        <div className="lg:col-span-2">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Badge variant="outline" className="text-sm">
                  {currentIndex + 1} of {totalCount}
                </Badge>
                <div className="w-20" /> {/* Spacer for alignment */}
              </div>

              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200 overflow-hidden shadow-lg">
                <img
                  src={official.image || "/placeholder.svg"}
                  alt={official.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=128&width=128"
                  }}
                />
              </div>

              <Badge className="mb-3">{official.category}</Badge>
              <CardTitle className="text-2xl mb-2">{official.fullName}</CardTitle>
              <p className="text-gray-600 mb-4">{official.position}</p>

              {/* Real-time Analytics Display */}
              {leaderAnalytics && !analyticsLoading && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">Current Rating</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {leaderAnalytics.averageRating.toFixed(1)}/5
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">Total Ratings</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {leaderAnalytics.totalRatings.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {leaderAnalytics.performanceMetrics.trendsUp ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium">Approval</span>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          leaderAnalytics.performanceMetrics.trendsUp ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {leaderAnalytics.performanceMetrics.approvalRating}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} disabled={currentIndex === 0} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Official
                </Button>

                <Button
                  onClick={() => onRate(official.id, rating[0])}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  {currentIndex === totalCount - 1 ? "Finish Rating" : "Next Official"}
                  {currentIndex !== totalCount - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Biography Sidebar */}
        {showBiography && biography && (
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">About {official.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Biography</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{biography.biography}</p>
                </div>

                {biography.keyAchievements && biography.keyAchievements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Achievements</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {biography.keyAchievements.slice(0, 3).map((achievement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {biography.currentFocus && biography.currentFocus.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Current Focus</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {biography.currentFocus.slice(0, 3).map((focus, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{focus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    <p>
                      <strong>Years in Office:</strong> {biography.yearsInOffice || "N/A"}
                    </p>
                    <p>
                      <strong>Category:</strong> {biography.category || official.category}
                    </p>
                  </div>
                </div>

                <Button variant="outline" size="sm" onClick={() => setShowBio(!showBio)} className="w-full text-xs">
                  {showBio ? "Show Less" : "Read Full Biography"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
