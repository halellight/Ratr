import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
// import { ErrorBoundary } from "./components/error-boundary"
import { UniversalAnalyticsHeader } from "./components/universal-analytics-header"
import { UniversalAnalyticsProvider } from "./components/universal-analytics-provider"

export const metadata: Metadata = {
  title: "Rate Your Nigerian Leaders",
  description: "Rate Nigerian public officials and share your opinion on social media",
  keywords: [
    "Nigerian leaders",
    "public officials",
    "politics",
    "government",
    "ratings",
    "social media",
    "share opinions",
    "Nigerian politics",
  ],
  authors: [
    {
      name: "Nigerian Leaders Rating",
      url: "https://ratedem.com",
    },
  ],
  icons: {
   icon: "/favicon.ico",
  },
  creator: "Praise Ibe",
  openGraph: {
    title: "Rate Your Nigerian Leaders",
    description: "Rate Nigerian public officials and share your opinion on social media",
    url: "https://ratedem.com",
    siteName: "Nigerian Leaders Rating",
    images: [
      {
        url: "https://ratedem.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rate Your Nigerian Leaders",
      },
    ],
    locale: "en_US",
    type: "website",
  },

}

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Analytics/>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900,300&display=swap" rel="stylesheet" />
      </head>
      
      <body className="font-satoshi">
        <UniversalAnalyticsHeader />
          <UniversalAnalyticsProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              {children}
            </ThemeProvider>
          <UniversalAnalyticsProvider
      </body>
      
    </html>
  )
}
