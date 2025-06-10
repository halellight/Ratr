"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Share2, Settings, BarChart3, Globe, Activity } from "lucide-react"
import { OfficialRating } from "./components/official-rating"
import { ResultsCard } from "./components/results-card"
// import { AdminPanel } from "./components/admin-panel"
import { useUniversalAnalyticsData, useUniversalAnalytics } from "./services/universal-analytics"
import { useRealTimeAnalytics } from "./services/real-time-analytics"

const defaultOfficials = [
  {
    id: "president",
    name: "President",
    fullName: "Bola Ahmed Tinubu",
    position: "President of Nigeria",
    image: "/placeholder.svg?height=120&width=120",
    category: "Executive",
  },
  {
    id: "vp",
    name: "Vice President",
    fullName: "Kashim Shettima",
    position: "Vice President of Nigeria",
    image: "/placeholder.svg?height=120&width=120",
    category: "Executive",
  },
  {
    id: "finance",
    name: "Minister of Finance",
    fullName: "Wale Edun",
    position: "Minister of Finance & Coordinating Minister of the Economy",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "budget",
    name: "Minister of Budget",
    fullName: "Atiku Bagudu",
    position: "Minister of Budget & Economic Planning",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "industry",
    name: "Minister of Industry",
    fullName: "Doris Uzoka-Anite",
    position: "Minister of Industry, Trade & Investment",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "petroleum",
    name: "Minister of Petroleum",
    fullName: "Heineken Lokpobiri",
    position: "Minister of State for Petroleum Resources (Oil)",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "petroleum_gas",
    name: "Minister of Petroleum (Gas)",
    fullName: "Ekperikpe Ekpo",
    position: "Minister of State for Petroleum Resources (Gas)",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "agriculture",
    name: "Minister of Agriculture",
    fullName: "Abubakar Kyari",
    position: "Minister of Agriculture & Food Security",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "education",
    name: "Minister of Education",
    fullName: "Prof. Tahir Mamman",
    position: "Minister of Education",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "health",
    name: "Minister of Health",
    fullName: "Prof. Muhammad Ali Pate",
    position: "Coordinating Minister of Health & Social Welfare",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "women_affairs",
    name: "Minister of Women Affairs",
    fullName: "Uju Kennedy-Ohanenye",
    position: "Minister of Women Affairs",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "humanitarian",
    name: "Minister of Humanitarian Affairs",
    fullName: "Dr. Betta Edu",
    position: "Minister of Humanitarian Affairs & Poverty Reduction",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "youth",
    name: "Minister of Youth",
    fullName: "Dr. Jamila Bio Ibrahim",
    position: "Minister of Youth Development",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "sports",
    name: "Minister of Sports",
    fullName: "John Enoh",
    position: "Minister of Sports Development",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "works",
    name: "Minister of Works",
    fullName: "Dave Umahi",
    position: "Minister of Works",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "power",
    name: "Minister of Power",
    fullName: "Adebayo Adelabu",
    position: "Minister of Power",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "housing",
    name: "Minister of Housing",
    fullName: "Ahmed Musa Dangiwa",
    position: "Minister of Housing & Urban Development",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "transport",
    name: "Minister of Transportation",
    fullName: "Said Alkali",
    position: "Minister of Transportation",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "aviation",
    name: "Minister of Aviation",
    fullName: "Festus Keyamo",
    position: "Minister of Aviation & Aerospace Development",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "innovation",
    name: "Minister of Innovation",
    fullName: "Uche Nnaji",
    position: "Minister of Innovation, Science & Technology",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "communications",
    name: "Minister of Communications",
    fullName: "Dr. Bosun Tijani",
    position: "Minister of Communications, Innovation & Digital Economy",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "interior",
    name: "Minister of Interior",
    fullName: "Olubunmi Tunji-Ojo",
    position: "Minister of Interior",
    image: "/placeholder.svg?height=120&width=120",
    category: "Security",
  },
  {
    id: "defense",
    name: "Minister of Defense",
    fullName: "Mohammed Badaru",
    position: "Minister of Defense",
    image: "/placeholder.svg?height=120&width=120",
    category: "Security",
  },
  {
    id: "police_affairs",
    name: "Minister of Police Affairs",
    fullName: "Ibrahim Geidam",
    position: "Minister of Police Affairs",
    image: "/placeholder.svg?height=120&width=120",
    category: "Security",
  },
  {
    id: "foreign_affairs",
    name: "Minister of Foreign Affairs",
    fullName: "Yusuf Tuggar",
    position: "Minister of Foreign Affairs",
    image: "/placeholder.svg?height=120&width=120",
    category: "Security",
  },
  {
    id: "justice",
    name: "Minister of Justice",
    fullName: "Lateef Fagbemi",
    position: "Minister of Justice & Attorney General",
    image: "/placeholder.svg?height=120&width=120",
    category: "Security",
  },
]

const categories = ["Executive", "Economic Team", "Social Services", "Infrastructure", "Security"]

export default function Component() {
  const [currentStep, setCurrentStep] = useState<"intro" | "rating" | "results">("intro")
  const [currentOfficialIndex, setCurrentOfficialIndex] = useState(0)
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [officialsToRate, setOfficialsToRate] = useState<typeof defaultOfficials>([])
  const [officials, setOfficials] = useState<typeof defaultOfficials>(defaultOfficials)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [cloudImages, setCloudImages] = useState<Record<string, string>>({})
  const [isLoadingImages, setIsLoadingImages] = useState(true)

  // Real-time analytics (primary data source)
  const { trackRating, stats: realTimeStats } = useRealTimeAnalytics()

  // Universal analytics (fallback)
  const universalData = useUniversalAnalyticsData()
  const { trackRating: universalTrackRating } = useUniversalAnalytics()

  // Use real-time data when available, fallback to universal
  const displayStats = {
    totalRatings: realTimeStats?.totalRatings ?? universalData.totalRatings,
    totalShares: realTimeStats?.totalShares ?? universalData.totalShares,
    activeUsers: realTimeStats?.activeUsers ?? universalData.activeUsers,
    isConnected: realTimeStats?.connectionStatus === "connected" ?? universalData.isConnected,
    version: realTimeStats?.strategy === "websocket" ? "Real-time" : "Live",
  }

  // Load officials data from localStorage and cloud images on component mount
  useEffect(() => {
    const savedOfficials = localStorage.getItem("officialsData")
    if (savedOfficials) {
      try {
        const parsedOfficials = JSON.parse(savedOfficials)
        setOfficials(parsedOfficials)
      } catch (e) {
        console.error("Error parsing officials data:", e)
      }
    }

    // Load cloud images for all users
    loadCloudImages()
  }, [])

  // Update officials with cloud images when they load
  useEffect(() => {
    if (Object.keys(cloudImages).length > 0) {
      const updatedOfficials = officials.map((official) => ({
        ...official,
        image: cloudImages[official.id] || official.image,
      }))
      setOfficials(updatedOfficials)
    }
  }, [cloudImages])

  const loadCloudImages = async () => {
    try {
      const response = await fetch("/api/officials/images")
      const data = await response.json()

      if (response.ok) {
        setCloudImages(data.images || {})
      } else {
        console.error("Failed to load cloud images:", data.error)
        setCloudImages({})
      }
    } catch (error) {
      console.error("Failed to load cloud images:", error)
      setCloudImages({})
    } finally {
      setIsLoadingImages(false)
    }
  }

  const progress = (Object.keys(ratings).length / officialsToRate.length) * 100

  const handleRating = async (officialId: string, rating: number) => {
    try {
      // Track rating in both systems for redundancy
      await Promise.all([trackRating(officialId, rating), universalTrackRating(officialId, rating)])

      // Update local state
      setRatings((prev) => ({ ...prev, [officialId]: rating }))

      if (currentOfficialIndex < officialsToRate.length - 1) {
        setCurrentOfficialIndex((prev) => prev + 1)
      } else {
        setCurrentStep("results")
      }
    } catch (error) {
      console.error("Failed to track rating:", error)
      // Continue with local update even if tracking fails
      setRatings((prev) => ({ ...prev, [officialId]: rating }))

      if (currentOfficialIndex < officialsToRate.length - 1) {
        setCurrentOfficialIndex((prev) => prev + 1)
      } else {
        setCurrentStep("results")
      }
    }
  }

  const handleBack = () => {
    if (currentOfficialIndex > 0) {
      setCurrentOfficialIndex((prev) => prev - 1)
    }
  }

  const filteredOfficials = selectedCategory
    ? officials.filter((official) => official.category === selectedCategory)
    : officials

  if (currentStep === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          {/* Admin Button */}
          {/* <div className="fixed top-4 right-4 z-40">
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Photos
            </Button>
          </div> */}

          {/* Real-Time Analytics Status */}
          {/* <div className="fixed top-4 left-4 z-40">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{displayStats.version} Analytics</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${displayStats.isConnected ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="font-medium">{displayStats.isConnected ? "Connected" : "Local"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>{displayStats.totalRatings.toLocaleString()} ratings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4 text-green-500" />
                  <span>{displayStats.totalShares.toLocaleString()} shares</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>{displayStats.activeUsers} active</span>
                </div>
              </div>
            </div>
          </div> */}

          {/* Simplified Hero Section - Action First */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white mb-12">
            <div className="relative z-10 px-6 py-12 text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-5 bg-green-800 rounded-sm"></div>
                <div className="w-8 h-5 bg-white rounded-sm"></div>
                <div className="w-8 h-5 bg-green-800 rounded-sm"></div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">Rate Nigeria's Leaders</h1>

              <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto">
                Quick 2-minute rating • Get shareable results • Join {displayStats.totalRatings.toLocaleString()}+
                ratings
              </p>

              {/* Immediate Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button
                  size="lg"
                  onClick={() => {
                    setOfficialsToRate(officials)
                    setCurrentOfficialIndex(0)
                    setRatings({})
                    setCurrentStep("rating")
                  }}
                  className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
                >
                  Start Rating Now →
                </Button>

                <Button
                  
                  size="lg"
                  className="bg-white text-green-700 hover:bg-green-50 px-8 py-4 text-lg font-semibold rounded-full shadow-lg"
                  onClick={() => {
                    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Choose Category First
                </Button>
              </div>

              {/* Quick Stats - Real-Time Data */}
              <div className="flex justify-center items-center gap-6 text-sm text-green-100">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{displayStats.totalRatings.toLocaleString()} ratings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>{displayStats.totalShares.toLocaleString()} shares</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span>{displayStats.activeUsers} active now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection - More Prominent */}
          <div id="categories" className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose What to Rate</h2>
              <p className="text-gray-600">Select a category or rate all {officials.length} officials</p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className="px-6 py-3 text-base font-medium"
                size="lg"
              >
                All Officials ({officials.length})
              </Button>
              {categories.map((category) => {
                const count = officials.filter((o) => o.category === category).length
                return (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="px-6 py-3 text-base font-medium"
                    size="lg"
                  >
                    {category} ({count})
                  </Button>
                )
              })}
            </div>

            {/* Big Start Button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={() => {
                  const filtered = selectedCategory
                    ? officials.filter((o) => o.category === selectedCategory)
                    : officials
                  setOfficialsToRate(filtered)
                  setCurrentOfficialIndex(0)
                  setRatings({})
                  setCurrentStep("rating")
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-12 py-4 text-xl rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Start Rating {selectedCategory || "All Officials"} →
              </Button>
              <p className="text-sm text-gray-500 mt-2">Takes about 2 minutes • Get shareable results</p>
            </div>
          </div>

          {/* Simplified Officials Preview */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-6">
              {selectedCategory ? `${selectedCategory} Officials` : "All Officials"}({filteredOfficials.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredOfficials.slice(0, 12).map((official) => (
                <Card key={official.id} className="hover:shadow-md transition-shadow cursor-pointer text-center p-3">
                  <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-200 overflow-hidden">
                    <img
                      src={official.image || "/placeholder.svg"}
                      alt={official.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=64&width=64"
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium">{official.name}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {official.category}
                  </Badge>
                </Card>
              ))}
              {filteredOfficials.length > 12 && (
                <Card className="flex items-center justify-center p-3 bg-gray-50">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">+{filteredOfficials.length - 12} more</p>
                    <p className="text-xs text-gray-500">Start rating to see all</p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Simple FAQ - Collapsible */}
          <div className="max-w-2xl mx-auto">
            <details className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <summary className="font-medium cursor-pointer">How does this work?</summary>
              <p className="text-sm text-gray-600 mt-2">
                Rate officials 1-5 stars, get a shareable report card, and see how others rated them.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border p-4 mb-4">
              <summary className="font-medium cursor-pointer">Is this anonymous?</summary>
              <p className="text-sm text-gray-600 mt-2">
                Yes, completely anonymous. We only track ratings, not personal information.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm border p-4">
              <summary className="font-medium cursor-pointer">What happens to my ratings?</summary>
              <p className="text-sm text-gray-600 mt-2">
                You get a personalized report card to share on social media, and your ratings contribute to the overall
                statistics.
              </p>
            </details>
          </div>

          {/* Admin Panel */}
          {/* {showAdminPanel && (
            <AdminPanel
              officials={officials}
              onUpdateOfficials={setOfficials}
              onClose={() => setShowAdminPanel(false)}
            />
          )} */}
        </div>
      </div>
    )
  }

  if (currentStep === "rating") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-8">
          <OfficialRating
            official={officialsToRate[currentOfficialIndex]}
            onRate={handleRating}
            onBack={handleBack}
            currentIndex={currentOfficialIndex}
            totalCount={officialsToRate.length}
            showBiography={true}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-8">
        <ResultsCard
          ratings={ratings}
          officials={officialsToRate}
          onRestart={() => {
            setCurrentStep("intro")
            setCurrentOfficialIndex(0)
            setRatings({})
            setOfficialsToRate([])
          }}
        />
      </div>
    </div>
  )
}
