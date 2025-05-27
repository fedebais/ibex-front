"use client"

import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import FlightDetailsModal from "../../components/modals/FlightDetailsModal"
import { getFlightLogsByPilotId, getPilots } from "../../services/api"
import type { FlightLog, Pilot } from "../../types/api"

interface FlightHistoryProps {
  darkMode: boolean
}

const FlightHistory = ({ darkMode = false }: FlightHistoryProps) => {
  const { user, accessToken } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFlightId, setSelectedFlightId] = useState(null)

  const [flightLogs, setFlightLogs] = useState<FlightLog[]>([])
  const [filteredFlights, setFilteredFlights] = useState<FlightLog[]>([])
  const [currentPilotId, setCurrentPilotId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFlightLog, setSelectedFlightLog] = useState<FlightLog | null>(null)

  // Filtrar vuelos del piloto actual
  // const pilotFlights = mockFlights.filter((flight) => flight.pilotId === user?.id)

  // Aplicar filtros
  // const filteredFlights = pilotFlights
  //   .filter((flight) => {
  //     if (filterStatus === "all") return true
  //     return flight.status === filterStatus
  //   })
  //   .filter((flight) => {
  //     if (!searchTerm) return true

  //     const originName = getLocationName(flight.originId).toLowerCase()
  //     const destinationName = getLocationName(flight.destinationId).toLowerCase()
  //     const helicopterInfo = getHelicopterInfo(flight.helicopterId).toLowerCase()
  //     const searchLower = searchTerm.toLowerCase()

  //     return (
  //       originName.includes(searchLower) ||
  //       destinationName.includes(searchLower) ||
  //       helicopterInfo.includes(searchLower) ||
  //       flight.date.includes(searchLower)
  //     )
  //   })
  //   .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  useEffect(() => {
    const loadFlightData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!accessToken) {
          setError("Token de acceso no encontrado")
          return
        }

        // Obtener pilotos para encontrar el pilotId del usuario actual
        const pilots = await getPilots(accessToken)
        const currentPilot = pilots.find((pilot: Pilot) => pilot.userId === user?.id)

        if (!currentPilot) {
          setError("No se encontró información del piloto para este usuario")
          return
        }

        setCurrentPilotId(currentPilot.id)

        // Obtener los flight logs del piloto
        const logs = await getFlightLogsByPilotId(currentPilot.id, accessToken)
        setFlightLogs(logs)
        setFilteredFlights(logs)
      } catch (err) {
        console.error("Error cargando datos de vuelos:", err)
        setError("Error al cargar los datos de vuelos")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      loadFlightData()
    }
  }, [user?.id, accessToken])

  useEffect(() => {
    let filtered = flightLogs

    // Filtro por estado
    if (filterStatus !== "all") {
      filtered = filtered.filter((flight) => flight.status.toLowerCase() === filterStatus)
    }

    // Filtro por búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter((flight) => {
        return (
          flight.destination?.name?.toLowerCase().includes(searchLower) ||
          flight.helicopter?.registration?.toLowerCase().includes(searchLower) ||
          flight.client?.name?.toLowerCase().includes(searchLower) ||
          flight.date.includes(searchLower) ||
          flight.notes?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Ordenar por fecha (más recientes primero)
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredFlights(filtered)
  }, [flightLogs, filterStatus, searchTerm])

  const handleFlightClick = (flightId: string) => {
    const flight = flightLogs.find((f) => f.id.toString() === flightId)
    setSelectedFlightLog(flight || null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Historial de Vuelos</h1>
      </div>

      {/* Filtros */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4 rounded-lg shadow border`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="sr-only">
              Buscar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                id="search"
                type="search"
                className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-orange-500 focus:border-orange-500"
                }`}
                placeholder="Buscar vuelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Estado:</span>
            <select
              className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              }`}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="completed">Completados</option>
              <option value="scheduled">Programados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de vuelos */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow rounded-lg overflow-hidden border`}
      >
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Ruta
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Helicóptero
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Horario
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Duración
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Estado
                </th>
              </tr>
            </thead>
            <tbody
              className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
            >
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-6 py-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Cargando vuelos...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className={`px-6 py-4 text-center text-sm text-red-500`}>
                    {error}
                  </td>
                </tr>
              ) : filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <tr
                    key={flight.id}
                    className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} cursor-pointer transition-colors duration-150`}
                    onClick={() => handleFlightClick(flight.id.toString())}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {new Date(flight.date).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {flight.destination?.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {flight.helicopter?.registration || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {flight.startTime
                          ? new Date(flight.startTime).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}{" "}
                        -
                        {flight.landingTime
                          ? new Date(flight.landingTime).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {flight.duration ? `${flight.duration} min` : "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          flight.status === "COMPLETED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {flight.status === "COMPLETED" ? "Completado" : "Programado"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className={`px-6 py-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No se encontraron vuelos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles del vuelo */}
      <FlightDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFlightLog(null)
        }}
        flightLog={selectedFlightLog}
        darkMode={darkMode}
      />
    </div>
  )
}

export default FlightHistory
