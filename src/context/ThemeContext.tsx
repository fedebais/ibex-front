"use client"

import { createContext, useState, useContext, useEffect, type ReactNode } from "react"

interface ThemeContextType {
  darkMode: boolean
  toggleDarkMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Inicializar explícitamente en modo claro
  console.log("ThemeProvider: Inicializando estado")
  const [darkMode, setDarkMode] = useState(() => {
    console.log("ThemeProvider: Estado inicial darkMode = true")
    return true
  })

  // Cargar preferencia guardada solo una vez al inicio
  useEffect(() => {
    console.log("ThemeProvider: Primer useEffect - Cargando preferencia guardada")

    // Aplicar clase dark por defecto
    document.documentElement.classList.add("dark")
    console.log("ThemeProvider: Clase 'dark' aplicada al documento por defecto")

    const savedTheme = localStorage.getItem("ibex_theme")
    console.log("ThemeProvider: Tema guardado en localStorage:", savedTheme)

    if (savedTheme === "light") {
      console.log("ThemeProvider: Aplicando modo claro desde localStorage")
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    } else {
      console.log("ThemeProvider: Aplicando modo oscuro (por defecto o desde localStorage)")
      // Asegurarse de que localStorage tenga el valor correcto para modo oscuro
      localStorage.setItem("ibex_theme", "dark")
    }
  }, [])

  // Este efecto se ejecuta cuando cambia el modo
  useEffect(() => {
    console.log("ThemeProvider: Segundo useEffect - darkMode cambiado a:", darkMode)

    if (darkMode) {
      console.log("ThemeProvider: Aplicando clase 'dark' al documento")
      document.documentElement.classList.add("dark")
      localStorage.setItem("ibex_theme", "dark")
    } else {
      console.log("ThemeProvider: Removiendo clase 'dark' del documento")
      document.documentElement.classList.remove("dark")
      localStorage.setItem("ibex_theme", "light")
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    console.log("ThemeProvider: toggleDarkMode llamado, estado actual:", darkMode)
    setDarkMode((prev) => {
      console.log("ThemeProvider: Cambiando darkMode de", prev, "a", !prev)
      return !prev
    })
  }

  console.log("ThemeProvider: Renderizando con darkMode =", darkMode)

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
