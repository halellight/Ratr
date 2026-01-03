"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Github, Twitter, Heart, Globe, MessageSquare } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative mt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="glass-morphism rounded-[2.5rem] p-8 md:p-12 border border-white/40 ring-1 ring-black/5 shadow-2xl relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
                        {/* Brand Section */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-4 bg-emerald-600 rounded-sm"></div>
                                <div className="w-8 h-4 bg-white rounded-sm border border-gray-100"></div>
                                <div className="w-8 h-4 bg-emerald-600 rounded-sm"></div>
                                <span className="text-xl font-black text-gray-900 tracking-tighter">RATE<span className="text-emerald-600">DEM</span></span>
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed max-w-sm">
                                Empowering Nigerian citizens through transparent data and collective feedback.
                                Shaping the national narrative, one rating at a time.
                            </p>
                            <div className="flex items-center gap-4">
                                <a href="#" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all">
                                    <Globe className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Links Section */}
                        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Platform</h4>
                                <ul className="space-y-3">
                                    <li><Link href="/" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Home</Link></li>
                                    <li><Link href="/analytics" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Analytics</Link></li>
                                    <li><Link href="/about" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">About Project</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Categories</h4>
                                <ul className="space-y-3">
                                    <li><Link href="/?cat=Executive" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Executive</Link></li>
                                    <li><Link href="/?cat=Economic Team" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Economic Team</Link></li>
                                    <li><Link href="/?cat=Security" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Security</Link></li>
                                </ul>
                            </div>
                            <div className="space-y-4 col-span-2 md:col-span-1">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Support</h4>
                                <ul className="space-y-3">
                                    <li><Link href="/contact" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Contact Us</Link></li>
                                    <li><Link href="/feedback" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors underline decoration-emerald-500/30">Feature Request</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                        <p className="text-sm text-gray-400 font-medium">
                            © {currentYear} Nigerian Leaders Rating. All rights reserved.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
                            <span>Built with</span>
                            <Heart className="w-4 h-4 text-rose-500 fill-current animate-pulse" />
                            <span>for Nigeria by</span>
                            <a href="#" className="text-gray-900 font-black hover:text-emerald-600 transition-colors">Praise Ibe</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
