"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "../context/UserContext"
import { Eye, EyeOff } from "lucide-react"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useUser()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Intentando login con:", email)
      const success = await login(email.trim().toLowerCase(), password.trim())

      console.log("Resultado del login:", success)

      if (success) {
        // Obtener datos del usuario del contexto
        const userData = localStorage.getItem("ibex_user")
        console.log("Datos del usuario:", userData)

        if (userData) {
          const user = JSON.parse(userData)
          console.log("Rol del usuario:", user.role)

          if (user.role === "PILOT") {
            console.log("Redirigiendo a /pilot")
            navigate("/pilot")
          } else if (user.role === "TECNICO") {
            console.log("Redirigiendo a /technician")
            navigate("/technician")
          } else if (user.role === "GROUND_SUPPORT") {
            console.log("Redirigiendo a /ground-support")
            navigate("/ground-support")
          } else {
            console.log("Redirigiendo a /admin")
            navigate("/admin")
          }
        }
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      console.error("Error completo:", err)
      setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="IBEX Logo" className="h-16" />
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">Iniciar Sesión</h2>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="ejemplo@ibexheli.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoCapitalize="none"
                    autoCorrect="off"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-gray-900 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => navigate("/password-recovery")}
                    className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
