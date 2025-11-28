/**
 * Gemini API Integration for Focus Guardian
 * Using REST API instead of WebSockets for better reliability
 */

export interface DistractionAnalysis {
  overallDistractionLevel: number // 0-100
  detectedBehaviors: {
    type: string
    confidence: number
    recommendation?: string
  }[]
  sessionSummary?: {
    totalEventsDetected: number
    criticalEvents: number
    focusScore: number // 0-10
  }
}

class GeminiAPI {
  private apiKey = ""
  private isConnected = false

  /**
   * Connect to Gemini API (just validates the key)
   */
  async connect(apiKey: string): Promise<void> {
    if (!apiKey) {
      throw new Error("API key is required.")
    }

    this.apiKey = apiKey
    this.isConnected = true
    console.log("[GeminiAPI] Connected successfully")
  }

  /**
   * Analyze a video frame for distractions
   * Now uses the backend API endpoint instead of WebSockets
   */
  async analyzeFrame(frameData: string): Promise<DistractionAnalysis> {
    if (!this.isConnected) {
      throw new Error("Not connected to Gemini API")
    }

    try {
      const response = await fetch('/api/analyze-frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ frameData }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Analysis failed')
      }

      const data = await response.json()
      return data.analysis
    } catch (error) {
      console.error("[GeminiAPI] Analysis error:", error)
      throw error
    }
  }

  /**
   * Disconnect from API
   */
  disconnect(): void {
    this.isConnected = false
    this.apiKey = ""
    console.log("[GeminiAPI] Disconnected")
  }

  /**
   * Check connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Export singleton instance
export const geminiAPI = new GeminiAPI()
