"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
} from "recharts"

interface AnalysisReportProps {
  onNavigate: (page: string) => void
}

const mockDistractionAnalysis = {
  phoneInView: 28,
  headTilted: 15,
  yawning: 12,
  lookingaround: 25,
  slouching: 14,
  eyeContactLoss: 6,
}

const performanceTrend = [
  { week: "Semana 1", avgScore: 6.8, avgDistractions: 24 },
  { week: "Semana 2", avgScore: 7.3, avgDistractions: 22 },
  { week: "Semana 3", avgScore: 8.1, avgDistractions: 18 },
  { week: "Semana 4", avgScore: 8.5, avgDistractions: 15 },
]

const correlationData = [
  { studyHours: 1, score: 5.2 },
  { studyHours: 2, score: 6.8 },
  { studyHours: 2.5, score: 7.4 },
  { studyHours: 3, score: 8.1 },
  { studyHours: 3.5, score: 8.3 },
  { studyHours: 4, score: 8.7 },
  { studyHours: 4.5, score: 8.9 },
  { studyHours: 5, score: 9.1 },
]

const COLORS = {
  primary: "rgba(140, 100, 255, 1)",
  accent: "rgba(155, 110, 255, 1)",
  success: "rgba(16, 185, 129, 1)",
  warning: "rgba(245, 158, 11, 1)",
  error: "rgba(239, 68, 68, 1)",
}

export default function AnalysisReport({ onNavigate }: AnalysisReportProps) {
  const distractionChartData = useMemo(() => {
    return [
      { name: "Teléfono a la Vista", value: mockDistractionAnalysis.phoneInView, fill: COLORS.error },
      { name: "Cabeza Inclinada", value: mockDistractionAnalysis.headTilted, fill: COLORS.warning },
      { name: "Bostezando", value: mockDistractionAnalysis.yawning, fill: COLORS.warning },
      { name: "Mirando Alrededor", value: mockDistractionAnalysis.lookingaround, fill: COLORS.accent },
      { name: "Encorvado", value: mockDistractionAnalysis.slouching, fill: COLORS.primary },
      { name: "Pérdida de Contacto Visual", value: mockDistractionAnalysis.eyeContactLoss, fill: COLORS.success },
    ]
  }, [])

  const performanceScore = 8.5
  const distractionTrend = -15
  const improvementRate = 24
  const consistencyScore = 87

  const handleExport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      performanceScore,
      distractionTrend,
      improvementRate,
      consistencyScore,
      distractionBreakdown: mockDistractionAnalysis,
      recommendations: generateRecommendations(),
    }

    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `focus-guardian-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const generateRecommendations = () => {
    const recs = [
      "Your phone is the primary distraction. Keep it in another room during study sessions.",
      "Maintain consistent eye contact with your study material - posture affects focus.",
      "Practice the Pomodoro technique: 25 minutes study, 5 minutes break.",
      "Your improvement rate is 24% week-over-week - keep up the momentum!",
      "Evening study sessions show better focus levels - schedule important tasks then.",
    ]
    return recs
  }

  const recommendations = generateRecommendations()

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Análisis y Reportes</h1>
        <p className="text-muted-foreground">
          Desglose detallado de tus patrones de distracción y rendimiento académico
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border p-6 rounded-lg">
          <p className="text-muted-foreground text-sm mb-2">Rendimiento General</p>
          <p className="text-4xl font-bold text-primary mb-2">{performanceScore.toFixed(1)}/10</p>
          <p className="text-xs text-success flex items-center gap-1">
            <TrendingUp size={14} /> Progreso excelente
          </p>
        </Card>

        <Card className="bg-card border-border p-6 rounded-lg">
          <p className="text-muted-foreground text-sm mb-2">Tendencia de Distracción</p>
          <p className="text-4xl font-bold text-success mb-2">{distractionTrend}%</p>
          <p className="text-xs text-success">Mejorando</p>
        </Card>

        <Card className="bg-card border-border p-6 rounded-lg">
          <p className="text-muted-foreground text-sm mb-2">Tasa de Mejora</p>
          <p className="text-4xl font-bold text-accent mb-2">{improvementRate}%</p>
          <p className="text-xs text-accent">Esta semana</p>
        </Card>

        <Card className="bg-card border-border p-6 rounded-lg">
          <p className="text-muted-foreground text-sm mb-2">Puntaje de Consistencia</p>
          <p className="text-4xl font-bold text-warning mb-2">{consistencyScore}%</p>
          <p className="text-xs text-warning">Muy consistente</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Distraction Breakdown */}
        <Card className="bg-card border-border p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Desglose de Distracciones</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distractionChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distractionChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Trend */}
        <Card className="bg-card border-border p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tendencia de Rendimiento Semanal</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 30, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgScore"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ fill: COLORS.primary, r: 4 }}
                name="Puntaje Promedio"
              />
              <Line
                type="monotone"
                dataKey="avgDistractions"
                stroke={COLORS.error}
                strokeWidth={2}
                dot={{ fill: COLORS.error, r: 4 }}
                name="Promedio de Distracciones"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Study Hours vs Performance Correlation */}
      <Card className="bg-card border-border p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Horas de Estudio vs Rendimiento</h2>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={correlationData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="studyHours" name="Horas de Estudio" stroke="rgba(255,255,255,0.5)" />
            <YAxis dataKey="score" name="Puntaje de Rendimiento" stroke="rgba(255,255,255,0.5)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(20, 20, 30, 0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              cursor={{ strokeDasharray: "3 3" }}
            />
            <Scatter name="Session Data" data={correlationData} fill={COLORS.primary} />
          </ScatterChart>
        </ResponsiveContainer>
      </Card>

      {/* Causes of Performance Variations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Causes */}
        <Card className="bg-card border-border p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-warning" size={20} />
            <h2 className="text-lg font-semibold text-foreground">Causas Comunes</h2>
          </div>
          <ul className="space-y-3">
            <li className="flex gap-3 p-3 bg-error/10 rounded-lg border border-error/20">
              <span className="text-error font-bold">1</span>
              <div>
                <p className="font-semibold text-foreground">Proximidad del Teléfono (28%)</p>
                <p className="text-sm text-muted-foreground">Dispositivo a la vista o al alcance</p>
              </div>
            </li>
            <li className="flex gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <span className="text-warning font-bold">2</span>
              <div>
                <p className="font-semibold text-foreground">Ambiental (25%)</p>
                <p className="text-sm text-muted-foreground">Mirando alrededor, ruido</p>
              </div>
            </li>
            <li className="flex gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <span className="text-accent font-bold">3</span>
              <div>
                <p className="font-semibold text-foreground">Fatiga (12%)</p>
                <p className="text-sm text-muted-foreground">Bostezos, somnolencia</p>
              </div>
            </li>
          </ul>
        </Card>

        {/* Impact Analysis */}
        <Card className="bg-card border-border p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="text-primary" size={20} />
            <h2 className="text-lg font-semibold text-foreground">Análisis de Impacto</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="font-semibold text-foreground mb-1">Alto Impacto de Distracción</p>
              <p className="text-sm text-muted-foreground">Reduce el rendimiento en 2.5 puntos en promedio</p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <p className="font-semibold text-foreground mb-1">Ventana de Concentración</p>
              <p className="text-sm text-muted-foreground">Mejor rendimiento: 2-4 PM y 8-10 PM</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="font-semibold text-foreground mb-1">Duración Óptima</p>
              <p className="text-sm text-muted-foreground">Sesiones de 45-60 min muestran mejores resultados</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-card border-border p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recomendaciones Personalizadas</h2>

        {/* Short-term */}
        <div className="mb-6">
          <h3 className="font-semibold text-primary text-base mb-3">Corto Plazo (Esta Semana)</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>Mueve tu teléfono a otra habitación durante las sesiones de estudio - es tu mayor distracción (28%)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary mt-1">→</span>
              <span>Programa sesiones de estudio entre 2-4 PM cuando tienes tu mejor ventana de concentración</span>
            </li>
          </ul>
        </div>

        {/* Medium-term */}
        <div className="mb-6">
          <h3 className="font-semibold text-accent text-base mb-3">Mediano Plazo (Este Mes)</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">→</span>
              <span>Establece una rutina de estudio consistente con sesiones de 45-60 minutos</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-1">→</span>
              <span>Practica mejor postura y contacto visual con los materiales de estudio</span>
            </li>
          </ul>
        </div>

        {/* Long-term */}
        <div>
          <h3 className="font-semibold text-success text-base mb-3">Largo Plazo (3+ Meses)</h3>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-3">
              <span className="text-success mt-1">→</span>
              <span>Apunta a un puntaje de rendimiento consistente de 9.0+ construyendo hábitos de concentración fuertes</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-success mt-1">→</span>
              <span>Reduce el promedio de distracciones a menos de 10 por sesión mediante optimización ambiental</span>
            </li>
          </ul>
        </div>
      </Card>

      {/* Export Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleExport}
          className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"
        >
          <Download size={18} />
          Exportar Reporte como JSON
        </Button>
      </div>
    </div>
  )
}
