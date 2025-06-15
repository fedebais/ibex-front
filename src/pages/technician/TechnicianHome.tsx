"use client"

import { useState, useEffect } from "react"
import { api } from "../../services/api"
import type { Helicopter } from "../../types/api"

interface TechnicianHomeProps {
  darkMode: boolean
}

const TechnicianHome = ({ darkMode }: TechnicianHomeProps) => {
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHelicopters()
  }, [])

  const loadHelicopters = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem("ibex_access_token")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const data = await api.getHelicopters(token)
      setHelicopters(data)
    } catch (err) {
      console.error("Error al cargar los helicópteros:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los helicópteros")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusText = (status: string | null) => {
    if (!status) return "Desconocido"
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "Activo"
      case "INACTIVE":
        return "Inactivo"
      case "MAINTENANCE":
        return "Mantenimiento"
      default:
        return status
    }
  }

  const getStatusClasses = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800"
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-red-100 text-red-800"
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeHelicopters = helicopters.filter((h) => h.status === "ACTIVE").length
  const maintenanceHelicopters = helicopters.filter((h) => h.status === "MAINTENANCE").length
  const inactiveHelicopters = helicopters.filter((h) => h.status === "INACTIVE").length

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`p-6 text-center rounded-lg shadow border ${darkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-700 border-gray-200"}`}
      >
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadHelicopters}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className={`text-2xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Panel de Técnico</h1>
      </div>

      {/* Estadísticas de la flota */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div
          className={`p-6 rounded-lg shadow ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Total Helicópteros
                </dt>
                <dd className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopters.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Activos
                </dt>
                <dd className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {activeHelicopters}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  En Mantenimiento
                </dt>
                <dd className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {maintenanceHelicopters}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div
          className={`p-6 rounded-lg shadow ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium truncate ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Inactivos
                </dt>
                <dd className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {inactiveHelicopters}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de helicópteros que requieren atención */}
      <div
        className={`rounded-lg shadow border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
            Helicópteros que Requieren Atención
          </h3>
        </div>
        <div className="px-6 py-4">
          {maintenanceHelicopters > 0 ? (
            <div className="space-y-3">
              {helicopters
                .filter((h) => h.status === "MAINTENANCE")
                .map((helicopter) => (
                  <div
                    key={helicopter.id}
                    className={`flex items-center justify-between p-3 rounded-md ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={helicopter.imageUrl || "/placeholder.svg?height=40&width=60&query=helicopter"}
                        alt={helicopter.model?.name || "Helicóptero"}
                        className="w-12 h-8 object-cover rounded"
                      />
                      <div>
                        <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {helicopter.model?.name || "Modelo desconocido"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {helicopter.registration || "Sin matrícula"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(helicopter.status)}`}
                    >
                      {getStatusText(helicopter.status)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No hay helicópteros que requieran mantenimiento en este momento.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TechnicianHome
