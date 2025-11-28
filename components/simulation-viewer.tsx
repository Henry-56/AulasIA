"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createSimulation, SimulationConfig } from "@/lib/video-simulator"
import { PlayIcon, Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react"

interface SimulationViewerProps {
    courseId: string
    studentCount: number
    onAnalysisComplete?: (sessionId: string, metrics: any) => void
}

export default function SimulationViewer({ courseId, studentCount, onAnalysisComplete }: SimulationViewerProps) {
    const [status, setStatus] = useState<"idle" | "generating" | "uploading" | "analyzing" | "complete" | "error">("idle")
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [progress, setProgress] = useState(0)
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleStartSimulation = async () => {
        try {
            setStatus("generating")
            setError(null)
            setProgress(10)

            // Generate video simulation
            const config: SimulationConfig = {
                studentCount: studentCount || 12,
                duration: 15,
                width: 1280,
                height: 720,
            }

            const { videoBlob, students } = await createSimulation(config)
            const url = URL.createObjectURL(videoBlob)
            setVideoUrl(url)
            setProgress(40)

            setStatus("uploading")

            // Create session in database
            const sessionRes = await fetch("/api/simulation/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            })

            const sessionData = await sessionRes.json()
            const sessionId = sessionData.sessionId

            setProgress(60)
            setStatus("analyzing")

            // Upload video to Gemini for analysis
            const formData = new FormData()
            formData.append("file", videoBlob, "classroom-simulation.webm")
            formData.append("sessionId", sessionId)

            const analysisRes = await fetch("/api/analyze-video", {
                method: "POST",
                body: formData,
            })

            const analysisData = await analysisRes.json()
            console.log("Analysis result:", analysisData)

            setProgress(80)

            // Save analysis to database
            const saveRes = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId,
                    duration: 15,
                    analyzed: true,
                    metricsData: analysisData.analysis,
                }),
            })

            const savedData = await saveRes.json()
            setMetrics(analysisData.analysis)
            setProgress(100)
            setStatus("complete")

            if (onAnalysisComplete) {
                onAnalysisComplete(sessionId, analysisData.analysis)
            }
        } catch (err) {
            console.error("Simulation error:", err)
            setError(err instanceof Error ? err.message : "Error desconocido")
            setStatus("error")
        }
    }

    const getStatusMessage = () => {
        switch (status) {
            case "generating":
                return "Generando video de simulación..."
            case "uploading":
                return "Subiendo video a Gemini AI..."
            case "analyzing":
                return "Analizando participación de estudiantes..."
            case "complete":
                return "¡Análisis completado!"
            case "error":
                return "Error en el proceso"
            default:
                return "Listo para comenzar"
        }
    }

    const getStatusIcon = () => {
        switch (status) {
            case "generating":
            case "uploading":
            case "analyzing":
                return <Loader2 className="animate-spin text-primary" size={24} />
            case "complete":
                return <CheckCircle className="text-success" size={24} />
            case "error":
                return <AlertCircle className="text-error" size={24} />
            default:
                return <PlayIcon className="text-primary" size={24} />
        }
    }

    return (
        <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Simulación de Clase con IA</h3>
                    <p className="text-sm text-muted-foreground">
                        Genera una clase simulada y analízala con Gemini para detectar patrones
                    </p>
                </div>
                <Button
                    onClick={handleStartSimulation}
                    disabled={status !== "idle" && status !== "complete" && status !== "error"}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {getStatusIcon()}
                    <span className="ml-2">
                        {status === "idle" ? "Iniciar Simulación" : status === "complete" ? "Nueva Simulación" : "Procesando..."}
                    </span>
                </Button>
            </div>

            {/* Progress Bar */}
            {status !== "idle" && (
                <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-foreground font-medium">{getStatusMessage()}</span>
                        <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3">
                    <AlertCircle className="text-error" size={20} />
                    <p className="text-error text-sm">{error}</p>
                </div>
            )}

            {/* Video Player */}
            {videoUrl && (
                <div className="mb-6 rounded-lg overflow-hidden border border-border bg-black aspect-video relative">
                    <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        className="w-full h-full"
                    />
                </div>
            )}

            {/* Analysis Results */}
            {status === "complete" && metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border text-center">
                        <p className="text-sm text-muted-foreground mb-1">Puntaje de Atención</p>
                        <p className="text-2xl font-bold text-primary">
                            {metrics.overallAttentionScore?.toFixed(0)}%
                        </p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border text-center">
                        <p className="text-sm text-muted-foreground mb-1">Participación</p>
                        <p className="text-2xl font-bold text-success">
                            {metrics.participationRate?.toFixed(0)}%
                        </p>
                    </div>
                    <div className="p-4 bg-secondary/30 rounded-lg border border-border text-center">
                        <p className="text-sm text-muted-foreground mb-1">Distracciones</p>
                        <p className="text-2xl font-bold text-warning">
                            {metrics.distractionCount}
                        </p>
                    </div>
                </div>
            )}

            {metrics?.distractionTypes && metrics.distractionTypes.length > 0 && (
                <div className="mt-4 p-4 bg-secondary/30 rounded-lg border border-border">
                    <p className="font-semibold text-foreground mb-2">Tipos de Distracciones Detectadas:</p>
                    <div className="flex flex-wrap gap-2">
                        {metrics.distractionTypes.map((type: string, index: number) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-warning/20 text-warning rounded-full text-sm border border-warning/30"
                            >
                                {type}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    )
}
