"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useUser, type UserRole } from "../context/UserContext"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useUser()
  const location = useLocation()

  useEffect(() => {
    console.log("ProtectedRoute - Ruta actual:", location.pathname)
    console.log("ProtectedRoute - isLoading:", isLoading)
    console.log("ProtectedRoute - isAuthenticated:", isAuthenticated)
    console.log("ProtectedRoute - user:", user)
    console.log("ProtectedRoute - allowedRoles:", allowedRoles)

    if (user) {
      console.log("ProtectedRoute - Rol del usuario:", user.role)
      console.log("ProtectedRoute - ¿Rol permitido?:", allowedRoles.includes(user.role))
    }
  }, [location.pathname, isLoading, isAuthenticated, user, allowedRoles])

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    console.log("ProtectedRoute - Mostrando loading...")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute - No autenticado, redirigiendo a /login")
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    console.log("ProtectedRoute - Rol no permitido:", user.role)
    // Redirigir al dashboard correspondiente según el rol
    if (user.role === "PILOT") {
      console.log("ProtectedRoute - Redirigiendo a /pilot")
      return <Navigate to="/pilot" replace />
    } else if (user.role === "ADMIN" || user.role === "TECNICO") {
      console.log("ProtectedRoute - Redirigiendo a /admin")
      return <Navigate to="/admin" replace />
    } else {
      console.log("ProtectedRoute - Rol desconocido, redirigiendo a /login")
      return <Navigate to="/login" replace />
    }
  }

  console.log("ProtectedRoute - Acceso permitido, mostrando contenido")
  return <>{children}</>
}

export default ProtectedRoute
