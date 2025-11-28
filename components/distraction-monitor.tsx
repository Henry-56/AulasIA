"use client"

import { Card } from "@/components/ui/card"

interface DistractionMonitorProps {
  level: number
  status: string
}

export default function DistractionMonitor({ level, status }: DistractionMonitorProps) {
  const getStatusColor = () => {
    if (level < 30) return "text-success"
    if (level < 60) return "text-warning"
    return "text-error"
  }

  const getGradientColor = () => {
    if (level < 30) return "from-success to-emerald-400"
    if (level < 60) return "from-warning to-orange-400"
    return "from-error to-red-400"
  }

  return (
    <Card className="bg-card border-border p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground mb-4">Nivel de Distracción</h3>

      {/* Circular Gauge */}
      <div className="flex justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle cx="60" cy="60" r="55" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke={level < 30 ? "#10b981" : level < 60 ? "#f59e0b" : "#ef4444"}
              strokeWidth="8"
              strokeDasharray={`${(level / 100) * 345.575} 345.575`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.3s ease" }}
            />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${getStatusColor()}`}>{Math.round(level)}%</span>
            <span className="text-xs text-muted-foreground mt-1">Distracción</span>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">Estado Actual</p>
        <p className={`text-lg font-bold ${getStatusColor()}`}>{status}</p>
      </div>

      {/* Status indicators */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span className="text-muted-foreground">0-30%: Concentrado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning"></div>
          <span className="text-muted-foreground">30-60%: Distracción Leve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-error"></div>
          <span className="text-muted-foreground">60-100%: Distracción Alta</span>
        </div>
      </div>
    </Card>
  )
}
