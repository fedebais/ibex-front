"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getSettings, updateSetting } from "../../services/api"
import { useUser } from "../../context/UserContext"

interface AdminSettingsProps {
  darkMode: boolean
}

const AdminSettings = ({ darkMode = false }: AdminSettingsProps) => {
  const { user, accessToken } = useUser()
  const [hourlyRate, setHourlyRate] = useState<string>("")
  const [currency, setCurrency] = useState<string>("USD")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string>("")

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    const loadSettings = async () => {
      console.log("🔍 Iniciando carga de configuraciones...")
      console.log("👤 Usuario:", user)
      console.log("🔑 Token:", accessToken ? "Disponible" : "No disponible")

      if (!accessToken) {
        console.log("❌ No hay token, saliendo...")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError("")

        console.log("📡 Llamando a getSettings...")
        const settings = await getSettings(accessToken)
        console.log("✅ Settings recibidos:", settings)

        // Buscar la configuración de precio por hora de vuelo
        const flightHourPrice = settings.find((setting) => setting.key === "flight_hour_price")
        if (flightHourPrice) {
          console.log("💰 Precio por hora encontrado:", flightHourPrice.value)
          setHourlyRate(flightHourPrice.value)
        } else {
          console.log("⚠️ No se encontró flight_hour_price")
        }

        // Buscar la configuración de moneda
        const currencySetting = settings.find((setting) => setting.key === "currency")
        if (currencySetting) {
          console.log("💱 Moneda encontrada:", currencySetting.value)
          setCurrency(currencySetting.value)
        } else {
          console.log("⚠️ No se encontró currency")
        }
      } catch (error) {
        console.error("❌ Error loading settings:", error)
        setError(`Error al cargar la configuración: ${error instanceof Error ? error.message : "Error desconocido"}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [accessToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("💾 Iniciando actualización de configuración...")
    console.log("👤 Usuario:", user)
    console.log("🔑 Token:", accessToken ? "Disponible" : "No disponible")
    console.log("💰 Nuevo precio:", hourlyRate)

    if (!accessToken) {
      setError("No hay token de autenticación")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      console.log("📡 Llamando a updateSetting...")
      await updateSetting("flight_hour_price", hourlyRate, accessToken)
      console.log("✅ Configuración actualizada exitosamente")

      setShowSuccess(true)

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("❌ Error updating settings:", error)
      setError(`Error al actualizar la configuración: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h1 className="text-2xl font-semibold">Configuración del Sistema</h1>
        </div>
        <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"} shadow rounded-lg p-6`}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Configuración del Sistema</h1>
      </div>

      {error && (
        <div
          className={`mb-6 border-l-4 border-red-500 p-4 rounded ${
            darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-800"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div
          className={`mb-6 border-l-4 border-green-500 p-4 rounded ${
            darkMode ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-800"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Configuración actualizada correctamente</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Tarifas de Vuelo</h3>
          <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Configura las tarifas por hora de vuelo para los pilotos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Tarifa estándar */}
            <div className="col-span-1">
              <label
                htmlFor="hourlyRate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Tarifa Estándar por Hora ({currency})
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-gray-500 sm:text-sm`}>$</span>
                </div>
                <input
                  type="number"
                  id="hourlyRate"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className={`pl-7 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Tarifa base para horas de vuelo en días laborables.
              </p>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode ? "focus:ring-offset-gray-800" : ""
              }`}
            >
              {isSubmitting ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </div>

      {/* Otras configuraciones */}
      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Configuración Adicional</h3>
          <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Otras configuraciones del sistema.
          </p>
        </div>

        <div className="p-6">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Próximamente se añadirán más opciones de configuración.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
