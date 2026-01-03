"use client"

import { motion } from "framer-motion"
import { MessageSquarePlus, Lightbulb, Zap, Star, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

export default function FeedbackPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedType, setSelectedType] = useState<string | null>(null)

    const feedbackTypes = [
        { id: "feature", label: "New Feature", icon: Lightbulb, color: "text-blue-600", bg: "bg-blue-50" },
        { id: "improvement", label: "Improvement", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
        { id: "data", label: "Data Correction", icon: MessageSquarePlus, color: "text-emerald-600", bg: "bg-emerald-50" },
        { id: "other", label: "Other", icon: Star, color: "text-purple-600", bg: "bg-purple-50" },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedType) {
            toast.error("Please select a feedback category")
            return
        }

        setIsSubmitting(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        toast.success("Thank you for your valuable feedback!")
        setIsSubmitting(false)
            ; (e.target as HTMLFormElement).reset()
        setSelectedType(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 selection:bg-green-100 selection:text-green-900">
            <div className="container mx-auto px-4 py-12 md:py-20">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-12"
                >
                    <Link href="/">
                        <Button variant="ghost" className="gap-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 rounded-xl">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Rating
                        </Button>
                    </Link>
                </motion.div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold tracking-wider uppercase mb-6 border border-emerald-100">
                            <Star className="w-4 h-4" />
                            Community Voice
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
                            Help Us <span className="text-emerald-600">Improve</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto">
                            Your suggestions shape the future of this platform. Let us know how we can make the rating experience better for everyone.
                        </p>
                    </motion.div>

                    <Card className="glass-morphism p-8 md:p-12 border border-white/40 ring-1 ring-black/5 shadow-2xl rounded-[3rem]">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {feedbackTypes.map((type) => {
                                        const Icon = type.icon
                                        const isSelected = selectedType === type.id
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setSelectedType(type.id)}
                                                className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 gap-3 group ${isSelected
                                                        ? "border-emerald-500 bg-white shadow-xl scale-105"
                                                        : "border-gray-100 bg-white/50 hover:border-emerald-200"
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 ${type.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    <Icon className={`w-6 h-6 ${type.color}`} />
                                                </div>
                                                <span className={`text-sm font-bold ${isSelected ? "text-emerald-700" : "text-gray-500"}`}>
                                                    {type.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Your Suggestion</label>
                                <Textarea
                                    placeholder="In a perfect world, this platform would have..."
                                    className="min-h-[200px] rounded-[2rem] border-gray-100 bg-white/80 focus:ring-emerald-500 p-8 text-lg font-medium shadow-inner"
                                    required
                                />
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <Button
                                    disabled={isSubmitting}
                                    className="w-full md:w-auto px-16 py-8 text-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl transition-all group"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Submitting...</span>
                                    ) : (
                                        <>
                                            Submit Feedback
                                            <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                                <p className="text-sm text-gray-400 font-bold tracking-widest uppercase">Every message is reviewed by our team</p>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}
