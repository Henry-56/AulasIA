"use client"

import type React from "react"

import { useRef, useState, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Play, Pause, Download, AlertCircle, CheckCircle2, Loader } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useGeminiAnalysis } from "@/hooks/use-gemini-analysis"
import { captureFrameAsBase64 } from "@/lib/frame-capture-utils"

interface AnalysisResult {
  frameIndex: number
  timestamp: string
  overallDistractionLevel: number
  detectedBehaviors: Array<{
    type: string
    confidence: number
    recommendation?: string
  }>
  analyzedAt: number
}

export default function VideoUploadAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([])
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "")
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const { isConnected, analyzeFrame, connect, disconnect } = useGeminiAnalysis()

  // Auto-connect if key is available
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

    console.log('[VideoAnalyzer] API Key available:', !!apiKey)
    console.log('[VideoAnalyzer] Currently connected:', isConnected)

    if (apiKey && !isConnected) {
      console.log('[VideoAnalyzer] Attempting auto-connect to Gemini API...')
      connect(apiKey).catch((err) => {
        console.error('[VideoAnalyzer] Auto-connect failed:', err)
        setError(`No se pudo conectar a la API de Gemini: ${err.message || 'Error desconocido'}`)
      })
    } else if (!apiKey) {
      console.warn('[VideoAnalyzer] No API key found in environment variables')
    }
  }, [connect, isConnected])

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.includes("video")) {
      setError("Por favor selecciona un archivo de video válido (MP4, WebM, MOV)")
      return
    }

    setVideoFile(file)
    setError(null)
    setAnalysisResults([])
    setCurrentResult(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setVideoPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add("bg-primary/10")
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-primary/10")
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove("bg-primary/10")
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleConnectAPI = async () => {
    if (!apiKeyInput.trim()) {
      setError("Por favor ingresa tu clave API de Gemini")
      return
    }

    try {
      await connect(apiKeyInput)
      setShowApiKeyInput(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fallo al conectar con la API")
    }
  }

  const handleAnalyzeVideo = async () => {
    if (!videoFile || !videoRef.current || !isConnected) {
      setError("Por favor asegúrate de que el video esté cargado y la API conectada")
      return
    }

    setIsAnalyzing(true)
    setAnalysisResults([])
    setError(null)
    let frameIndex = 0

    try {
      const video = videoRef.current
      const frameInterval = 30 // Capture every 30 seconds

      // Calculate total frames to analyze
      const totalFrames = Math.ceil(video.duration / frameInterval)
      setAnalysisProgress(0)

      for (let time = 0; time < video.duration; time += frameInterval) {
        try {
          // Seek to frame position
          await new Promise<void>((resolve) => {
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked)
              resolve()
            }
            video.addEventListener("seeked", onSeeked)
            video.currentTime = time
          })

          // Capture frame as base64
          const frameData = captureFrameAsBase64(video, 640, 480)

          // Analyze frame with Gemini API
          const analysis = await analyzeFrame(frameData)

          if (analysis) {
            const result: AnalysisResult = {
              frameIndex,
              timestamp: `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`,
              overallDistractionLevel: analysis.overallDistractionLevel,
              detectedBehaviors: analysis.detectedBehaviors,
              analyzedAt: Date.now(),
            }
            setAnalysisResults((prev) => [...prev, result])
            setCurrentResult(result)
            setAnalysisProgress(Math.round((frameIndex / totalFrames) * 100))
            frameIndex++
          }
        } catch (frameError) {
          console.error(`[v0] Error analyzing frame at ${time}s:`, frameError)
          continue
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setAnalysisProgress(100)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Análisis fallido")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleExportResults = () => {
    if (analysisResults.length === 0) {
      setError("No hay resultados de análisis para exportar")
      return
    }

    const data = {
      videoFile: videoFile?.name,
      analysisDate: new Date().toISOString(),
      totalFramesAnalyzed: analysisResults.length,
      averageDistractionLevel:
        analysisResults.reduce((sum, r) => sum + r.overallDistractionLevel, 0) / analysisResults.length,
      results: analysisResults,
    }

    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `distraction-analysis-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const averageDistractionLevel =
    analysisResults.length > 0
      ? Math.round(analysisResults.reduce((sum, r) => sum + r.overallDistractionLevel, 0) / analysisResults.length)
      : 0

  const getDistractionColor = (level: number) => {
    if (level < 30) return "text-success"
    if (level < 60) return "text-warning"
    return "text-error"
  }

  const getDistractionBgColor = (level: number) => {
    if (level < 30) return "bg-success/10 border-success/20"
    if (level < 60) return "bg-warning/10 border-warning/20"
    return "bg-error/10 border-error/20"
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Analizador de Video Subido</h1>
        <p className="text-muted-foreground">Sube un video para analizar niveles de distracción con la API de Gemini Live</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Connection - Only show if not connected and no env key */}
          {!isConnected && !process.env.NEXT_PUBLIC_GEMINI_API_KEY && (
            <Card className="bg-card border-border p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-warning" />
                Conectar API de Gemini
              </h2>
              {showApiKeyInput ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Clave API de Gemini</label>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Ingresa tu clave API de Gemini"
                      className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Obtén tu clave API gratuita de{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleConnectAPI}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                    >
                      Conectar
                    </Button>
                    <Button
                      onClick={() => {
                        setShowApiKeyInput(false)
                        setApiKeyInput("")
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowApiKeyInput(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Agregar Clave API
                </Button>
              )}
            </Card>
          )}

          {isConnected && (
            <Card className="bg-success/10 border-success/20 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">API Conectada</p>
                <p className="text-sm text-muted-foreground">La API de Gemini Live está lista para análisis de video</p>
              </div>
              <Button onClick={disconnect} variant="outline" size="sm" className="ml-auto bg-transparent">
                Desconectar
              </Button>
            </Card>
          )}

          {/* File Upload Area */}
          <Card
            className="bg-card border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-lg p-8 text-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              hidden
            />
            <Upload size={32} className="mx-auto mb-3 text-primary/60" />
            <p className="text-lg font-semibold text-foreground mb-1">Subir Archivo de Video</p>
            <p className="text-sm text-muted-foreground">Formato MP4, WebM o MOV • Arrastra y suelta o haz clic para seleccionar</p>
            {videoFile && (
              <p className="text-sm text-primary mt-3 font-medium">
                ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </Card>

          {/* Video Preview */}
          {videoPreview && (
            <Card className="bg-card border-border p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-foreground mb-4">Vista Previa del Video</h2>
              <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
                <video
                  ref={videoRef}
                  src={videoPreview}
                  className="w-full h-full"
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={togglePlayback}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  {isPlaying ? "Pausar" : "Reproducir"}
                </Button>
                <Button
                  onClick={handleAnalyzeVideo}
                  disabled={!isConnected || isAnalyzing}
                  className="flex-1 bg-success hover:bg-success/90 text-white flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Analizando ({analysisProgress}%)
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Analizar con Gemini
                    </>
                  )}
                </Button>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card className="bg-error/10 border-error/20 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-error flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </Card>
          )}

          {/* Analysis Results */}
          {analysisResults.length > 0 && (
            <Card className="bg-card border-border p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Resultados del Análisis</h2>
                <Button
                  onClick={handleExportResults}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Download size={16} />
                  Exportar JSON
                </Button>
              </div>

              <div className="mb-6 p-4 bg-secondary/30 rounded-lg border border-border/50">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Cuadros Analizados</p>
                    <p className="text-2xl font-bold text-primary">{analysisResults.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Distracción Promedio</p>
                    <p className={`text-2xl font-bold ${getDistractionColor(averageDistractionLevel)}`}>
                      {averageDistractionLevel}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Estado</p>
                    <p className={`text-lg font-bold ${getDistractionColor(averageDistractionLevel)}`}>
                      {averageDistractionLevel < 30
                        ? "Concentrado"
                        : averageDistractionLevel < 60
                          ? "Distracción Leve"
                          : "Distracción Alta"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="h-[300px] w-full bg-secondary/10 p-4 rounded-lg border border-border/50">
                  <h3 className="text-sm font-semibold mb-4 text-foreground">Nivel de Distracción en el Tiempo</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analysisResults}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis
                        dataKey="timestamp"
                        stroke="#888"
                        fontSize={12}
                        tick={{ fill: '#888' }}
                      />
                      <YAxis
                        stroke="#888"
                        fontSize={12}
                        domain={[0, 100]}
                        tick={{ fill: '#888' }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="overallDistractionLevel"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4, fill: '#ef4444' }}
                        activeDot={{ r: 6 }}
                        name="% Distracción"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="h-[300px] w-full bg-secondary/10 p-4 rounded-lg border border-border/50">
                  <h3 className="text-sm font-semibold mb-4 text-foreground">Frecuencia de Comportamientos Detectados</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(
                        analysisResults
                          .flatMap((r) => r.detectedBehaviors)
                          .reduce((acc, b) => {
                            acc[b.type] = (acc[b.type] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                      )
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 8)}
                      layout="vertical"
                      margin={{ left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="#888" fontSize={12} tick={{ fill: '#888' }} allowDecimals={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={120}
                        stroke="#888"
                        fontSize={11}
                        tick={{ fill: '#888' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Conteo" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Result Timeline */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analysisResults.map((result, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentResult(result)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${currentResult?.frameIndex === result.frameIndex
                      ? `${getDistractionBgColor(result.overallDistractionLevel)} border-current`
                      : "bg-secondary/20 border-border/50 hover:border-border"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Cuadro {result.frameIndex + 1}</p>
                        <p className="text-xs text-muted-foreground">{result.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getDistractionColor(result.overallDistractionLevel)}`}>
                          {result.overallDistractionLevel}%
                        </p>
                        <p className="text-xs text-muted-foreground">{result.detectedBehaviors.length} comportamientos</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Detailed Analysis */}
        <div className="space-y-6">
          {/* Current Result Details */}
          {currentResult && (
            <Card className={`${getDistractionBgColor(currentResult.overallDistractionLevel)} border rounded-lg p-6`}>
              <h3 className="text-lg font-semibold text-foreground mb-4">Detalles del Cuadro</h3>

              <div className="space-y-4">
                {/* Distraction Level */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nivel de Distracción</p>
                  <div className="flex items-end gap-3">
                    <div>
                      <p className={`text-4xl font-bold ${getDistractionColor(currentResult.overallDistractionLevel)}`}>
                        {currentResult.overallDistractionLevel}%
                      </p>
                    </div>
                    <div className="flex-1 h-20 bg-secondary/30 rounded flex items-end justify-center gap-1 p-2">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm transition-all ${i < Math.ceil(currentResult.overallDistractionLevel / 10)
                            ? currentResult.overallDistractionLevel < 30
                              ? "bg-success"
                              : currentResult.overallDistractionLevel < 60
                                ? "bg-warning"
                                : "bg-error"
                            : "bg-secondary/50"
                            }`}
                          style={{ height: `${Math.random() * 100}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timestamp and Frame Info */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Marca de Tiempo</p>
                  <p className="font-mono text-foreground">{currentResult.timestamp}</p>
                </div>

                {/* Detected Behaviors */}
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm font-semibold text-foreground mb-3">Comportamientos Detectados</p>
                  <div className="space-y-3">
                    {currentResult.detectedBehaviors.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No se detectaron distracciones</p>
                    ) : (
                      currentResult.detectedBehaviors.map((behavior, idx) => (
                        <div key={idx} className="p-3 bg-secondary/30 rounded-lg border border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground">{behavior.type}</p>
                            <p className="text-xs font-bold text-accent">{Math.round(behavior.confidence * 100)}%</p>
                          </div>
                          {behavior.recommendation && (
                            <p className="text-xs text-muted-foreground">{behavior.recommendation}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Analysis Summary */}
          {analysisResults.length > 0 && (
            <Card className="bg-card border-border p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Resumen</h3>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Duración Total Analizada</p>
                  <p className="font-bold text-foreground">
                    {analysisResults.length * 30} segundos ({Math.round((analysisResults.length * 30) / 60)} minutos)
                  </p>
                </div>

                {/* Most Common Distraction */}
                {analysisResults.length > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <p className="text-muted-foreground mb-2">Distracciones Más Comunes</p>
                    <div className="space-y-2">
                      {Object.entries(
                        analysisResults
                          .flatMap((r) => r.detectedBehaviors)
                          .reduce(
                            (acc, b) => {
                              acc[b.type] = (acc[b.type] || 0) + 1
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                      )
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{type}</span>
                            <span className="font-bold text-foreground">{count}x</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Canvas for frame extraction */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}
