"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import Navbar from "../../components/ui/Navbar"
import Sidebar from "../../components/ui/Sidebar"
import PilotHome from "./PilotHome"
import FlightHistory from "./FlightHistory"
import NewFlightLog from "./NewFlightLog"
import PilotProfile from "./PilotProfile"
import Calendar from "./Calendar"
import { LayoutDashboard, FileText, Plus, User, Menu, CalendarDays, ChevronDown } from "lucide-react"

const PilotDashboard = () => {
  const { user } = useUser()
  const { darkMode, toggleDarkMode } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // Inicializar con el mes actual o el guardado en localStorage
    const savedMonth = localStorage.getItem("selectedMonth")
    return savedMonth ? Number.parseInt(savedMonth) : new Date().getMonth()
  })
  const [isMonthSelectorOpen, setIsMonthSelectorOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === "/pilot" || location.pathname === "/pilot/"

  // Guardar el mes seleccionado en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem("selectedMonth", selectedMonth.toString())
  }, [selectedMonth])

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
      path: "/pilot/calendar",
      label: "Calendario",
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      path: "/pilot/profile",
      label: "Mi Perfil",
      icon: <User className="w-5 h-5" />,
    },
  ]

  const months = [
    "Todos",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const handleMonthChange = (monthIndex) => {
    setSelectedMonth(monthIndex)
    setIsMonthSelectorOpen(false)
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <Sidebar items={sidebarItems} isCollapsed={isSidebarCollapsed} toggleCollapse={toggleSidebar} />

        {/* Contenido principal */}
        <div
          className={`transition-all duration-300 ${isSidebarCollapsed ? "md:ml-16" : "md:ml-64"} ml-0 h-screen flex flex-col`}
        >
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isSidebarCollapsed={isSidebarCollapsed} />

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
            {/* Selector de mes - solo visible en la página de inicio */}
            {isHomePage && (
              <div className="mb-6 flex justify-end">
                <div className="relative">
                  <button
                    onClick={() => setIsMonthSelectorOpen(!isMonthSelectorOpen)}
                    className={`flex items-center justify-between px-4 py-2 rounded-md ${
                      darkMode
                        ? "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                        : "bg-white text-gray-900 hover:bg-gray-50 border border-gray-200"
                    } shadow-sm transition-colors duration-200 w-40`}
                    aria-haspopup="listbox"
                    aria-expanded={isMonthSelectorOpen}
                  >
                    <span>{selectedMonth === 0 ? "Todos los meses" : months[selectedMonth]}</span>
                    <ChevronDown
                      size={16}
                      className={`ml-2 transition-transform duration-200 ${isMonthSelectorOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isMonthSelectorOpen && (
                    <div
                      className={`absolute right-0 mt-1 w-40 rounded-md shadow-lg z-10 ${
                        darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                      }`}
                    >
                      <ul className={`py-1 max-h-60 overflow-auto rounded-md`} role="listbox">
                        {months.map((month, index) => (
                          <li
                            key={index}
                            onClick={() => handleMonthChange(index)}
                            className={`px-4 py-2 cursor-pointer ${
                              darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-900"
                            } ${selectedMonth === index ? (darkMode ? "bg-gray-700" : "bg-gray-100") : ""}`}
                            role="option"
                            aria-selected={selectedMonth === index}
                          >
                            {index === 0 ? "Todos los meses" : month}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Routes>
              <Route path="/" element={<PilotHome darkMode={darkMode} selectedMonth={selectedMonth} />} />
              <Route path="/history" element={<FlightHistory darkMode={darkMode} />} />
              <Route path="/new-flight" element={<NewFlightLog darkMode={darkMode} />} />
              <Route path="/calendar" element={<Calendar darkMode={darkMode} />} />
              <Route path="/profile" element={<PilotProfile darkMode={darkMode} />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  )
}

export default PilotDashboard
