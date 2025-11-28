"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Eye, TrendingUp, Clock, AlertCircle } from "lucide-react"

interface DashboardProps {
  onNavigate: (page: string) => void
}

const performanceData = [
  { date: "Lun", score: 8.5, distractions: 12 },
  { date: "Mar", score: 7.8, distractions: 18 },
  { date: "Mié", score: 9.2, distractions: 8 },
  { date: "Jue", score: 8.0, distractions: 20 },
  { date: "Vie", score: 9.1, distractions: 10 },
  { date: "Sáb", score: 7.5, distractions: 25 },
  { date: "Dom", score: 8.7, distractions: 14 },
]

const sessionHistory = [
  { id: 1, date: "Hoy 2:30 PM", duration: "45 min", score: 9.2, distractions: 8, status: "Excelente" },
  { id: 2, date: "Ayer 3:15 PM", duration: "60 min", score: 8.5, distractions: 12, status: "Bueno" },
  { id: 3, date: "Hace 2 días", duration: "50 min", score: 7.8, distractions: 18, status: "Regular" },
  { id: 4, date: "Hace 3 días", duration: "55 min", score: 9.1, distractions: 10, status: "Excelente" },
  { id: 5, date: "Hace 4 días", duration: "40 min", score: 8.0, distractions: 20, status: "Bueno" },
]

export default function Dashboard({ onNavigate }: DashboardProps) {
  const avgScore = (performanceData.reduce((sum, d) => sum + d.score, 0) / performanceData.length).toFixed(1)
  const totalSessions = sessionHistory.length

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Bienvenido de nuevo, Estudiante</h1>
        <p className="text-muted-foreground">Tus estadísticas de concentración de esta semana</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Puntaje Promedio</p>
              <p className="text-3xl font-bold text-primary">{avgScore}/10</p>
            </div>
            <TrendingUp className="text-primary opacity-20" size={40} />
          </div>
        </Card>

        <Card className="bg-card border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Sesiones de Estudio</p>
              <p className="text-3xl font-bold text-accent">{totalSessions}</p>
            </div>
            <Clock className="text-accent opacity-20" size={40} />
          </div>
        </Card>

        <Card className="bg-card border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Promedio de Distracciones</p>
              <p className="text-3xl font-bold text-warning">14.6</p>
            </div>
            <AlertCircle className="text-warning opacity-20" size={40} />
          </div>
        </Card>

        <Card className="bg-card border-border p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Tasa de Concentración</p>
              <p className="text-3xl font-bold text-success">87%</p>
            </div>
            <Eye className="text-success opacity-20" size={40} />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Trend */}
        <Card className="bg-card border-border p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Tendencia de Rendimiento</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 30, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="rgba(140, 100, 255, 1)"
                strokeWidth={2}
                dot={{ fill: "rgba(140, 100, 255, 1)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Distraction Pattern */}
        <Card className="bg-card border-border p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-4">Distracciones por Sesión</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 20, 30, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="distractions" fill="rgba(255, 150, 50, 0.8)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Session History */}
      <Card className="bg-card border-border p-6 rounded-lg">
        <h2 className="text-lg font-semibold text-foreground mb-4">Sesiones Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Fecha y Hora</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Duración</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Puntaje</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Distracciones</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sessionHistory.map((session) => (
                <tr key={session.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-foreground">{session.date}</td>
                  <td className="py-3 px-4 text-foreground">{session.duration}</td>
                  <td className="py-3 px-4">
                    <span className="text-primary font-semibold">{session.score}/10</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={session.distractions > 15 ? "text-error" : "text-foreground"}>
                      {session.distractions}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${session.status === "Excellent"
                          ? "bg-success/20 text-success"
                          : session.status === "Good"
                            ? "bg-primary/20 text-primary"
                            : "bg-warning/20 text-warning"
                        }`}
                    >
                      {session.status === "Excellent" ? "Excelente" : session.status === "Good" ? "Bueno" : "Regular"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* CTA Button */}
      <div className="mt-8 flex gap-4 justify-center">
        <Button
          size="lg"
          onClick={() => onNavigate("session")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Start Study Session
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => onNavigate("analysis")}
          className="border-border hover:bg-secondary/30"
        >
          Ver Análisis Detallado
        </Button>
      </div>
    </div>
  )
}
