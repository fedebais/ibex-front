"use client"

import { useState, useEffect } from "react"
import { Routes, Route } from "react-router-dom"
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
// Importar los componentes UserManagement y Calendar
import UserManagement from "./UserManagement"
import Calendar from "./Calendar"
import Library from "./Library"
import {
  LayoutDashboard,
  Users,
  Plane,
  FileText,
  Building2,
  Clock,
  Send,
  Settings,
  Menu,
  CalendarDays,
  UserCog,
  Wrench,
  MapPin,
  Stethoscope,
} from "lucide-react"
import HelicopterModels from "./HelicopterModels"
import TechniciansList from "./TechniciansList"
import DestinationsList from "./DestinationsList"
import GroundSupportManagement from "./GroundSupportManagement"
import MedicalCertificatesManagement from "./MedicalCertificatesManagement"
import Qualifications from "./Qualifications"
import TrainingCourses from "./TrainingCourses"
import PracticalTraining from "./PracticalTraining"

const AdminDashboard = () => {
  const { darkMode, toggleDarkMode } = useTheme()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear] = useState(new Date().getFullYear())



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
      label: "Equipo",
      icon: <Users className="w-5 h-5" />,
      isSection: true,
      subsections: [
        {
          path: "/admin/pilots",
          label: "Pilotos",
          icon: <Users className="w-4 h-4" />,
        },
        {
          path: "/admin/ground-support",
          label: "Personal en Tierra",
          icon: <Users className="w-4 h-4" />,
        },
        {
          path: "/admin/technicians",
          label: "Técnicos",
          icon: <Wrench className="w-4 h-4" />,
        },
      ],
    },
    {
      path: "/admin/helicopters",
      label: "Helicópteros",
      icon: <Plane className="w-5 h-5" />,
    },
    {
      path: "/admin/helicopter-models",
      label: "Modelos de Helicópteros",
      icon: <Send className="w-5 h-5" />,
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
      path: "/admin/destinations",
      label: "Destinos",
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: "Documentos",
      icon: <FileText className="w-5 h-5" />,
      isSection: true,
      subsections: [
        {
          path: "/admin/library",
          label: "Biblioteca",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          path: "/admin/qualifications",
          label: "Habilitaciones",
          icon: <Users className="w-4 h-4" />,
        },
        {
          path: "/admin/training-courses",
          label: "Cursos de Capacitación",
          icon: <Users className="w-4 h-4" />,
        },
        {
          path: "/admin/practical-training",
          label: "Entrenamiento Práctico",
          icon: <Users className="w-4 h-4" />,
        },
        {
          path: "/admin/medical-certificates",
          label: "Psicofísicos",
          icon: <Stethoscope className="w-4 h-4" />,
        },
      ],
    },
    {
      path: "/admin/hours-analysis",
      label: "Análisis de Horas",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      path: "/admin/user-management",
      label: "Gestión de Usuarios",
      icon: <UserCog className="w-5 h-5" />,
    },
    {
      path: "/admin/calendar",
      label: "Calendario",
      icon: <CalendarDays className="w-5 h-5" />,
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
          <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} isSidebarCollapsed={isSidebarCollapsed} />

          {/* Contenido principal con scroll */}
          <main
            className={`flex-1 pt-16 pb-6 px-4 sm:px-6 lg:px-8 overflow-y-auto ${
              darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
            }`}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <AdminHome
                    darkMode={darkMode}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    onMonthChange={setSelectedMonth}
                     
                  />
                }
              />
              <Route path="/pilots" element={<PilotsList darkMode={darkMode} />} />
              <Route path="/technicians" element={<TechniciansList darkMode={darkMode} />} />
              <Route path="/ground-support" element={<GroundSupportManagement darkMode={darkMode} />} />
              <Route path="/helicopters" element={<HelicoptersList darkMode={darkMode} />} />
              <Route
                path="/flights"
                element={<FlightLogs darkMode={darkMode} selectedMonth={selectedMonth} selectedYear={selectedYear} />}
              />
              <Route path="/clients" element={<ClientsList darkMode={darkMode} />} />
              <Route path="/destinations" element={<DestinationsList darkMode={darkMode} />} />
              <Route path="/medical-certificates" element={<MedicalCertificatesManagement darkMode={darkMode} />} />
              <Route
                path="/hours-analysis"
                element={
                  <HoursAnalysis darkMode={darkMode} selectedMonth={selectedMonth} selectedYear={selectedYear} />
                }
              />
              <Route path="/settings" element={<AdminSettings darkMode={darkMode} />} />
              {/* Añadir las rutas para UserManagement y Calendar */}
              <Route path="/user-management" element={<UserManagement darkMode={darkMode} />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/library" element={<Library darkMode={darkMode} />} />
              <Route path="/helicopter-models" element={<HelicopterModels  />} />
              <Route path="/qualifications" element={<Qualifications darkMode={darkMode} />} />
              <Route path="/training-courses" element={<TrainingCourses darkMode={darkMode} />} />
              <Route path="/practical-training" element={<PracticalTraining darkMode={darkMode} />} />
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

export default AdminDashboard
