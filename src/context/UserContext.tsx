import { createContext, useState, useContext, type ReactNode } from "react"
import { mockUsers } from "../data/mockData"

export type UserRole = "pilot" | "operator" | "admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}

interface UserContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("ibex_user")
    return savedUser ? JSON.parse(savedUser) : null
  })

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de autenticación con datos mock
    // En una aplicación real, esto sería una llamada a una API
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find((u) => u.email === email && password === "123456")

        if (foundUser) {
          const userData: User = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            role: foundUser.role as UserRole,
            avatar: foundUser.avatar,
          }

          setUser(userData)
          localStorage.setItem("ibex_user", JSON.stringify(userData))
          resolve(true)
        } else {
          resolve(false)
        }
      }, 800) // Simular delay de red
    })
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ibex_user")
  }

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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
