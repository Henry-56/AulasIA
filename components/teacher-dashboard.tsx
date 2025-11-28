"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import CourseSelector from "@/components/course-selector"
import SimulationViewer from "@/components/simulation-viewer"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { TrendingUp, Users, AlertCircle, CheckCircle } from "lucide-react"

interface TeacherDashboardProps {
    onNavigate: (page: string) => void
}

export default function TeacherDashboard({ onNavigate }: TeacherDashboardProps) {
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseData()
            fetchSessions()
        }
    }, [selectedCourseId])

    const fetchCourseData = async () => {
        try {
            const res = await fetch("/api/courses")
            const data = await res.json()
            const course = data.courses.find((c: any) => c.id === selectedCourseId)
            setSelectedCourse(course)
        } catch (error) {
            console.error("Error fetching course:", error)
        }
    }

    const fetchSessions = async () => {
        if (!selectedCourseId) return
        setLoading(true)
        try {
            const res = await fetch(`/api/sessions?courseId=${selectedCourseId}`)
            const data = await res.json()
            setSessions(data.sessions || [])
        } catch (error) {
            console.error("Error fetching sessions:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleAnalysisComplete = (sessionId: string, metrics: any) => {
        console.log("Analysis complete:", sessionId, metrics)
        fetchSessions() // Refresh session list
    }

    // Calculate aggregate metrics
    const avgAttention = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.metrics?.overallAttentionScore || 0), 0) / sessions.length
        : 0

    const avgParticipation = sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.metrics?.participationRate || 0), 0) / sessions.length
        : 0

    const totalDistractions = sessions.reduce((sum, s) => sum + (s.metrics?.distractionCount || 0), 0)

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    Panel del Profesor
                </h1>
                <p className="text-muted-foreground">
                    Monitorea la participación de los estudiantes y ejecuta simulaciones de clase
                </p>
            </div>

            {/* Course Selection */}
            <div className="mb-6">
                <CourseSelector
                    onCourseSelect={(id) => setSelectedCourseId(id)}
                    selectedCourseId={selectedCourseId || undefined}
                />
            </div>

            {selectedCourseId && selectedCourse ? (
                <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-card border-border p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm mb-2">Atención Promedio</p>
                                    <p className="text-3xl font-bold text-primary">{avgAttention.toFixed(0)}%</p>
                                </div>
                                <TrendingUp className="text-primary opacity-20" size={40} />
                            </div>
                        </Card>

                        <Card className="bg-card border-border p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm mb-2">Tasa de Participación</p>
                                    <p className="text-3xl font-bold text-success">{avgParticipation.toFixed(0)}%</p>
                                </div>
                                <CheckCircle className="text-success opacity-20" size={40} />
                            </div>
                        </Card>

                        <Card className="bg-card border-border p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm mb-2">Alertas de Distracción</p>
                                    <p className="text-3xl font-bold text-warning">{totalDistractions}</p>
                                </div>
                                <AlertCircle className="text-warning opacity-20" size={40} />
                            </div>
                        </Card>

                        <Card className="bg-card border-border p-6 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-muted-foreground text-sm mb-1">Sesiones</p>
                                    <p className="text-3xl font-bold text-accent">{sessions.length}</p>
                                </div>
                                <Users className="text-accent opacity-20" size={40} />
                            </div>
                        </Card>
                    </div>

                    {/* Simulation Viewer */}
                    <div className="mb-6">
                        <SimulationViewer
                            courseId={selectedCourseId}
                            studentCount={selectedCourse.students?.length || 12}
                            onAnalysisComplete={handleAnalysisComplete}
                        />
                    </div>

                    {/* Recent Sessions */}
                    <Card className="bg-card border-border p-6 rounded-lg">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Resumen de la Clase</h2>

                        {loading ? (
                            <p className="text-muted-foreground text-center py-4">Cargando sesiones...</p>
                        ) : sessions.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                No hay sesiones aún. Genera un video simulado de la clase y analízalo con Gemini para identificar patrones de distracción y mejorar estrategias de enseñanza.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Fecha</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Duración</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Atención</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Participación</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Distracciones</th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                                                <td className="py-3 px-4 text-foreground">
                                                    {new Date(session.date).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="py-3 px-4 text-foreground">{session.duration}s</td>
                                                <td className="py-3 px-4">
                                                    <span className="text-primary font-semibold">
                                                        {session.metrics?.overallAttentionScore?.toFixed(0) || "N/A"}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="text-success font-semibold">
                                                        {session.metrics?.participationRate?.toFixed(0) || "N/A"}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={session.metrics?.distractionCount > 5 ? "text-error" : "text-foreground"}>
                                                        {session.metrics?.distractionCount || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${session.analyzed
                                                            ? "bg-success/20 text-success"
                                                            : "bg-warning/20 text-warning"
                                                            }`}
                                                    >
                                                        {session.analyzed ? "Analizado" : "Pendiente"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </>
            ) : (
                <Card className="bg-card border-border p-12 text-center">
                    <Users className="mx-auto mb-4 text-muted-foreground opacity-30" size={64} />
                    <h3 className="text-xl font-semibold text-foreground mb-2">Selecciona un Curso</h3>
                    <p className="text-muted-foreground">
                        Elige un curso arriba o crea uno nuevo para comenzar a monitorear la participación estudiantil
                    </p>
                </Card>
            )}
        </div>
    )
}
