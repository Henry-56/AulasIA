"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Square, RotateCcw, AlertCircle } from "lucide-react"
import VideoCapture from "@/components/video-capture"
import DistractionMonitor from "@/components/distraction-monitor"
import SessionTimer from "@/components/session-timer"
import { useGeminiAnalysis } from "@/hooks/use-gemini-analysis"
import { optimizeFrameForAPI } from "@/lib/frame-capture-utils"
import VideoUploadAnalyzer from "@/components/video-upload-analyzer"

interface LiveSessionProps {
  onNavigate: (page: string) => void
}

interface DistractionEvent {
  type: string
  confidence: number
  timestamp: number
}

export default function LiveSession({ onNavigate }: LiveSessionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(0)
  const [distractionLevel, setDistractionLevel] = useState(0)
  const [detectedDistractions, setDetectedDistractions] = useState<any[]>([])
  const [sessionData, setSessionData] = useState<DistractionEvent[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const [sessionMode, setSessionMode] = useState<"camera" | "upload">("camera")

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { isConnected, analyzeFrame, connect, disconnect, error } = useGeminiAnalysis()

  useEffect(() => {
    const initializeAPI = async () => {
      // First try environment variable
      const envApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      console.log('[LiveSession] API Key from env available:', !!envApiKey)
      console.log('[LiveSession] Currently connected:', isConnected)

      if (envApiKey) {
        console.log('[LiveSession] Attempting auto-connect with env API key...')
        try {
          await connect(envApiKey)
          setApiKeyMissing(false)
          console.log('[LiveSession] Successfully connected to Gemini API')
        } catch (err) {
          console.error('[LiveSession] Auto-connect failed:', err)
          setApiError(`No se pudo conectar a la API de Gemini: ${err instanceof Error ? err.message : 'Error desconocido'}`)
        }
        return
      }

      // Fallback to localStorage if no env variable
      console.warn('[LiveSession] No env API key found, checking localStorage...')
      const settings = localStorage.getItem("focusGuardianSettings")
      if (settings) {
        try {
          const { apiKey } = JSON.parse(settings)
          if (apiKey) {
            await connect(apiKey)
            setApiKeyMissing(false)
          } else {
            setApiKeyMissing(true)
          }
        } catch (err) {
          console.error("Error initializing API from localStorage:", err)
          setApiKeyMissing(true)
        }
      } else {
        setApiKeyMissing(true)
        console.warn('[LiveSession] No API key found in env or localStorage')
      }
    }

    if (!isConnected) {
      initializeAPI()
    }

    return () => {
      if (isRecording) {
        disconnect()
      }
    }
  }, [connect, disconnect, isRecording, isConnected])

  const captureAndAnalyzeFrame = useCallback(async () => {
    if (!videoRef.current || !isConnected) return

    try {
      const frameData = optimizeFrameForAPI(videoRef.current)
      const analysis = await analyzeFrame(frameData)

      if (analysis) {
        setDistractionLevel(analysis.overallDistractionLevel)

        if (analysis.detectedBehaviors && analysis.detectedBehaviors.length > 0) {
          // Store full behavior objects instead of just types
          setDetectedDistractions(analysis.detectedBehaviors.slice(0, 5))

          setSessionData((prev) => [
            ...prev,
            ...analysis.detectedBehaviors.map((b) => ({
              type: b.type,
              confidence: b.confidence,
              timestamp: sessionDuration,
            })),
          ])
        }

        setApiError(null)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Fallo en el análisis"
      setApiError(errorMsg)
      console.error("Frame analysis error:", err)
    }
  }, [isConnected, analyzeFrame, sessionDuration])

  useEffect(() => {
    if (!isRecording || !isConnected) return

    captureAndAnalyzeFrame()

    frameIntervalRef.current = setInterval(() => {
      captureAndAnalyzeFrame()
    }, 30000)

    return () => {
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)
    }
  }, [isRecording, isConnected, captureAndAnalyzeFrame])

  useEffect(() => {
    if (!isRecording) return

    timerIntervalRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isRecording])

  const handleStart = async () => {
    if (!isConnected) {
      setApiError("API de Gemini no conectada. Por favor revisa tu clave API en configuración.")
      return
    }

    setIsRecording(true)
    setDistractionLevel(0)
    setDetectedDistractions([])
    setSessionData([])
    setSessionDuration(0)
    setApiError(null)
  }

  const handleStop = () => {
    setIsRecording(false)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current)

    const existingSessions = JSON.parse(localStorage.getItem("focusGuardianSessions") || "[]")
    const newSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: sessionDuration,
      finalDistractionLevel: distractionLevel,
      detectedDistractions: Array.from(new Set(detectedDistractions)),
      events: sessionData,
      usedGeminiAPI: isConnected,
    }
    existingSessions.push(newSession)
    localStorage.setItem("focusGuardianSessions", JSON.stringify(existingSessions))
  }

  const handleReset = () => {
    setIsRecording(false)
    setSessionDuration(0)
    setDistractionLevel(0)
    setDetectedDistractions([])
    setSessionData([])
    setApiError(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Sesión de Estudio en Vivo</h1>
        <div className="flex gap-2 border-b border-border">
          <button
            onClick={() => setSessionMode("camera")}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${sessionMode === "camera"
              ? "text-primary border-b-primary"
              : "text-muted-foreground border-b-transparent hover:text-foreground"
              }`}
          >
            Cámara en Vivo
          </button>
          <button
            onClick={() => setSessionMode("upload")}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${sessionMode === "upload"
              ? "text-primary border-b-primary"
              : "text-muted-foreground border-b-transparent hover:text-foreground"
              }`}
          >
            Subir Video
          </button>
        </div>
      </div>

      {sessionMode === "camera" ? (
        <>
          <p className="text-muted-foreground mb-6">Monitorea tu concentración en tiempo real usando análisis de cámara</p>

          {apiKeyMissing && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-foreground">Clave API Requerida</p>
                <p className="text-sm text-muted-foreground">
                  Por favor configura tu clave API de Gemini en Configuración para habilitar la detección de distracciones en tiempo real.
                </p>
                <Button
                  size="sm"
                  className="mt-2 bg-error hover:bg-error/90 text-white"
                  onClick={() => onNavigate("settings")}
                >
                  Ir a Configuración
                </Button>
              </div>
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <AlertCircle size={18} className="text-warning" />
                Error de Conexión
              </p>
              <p className="text-sm text-muted-foreground mt-1">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-card border-border p-6 rounded-lg overflow-hidden">
                <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden mb-4">
                  <VideoCapture videoRef={videoRef} isRecording={isRecording} />
                  <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />

                  {isRecording && (
                    <div className="absolute top-4 right-4 bg-primary/90 px-4 py-2 rounded-lg">
                      <SessionTimer duration={sessionDuration} />
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/90 px-3 py-2 rounded-lg border border-border">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-success" : "bg-error"}`}></div>
                    <span className="text-xs text-muted-foreground">
                      {isConnected ? "API Gemini: Conectada" : "API Desconectada"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={handleStart}
                    disabled={isRecording || !isConnected}
                    className="bg-success hover:bg-success/90 text-white flex items-center gap-2"
                  >
                    <Play size={18} />
                    {isConnected ? "Iniciar Sesión" : "Configurar API"}
                  </Button>
                  <Button
                    onClick={handleStop}
                    disabled={!isRecording}
                    variant="outline"
                    className="border-error hover:bg-error/10 text-error flex items-center gap-2 bg-transparent"
                  >
                    <Square size={18} />
                    Detener Sesión
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-border hover:bg-secondary/30 flex items-center gap-2 bg-transparent"
                  >
                    <RotateCcw size={18} />
                    Reiniciar
                  </Button>
                </div>
              </Card>

              <Card className="bg-card border-border p-6 rounded-lg">
                <h2 className="text-lg font-semibold text-foreground mb-4">Distracciones Detectadas</h2>
                {detectedDistractions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    {isRecording ? "Monitoreando distracciones..." : "Inicia una sesión para detectar distracciones"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {detectedDistractions.map((behavior, index) => {
                      // Translations map for behavior types (now includes Spanish from API)
                      const translations: Record<string, string> = {
                        // Spanish types from API
                        uso_telefono: "Uso de teléfono",
                        mirada_desviada: "Mirada desviada",
                        mirada_hacia_abajo: "Mirada hacia abajo",
                        postura_inadecuada: "Postura inadecuada",
                        fatiga: "Fatiga",
                        bostezo: "Bostezo",
                        distraccion_ambiental: "Distracción ambiental",

                        // English fallbacks (in case API responds in English)
                        phone_presence: "Uso de teléfono",
                        phone_use: "Uso de teléfono",
                        gaze_direction: "Dirección de la mirada",
                        gaze_direction_down: "Mirada hacia abajo",
                        gaze_direction_away: "Mirada desviada",
                        head_position_gaze_direction: "Dirección de la mirada",
                        facial_fatigue: "Fatiga",
                        facial_expressions_fatigue: "Fatiga",
                        yawning: "Bostezo",
                        posture_slouching: "Postura inadecuada",
                        posture_quality: "Calidad de postura",
                        poor_posture: "Postura inadecuada",
                        environmental_distraction: "Distracción ambiental",
                        environmental_distractions: "Distracción ambiental",
                        background_activity: "Actividad en el fondo",
                        looking_around: "Mirando alrededor",
                        distraction: "Distracción",
                      }

                      const behaviorType = behavior.type || behavior
                      const translatedType = translations[behaviorType] || behaviorType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())

                      // Ensure confidence is between 0 and 100
                      let confidence = 0
                      if (behavior.confidence !== undefined) {
                        confidence = Math.min(100, Math.max(0, Math.round(behavior.confidence * 100)))
                      }

                      // Color based on confidence level
                      const getConfidenceColor = (conf: number) => {
                        if (conf >= 80) return "text-error"
                        if (conf >= 60) return "text-warning"
                        return "text-success"
                      }

                      return (
                        <div
                          key={index}
                          className="relative p-4 bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-lg border border-border/50 hover:border-border transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-3 h-3 rounded-full bg-warning animate-pulse"></div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-foreground font-semibold text-base mb-1">
                                {translatedType}
                              </h3>
                              {behavior.recommendation && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {behavior.recommendation}
                                </p>
                              )}
                            </div>

                            <div className="flex-shrink-0 text-right">
                              <div className={`text-2xl font-bold ${getConfidenceColor(confidence)}`}>
                                {confidence}%
                              </div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                Confianza
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-6">
              <DistractionMonitor
                level={distractionLevel}
                status={
                  distractionLevel < 30 ? "Concentrado" : distractionLevel < 60 ? "Distracción Leve" : "Distracción Alta"
                }
              />

              <Card className="bg-card border-border p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Estadísticas de la Sesión</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Duración</p>
                    <p className="text-2xl font-bold text-primary">
                      {Math.floor(sessionDuration / 60)}:{String(sessionDuration % 60).padStart(2, "0")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Eventos Totales</p>
                    <p className="text-2xl font-bold text-accent">{sessionData.length}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm mb-1">Puntaje de Concentración</p>
                    <p className="text-2xl font-bold text-success">
                      {Math.max(0, 10 - Math.floor(distractionLevel / 10)).toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="bg-card border-border p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Consejos para Mejorar la Concentración</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Mantén tu teléfono fuera del alcance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Mantén una buena postura</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Minimiza el ruido de fondo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Toma descansos cada 25 minutos</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          {!isRecording && sessionDuration > 0 && (
            <Card className="bg-card border-border p-8 rounded-lg mt-6 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">¡Sesión Completada!</h2>
              <div className="flex justify-center gap-8 mb-6">
                <div>
                  <p className="text-muted-foreground mb-1">Duración de la Sesión</p>
                  <p className="text-3xl font-bold text-primary">
                    {Math.floor(sessionDuration / 60)}m {sessionDuration % 60}s
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Puntaje Final</p>
                  <p className="text-3xl font-bold text-accent">
                    {Math.max(0, 10 - Math.floor(distractionLevel / 10)).toFixed(1)}/10
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Distracciones Detectadas</p>
                  <p className="text-3xl font-bold text-warning">{sessionData.length}</p>
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleReset}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Iniciar Otra Sesión
                </Button>
              </div>
            </Card>
          )}
        </>
      ) : (
        <VideoUploadAnalyzer />
      )}
    </div>
  )
}
