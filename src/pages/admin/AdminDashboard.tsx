import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
// import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import Navbar from "../../components/ui/Navbar"
import Sidebar from "../../components/ui/Sidebar"
import AdminHome from "./AdminHome"
import PilotsList from "./PilotsList"
import HelicoptersList from "./HelicoptersList"
import FlightLogs from "./FlightLogs"
import ClientsList from "./ClientsList"
import HoursAnalysis from "./HoursAnalysis"
import AdminSettings from "./AdminSettings"
import { LayoutDashboard, Users, Plane, FileText, Building2, Clock, Settings, Menu } from "lucide-react"

const AdminDashboard = () => {
  // const { user } = useUser()
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
      path: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      path: "/admin/pilots",
      label: "Pilotos",
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: "/admin/helicopters",
      label: "Helicópteros",
      icon: <Plane className="w-5 h-5" />,
    },
    {
      path: "/admin/flights",
      label: "Bitácoras de Vuelo",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      path: "/admin/clients",
      label: "Clientes",
      icon: <Building2 className="w-5 h-5" />,
    },
    {
      path: "/admin/hours-analysis",
      label: "Análisis de Horas",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      path: "/admin/settings",
      label: "Configuración",
      icon: <Settings className="w-5 h-5" />,
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
              <Route path="/" element={<AdminHome darkMode={darkMode} />} />
              <Route path="/pilots" element={<PilotsList darkMode={darkMode} />} />
              <Route path="/helicopters" element={<HelicoptersList darkMode={darkMode} />} />
              <Route path="/flights" element={<FlightLogs darkMode={darkMode} />} />
              <Route path="/clients" element={<ClientsList darkMode={darkMode} />} />
              <Route path="/hours-analysis" element={<HoursAnalysis darkMode={darkMode} />} />
              <Route path="/settings" element={<AdminSettings darkMode={darkMode} />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
