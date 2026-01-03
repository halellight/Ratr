"use client"

import { motion } from "framer-motion"
import { Mail, MessageSquare, Phone, MapPin, Send, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))

        toast.success("Message sent successfully! We'll get back to you soon.")
        setIsSubmitting(false)
            ; (e.target as HTMLFormElement).reset()
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

                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-start">
                        {/* Left Column: Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold tracking-wider uppercase mb-8 border border-emerald-100">
                                <MessageSquare className="w-4 h-4" />
                                Get in Touch
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
                                We're Listeneing to Your <span className="text-emerald-600">Feedback</span>
                            </h1>
                            <p className="text-xl text-gray-600 font-medium leading-relaxed mb-12">
                                Have questions about our data, methodology, or want to report an issue? Our team is here to help and will respond within 24 hours.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/50 border border-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-emerald-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email Us</p>
                                        <p className="text-lg font-bold text-gray-900">praiseibec@gmail.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/50 border border-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-blue-700" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Based In</p>
                                        <p className="text-lg font-bold text-gray-900">Lagos, Nigeria</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Form */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="glass-morphism p-8 md:p-12 border border-white/40 ring-1 ring-black/5 shadow-2xl rounded-[3rem]">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            拉                      <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                            <Input
                                                placeholder="John Doe"
                                                required
                                                className="rounded-2xl border-gray-100 bg-white/80 focus:ring-emerald-500 h-14"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                required
                                                className="rounded-2xl border-gray-100 bg-white/80 focus:ring-emerald-500 h-14"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Subject</label>
                                        <Input
                                            placeholder="Methodology Inquiry"
                                            required
                                            className="rounded-2xl border-gray-100 bg-white/80 focus:ring-emerald-500 h-14"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">How can we help?</label>
                                        <Textarea
                                            placeholder="Tell us what's on your mind..."
                                            className="min-h-[150px] rounded-2xl border-gray-100 bg-white/80 focus:ring-emerald-500 p-4"
                                            required
                                        />
                                    </div>

                                    <Button
                                        disabled={isSubmitting}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-8 text-lg font-bold rounded-2xl shadow-xl transition-all group"
                                    >
                                        {isSubmitting ? (
                                            <span className="animate-pulse">Sending Message...</span>
                                        ) : (
                                            <>
                                                Send Message
                                                <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
