/**
 * Setup guide component for Gemini API integration
 *
 * Displayed in Settings to help users configure their API key
 */

import { Card } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function GeminiIntegrationGuide() {
  return (
    <Card className="bg-card border-border p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <AlertCircle className="text-warning" size={20} />
        Configurando la API de Gemini Live
      </h3>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-sm font-semibold">
              1
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Crear una Cuenta de Google AI</p>
            <p className="text-sm text-muted-foreground">
              Visita <code className="text-xs bg-secondary/30 px-1 rounded">ai.google.dev</code>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-sm font-semibold">
              2
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Obtén Tu Clave API</p>
            <p className="text-sm text-muted-foreground">
              Ve a Google AI Studio y genera una clave API para la API de Gemini Live
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/20 text-primary text-sm font-semibold">
              3
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Pegar en Configuración</p>
            <p className="text-sm text-muted-foreground">Agrega la clave API al campo de configuración arriba</p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-success/20 text-success text-sm font-semibold">
              ✓
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Comienza a Detectar Distracciones</p>
            <p className="text-sm text-muted-foreground">Inicia una sesión de estudio y deja que Gemini analice tu concentración</p>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Cómo funciona:</span> Focus Guardian usa las capacidades de visión de Gemini para
          analizar tus cuadros de video en tiempo real, identificando distracciones como presencia de teléfono, problemas de postura y
          señales de fatiga cada 30 segundos durante las sesiones de estudio.
        </p>
      </div>
    </Card>
  )
}
