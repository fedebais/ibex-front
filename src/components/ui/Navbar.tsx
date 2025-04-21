import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useUser } from "../../context/UserContext"
import { Sun, Moon, User, LogOut } from "lucide-react"

interface NavbarProps {
  darkMode: boolean
  toggleDarkMode: () => void
  isSidebarCollapsed: boolean
  
}

const Navbar = ({ darkMode, toggleDarkMode, isSidebarCollapsed }: NavbarProps) => {
  const { user, logout } = useUser()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  // Log para depuración
  console.log("Navbar: darkMode =", darkMode)

  // Efecto para verificar el tema actual
  useEffect(() => {
    console.log("Navbar: useEffect - darkMode =", darkMode)
    console.log("Navbar: document.documentElement.classList =", document.documentElement.classList.toString())
  }, [darkMode])

  const handleToggleDarkMode = () => {
    console.log("Navbar: handleToggleDarkMode - antes:", darkMode)
    toggleDarkMode()
    // Verificar después de un pequeño retraso
    setTimeout(() => {
      console.log("Navbar: después del toggle - classList =", document.documentElement.classList.toString())
    }, 100)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <nav
      className={`fixed top-0 right-0 z-30 h-16 transition-all duration-300 ${
        isSidebarCollapsed ? "md:left-16" : "md:ml-64"
      } left-0 ${
        darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-200 text-gray-900"
      } border-b`}
    >
      <div className="h-full px-4 flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleToggleDarkMode}
            className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${
              darkMode ? "text-gray-300" : "text-gray-500"
            }`}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="hidden md:flex items-center">
            <span className={`text-base font-normal mr-5 ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
              {user?.role === "pilot" ? "Piloto" : user?.role === "admin" ? "Administrador" : "Operador"}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={`flex items-center p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${
                darkMode ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {user?.avatar ? (
                <img src={user.avatar || "/placeholder.svg"} className="w-8 h-8 rounded-full" alt={user.name} />
              ) : (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                  {user?.name?.charAt(0)}
                </div>
              )}
              <span className="ml-2 text-sm font-medium hidden md:block">{user?.name}</span>
            </button>

            {showDropdown && (
              <div
                className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 border ${
                  darkMode ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-white border-gray-200 text-gray-700"
                }`}
              >
                <Link
                  to="/profile"
                  className={`flex items-center px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={16} className="mr-2" />
                  Mi Perfil
                </Link>
                <button
                  onClick={() => {
                    setShowDropdown(false)
                    handleLogout()
                  }}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm hover:bg-opacity-10 hover:bg-gray-500 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <LogOut size={16} className="mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
