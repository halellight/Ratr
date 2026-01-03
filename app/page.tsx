"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Share2, Settings, BarChart3, Globe, Activity, Star } from "lucide-react"
import { OfficialRating } from "./components/official-rating"
import { ResultsCard } from "./components/results-card"
import { AdminPanel } from "./components/admin-panel"
import { useUniversalAnalyticsData, useUniversalAnalytics } from "./services/universal-analytics"
import { useRealTimeAnalytics } from "./services/real-time-analytics"
import { motion, AnimatePresence } from "framer-motion"

const defaultOfficials = [
  {
    id: "president",
    name: "President",
    fullName: "Bola Ahmed Tinubu",
    position: "President of Nigeria",
    image: "/tinubu.jpg",
    category: "Executive",
  },
  {
    id: "vp",
    name: "Vice President",
    fullName: "Kashim Shettima",
    position: "Vice President of Nigeria",
    image: "/vp.jpg",
    category: "Executive",
  },
  {
    id: "fct",
    name: "Minister of FCT",
    fullName: "Nyesom Wike",
    position: "Minister of Federal Capital Territory",
    image: "/placeholder.svg?height=120&width=120",
    category: "Executive",
  },
  {
    id: "finance",
    name: "Minister of Finance",
    fullName: "Wale Edun",
    position: "Minister of Finance & Coordinating Minister of the Economy",
    image: "/finance.jpg",
    category: "Economic Team",
  },
  {
    id: "budget",
    name: "Minister of Budget",
    fullName: "Atiku Bagudu",
    position: "Minister of Budget & Economic Planning",
    image: "/atiku.jpg",
    category: "Economic Team",
  },
  {
    id: "industry",
    name: "Minister of Industry",
    fullName: "Dr. Jumoke Oduwole",
    position: "Minister of Industry, Trade & Investment",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "petroleum",
    name: "Minister of Petroleum (Oil)",
    fullName: "Heineken Lokpobiri",
    position: "Minister of State for Petroleum Resources (Oil)",
    image: "/petrol.jpg",
    category: "Economic Team",
  },
  {
    id: "petroleum_gas",
    name: "Minister of Petroleum (Gas)",
    fullName: "Ekperikpe Ekpo",
    position: "Minister of State for Petroleum Resources (Gas)",
    image: "/gas.jpg",
    category: "Economic Team",
  },
  {
    id: "agriculture",
    name: "Minister of Agriculture",
    fullName: "Abubakar Kyari",
    position: "Minister of Agriculture & Food Security",
    image: "/kyari2.jpg",
    category: "Economic Team",
  },
  {
    id: "solid_minerals",
    name: "Minister of Solid Minerals",
    fullName: "Dele Alake",
    position: "Minister of Solid Minerals Development",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "marine_economy",
    name: "Minister of Marine & Blue Economy",
    fullName: "Adegboyega Oyetola",
    position: "Minister of Marine and Blue Economy",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "livestock",
    name: "Minister of Livestock",
    fullName: "Idi Mukhtar Maiha",
    position: "Minister of Livestock Development",
    image: "/placeholder.svg?height=120&width=120",
    category: "Economic Team",
  },
  {
    id: "education",
    name: "Minister of Education",
    fullName: "Dr. Maruf Tunji Alausa",
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
    id: "humanitarian",
    name: "Minister of Humanitarian Affairs",
    fullName: "Dr. Nentawe Yilwatda",
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
    id: "labour",
    name: "Minister of Labour",
    fullName: "Muhammadu Maigari Dingyadi",
    position: "Minister of Labour & Employment",
    image: "/placeholder.svg?height=120&width=120",
    category: "Social Services",
  },
  {
    id: "education_state",
    name: "Minister of State, Education",
    fullName: "Dr. Suwaiba Said Ahmad",
    position: "Minister of State for Education",
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
    id: "housing_state",
    name: "Minister of State, Housing",
    fullName: "Rt. Hon. Yusuf Abdullahi Ata",
    position: "Minister of State for Housing and Urban Development",
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
    id: "communications",
    name: "Minister of Communications",
    fullName: "Dr. Bosun Tijani",
    position: "Minister of Communications, Innovation & Digital Economy",
    image: "/placeholder.svg?height=120&width=120",
    category: "Infrastructure",
  },
  {
    id: "regional_development",
    name: "Minister of Regional Development",
    fullName: "Abubakar Momoh",
    position: "Minister of Regional Development",
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
    fullName: "Mohammed Badaru Abubakar",
    position: "Minister of Defense",
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
    id: "foreign_affairs_state",
    name: "Minister of State, Foreign Affairs",
    fullName: "Bianca Odumegwu-Ojukwu",
    position: "Minister of State for Foreign Affairs",
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
    isConnected: (realTimeStats?.connectionStatus === "connected") || universalData.isConnected,
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
      // Track rating using the unified hook
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

          {/* Real-Time Analytics Status */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-4 left-4 z-40 hidden md:block"
          >
            <div className="glass-morphism rounded-full px-6 py-2 shadow-2xl border border-white/40 ring-1 ring-black/5">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className={`relative flex h-2 w-2`}>
                    <div className={`animate-ping absolute inline-flex h-full w-full rounded-full ${displayStats.isConnected ? "bg-green-400" : "bg-yellow-400"} opacity-75`}></div>
                    <div className={`relative inline-flex rounded-full h-2 w-2 ${displayStats.isConnected ? "bg-green-500" : "bg-yellow-500"}`}></div>
                  </div>
                  <span className="font-semibold text-gray-800 tracking-tight">{displayStats.version}</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">{displayStats.totalRatings.toLocaleString()}</span>
                  <span className="text-gray-500 font-medium">ratings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-blue-500" />
                  <span className="font-bold text-blue-600">{displayStats.totalShares.toLocaleString()}</span>
                  <span className="text-gray-500 font-medium">shares</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-purple-600">{displayStats.activeUsers}</span>
                  <span className="text-gray-500 font-medium">live</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Simplified Hero Section - Action First */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[2.5rem] mesh-gradient text-white mb-16 premium-shadow"
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
            <div className="relative z-10 px-8 py-20 md:py-28 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                <div className="w-12 h-6 bg-green-900/40 backdrop-blur-md border border-white/20 rounded-md shadow-inner"></div>
                <div className="w-12 h-6 bg-white/40 backdrop-blur-md border border-white/20 rounded-md shadow-inner"></div>
                <div className="w-12 h-6 bg-green-900/40 backdrop-blur-md border border-white/20 rounded-md shadow-inner"></div>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight"
              >
                Rate Your <br />
                <span className="text-emerald-300">Nigerian Leaders</span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-emerald-50 mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
              >
                Transparency through participation. <br />
                Join <span className="text-white font-bold">{displayStats.totalRatings.toLocaleString()}</span> citizens shaping the national narrative.
              </motion.p>

              {/* Immediate Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-12"
              >
                <Button
                  size="lg"
                  onClick={() => {
                    setOfficialsToRate(officials)
                    setCurrentOfficialIndex(0)
                    setRatings({})
                    setCurrentStep("rating")
                  }}
                  className="bg-white text-emerald-800 hover:bg-emerald-50 px-10 py-8 text-xl font-bold rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                >
                  Start Rating Now →
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white hover:text-emerald-900 px-8 py-8 rounded-2xl text-lg font-semibold transition-all"
                  onClick={() => {
                    document.getElementById("categories")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Filter by Category
                </Button>
              </motion.div>

              {/* Quick Stats - Real-Time Data */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex justify-center items-center gap-8 text-sm font-semibold tracking-widest uppercase text-emerald-100/80"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Verified Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Anonymous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span>Real-Time</span>
                </div>
              </motion.div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-emerald-400/20 rounded-full blur-3xl"></div>
          </motion.div>

          {/* Category Selection - More Prominent */}
          <div id="categories" className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Voices of the People</h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto font-medium">Select a focused cabinet to rate or experience the full national review.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-4 mb-12"
            >
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                className={`px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-300 ${selectedCategory === null
                  ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105"
                  : "bg-white/50 backdrop-blur-sm border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                size="lg"
              >
                All Officials
                <Badge className="ml-2 bg-white/20 text-white border-0">{officials.length}</Badge>
              </Button>
              {categories.map((category) => {
                const count = officials.filter((o) => o.category === category).length
                const isActive = selectedCategory === category
                return (
                  <Button
                    key={category}
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-8 py-6 text-lg font-bold rounded-2xl transition-all duration-300 ${isActive
                      ? "bg-emerald-600 text-white shadow-xl shadow-emerald-200 scale-105"
                      : "bg-white/50 backdrop-blur-sm border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    size="lg"
                  >
                    {category}
                    <Badge className={`ml-2 border-0 ${isActive ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"}`}>{count}</Badge>
                  </Button>
                )
              })}
            </motion.div>

            {/* Big Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
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
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-16 py-8 text-2xl font-black rounded-[2rem] shadow-2xl hover:shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 group"
              >
                Rate {selectedCategory || "Everything"}
                <span className="ml-3 group-hover:translate-x-2 transition-transform inline-block">→</span>
              </Button>
              <p className="text-sm text-gray-400 mt-6 font-bold tracking-widest uppercase">Secured & Anonymous Feedback Loop</p>
            </motion.div>
          </div>

          {/* Simplified Officials Preview */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-center mb-6">
              {selectedCategory ? `${selectedCategory} Officials` : "All Officials"}({filteredOfficials.length})
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredOfficials.slice(0, 12).map((official, index) => (
                  <motion.div
                    key={official.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      onClick={() => {
                        setOfficialsToRate([official])
                        setCurrentOfficialIndex(0)
                        setRatings({})
                        setCurrentStep("rating")
                      }}
                      className="group relative overflow-hidden h-full hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/50 backdrop-blur-sm ring-1 ring-black/5 hover:ring-emerald-500/30 p-4"
                    >
                      <div className="relative w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-white overflow-hidden shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <img
                          src={official.image || "/placeholder.svg"}
                          alt={official.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=80&width=80"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{official.name}</h4>
                      <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider mt-2 bg-emerald-50 text-emerald-700 border- emerald-100">
                        {official.category}
                      </Badge>

                      <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-emerald-500 text-white p-1 rounded-bl-lg">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredOfficials.length > 12 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Card className="flex items-center justify-center h-full p-4 bg-gray-50/50 backdrop-blur-sm border-dashed border-2 border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                    onClick={() => {
                      setOfficialsToRate(filteredOfficials)
                      setCurrentOfficialIndex(0)
                      setRatings({})
                      setCurrentStep("rating")
                    }}
                  >
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-700">+{filteredOfficials.length - 12} more</p>
                      <p className="text-xs text-gray-500 font-medium">Rate all now</p>
                    </div>
                  </Card>
                </motion.div>
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
          {showAdminPanel && (
            <AdminPanel
              officials={officials}
              onUpdateOfficials={setOfficials}
              onClose={() => setShowAdminPanel(false)}
            />
          )}
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
