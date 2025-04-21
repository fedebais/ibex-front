"use client"

import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useUser, type UserRole } from "../context/UserContext"

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useUser()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    // Redirigir al dashboard correspondiente según el rol
    if (user.role === "pilot") {
      return <Navigate to="/pilot" replace />
    } else {
      return <Navigate to="/admin" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
