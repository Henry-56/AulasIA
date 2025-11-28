"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Save, Copy, Eye, EyeOff, Bell, Clock, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SettingsProps {
  onNavigate: (page: string) => void
}

interface Settings {
  apiKey: string
  distractionThreshold: number
  studyDuration: number
  breakDuration: number
  enableNotifications: boolean
  enableSound: boolean
  theme: "dark" | "light"
  emailReminders: boolean
}

const defaultSettings: Settings = {
  apiKey: "",
  distractionThreshold: 50,
  studyDuration: 45,
  breakDuration: 5,
  enableNotifications: true,
  enableSound: true,
  theme: "dark",
  emailReminders: false,
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("focusGuardianSettings")
    if (saved) {
      try {
        setSettings(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("focusGuardianSettings", JSON.stringify(settings))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
    toast({
      title: "Configuración Guardada",
      description: "Tus preferencias han sido actualizadas exitosamente.",
    })
  }

  const handleExportData = () => {
    setIsExporting(true)
    try {
      const sessions = JSON.parse(localStorage.getItem("focusGuardianSessions") || "[]")
      const data = {
        settings,
        sessions,
        exportedAt: new Date().toISOString(),
      }

      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `focus-guardian-data-${new Date().toISOString().split("T")[0]}.json`
      link.click()

      toast({
        title: "Datos Exportados",
        description: "Tus datos han sido exportados exitosamente.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        title: "Exportación Fallida",
        description: "Hubo un error al exportar tus datos.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const copyApiKey = () => {
    if (settings.apiKey) {
      navigator.clipboard.writeText(settings.apiKey)
      toast({
        title: "Copiado",
        description: "Clave API copiada al portapapeles.",
      })
    }
  }

  const handleClearData = () => {
    if (confirm("¿Estás seguro? Esto borrará todos tus datos de sesión. Esta acción no se puede deshacer.")) {
      localStorage.removeItem("focusGuardianSessions")
      toast({
        title: "Datos Borrados",
        description: "Todos los datos de sesión han sido borrados.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Configuración y Ajustes</h1>
        <p className="text-muted-foreground">Configura tus preferencias de Focus Guardian y ajustes de API</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Configuration */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              Configuración de API Gemini Live
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Clave API <span className="text-error">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={settings.apiKey}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                      placeholder="Ingresa tu clave API de Gemini"
                      className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <Button
                    onClick={copyApiKey}
                    variant="outline"
                    className="border-border hover:bg-secondary/30 bg-transparent"
                    disabled={!settings.apiKey}
                  >
                    <Copy size={18} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Obtén tu clave API de{" "}
                  <a href="#" className="text-primary hover:underline">
                    Google AI Studio
                  </a>
                  . Nunca compartas tu clave API.
                </p>
              </div>

              <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Cómo funciona:</span> Focus Guardian envía cuadros de video a la API de Gemini Live
                  cada 30 segundos para análisis de distracción en tiempo real.
                </p>
              </div>
            </div>
          </Card>

          {/* Distraction Detection Settings */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Eye size={20} className="text-accent" />
              Detección de Distracciones
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Umbral de Distracción: {settings.distractionThreshold}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="5"
                  value={settings.distractionThreshold}
                  onChange={(e) => setSettings({ ...settings, distractionThreshold: Number.parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Alertar cuando el nivel de distracción exceda este umbral
                </p>
              </div>

              <div className="p-3 bg-secondary/30 rounded-lg border border-border">
                <p className="text-sm text-foreground mb-2 font-semibold">Comportamientos Detectados:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Presencia de teléfono y movimientos de manos</li>
                  <li>• Posición de la cabeza y contacto visual</li>
                  <li>• Expresiones faciales (bostezos, fatiga)</li>
                  <li>• Análisis de postura</li>
                  <li>• Distracciones ambientales</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Study Session Preferences */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={20} className="text-warning" />
              Preferencias de Sesión de Estudio
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Duración de Estudio (minutos): {settings.studyDuration}
                </label>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={settings.studyDuration}
                  onChange={(e) => setSettings({ ...settings, studyDuration: Number.parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">Recomendado: 45-60 minutos para concentración óptima</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Duración del Descanso (minutos): {settings.breakDuration}
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={settings.breakDuration}
                  onChange={(e) => setSettings({ ...settings, breakDuration: Number.parseInt(e.target.value) })}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground mt-2">Recomendado: 5-10 minutos entre sesiones</p>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Bell size={20} className="text-success" />
              Notificaciones
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-foreground">Notificaciones del Navegador</p>
                  <p className="text-sm text-muted-foreground">Recibe alertas cuando se detecte una distracción</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableNotifications}
                  onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                  className="w-6 h-6 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-foreground">Alertas de Sonido</p>
                  <p className="text-sm text-muted-foreground">Reproducir sonido en eventos de alta distracción</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableSound}
                  onChange={(e) => setSettings({ ...settings, enableSound: e.target.checked })}
                  className="w-6 h-6 accent-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border">
                <div>
                  <p className="font-semibold text-foreground">Recordatorios por Email</p>
                  <p className="text-sm text-muted-foreground">Emails de resumen de rendimiento semanal</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.emailReminders}
                  onChange={(e) => setSettings({ ...settings, emailReminders: e.target.checked })}
                  className="w-6 h-6 accent-primary"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Data Management */}
        <div className="space-y-6">
          {/* Save Status */}
          {isSaved && (
            <Card className="bg-success/10 border border-success/20 p-4 rounded-lg">
              <p className="text-success text-sm font-semibold">✓ Configuración guardada exitosamente</p>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumen de Datos</h3>
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Sesiones Totales</p>
                <p className="text-2xl font-bold text-primary">
                  {(() => {
                    const sessions = localStorage.getItem("focusGuardianSessions")
                    return sessions ? JSON.parse(sessions).length : 0
                  })()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm mb-1">Tiempo Total de Estudio</p>
                <p className="text-2xl font-bold text-accent">
                  {(() => {
                    const sessions = localStorage.getItem("focusGuardianSessions")
                    if (!sessions) return "0h"
                    const total = JSON.parse(sessions).reduce((sum: number, s: any) => sum + (s.duration || 0), 0)
                    return `${Math.floor(total / 3600)}h ${Math.floor((total % 3600) / 60)}m`
                  })()}
                </p>
              </div>
            </div>
          </Card>

          {/* Data Management */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Gestión de Datos</h3>
            <div className="space-y-3">
              <Button
                onClick={handleExportData}
                disabled={isExporting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isExporting ? "Exportando..." : "Exportar Todos los Datos"}
              </Button>
              <Button
                onClick={handleClearData}
                variant="outline"
                className="w-full border-error hover:bg-error/10 text-error bg-transparent"
              >
                Borrar Datos de Sesión
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              La exportación incluye configuración, historial de sesiones y datos de análisis en formato JSON.
            </p>
          </Card>

          {/* Theme Selection */}
          <Card className="bg-card border-border p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-foreground mb-4">Visualización</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === "dark"}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as "dark" | "light" })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-foreground">Tema Oscuro</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={settings.theme === "light"}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value as "dark" | "light" })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-foreground">Tema Claro</span>
              </label>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Guardar Configuración
          </Button>
        </div>
      </div>
    </div>
  )
}
