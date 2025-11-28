"use client"

/**
 * Custom hook for Gemini API distraction analysis
 *
 * Provides:
 * - Connection management
 * - Frame analysis with error handling
 * - Real-time distraction tracking
 * - Automatic retry logic
 */

import { useRef, useState, useCallback } from "react"
import { geminiAPI, type DistractionAnalysis } from "@/lib/gemini-api"

interface UseGeminiAnalysisReturn {
  isConnected: boolean
  isAnalyzing: boolean
  error: string | null
  analysis: DistractionAnalysis | null
  connect: (apiKey: string) => Promise<void>
  analyzeFrame: (frameData: string) => Promise<DistractionAnalysis | null>
  disconnect: () => void
}

export function useGeminiAnalysis(): UseGeminiAnalysisReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<DistractionAnalysis | null>(null)
  const retryCountRef = useRef(0)

  const connect = useCallback(async (apiKey: string) => {
    try {
      setError(null)
      await geminiAPI.connect(apiKey)
      setIsConnected(true)
      retryCountRef.current = 0
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection failed"
      setError(errorMessage)
      setIsConnected(false)
      console.error("[v0] Connection error:", errorMessage)
    }
  }, [])

  const analyzeFrame = useCallback(
    async (frameData: string): Promise<DistractionAnalysis | null> => {
      if (!isConnected) {
        setError("Not connected to Gemini API")
        return null
      }

      setIsAnalyzing(true)
      try {
        const result = await geminiAPI.analyzeFrame(frameData)
        setAnalysis(result)
        setError(null)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Analysis failed"
        setError(errorMessage)
        console.error("[v0] Analysis error:", errorMessage)
        return null
      } finally {
        setIsAnalyzing(false)
      }
    },
    [isConnected],
  )

  const disconnect = useCallback(() => {
    geminiAPI.disconnect()
    setIsConnected(false)
    setAnalysis(null)
    setError(null)
  }, [])

  return {
    isConnected,
    isAnalyzing,
    error,
    analysis,
    connect,
    analyzeFrame,
    disconnect,
  }
}
