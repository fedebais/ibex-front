"use client"

import { useUser } from "../../context/UserContext"
import { useEffect, useState } from "react"
import { getStats } from "../../services/api"
import type { PilotDashboardData } from "../../types/api"

interface PilotHomeProps {
  darkMode: boolean
  selectedMonth: number
}

const PilotHome = ({ darkMode = false }: PilotHomeProps) => {
  const { user, accessToken } = useUser()
  const [dashboardData, setDashboardData] = useState<PilotDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPilotData = async () => {
      try {
        console.log("Access token from context:", accessToken ? "exists" : "missing")
        console.log("User:", user)

        if (!accessToken) {
          setError("No access token found")
          return
        }

        // Crear parámetros para el mes actual
        const currentDate = new Date()
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`

        console.log("Calling getStats with month:", currentMonth)
        const response = await getStats({ month: currentMonth }, accessToken)
        console.log("Stats response:", response)

        // Convertir la respuesta al tipo correcto usando unknown primero
        setDashboardData(response as unknown as PilotDashboardData)
        setError(null)
      } catch (error) {
        console.error("Error loading pilot data:", error)
        setError(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setLoading(false)
      }
    }

    if (accessToken) {
      loadPilotData()
    } else {
      setLoading(false)
      setError("No access token available")
    }
  }, [user, accessToken])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Cargando datos del piloto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        <p>Error al cargar los datos del piloto:</p>
        <p className="text-red-500 mt-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
        No se pudieron cargar los datos del piloto.
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Reintentar
        </button>
      </div>
    )
  }

  // Clases condicionales para tarjetas
  const cardClass = darkMode
    ? "bg-gray-800 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-200"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Bienvenido, {user?.firstName}</h1>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Total de Vuelos
                </dt>
                <dd className="text-lg font-semibold">{dashboardData.totalFlights}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Horas de Vuelo
                </dt>
                <dd className="text-lg font-semibold">{dashboardData.totalHours}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Próximos Vuelos
                </dt>
                <dd className="text-lg font-semibold">{dashboardData.upcomingFlights}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Vuelos Completados
                </dt>
                <dd className="text-lg font-semibold">{dashboardData.completedFlights}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos vuelos */}
      <div className={`${cardClass} shadow rounded-lg overflow-hidden`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Próximos Vuelos</h3>
        </div>
        <div className={cardClass}>
          {dashboardData.nextFlights && dashboardData.nextFlights.length > 0 ? (
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {dashboardData.nextFlights.map((flight) => (
                <li key={flight.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <p className={`text-sm font-medium ${darkMode ? "text-orange-400" : "text-orange-600"} md:w-24`}>
                        {new Date(flight.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                      </p>
                      <div className="mt-2 md:mt-0 md:ml-4">
                        <p className="text-sm font-medium">Destino: {flight.destination.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {flight.helicopter.model.name} ({flight.helicopter.registration}) |{" "}
                          {new Date(flight.startTime).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Programado
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`px-4 py-5 sm:px-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No tienes vuelos programados.
            </div>
          )}
        </div>
      </div>

      {/* Vuelos recientes */}
      <div className={`${cardClass} shadow rounded-lg overflow-hidden`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Vuelos Recientes</h3>
        </div>
        <div className={cardClass}>
          {dashboardData.recentFlights && dashboardData.recentFlights.length > 0 ? (
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {dashboardData.recentFlights.slice(0, 3).map((flight) => (
                <li key={flight.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <p className={`text-sm font-medium ${darkMode ? "text-orange-400" : "text-orange-600"} md:w-24`}>
                        {new Date(flight.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                      </p>
                      <div className="mt-2 md:mt-0 md:ml-4">
                        <p className="text-sm font-medium">Destino: {flight.destination.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {flight.helicopter.model.name} ({flight.helicopter.registration}) | {flight.odometer} horas
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Completado
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`px-4 py-5 sm:px-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No tienes vuelos recientes.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PilotHome
