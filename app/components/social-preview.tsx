"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Twitter, Facebook, Instagram, Copy, Check, MessageCircle, Heart, Share, MoreHorizontal } from "lucide-react"

interface SocialPreviewProps {
  averageRating: number
  totalRatings: number
  shareText: string
  onClose: () => void
  onCopyText: () => void
  copied: boolean
}

export function SocialPreview({
  averageRating,
  totalRatings,
  shareText,
  onClose,
  onCopyText,
  copied,
}: SocialPreviewProps) {
  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excellent"
    if (rating >= 3.5) return "Good"
    if (rating >= 2.5) return "Fair"
    if (rating >= 1.5) return "Poor"
    return "Very Poor"
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Social Media Preview</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-8">
          {/* Twitter Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-500" />
              Twitter / X Preview
            </h3>
            <Card className="max-w-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">Your Name</span>
                      <span className="text-gray-500 text-sm">@yourhandle</span>
                      <span className="text-gray-500 text-sm">·</span>
                      <span className="text-gray-500 text-sm">now</span>
                    </div>
                    <p className="text-sm mb-3">{shareText}</p>

                    {/* Twitter Card */}
                    <div className="border rounded-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-2 bg-green-800 rounded-sm"></div>
                          <div className="w-4 h-2 bg-white rounded-sm"></div>
                          <div className="w-4 h-2 bg-green-800 rounded-sm"></div>
                          <span className="text-xs font-bold">NIGERIA 2025</span>
                        </div>
                        <h4 className="font-bold text-lg">My Cabinet Rating: {averageRating.toFixed(1)}/5</h4>
                        <p className="text-green-100 text-sm">
                          {getRatingLabel(averageRating)} • {totalRatings} officials rated
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50">
                        <p className="text-xs text-gray-600">rateyourleaders.ng</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 text-gray-500">
                      <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">Reply</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-green-500 cursor-pointer">
                        <Share className="w-4 h-4" />
                        <span className="text-xs">Retweet</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-red-500 cursor-pointer">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">Like</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facebook Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" />
              Facebook Preview
            </h3>
            <Card className="max-w-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">Your Name</span>
                      <span className="text-gray-500 text-xs">just now</span>
                    </div>
                    <p className="text-sm mb-3">{shareText}</p>

                    {/* Facebook Card */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-green-700 aspect-[1.91/1] flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div className="w-6 h-4 bg-green-800 rounded-sm"></div>
                            <div className="w-6 h-4 bg-white rounded-sm"></div>
                            <div className="w-6 h-4 bg-green-800 rounded-sm"></div>
                          </div>
                          <h4 className="font-bold text-2xl mb-1">{averageRating.toFixed(1)}/5</h4>
                          <p className="text-green-100">Nigeria Cabinet Rating</p>
                        </div>
                      </div>
                      <div className="p-3">
                        <h4 className="font-semibold text-sm mb-1">My Nigeria Cabinet Rating - 2025</h4>
                        <p className="text-xs text-gray-600 mb-1">Rate your leaders and share your opinion</p>
                        <p className="text-xs text-gray-500 uppercase">RATEYOURLEADERS.NG</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t text-gray-500">
                      <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">Like</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-xs">Comment</span>
                      </div>
                      <div className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
                        <Share className="w-4 h-4" />
                        <span className="text-xs">Share</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instagram Preview */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Instagram Story Preview
            </h3>
            <Card className="max-w-xs">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 aspect-[9/16] relative text-white flex flex-col justify-center items-center p-6">
                  <div className="absolute top-4 left-4 right-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                    <span className="text-sm font-medium">Your Story</span>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-8 h-5 bg-green-800 rounded-sm"></div>
                      <div className="w-8 h-5 bg-white rounded-sm"></div>
                      <div className="w-8 h-5 bg-green-800 rounded-sm"></div>
                    </div>
                    <h4 className="text-3xl font-bold mb-2">{averageRating.toFixed(1)}/5</h4>
                    <p className="text-lg font-semibold mb-1">Nigeria Cabinet</p>
                    <p className="text-green-100 mb-4">{getRatingLabel(averageRating)}</p>
                    <Badge className="bg-white/20 text-white">#RateYourLeaders</Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-xs text-green-100">Swipe up to rate yours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Share Text */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Share Text</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">{shareText}</p>
              <Button onClick={onCopyText} variant="outline" size="sm" className="w-full">
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
          </div>
        </div>
      </div>
    </div>
  )
}
