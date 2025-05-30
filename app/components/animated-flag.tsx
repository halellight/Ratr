"use client"

import { useEffect, useRef } from "react"

export function AnimatedFlag() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 200

    // Flag colors
    const green = "#008751"
    const white = "#ffffff"

    // Animation variables
    let frame = 0
    const amplitude = 5
    const frequency = 0.02
    const speed = 0.5

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the flag with wave effect
      for (let x = 0; x < canvas.width; x++) {
        // Calculate wave offset
        const waveOffset = Math.sin(x * frequency + frame * speed) * amplitude

        // Draw green stripes
        ctx.fillStyle = green
        ctx.fillRect(x, 0, 1, canvas.height / 3 + waveOffset)
        ctx.fillRect(x, (canvas.height / 3) * 2 + waveOffset, 1, canvas.height / 3)

        // Draw white stripe
        ctx.fillStyle = white
        ctx.fillRect(x, canvas.height / 3 + waveOffset, 1, canvas.height / 3)
      }

      // Update frame
      frame++
      requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      // No need to cancel animation frame as component unmount will handle it
    }
  }, [])

  return <canvas ref={canvasRef} className="rounded-lg shadow-md" />
}
