import { useState } from "react"
import { mockFlights, getPilotName, getHelicopterInfo, getLocationName } from "../../data/mockData"
import FlightDetailsModal from "../../components/modals/FlightDetailsModal"

interface FlightLogsProps {
  darkMode: boolean
}

const FlightLogs = ({ darkMode = false }: FlightLogsProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Aplicar filtros
  const filteredFlights = mockFlights
    .filter((flight) => {
      if (filterStatus === "all") return true
      return flight.status === filterStatus
    })
    .filter((flight) => {
      if (!searchTerm) return true

      const pilotName = getPilotName(flight.pilotId).toLowerCase()
      const originName = getLocationName(flight.originId).toLowerCase()
      const destinationName = getLocationName(flight.destinationId).toLowerCase()
      const helicopterInfo = getHelicopterInfo(flight.helicopterId).toLowerCase()
      const searchLower = searchTerm.toLowerCase()

      return (
        pilotName.includes(searchLower) ||
        originName.includes(searchLower) ||
        destinationName.includes(searchLower) ||
        helicopterInfo.includes(searchLower) ||
        flight.date.includes(searchLower)
      )
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleViewFlight = (flightId: string) => {
    setSelectedFlightId(flightId)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Bitácoras de Vuelo</h1>
        <button className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Nuevo Vuelo
        </button>
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
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"}`}
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
                  Piloto
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
                <th
                  scope="col"
                  className={`px-6 py-3 text-right text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody
              className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
            >
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <tr key={flight.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
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
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {getPilotName(flight.pilotId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {getLocationName(flight.originId).split(" ")[0]} →{" "}
                        {getLocationName(flight.destinationId).split(" ")[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {getHelicopterInfo(flight.helicopterId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {flight.departureTime} - {flight.arrivalTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                        {flight.flightHours}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          flight.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {flight.status === "completed" ? "Completado" : "Programado"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewFlight(flight.id)}
                        className={`text-orange-600 hover:text-orange-900 mr-3 ${darkMode ? "hover:text-orange-400" : ""}`}
                      >
                        Ver
                      </button>
                      <button
                        className={`text-orange-600 hover:text-orange-900 mr-3 ${darkMode ? "hover:text-orange-400" : ""}`}
                      >
                        Editar
                      </button>
                      <button className={`text-red-600 hover:text-red-900 ${darkMode ? "hover:text-red-400" : ""}`}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
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

      {/* Modal de detalles de vuelo */}
      <FlightDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        flightId={selectedFlightId}
        darkMode={darkMode}
      />
    </div>
  )
}

export default FlightLogs
