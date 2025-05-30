"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download,
  RotateCcw,
  Eye,
  Share2,
  Twitter,
  Facebook,
  MessageCircle,
  Copy,
  Check,
  BarChart3,
  Loader2,
} from "lucide-react"
import html2canvas from "html2canvas"
import { SocialPreview } from "./social-preview"
import { ShareAnalytics } from "./share-analytics"

interface Official {
  id: string
  name: string
  fullName: string
  position: string
  image: string
  category: string
}

interface ResultsCardProps {
  ratings: Record<string, number>
  officials: Official[]
  onRestart: () => void
}

// Define share platform types
type SharePlatform = "twitter" | "facebook" | "whatsapp" | "copy" | "native" | "other"

// Interface for share analytics data
interface ShareData {
  platform: SharePlatform
  count: number
  lastShared: string // ISO date string
}

export function ResultsCard({ ratings, officials, onRestart }: ResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [shareStats, setShareStats] = useState<ShareData[]>([])
  const [downloadProgress, setDownloadProgress] = useState(0)

  const averageRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / Object.values(ratings).length
  const totalRatings = Object.values(ratings).length

  // Load share statistics from localStorage on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem("rateYourLeadersShareStats")
    if (savedStats) {
      try {
        setShareStats(JSON.parse(savedStats))
      } catch (e) {
        console.error("Error parsing share stats:", e)
        // Initialize with empty stats if parsing fails
        initializeShareStats()
      }
    } else {
      // Initialize with empty stats if none exist
      initializeShareStats()
    }
  }, [])

  // Initialize share statistics with zero counts
  const initializeShareStats = () => {
    const initialStats: ShareData[] = [
      { platform: "twitter", count: 0, lastShared: "" },
      { platform: "facebook", count: 0, lastShared: "" },
      { platform: "whatsapp", count: 0, lastShared: "" },
      { platform: "copy", count: 0, lastShared: "" },
      { platform: "native", count: 0, lastShared: "" },
      { platform: "other", count: 0, lastShared: "" },
    ]
    setShareStats(initialStats)
    localStorage.setItem("rateYourLeadersShareStats", JSON.stringify(initialStats))
  }

  // Track share event
  const trackShare = (platform: SharePlatform) => {
    const now = new Date().toISOString()
    const updatedStats = shareStats.map((stat) => {
      if (stat.platform === platform) {
        return {
          ...stat,
          count: stat.count + 1,
          lastShared: now,
        }
      }
      return stat
    })
    setShareStats(updatedStats)
    localStorage.setItem("rateYourLeadersShareStats", JSON.stringify(updatedStats))
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return "text-green-500"
    if (rating >= 3) return "text-yellow-500"
    return "text-red-500"
  }

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent"
    if (rating >= 3.5) return "Good"
    if (rating >= 2.5) return "Fair"
    if (rating >= 1.5) return "Poor"
    return "Very Poor"
  }

  const downloadCard = async () => {
    if (!cardRef.current) return

    setIsGenerating(true)
    setDownloadProgress(10)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await new Promise((resolve) => setTimeout(resolve, 100))
      setDownloadProgress(30)

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        width: 1200,
        height: 630,
      })

      setDownloadProgress(80)

      const link = document.createElement("a")
      link.download = "my-nigeria-cabinet-rating-2025.png"
      link.href = canvas.toDataURL("image/png", 1.0)

      setDownloadProgress(95)
      clearInterval(progressInterval)

      link.click()
      setDownloadProgress(100)

      // Reset progress after a delay
      setTimeout(() => {
        setDownloadProgress(0)
        setIsGenerating(false)
      }, 1000)
    } catch (error) {
      console.error("Error generating image:", error)
      setIsGenerating(false)
      setDownloadProgress(0)
    }
  }

  const shareText = `I rated Nigeria's cabinet ${averageRating.toFixed(1)}/5 after 2+ years in office. What's your rating? #RateYourLeaders #Nigeria2025`
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      trackShare("copy")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareToTwitter = () => {
    trackShare("twitter")
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, "_blank", "width=600,height=400")
  }

  const shareToFacebook = () => {
    trackShare("facebook")
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, "_blank", "width=600,height=400")
  }

  const shareToWhatsApp = () => {
    trackShare("whatsapp")
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        trackShare("native")
        await navigator.share({
          title: "My Nigeria Cabinet Rating",
          text: shareText,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying to clipboard
      copyToClipboard()
    }
  }

  // Calculate total shares
  const totalShares = shareStats.reduce((sum, stat) => sum + stat.count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cabinet Report Card</h1>
          <p className="text-xl text-gray-600">Here's your assessment of Nigeria's leadership after 2+ years</p>
        </div>

        {/* Enhanced Social Media Card - Fixed for Download */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
            <div
              ref={cardRef}
              className="w-full bg-white"
              style={{
                width: "1200px",
                height: "630px",
                margin: "0 auto",
              }}
            >
              {/* Background with Nigerian colors */}
              <div className="relative w-full h-full bg-gradient-to-br from-green-600 via-green-700 to-green-800">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white opacity-5 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                {/* Content */}
                <div className="relative z-10 p-12 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-5 bg-green-800 rounded"></div>
                        <div className="w-8 h-5 bg-white rounded"></div>
                        <div className="w-8 h-5 bg-green-800 rounded"></div>
                      </div>
                      <span className="text-white text-2xl font-bold">NIGERIA</span>
                    </div>
                    <div className="bg-white text-green-700 text-lg px-4 py-2 rounded-lg font-semibold">
                      2025 Report
                    </div>
                  </div>

                  <div className="flex-1 flex items-center gap-12">
                    {/* Left Side - Main Score */}
                    <div className="flex-1">
                      <h1 className="text-white text-5xl font-bold mb-4 leading-tight">My Cabinet Rating</h1>
                      <p className="text-green-100 text-2xl mb-8">After 2+ years in office</p>

                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-8 inline-block">
                        <div className="text-center">
                          <div className="text-8xl font-bold text-white mb-4 leading-none">
                            {averageRating.toFixed(1)}
                          </div>
                          <div className="flex justify-center mb-4 gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-8 h-8 ${
                                  star <= Math.round(averageRating) ? "text-yellow-400" : "text-white text-opacity-50"
                                }`}
                              >
                                ★
                              </div>
                            ))}
                          </div>
                          <p className="text-white text-2xl font-semibold mb-2">{getRatingLabel(averageRating)}</p>
                          <p className="text-green-100 text-lg">{totalRatings} officials rated</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Top Officials */}
                    <div className="flex-1">
                      <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                        <h3 className="text-white text-2xl font-bold mb-6">Top Rated Officials</h3>
                        <div className="space-y-4">
                          {officials
                            .filter((official) => ratings[official.id])
                            .sort((a, b) => ratings[b.id] - ratings[a.id])
                            .slice(0, 4)
                            .map((official) => {
                              const rating = ratings[official.id]
                              return (
                                <div key={official.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                      <span className="text-white font-bold text-sm">
                                        {official.name
                                          .split(" ")
                                          .map((word) => word[0])
                                          .join("")
                                          .slice(0, 2)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-white font-medium text-lg">{official.name}</p>
                                      <p className="text-green-100 text-sm">{official.category}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                          key={star}
                                          className={`text-lg ${
                                            star <= rating ? "text-yellow-400" : "text-white text-opacity-30"
                                          }`}
                                        >
                                          ★
                                        </span>
                                      ))}
                                    </div>
                                    <span className="text-white font-bold text-lg">{rating}/5</span>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-green-100 mt-8">
                    <p className="text-lg">Generated on {new Date().toLocaleDateString()} • #RateYourLeaders</p>
                    <p className="text-lg font-medium">RateYourLeaders.ng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-6 justify-center items-center mb-8">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={downloadCard}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  {downloadProgress < 100 ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span>Generating... {downloadProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Check className="w-5 h-5 mr-2" />
                      <span>Downloaded!</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Report Card
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              size="lg"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <Eye className="w-5 h-5 mr-2" />
              Preview Social Share
            </Button>

            <Button onClick={onRestart} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              Rate Again
            </Button>
          </div>

          {/* Social Sharing Section */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Share Your Rating</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalytics(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Share Stats
                </Button>
              </div>
              <p className="text-gray-600 text-center mb-6">Let others know your opinion about Nigeria's leadership</p>

              {/* Share Text Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 mb-3">{shareText}</p>
                <Button onClick={copyToClipboard} variant="outline" size="sm" className="w-full">
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </>
                  )}
                </Button>
              </div>

              {/* Social Media Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button onClick={shareToTwitter} className="bg-blue-500 hover:bg-blue-600 text-white" size="lg">
                  <Twitter className="w-5 h-5 mr-2" />
                  Twitter
                </Button>

                <Button onClick={shareToFacebook} className="bg-blue-600 hover:bg-blue-700 text-white" size="lg">
                  <Facebook className="w-5 h-5 mr-2" />
                  Facebook
                </Button>

                <Button onClick={shareToWhatsApp} className="bg-green-500 hover:bg-green-600 text-white" size="lg">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </Button>

                <Button onClick={shareNatively} variant="outline" size="lg" className="border-gray-300">
                  <Share2 className="w-5 h-5 mr-2" />
                  More
                </Button>
              </div>

              {/* Share statistics summary */}
              {totalShares > 0 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{totalShares}</span> shares so far • Most popular:{" "}
                    <span className="font-medium">
                      {shareStats.reduce((max, stat) => (stat.count > max.count ? stat : max), shareStats[0]).platform}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                {Object.values(ratings).filter((r) => r >= 4).length}
              </CardTitle>
              <p className="text-sm text-gray-600">Officials Rated Good/Excellent</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-yellow-600">
                {Object.values(ratings).filter((r) => r === 3).length}
              </CardTitle>
              <p className="text-sm text-gray-600">Officials Rated Fair</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-red-600">
                {Object.values(ratings).filter((r) => r <= 2).length}
              </CardTitle>
              <p className="text-sm text-gray-600">Officials Rated Poor</p>
            </CardHeader>
          </Card>
        </div>

        {/* Social Preview Modal */}
        {showPreview && (
          <SocialPreview
            averageRating={averageRating}
            totalRatings={totalRatings}
            shareText={shareText}
            onClose={() => setShowPreview(false)}
            onCopyText={copyToClipboard}
            copied={copied}
          />
        )}

        {/* Share Analytics Modal */}
        {showAnalytics && <ShareAnalytics shareStats={shareStats} onClose={() => setShowAnalytics(false)} />}
      </div>
    </div>
  )
}
