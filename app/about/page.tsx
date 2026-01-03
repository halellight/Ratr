"use client"

import { motion } from "framer-motion"
import { Info, Target, Shield, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 selection:bg-green-100 selection:text-green-900">
            <div className="container mx-auto px-4 py-12 md:py-24">
                {/* Navigation */}
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

                {/* Hero Section */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold tracking-wider uppercase mb-6 border border-emerald-100">
                            <Info className="w-4 h-4" />
                            About the Platform
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight leading-tight">
                            Empowering Citizens Through <span className="text-emerald-600">Transparency</span>
                        </h1>
                        <p className="text-xl text-gray-600 font-medium leading-relaxed">
                            Nigerian Leaders Rating is a non-partisan platform designed to bridge the gap between governance and citizen feedback. We provide a space for Nigerians to voice their opinions on the performance of their public officials in real-time.
                        </p>
                    </motion.div>
                </div>

                {/* Mission & Vision Cards */}
                <div className="grid md:grid-cols-2 gap-8 mb-24 max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-morphism rounded-[2.5rem] p-10 border border-white/40 ring-1 ring-black/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Target className="w-8 h-8 text-emerald-700" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4">Our Mission</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                To foster a culture of accountability and excellence in public service by providing data-driven insights from the most important stakeholders: the citizens of Nigeria.
                            </p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="glass-morphism rounded-[2.5rem] p-10 border border-white/40 ring-1 ring-black/5 shadow-2xl relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                                <Shield className="w-8 h-8 text-blue-700" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-4">Our Vision</h3>
                            <p className="text-gray-600 font-medium leading-relaxed">
                                A Nigeria where every public official is held to the highest standards of performance, and where every citizen's voice contributes to the national progress.
                            </p>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>

                {/* Accountability Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="rounded-[3rem] bg-emerald-900 text-white p-12 md:p-24 relative overflow-hidden mb-24"
                >
                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Anonymous & Secure</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-emerald-400 flex-shrink-0 mt-1"></div>
                                <p className="text-lg text-emerald-100 font-medium">We do not collect personal data. Your ratings are 100% anonymous.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-emerald-400 flex-shrink-0 mt-1"></div>
                                <p className="text-lg text-emerald-100 font-medium">Data is protected with enterprise-grade encryption and real-time validation.</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-emerald-400 flex-shrink-0 mt-1"></div>
                                <p className="text-lg text-emerald-100 font-medium">Our methodology focuses on qualitative sentiment reflected through quantitative ratings.</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
                    <Users className="absolute bottom-12 right-12 w-48 h-48 text-white/5" />
                </motion.div>

                {/* Team/Credits */}
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-black text-gray-900 mb-6">Join the Movement</h2>
                    <p className="text-gray-600 font-medium mb-12">
                        This is a community-driven initiative. We are constantly improving our data and platform features based on user feedback.
                    </p>
                    <Link href="/">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                            Start Rating Officials Now
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
