"use client"

import { useUser } from "../../context/UserContext"
import { useEffect, useState } from "react"
import { getStats } from "../../services/api"
import type { PilotDashboardData } from "../../types/api"
import { formatDate, formatDateLong } from "../../utils/dateUtils"

interface PilotHomeProps {
  darkMode: boolean
  selectedMonth: number
}

const PilotHome = ({ darkMode = false }: PilotHomeProps) => {
  const { user, accessToken } = useUser()
  const [dashboardData, setDashboardData] = useState<PilotDashboardData | null>(null)
  const [medicalCertificate, setMedicalCertificate] = useState<any>(null)
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

        // Fetch medical certificate data
        try {
          const medicalResponse = await fetch("http://localhost:8080/medical-certificates/my-certificates", {
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json"
            }
          })

          if (medicalResponse.ok) {
            const medicalData = await medicalResponse.json()
            // Get the most recent active medical certificate
            const activeCert = medicalData
              .filter((cert: any) => cert.active)
              .sort((a: any, b: any) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime())[0]
            setMedicalCertificate(activeCert)
          }
        } catch (medicalError) {
          console.warn("Could not fetch medical certificate data:", medicalError)
        }

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

  // Functions for medical certificate alerts
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getMedicalAlertStatus = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate)

    if (daysUntilExpiry <= 7) {
      return { status: 'critical', color: 'red', message: `¡Vence en ${daysUntilExpiry} días!` }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'yellow', message: `Vence en ${daysUntilExpiry} días` }
    }
    return { status: 'good', color: 'green', message: `Vigente por ${daysUntilExpiry} días más` }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Bienvenido, {user?.firstName}</h1>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {formatDateLong(new Date().toISOString())}
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
                <dd className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} mt-1`}>
                  Solo vuelos completados
                </dd>
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

      {/* Medical Certificate Alert */}
      {medicalCertificate && (
        <div className={`${cardClass} rounded-lg shadow p-5 ${
          getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'critical'
            ? 'border-l-4 border-red-500'
            : getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'warning'
            ? 'border-l-4 border-yellow-500'
            : 'border-l-4 border-green-500'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${
              getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'critical'
                ? (darkMode ? 'bg-red-900/30' : 'bg-red-100')
                : getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'warning'
                ? (darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100')
                : (darkMode ? 'bg-green-900/30' : 'bg-green-100')
            }`}>
              <svg
                className={`h-6 w-6 ${
                  getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'critical'
                    ? (darkMode ? 'text-red-400' : 'text-red-600')
                    : getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'warning'
                    ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                    : (darkMode ? 'text-green-400' : 'text-green-600')
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Certificado Médico (Psicofísico)
                </dt>
                <dd className={`text-lg font-semibold ${
                  getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'critical'
                    ? 'text-red-600'
                    : getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'warning'
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {getMedicalAlertStatus(medicalCertificate.expiryDate).message}
                </dd>
                <dd className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"} mt-1`}>
                  Vence: {new Date(medicalCertificate.expiryDate).toLocaleDateString('es-ES')}
                </dd>
              </dl>
            </div>
            {(getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'critical' ||
              getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'warning') && (
              <div className="ml-4">
                {getMedicalAlertStatus(medicalCertificate.expiryDate).status === 'critical' ? (
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
                        {formatDate(flight.date)}
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
                        {formatDate(flight.date)}
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
