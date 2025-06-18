"use client"

import { useUser } from "../../context/UserContext"
import { getFlightLogs, getPilotByUserId } from "../../services/api"
import { useState, useEffect } from "react"
import type { FlightLog } from "../../types/api"

interface PilotProfileProps {
  darkMode: boolean
}

const PilotProfile = ({ darkMode = false }: PilotProfileProps) => {
  const { user, accessToken } = useUser()
  const [pilotData, setPilotData] = useState<any>(null)
  const [flights, setFlights] = useState<FlightLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPilotData = async () => {
      if (!user?.id || !accessToken) return

      try {
        setIsLoading(true)
        setError(null)

        console.log("Loading pilot data for user:", user.id) // Debug log

        // Cargar datos del piloto usando getPilotByUserId
        const pilotResponse = await getPilotByUserId(user.id, accessToken)
        console.log("Pilot response:", pilotResponse) // Debug log
        setPilotData(pilotResponse)

        // Cargar vuelos del piloto
        const flightsResponse = await getFlightLogs(accessToken)
        console.log("Flights response:", flightsResponse) // Debug log

        // Filtrar vuelos por pilotId
        const pilotFlights = flightsResponse.filter((flight: FlightLog) => flight.pilotId === pilotResponse.id)
        console.log("Filtered pilot flights:", pilotFlights) // Debug log
        setFlights(pilotFlights)
      } catch (err) {
        console.error("Error loading pilot data:", err)
        setError("Error al cargar los datos del piloto")
      } finally {
        setIsLoading(false)
      }
    }

    loadPilotData()
  }, [user?.id, accessToken])

  console.log(flights);

  // Calcular estadísticas
  // const totalFlightHours = flights.reduce((total, flight) => total + (flight.duration || 0), 0) / 60 // Convertir minutos a horas
  // const completedFlights = flights.filter((f) => f.status === "COMPLETED").length
  // const scheduledFlights = flights.filter((f) => f.status === "SCHEDULED").length

  // Estadísticas del mes actual
  // const currentDate = new Date()
  // const currentMonth = currentDate.getMonth()
  // const currentYear = currentDate.getFullYear()

  // const monthlyFlights = flights.filter((flight) => {
  //   const flightDate = new Date(flight.date)
  //   return flightDate.getMonth() === currentMonth && flightDate.getFullYear() === currentYear
  // })

  // const monthlyHours = monthlyFlights.reduce((total, flight) => total + (flight.duration || 0), 0) / 60
  // const monthlyValue = monthlyHours * 1000 // Tarifa fija de $1000/hora

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="ml-4">Cargando datos del piloto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className={`p-4 rounded-lg ${darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-600"}`}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold">Mi Perfil</h1>
      </div>

      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden mb-6 border`}
      >
        <div
          className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex flex-col md:flex-row md:items-center md:justify-between`}
        >
          <div className="flex items-center">
            {pilotData?.user?.profileImage ? (
              <img
                src={pilotData.user.profileImage || "/placeholder.svg"}
                className="h-16 w-16 rounded-full mr-4"
                alt={pilotData.user.firstName}
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl mr-4">
                {pilotData?.user?.firstName?.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium leading-6">
                {pilotData?.user?.firstName} {pilotData?.user?.lastName}
              </h3>
              <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Piloto</p>
            </div>
          </div>
          {/* Comentado temporalmente - Botón editar perfil */}
          {/* <div className="mt-4 md:mt-0">
            <button
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Editar Perfil
            </button>
          </div> */}
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                Información Personal
              </h4>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</dt>
                  <dd className="text-sm">{pilotData?.user?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</dt>
                  <dd className="text-sm">{pilotData?.user?.phone || "No especificado"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Número de Licencia
                  </dt>
                  <dd className="text-sm">{pilotData?.license || "No especificado"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vencimiento Médico
                  </dt>
                  <dd className="text-sm">
                    {pilotData?.medicalExpiry
                      ? new Date(pilotData.medicalExpiry).toLocaleDateString("es-ES")
                      : "No especificado"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Último Entrenamiento
                  </dt>
                  <dd className="text-sm">
                    {pilotData?.lastTraining
                      ? new Date(pilotData.lastTraining).toLocaleDateString("es-ES")
                      : "No especificado"}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                Estadísticas de Vuelo
              </h4>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Total Horas de Vuelo
                  </dt>
                  <dd className="text-sm">{pilotData?.flightHours || 0} hrs</dd>
                </div>
                {/* Comentado temporalmente - Estadísticas de horas y dinero */}
                {/* <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Horas en IBEX
                  </dt>
                  <dd className="text-sm">{totalFlightHours.toFixed(1)} hrs</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vuelos Completados
                  </dt>
                  <dd className="text-sm">{completedFlights}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vuelos Programados
                  </dt>
                  <dd className="text-sm">{scheduledFlights}</dd>
                </div> */}
              </dl>
            </div>
          </div>

          {/* Comentado temporalmente - Estadísticas del mes actual */}
          {/* <div className="mt-8">
            <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
              Estadísticas del Mes Actual ({new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })})
            </h4>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas Voladas</p>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {monthlyHours.toFixed(1)} hrs
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Vuelos del Mes</p>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {monthlyFlights.length}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Valor Estimado</p>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    $
                    {monthlyValue.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div> */}

          <div className="mt-8">
            <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
              Certificaciones
            </h4>
            <div className="flex flex-wrap gap-2">
              {pilotData?.certifications?.map((cert: any, index: number) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                    darkMode ? "bg-orange-900/30 text-orange-300" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {cert.certificationType.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
              Certificaciones por Aeronave
            </h4>
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border overflow-hidden`}
            >
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Modelo
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Fecha de Certificación
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${darkMode ? "bg-gray-800" : "bg-white"} divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {pilotData?.aircraftRatings?.map((rating: any, index: number) => (
                    <tr key={index}>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {rating.helicopterModel.name}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {new Date(rating.certificationDate).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Comentado temporalmente - Sección de documentos */}
      {/* <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden border`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Documentos</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            <li className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Licencia de Piloto</span>
              </div>
              <button
                className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
              >
                Ver
              </button>
            </li>
            <li className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Certificado Médico</span>
              </div>
              <button
                className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
              >
                Ver
              </button>
            </li>
            <li className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Certificado de Entrenamiento</span>
              </div>
              <button
                className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
              >
                Ver
              </button>
            </li>
          </ul>
        </div>
      </div> */}
    </div>
  )
}

export default PilotProfile
