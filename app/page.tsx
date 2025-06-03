"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Share2, ChevronRight, Settings, Cloud, BarChart3, Globe, Activity } from "lucide-react"
import { OfficialRating } from "./components/official-rating"
import { ResultsCard } from "./components/results-card"
import { AdminPanel } from "./components/admin-panel"
import { useUniversalAnalyticsData, useUniversalAnalytics } from "./services/universal-analytics"

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

  // Universal analytics
  const { trackRating } = useUniversalAnalytics()
  const { totalRatings, totalShares, activeUsers, isConnected, version } = useUniversalAnalyticsData()

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
      // Track rating in universal analytics
      await trackRating(officialId, rating)

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
          <div className="fixed top-4 right-4 z-40">
            <Button
              onClick={() => setShowAdminPanel(true)}
              variant="outline"
              size="sm"
              className="bg-white/90 backdrop-blur-sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Photos
            </Button>
          </div>

          {/* Universal Analytics Status */}
          <div className="fixed top-4 left-4 z-40">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Universal Analytics v{version}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="font-medium">{isConnected ? "Global" : "Local"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  <span>{totalRatings.toLocaleString()} ratings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4 text-green-500" />
                  <span>{totalShares.toLocaleString()} shares</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>{activeUsers} active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Creative Hero Section */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-green-700 text-white mb-16">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 px-6 py-16 md:py-24 md:px-12">
              <div className="flex items-center justify-center gap-3 mb-8 animate-pulse">
                <div className="w-10 h-6 bg-green-800 rounded-sm"></div>
                <div className="w-10 h-6 bg-white rounded-sm"></div>
                <div className="w-10 h-6 bg-green-800 rounded-sm"></div>
              </div>

              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300">Rate</span>{" "}
                  <span className="inline-block transform hover:scale-105 transition-transform duration-300">Your</span>{" "}
                  <span className="inline-block bg-white text-green-600 px-4 py-2 rounded-lg transform hover:scale-105 transition-transform duration-300">
                    Leaders
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-green-50 mb-12 max-w-3xl mx-auto">
                  Share your honest opinion about Nigeria's public officials after two years in office.
                  <span className="block mt-2 font-light">
                    Get a personalized social media card to share your views!
                  </span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform transition-all hover:scale-105 hover:bg-white/20">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Rate Officials</h3>
                    <p className="text-green-50 text-sm">{officials.length} Nigerian leaders to evaluate</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform transition-all hover:scale-105 hover:bg-white/20">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Get Report Card</h3>
                    <p className="text-green-50 text-sm">Visualize your ratings in a beautiful format</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transform transition-all hover:scale-105 hover:bg-white/20">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Share Results</h3>
                    <p className="text-green-50 text-sm">Download and share on your social media</p>
                  </div>
                </div>

                {/* Universal Community Stats */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Globe className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-semibold">Universal Community Activity</h3>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      v{version}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalRatings.toLocaleString()}</div>
                      <div className="text-green-100 text-sm">Global Ratings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{totalShares.toLocaleString()}</div>
                      <div className="text-green-100 text-sm">Global Shares</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{activeUsers}</div>
                      <div className="text-green-100 text-sm">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`} />
                        <div className="text-3xl font-bold">{isConnected ? "GLOBAL" : "LOCAL"}</div>
                      </div>
                      <div className="text-green-100 text-sm">Data Source</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-green-100 text-sm">
                    All users see the same data • Real-time synchronization • Universal access
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Category to Rate</h2>
            <p className="text-gray-600 mb-8">Choose a specific category of officials or rate them all</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-5 bg-green-600 rounded-sm"></div>
            <div className="w-8 h-5 bg-white border border-gray-300 rounded-sm"></div>
            <div className="w-8 h-5 bg-green-600 rounded-sm"></div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="mb-2 px-6 py-6 text-lg"
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
                  className="mb-2 px-6 py-6 text-lg"
                  size="lg"
                >
                  {category} ({count})
                </Button>
              )
            })}
          </div>

          {/* Officials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {filteredOfficials.map((official) => {
              const hasCloudImage = cloudImages[official.id]

              return (
                <Card
                  key={official.id}
                  className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer group border-2 border-transparent hover:border-green-200"
                >
                  <CardHeader className="text-center pb-2">
                    <div className="relative w-20 h-20 mx-auto mb-3 rounded-full bg-gray-200 overflow-hidden group-hover:ring-4 group-hover:ring-green-100 transition-all">
                      <img
                        src={official.image || "/placeholder.svg"}
                        alt={official.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=80&width=80"
                        }}
                      />
                      {hasCloudImage && (
                        <div className="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-full">
                          <Cloud className="w-2 h-2" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="secondary">{official.category}</Badge>
                    </div>
                    <CardTitle className="text-lg">{official.name}</CardTitle>
                    <CardDescription className="text-sm">{official.fullName}</CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {/* Start Button */}
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => {
                const filtered = selectedCategory ? officials.filter((o) => o.category === selectedCategory) : officials
                setOfficialsToRate(filtered)
                setCurrentOfficialIndex(0)
                setRatings({})
                setCurrentStep("rating")
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-xl rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Start Rating {selectedCategory || "All Officials"} <ChevronRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>

        {/* Admin Panel */}
        {showAdminPanel && (
          <AdminPanel officials={officials} onUpdateOfficials={setOfficials} onClose={() => setShowAdminPanel(false)} />
        )}
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
