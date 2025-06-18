"use client"

import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { useTheme } from "../../context/ThemeContext"
import Navbar from "../../components/ui/Navbar"
import Sidebar from "../../components/ui/Sidebar"
import TechnicianHome from "./TechnicianHome"
import TechnicianHelicoptersList from "./TechnicianHelicoptersList"
import Calendar from "../admin/Calendar"
import { LayoutDashboard, Plane, Menu, CalendarIcon } from "lucide-react"

const TechnicianDashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  const sidebarItems = [
    {
      path: "/technician",
      label: "Inicio",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/technician/helicopters",
      label: "Helicópteros",
      icon: <Plane className="w-5 h-5" />,
    },
    {
      path: "/technician/calendar",
      label: "Calendario",
      icon: <CalendarIcon className="w-5 h-5" />,
    },
  ]

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar items={sidebarItems} isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

        {/* Contenido principal */}
        <div
          className={`transition-all duration-300 ${isSidebarCollapsed ? "md:ml-16" : "md:ml-64"} ml-0 h-screen flex flex-col`}
        >
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isSidebarCollapsed={isSidebarCollapsed} />

          {/* Contenido principal con scroll */}
          <main
            className={`flex-1 pt-16 pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto ${
              darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
            }`}
          >
            <Routes>
              <Route path="/" element={<TechnicianHome darkMode={darkMode} />} />
              <Route path="/helicopters" element={<TechnicianHelicoptersList darkMode={darkMode} />} />
              <Route path="/calendar" element={<Calendar />} />
            </Routes>
          </main>

          {/* Botón flotante para móvil (visible siempre en móvil) */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="fixed bottom-4 right-4 z-40 p-3 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 focus:outline-none"
              aria-label="Toggle Sidebar"
            >
              <Menu size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TechnicianDashboard
