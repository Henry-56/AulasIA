"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import Dashboard from "@/components/dashboard"
import TeacherDashboard from "@/components/teacher-dashboard"
import LiveSession from "@/components/live-session"
import AnalysisReport from "@/components/analysis-report"
import Settings from "@/components/settings"
import { VideoAnalyzer } from "@/components/video-analyzer"

type Page = "dashboard" | "teacher" | "session" | "analysis" | "settings" | "test"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("teacher")

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page)
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} />
      case "teacher":
        return <TeacherDashboard onNavigate={handleNavigate} />
      case "session":
        return <LiveSession onNavigate={handleNavigate} />
      case "analysis":
        return <AnalysisReport onNavigate={handleNavigate} />
      case "settings":
        return <Settings onNavigate={handleNavigate} />
      case "test":
        return (
          <div className="container mx-auto py-8">
            <VideoAnalyzer />
          </div>
        )
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="pt-20">{renderPage()}</main>
    </div>
  )
}
