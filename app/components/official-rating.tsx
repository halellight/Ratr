"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { useUniversalLeaderAnalytics } from "@/app/services/universal-analytics"
import { getLeaderBiography, type LeaderBiography } from "@/app/data/leader-biographies"
import { useRealTimeAnalytics } from "@/app/services/real-time-analytics"
import { systemValidator } from "@/app/services/system-validator"
import { errorHandler } from "@/app/services/enhanced-error-handler"
import { performanceOptimizer } from "@/app/services/performance-optimizer"
import { motion, AnimatePresence } from "framer-motion"

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
  const [hasUpdated, setHasUpdated] = useState(false)
  const [localAnalytics, setLocalAnalytics] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [systemHealth, setSystemHealth] = useState<"healthy" | "warning" | "critical">("healthy")

  // Get real-time analytics for this leader
  const { trackRating, stats: realTimeStats } = useRealTimeAnalytics()
  const { data: leaderAnalytics, isLoading: analyticsLoading } = useUniversalLeaderAnalytics(official.id)

  // Validate component state on mount and updates
  useEffect(() => {
    const validation = systemValidator.validateComponentState("OfficialRating", {
      official,
      currentIndex,
      totalCount,
      rating: rating[0],
    })

    if (!validation.isValid) {
      setValidationErrors(validation.errors.map((e) => e.message))
    } else {
      setValidationErrors([])
    }

    // Check system health
    const health = systemValidator.getSystemHealth()
    setSystemHealth(health.overall)
  }, [official, currentIndex, totalCount, rating])

  // Optimized image loading
  const optimizedImage = useMemo(() => {
    return performanceOptimizer.optimizeImages(official.image || "/placeholder.svg", {
      width: 128,
      height: 128,
      quality: 80,
    })
  }, [official.image])

  // Debounced rating change
  const debouncedRatingChange = useCallback(
    performanceOptimizer.debounce(
      `rating-change-${official.id}`,
      (newRating: number[]) => {
        setRating(newRating)
      },
      150,
    ),
    [official.id],
  )

  // Combine data sources for most up-to-date view with caching
  useEffect(() => {
    const cacheKey = `leader-analytics-${official.id}`
    const cachedData = performanceOptimizer.getCache<any>(cacheKey)

    if (cachedData && leaderAnalytics) {
      setLocalAnalytics(cachedData)
      return
    }

    if (leaderAnalytics) {
      // Start with universal analytics data
      const combinedData = { ...leaderAnalytics }

      // If we have real-time data for this official, use the most recent values
      if (realTimeStats?.leaderRatings?.[official.id]) {
        const realTimeData = realTimeStats.leaderRatings[official.id]

        // Use the most recent data
        if (new Date(realTimeData.lastUpdated) > new Date(combinedData.lastUpdated)) {
          combinedData.averageRating = realTimeData.averageRating
          combinedData.totalRatings = realTimeData.totalRatings
          combinedData.performanceMetrics = realTimeData.performanceMetrics
        }
      }

      setLocalAnalytics(combinedData)

      // Cache the combined data
      performanceOptimizer.setCache(cacheKey, combinedData, 30000) // 30 seconds TTL
    }
  }, [leaderAnalytics, realTimeStats, official.id])

  // Get biography data with caching
  const biography = useMemo(() => {
    const cacheKey = `biography-${official.id}`
    const cached = performanceOptimizer.getCache<LeaderBiography>(cacheKey)

    if (cached) return cached

    const bio = getLeaderBiography(official.id) || null
    if (bio) {
      performanceOptimizer.setCache(cacheKey, bio, 300000) // 5 minutes TTL
    }

    return bio
  }, [official.id])

  const currentRating = hoveredStar || rating[0]
  const currentLabel = ratingLabels.find((label) => label.value === currentRating)
  const IconComponent = currentLabel?.icon || Meh

  const progress = ((currentIndex + 1) / totalCount) * 100

  // Enhanced rating submission with comprehensive error handling
  const handleRateSubmit = useCallback(async () => {
    if (isSubmitting) return

    setIsSubmitting(true)
    setValidationErrors([])

    try {
      // Validate rating before submission
      const validation = systemValidator.validateRating(official.id, rating[0])

      if (!validation.isValid) {
        setValidationErrors(validation.errors.map((e) => e.message))
        return
      }

      // Tracking is now handled by the parent component via onRate
      // to avoid double-counting. We just call onRate here.

      // Show visual feedback
      setHasUpdated(true)
      setTimeout(() => setHasUpdated(false), 2000)

      // Call the parent component's handler
      onRate(official.id, rating[0])
    } catch (error) {
      const errorReport = await errorHandler.handleError(
        error as Error,
        {
          component: "EnhancedOfficialRating",
          action: "submit-rating",
          additionalData: {
            officialId: official.id,
            rating: rating[0],
            currentIndex,
            totalCount,
          },
        },
        "Failed to submit your rating. Please try again.",
      )

      setValidationErrors([errorReport.userMessage])

      // Still call parent handler to continue flow if it's not a critical error
      if (errorReport.severity !== "critical") {
        onRate(official.id, rating[0])
      }
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, official.id, rating, trackRating, onRate, currentIndex, totalCount])

  // Display data - use local analytics if available, otherwise use leaderAnalytics
  const displayData = localAnalytics || leaderAnalytics

  // Render validation errors
  const renderValidationErrors = () => {
    if (validationErrors.length === 0) return null

    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  // Render system health indicator
  const renderSystemHealth = () => {
    if (systemHealth === "healthy") return null

    const healthConfig = {
      warning: {
        icon: AlertTriangle,
        color: "text-amber-500",
        message: "System experiencing minor issues",
      },
      critical: {
        icon: AlertTriangle,
        color: "text-rose-500",
        message: "System issues detected - some features may be limited",
      },
    }

    const config = healthConfig[systemHealth]
    const HealthIcon = config.icon

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
      >
        <Alert variant={systemHealth === "critical" ? "destructive" : "default"} className="mb-4 glass-morphism border-rose-200/50">
          <HealthIcon className={`h-4 w-4 ${config.color}`} />
          <AlertDescription className="font-bold">{config.message}</AlertDescription>
        </Alert>
      </motion.div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* System Health and Validation Errors */}
      {renderSystemHealth()}
      {renderValidationErrors()}

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 px-2"
      >
        <div className="flex items-center justify-between mb-3 text-sm font-black uppercase tracking-widest text-emerald-800/60">
          <span>Official {currentIndex + 1} <span className="text-emerald-800/30 mx-1">/</span> {totalCount}</span>
          <span className="text-emerald-700">{Math.round(progress)}% Verified</span>
        </div>
        <div className="h-2.5 w-full bg-emerald-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-emerald-600 rounded-full shadow-[0_0_15px_rgba(5,150,105,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Rating Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8"
        >
          <Card
            className={`overflow-hidden glass-card premium-shadow border-0 transition-all duration-700 relative ${hasUpdated ? "ring-4 ring-emerald-500/20" : ""
              }`}
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${hasUpdated ? "bg-emerald-500" : "bg-transparent"} transition-colors duration-500`}></div>

            <CardHeader className="text-center pb-8 pt-10">
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  disabled={currentIndex === 0 || isSubmitting}
                  className="hover:bg-emerald-50 text-emerald-800 font-bold"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Back
                </Button>

                <div className="glass-morphism px-4 py-1.5 rounded-full border border-gray-200/50 shadow-sm">
                  {realTimeStats?.connectionStatus === "connected" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">Live Sync</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500">Local Cache</span>
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                layoutId={`avatar-${official.id}`}
                className="w-40 h-40 mx-auto mb-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-100 to-white p-1 shadow-2xl relative group"
              >
                <div className="absolute inset-0 rounded-[2.5rem] bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={optimizedImage || "/placeholder.svg"}
                  alt={official.fullName}
                  className="w-full h-full object-cover rounded-[2.4rem] relative z-10"
                  loading="eager"
                />
              </motion.div>

              <div className="space-y-2">
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-0 font-black uppercase tracking-widest text-[10px] px-3 py-1">
                  {official.category}
                </Badge>
                <CardTitle className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">{official.fullName}</CardTitle>
                <p className="text-lg text-emerald-700/70 font-bold">{official.position}</p>
              </div>

              {/* Real-time Analytics Display */}
              {displayData && !analyticsLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 grid grid-cols-3 gap-1 px-4"
                >
                  <div className="p-3 bg-white/40 rounded-2xl border border-white/60 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Impact</p>
                    <p className="text-xl font-black text-emerald-900">{displayData.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="p-3 bg-white/40 rounded-2xl border border-white/60 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Responses</p>
                    <p className="text-xl font-black text-emerald-900">{displayData.totalRatings.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white/40 rounded-2xl border border-white/60 shadow-inner">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Approval</p>
                    <p className={`text-xl font-black ${displayData.performanceMetrics.trendsUp ? "text-emerald-600" : "text-rose-600"}`}>
                      {displayData.performanceMetrics.approvalRating}%
                    </p>
                  </div>
                </motion.div>
              )}
            </CardHeader>

            <CardContent className="space-y-10 px-8 pb-12">
              {/* Star Rating */}
              <div className="text-center relative">
                <div className="absolute inset-x-0 -top-4 flex justify-center opacity-10 pointer-events-none">
                  <Star className="w-24 h-24 text-emerald-600 fill-current" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-8 relative z-10">Assign Performance Grade</h3>

                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => setRating([star])}
                      disabled={isSubmitting}
                      className="relative group p-1"
                    >
                      {star <= currentRating && (
                        <motion.div
                          layoutId="star-glow"
                          className="absolute inset-0 bg-yellow-400/30 blur-xl rounded-full"
                        />
                      )}
                      <Star
                        className={`w-12 h-12 md:w-14 md:h-14 transition-all duration-300 ${star <= currentRating
                            ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                            : "text-gray-200 fill-transparent hover:text-yellow-200"
                          }`}
                      />
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentRating}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center gap-1 min-h-[60px]"
                  >
                    <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/80 shadow-sm">
                      <IconComponent className={`w-6 h-6 ${currentLabel?.color} drop-shadow-sm`} />
                      <span className={`text-xl font-black uppercase tracking-tight ${currentLabel?.color}`}>
                        {currentLabel?.label}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Slider Alternative */}
              <div className="space-y-6 pt-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <span>Sub-zero</span>
                  <span>Distinguished</span>
                </div>
                <Slider
                  value={rating}
                  onValueChange={debouncedRatingChange}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                  disabled={isSubmitting}
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={currentIndex === 0 || isSubmitting}
                  className="flex-1 py-8 text-lg font-bold rounded-2xl border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all border-2"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Discard & Back
                </Button>

                <Button
                  onClick={handleRateSubmit}
                  disabled={isSubmitting || validationErrors.length > 0}
                  className={`flex-1 py-8 text-lg font-black rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 border-b-4 ${hasUpdated
                      ? "bg-emerald-700 border-emerald-900"
                      : "bg-emerald-600 hover:bg-emerald-700 border-emerald-800 text-white"
                    }`}
                  size="lg"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <div className="flex items-center gap-2">
                      {currentIndex === totalCount - 1 ? "Submit Review" : "Validate & Next"}
                      {currentIndex !== totalCount - 1 && <ChevronRight className="w-6 h-6" />}
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Biography Sidebar */}
        {showBiography && biography && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <Card className="h-fit glass-card premium-shadow border-0 overflow-hidden group">
              <div className="h-1.5 w-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors"></div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-black tracking-tight">Public Record</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-blue-600/60">Professional Bio</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">{biography.biography}</p>
                </div>

                {biography.keyAchievements && biography.keyAchievements.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-600/60">Milestones</h4>
                    <ul className="text-sm text-gray-600 space-y-3">
                      {biography.keyAchievements.slice(0, 3).map((achievement: string, index: number) => (
                        <li key={index} className="flex items-start gap-3 group/item">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform" />
                          <span className="font-medium">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Tenure</p>
                      <p className="text-sm font-bold text-gray-900">{biography.yearsInOffice || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Domain</p>
                      <p className="text-sm font-bold text-gray-900">{biography.category || official.category}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowBio(!showBio)}
                  className="w-full rounded-xl border-gray-200 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 py-6"
                >
                  {showBio ? "Concise View" : "Full Dossier"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
