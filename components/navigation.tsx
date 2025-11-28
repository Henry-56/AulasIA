"use client"

import { BarChart3, Settings, Book, Eye, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export default function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const navItems = [
    { id: "teacher", label: "Panel Docente", icon: GraduationCap },
    { id: "session", label: "Sesión de Estudio", icon: Eye },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Focus Guardian
          </div>
          <div className="hidden md:flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.id)}
                  className="flex items-center gap-2"
                >
                  <Icon size={18} />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
        <div className="md:hidden flex gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`p-2 rounded transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
