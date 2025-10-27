"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"
import { api } from "../services/api"
import type { User, UserRole, LoginResponse } from "../types/api"

interface UserContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Efecto para restaurar la sesión desde localStorage al cargar la página
  useEffect(() => {
    const restoreSession = () => {
      try {
        console.log("Restaurando sesión desde localStorage...")
        const savedUser = localStorage.getItem("ibex_user")
        const savedToken = localStorage.getItem("ibex_access_token")

        console.log("Usuario guardado:", savedUser)
        console.log("Token guardado:", savedToken ? "Existe" : "No existe")

        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser)
          console.log("Datos del usuario restaurados:", userData)
          setUser(userData)
          setAccessToken(savedToken)
        }
      } catch (error) {
        console.error("Error al restaurar la sesión:", error)
        // Limpiar localStorage si hay datos corruptos
        localStorage.removeItem("ibex_user")
        localStorage.removeItem("ibex_access_token")
        localStorage.removeItem("ibex_user_id")
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Llamando a API login con:", email)
      const response: LoginResponse = await api.login(email, password)
      console.log("Respuesta de API login:", response)

      // Crear el objeto user sin el accessToken
      const userData: User = {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        phone: response.phone,
        active: response.active,
        role: response.role as UserRole,
        pilot: response.pilot, // Include pilot data if present
      }

      console.log("Datos de usuario procesados:", userData)

      // Guardar en el estado
      setUser(userData)
      setAccessToken(response.accessToken)

      // Guardar en localStorage
      localStorage.setItem("ibex_user", JSON.stringify(userData))
      localStorage.setItem("ibex_access_token", response.accessToken)
      localStorage.setItem("ibex_user_id", response.id.toString())

      console.log("Datos guardados en localStorage")
      console.log("isAuthenticated:", !!userData && !!response.accessToken)

      return true
    } catch (error) {
      console.error("Error en login:", error)
      return false
    }
  }

  const logout = () => {
    console.log("Cerrando sesión...")
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem("ibex_user")
    localStorage.removeItem("ibex_access_token")
    localStorage.removeItem("ibex_user_id")
    console.log("Sesión cerrada")
  }

  return (
    <UserContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// Exportar tipos para compatibilidad
export type { UserRole, User }
