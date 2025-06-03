"use client"

import { useRef, useState } from "react"
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
  Globe,
} from "lucide-react"
import html2canvas from "html2canvas"
import { SocialPreview } from "./social-preview"
import { ShareAnalytics } from "./share-analytics"
import Link from "next/link"
import {
  useUniversalShareTracking,
  useUniversalAnalyticsData,
  type SharePlatform,
} from "@/app/services/universal-analytics"

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

export function ResultsCard({ ratings, officials, onRestart }: ResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  // Use universal analytics system - FIXED IMPORT
  const { trackShare, isConnected, error: shareError } = useUniversalShareTracking()
  const {
    totalShares,
    shareAnalytics,
    activeUsers,
    version,
    isRedisConnected,
    error: analyticsError,
  } = useUniversalAnalyticsData()

  const averageRating = Object.values(ratings).reduce((sum, rating) => sum + rating, 0) / Object.values(ratings).length
  const totalRatings = Object.values(ratings).length

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

      // Create a simplified version for canvas rendering
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#16a34a", // Solid green background instead of gradient
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: false,
        width: 1200,
        height: 630,
        ignoreElements: (element) => {
          // Skip elements that might cause gradient issues
          const classList = element.classList
          return (
            classList.contains("gradient-problematic") ||
            element.tagName === "CANVAS" ||
            (element.style && element.style.background && element.style.background.includes("gradient"))
          )
        },
        onclone: (clonedDoc) => {
          // Fix gradients in the cloned document
          const gradientElements = clonedDoc.querySelectorAll('[class*="gradient"], [style*="gradient"]')
          gradientElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              // Replace gradients with solid colors
              if (htmlEl.style.background && htmlEl.style.background.includes("gradient")) {
                htmlEl.style.background = "#16a34a" // Green color
              }
              if (htmlEl.classList.contains("bg-gradient-to-br")) {
                htmlEl.style.background = "#16a34a"
                htmlEl.classList.remove("bg-gradient-to-br")
              }
            }
          })

          // Ensure all text is visible
          const textElements = clonedDoc.querySelectorAll("*")
          textElements.forEach((el: Element) => {
            const htmlEl = el as HTMLElement
            if (htmlEl.style) {
              // Ensure text colors are solid
              if (htmlEl.style.color && htmlEl.style.color.includes("rgba")) {
                htmlEl.style.color = "#ffffff"
              }
            }
          })
        },
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

      // Fallback: try with simpler settings
      try {
        console.log("Attempting fallback image generation...")
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: "#ffffff",
          scale: 1,
          useCORS: false,
          allowTaint: true,
          logging: false,
          width: 800,
          height: 400,
          onclone: (clonedDoc) => {
            // Remove all gradients and replace with solid colors
            const allElements = clonedDoc.querySelectorAll("*")
            allElements.forEach((el: Element) => {
              const htmlEl = el as HTMLElement
              if (htmlEl.style) {
                htmlEl.style.background = htmlEl.style.background?.includes("green") ? "#16a34a" : "#ffffff"
                htmlEl.style.backgroundImage = "none"
              }
            })
          },
        })

        const link = document.createElement("a")
        link.download = "my-nigeria-cabinet-rating-2025-simple.png"
        link.href = canvas.toDataURL("image/png", 0.8)
        link.click()

        setDownloadProgress(100)
        setTimeout(() => {
          setDownloadProgress(0)
          setIsGenerating(false)
        }, 1000)
      } catch (fallbackError) {
        console.error("Fallback generation also failed:", fallbackError)
        alert("Image generation failed. Please try again or use the share preview instead.")
        setIsGenerating(false)
        setDownloadProgress(0)
      }
    }
  }

  const shareText = `I rated Nigeria's cabinet ${averageRating.toFixed(1)}/5 after 2+ years in office. What's your rating? #RateYourLeaders #Nigeria2025`
  const shareUrl = typeof window !== "undefined" ? window.location.href : ""

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      await trackShare("copy" as SharePlatform)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const shareToTwitter = async () => {
    try {
      await trackShare("twitter" as SharePlatform)
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
      window.open(twitterUrl, "_blank", "width=600,height=400")
    } catch (error) {
      console.error("Failed to track Twitter share:", error)
      // Still open the share dialog even if tracking fails
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
      window.open(twitterUrl, "_blank", "width=600,height=400")
    }
  }

  const shareToFacebook = async () => {
    try {
      await trackShare("facebook" as SharePlatform)
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
      window.open(facebookUrl, "_blank", "width=600,height=400")
    } catch (error) {
      console.error("Failed to track Facebook share:", error)
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
      window.open(facebookUrl, "_blank", "width=600,height=400")
    }
  }

  const shareToWhatsApp = async () => {
    try {
      await trackShare("whatsapp" as SharePlatform)
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`
      window.open(whatsappUrl, "_blank")
    } catch (error) {
      console.error("Failed to track WhatsApp share:", error)
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await trackShare("native" as SharePlatform)
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

  // Show error messages if any
  const hasError = shareError || analyticsError
  const errorMessage = shareError?.message || analyticsError?.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Error Display */}
        {hasError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">⚠️ {errorMessage}</p>
          </div>
        )}

        {/* Header - Responsive */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-green-600" />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Your Cabinet Report Card</h1>
          </div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
            Here's your assessment of Nigeria's leadership after 2+ years
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Universal Analytics v{version}</span>
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm text-gray-500">
              {isRedisConnected ? "Redis Connected" : isConnected ? "Server Connected" : "Local Mode"}
            </span>
          </div>
        </div>

        {/* Enhanced Social Media Card - Fully Responsive */}
        <div className="w-full max-w-6xl mx-auto mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border">
            {/* Desktop/Tablet Version */}
            <div className="hidden md:block">
              <div
                ref={cardRef}
                className="w-full bg-white relative overflow-hidden "

              >
                {/* Solid background instead of gradient for canvas compatibility */}
                <div className="absolute inset-0 bg-green-700"></div>

                {/* Decorative circles with solid colors */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-600 opacity-20 rounded-full transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-600 opacity-20 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-green-600 opacity-10 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

                {/* Content with solid backgrounds */}
                <div className="relative z-10 p-12 h-full flex flex-col text-white">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-5 bg-green-900 rounded"></div>
                        <div className="w-8 h-5 bg-white rounded"></div>
                        <div className="w-8 h-5 bg-green-900 rounded"></div>
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

                      <div className="bg-green-600 bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 inline-block border border-green-500">
                        <div className="text-center">
                          <div className="text-8xl font-bold text-white mb-4 leading-none">
                            {averageRating.toFixed(1)}
                          </div>
                          <div className="flex justify-center mb-4 gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <div
                                key={star}
                                className={`w-8 h-8 ${
                                  star <= Math.round(averageRating) ? "text-yellow-400" : "text-white opacity-50"
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
                      <div className="bg-green-600 bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 border border-green-500">
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
                                    <div className="w-12 h-12 rounded-full bg-green-800 bg-opacity-40 flex items-center justify-center border border-green-400">
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
                                            star <= rating ? "text-yellow-400" : "text-white opacity-30"
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

            {/* Mobile Version */}
            <div className="block md:hidden">
              <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-6 text-white">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-4 bg-green-800 rounded"></div>
                    <div className="w-6 h-4 bg-white rounded"></div>
                    <div className="w-6 h-4 bg-green-800 rounded"></div>
                    <span className="text-white text-lg font-bold">NIGERIA</span>
                  </div>
                  <div className="bg-white text-green-700 text-sm px-3 py-1 rounded-lg font-semibold">2025 Report</div>
                </div>

                {/* Mobile Main Score */}
                <div className="text-center mb-6">
                  <h1 className="text-white text-2xl font-bold mb-2">My Cabinet Rating</h1>
                  <p className="text-green-100 text-sm mb-4">After 2+ years in office</p>

                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 inline-block">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-white mb-3 leading-none">{averageRating.toFixed(1)}</div>
                      <div className="flex justify-center mb-3 gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <div
                            key={star}
                            className={`w-6 h-6 ${
                              star <= Math.round(averageRating) ? "text-yellow-400" : "text-white text-opacity-50"
                            }`}
                          >
                            ★
                          </div>
                        ))}
                      </div>
                      <p className="text-white text-lg font-semibold mb-1">{getRatingLabel(averageRating)}</p>
                      <p className="text-green-100 text-sm">{totalRatings} officials rated</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Top Officials */}
                <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="text-white text-lg font-bold mb-4">Top Rated Officials</h3>
                  <div className="space-y-3">
                    {officials
                      .filter((official) => ratings[official.id])
                      .sort((a, b) => ratings[b.id] - ratings[a.id])
                      .slice(0, 3)
                      .map((official) => {
                        const rating = ratings[official.id]
                        return (
                          <div key={official.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                  {official.name
                                    .split(" ")
                                    .map((word) => word[0])
                                    .join("")
                                    .slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{official.name}</p>
                                <p className="text-green-100 text-xs">{official.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-sm ${
                                      star <= rating ? "text-yellow-400" : "text-white text-opacity-30"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <span className="text-white font-bold text-sm ml-1">{rating}/5</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Mobile Footer */}
                <div className="text-center text-green-100 mt-4 text-xs">
                  <p>Generated on {new Date().toLocaleDateString()} • #RateYourLeaders</p>
                  <p className="font-medium mt-1">RateYourLeaders.ng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-col gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8">
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full max-w-4xl">
            <Button
              onClick={downloadCard}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3"
              size="lg"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  {downloadProgress < 100 ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      <span className="text-sm sm:text-base">Generating... {downloadProgress}%</span>
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
                  <span className="text-sm sm:text-base">Download Report Card</span>
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowPreview(true)}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-50"
            >
              <Eye className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">Preview Social Share</span>
            </Button>

            <Button onClick={onRestart} variant="outline" size="lg" className="w-full sm:w-auto">
              <RotateCcw className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">Rate Again</span>
            </Button>
          </div>

          {/* Social Sharing Section - Responsive */}
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Share Your Rating</h3>
                </div>
                <div className="flex gap-2">
                  <Link href="/analytics?from=results" passHref>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm">
                      <BarChart3 className="w-4 h-4 mr-1 sm:mr-2" />
                      Universal Analytics
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-gray-600 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                Let others know your opinion about Nigeria's leadership
              </p>

              {/* Share Text Preview - Responsive */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-700 mb-3">{shareText}</p>
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

              {/* Social Media Buttons - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  onClick={shareToTwitter}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm"
                  size="lg"
                >
                  <Twitter className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Twitter</span>
                  <span className="sm:hidden">X</span>
                </Button>

                <Button
                  onClick={shareToFacebook}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                  size="lg"
                >
                  <Facebook className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Facebook</span>
                  <span className="sm:hidden">FB</span>
                </Button>

                <Button
                  onClick={shareToWhatsApp}
                  className="bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm"
                  size="lg"
                >
                  <MessageCircle className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <span className="sm:hidden">WA</span>
                </Button>

                <Button
                  onClick={shareNatively}
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-xs sm:text-sm"
                >
                  <Share2 className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">More</span>
                  <span className="sm:hidden">Share</span>
                </Button>
              </div>

              {/* Universal Share Statistics - Responsive */}
              {totalShares > 0 && (
                <div className="mt-4 text-center">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{totalShares.toLocaleString()}</span>
                    <span>global shares</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{activeUsers} active users</span>
                    {!isConnected && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-orange-600">Local mode</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-green-600">
                {Object.values(ratings).filter((r) => r >= 4).length}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Officials Rated Good/Excellent</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-600">
                {Object.values(ratings).filter((r) => r === 3).length}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Officials Rated Fair</p>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="text-center p-4 sm:p-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-red-600">
                {Object.values(ratings).filter((r) => r <= 2).length}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Officials Rated Poor</p>
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
        {showAnalytics && <ShareAnalytics shareStats={shareAnalytics || []} onClose={() => setShowAnalytics(false)} />}
      </div>
    </div>
  )
}
