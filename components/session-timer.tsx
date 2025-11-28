"use client"

interface SessionTimerProps {
  duration: number
}

export default function SessionTimer({ duration }: SessionTimerProps) {
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60

  return (
    <div className="font-mono text-lg font-bold text-primary-foreground">
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </div>
  )
}
