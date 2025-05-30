import type React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { ChevronLeft, LogOut } from "lucide-react"

interface SidebarProps {
  items: {
    path: string
    label: string
    icon: React.ReactNode
  }[]
  isCollapsed: boolean
  toggleCollapse: () => void
}

const Sidebar = ({ items, isCollapsed, toggleCollapse }: SidebarProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const {  logout } = useUser()
  const { darkMode } = useTheme()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const isActive = (path: string) => {
    // Verificar si la ruta actual coincide exactamente con la ruta del elemento
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } ${isMobile && !isCollapsed ? "translate-x-0" : isMobile ? "-translate-x-full" : "translate-x-0"} ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      } border-r overflow-hidden`}
    >
      {/* Header del sidebar */}
      <div className="flex items-center justify-between h-16 px-4 bg-orange-600">
        {isCollapsed ? (
          <div className="w-full flex items-center justify-center cursor-pointer" onClick={toggleCollapse}>
            <img src="/goat.png" className="h-8" alt="IBEX" />
          </div>
        ) : (
          <div className="w-full flex items-center justify-between">
            <img src="/logowhite.png" className="h-6" alt="IBEX" />
            <button
              onClick={toggleCollapse}
              className="text-white p-2 rounded-md hover:bg-orange-700 focus:outline-none"
              aria-label="Collapse Sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? darkMode
                      ? "bg-orange-900/30 text-orange-300"
                      : "bg-orange-100 text-orange-700"
                    : darkMode
                      ? "text-gray-300 hover:bg-gray-700"
                      : "text-gray-700 hover:bg-gray-100"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : ""}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Botón de cierre de sesión */}
      <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md ${
            darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
          } ${isCollapsed ? "justify-center" : ""}`}
          title={isCollapsed ? "Cerrar Sesión" : ""}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
