import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import Navbar from "../../components/ui/Navbar"
import Sidebar from "../../components/ui/Sidebar"
import PilotHome from "./PilotHome"
import FlightHistory from "./FlightHistory"
import NewFlightLog from "./NewFlightLog"
import PilotProfile from "./PilotProfile"
import { LayoutDashboard, FileText, Plus, User, Menu } from "lucide-react"

const PilotDashboard = () => {
  const { user } = useUser()
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
      path: "/pilot",
      label: "Inicio",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/pilot/history",
      label: "Historial de Vuelos",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      path: "/pilot/new-flight",
      label: "Nueva Bitácora",
      icon: <Plus className="w-5 h-5" />,
    },
    {
      path: "/pilot/profile",
      label: "Mi Perfil",
      icon: <User className="w-5 h-5" />,
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
          <Navbar
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            isSidebarCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />

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

          {/* Contenido principal con scroll */}
          <main
            className={`flex-1 pt-20 pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto ${
              darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
            }`}
          >
            <Routes>
              <Route path="/" element={<PilotHome darkMode={darkMode} />} />
              <Route path="/history" element={<FlightHistory darkMode={darkMode} />} />
              <Route path="/new-flight" element={<NewFlightLog darkMode={darkMode} />} />
              <Route path="/profile" element={<PilotProfile darkMode={darkMode} />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PilotDashboard
