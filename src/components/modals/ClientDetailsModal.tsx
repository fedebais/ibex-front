"use client"

import { useState } from "react"
import Modal from "../ui/Modal"
import EditClientModal from "./EditClientModal"
import { mockClients, getClientFlights, getPilotName, getHelicopterInfo, getLocationName } from "../../data/mockData"

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string | null
  darkMode?: boolean
  onUpdateClient?: () => void
}

const ClientDetailsModal = ({
  isOpen,
  onClose,
  clientId,
  darkMode = false,
  onUpdateClient,
}: ClientDetailsModalProps) => {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  if (!clientId) return null

  const client = mockClients.find((c) => c.id === clientId)
  if (!client) return null

  // Obtener vuelos del cliente
  const clientFlights = getClientFlights(clientId)

  // Filtrar vuelos por fecha si se han seleccionado fechas
  const filteredFlights = clientFlights.filter((flight) => {
    if (!startDate && !endDate) return true

    const flightDate = new Date(flight.date)
    const start = startDate ? new Date(startDate) : new Date(0)
    const end = endDate ? new Date(endDate) : new Date(8640000000000000) // Max date

    return flightDate >= start && flightDate <= end
  })

  // Calcular estadísticas
  const totalFlights = clientFlights.length
  const completedFlights = clientFlights.filter((f) => f.status === "completed").length
  const scheduledFlights = clientFlights.filter((f) => f.status === "scheduled").length
  const totalPassengers = clientFlights.reduce((sum, flight) => sum + flight.passengers, 0)

  // Función para generar CSV de vuelos filtrados
  const generateCSV = () => {
    // Cabeceras del CSV
    const headers = ["Fecha", "Origen", "Destino", "Piloto", "Helicóptero", "Duración", "Pasajeros", "Estado"]

    // Datos de vuelos
    const rows = filteredFlights.map((flight) => [
      new Date(flight.date).toLocaleDateString("es-ES"),
      getLocationName(flight.originId),
      getLocationName(flight.destinationId),
      getPilotName(flight.pilotId),
      getHelicopterInfo(flight.helicopterId),
      flight.flightHours,
      flight.passengers,
      flight.status === "completed" ? "Completado" : "Programado",
    ])

    // Combinar cabeceras y filas
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `vuelos_${client.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEditClient = () => {
    setIsEditModalOpen(true)
  }

  const handleEditComplete = () => {
    setIsEditModalOpen(false)
    if (onUpdateClient) {
      onUpdateClient()
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Cliente" maxWidth="max-w-4xl" darkMode={darkMode}>
        <div className="space-y-6">
          {/* Información básica del cliente */}
          <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>{client.name}</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Persona de Contacto</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {client.contactPerson}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tipo</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {client.type === "corporate"
                    ? "Corporativo"
                    : client.type === "individual"
                      ? "Individual"
                      : "Gubernamental"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{client.email}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{client.phone}</p>
              </div>
              <div className="md:col-span-2">
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dirección</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{client.address}</p>
              </div>
              {client.notes && (
                <div className="md:col-span-2">
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Notas</p>
                  <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{client.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Estadísticas</h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
              >
                <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Vuelos</p>
                <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {totalFlights}
                </p>
              </div>
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
              >
                <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Completados</p>
                <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {completedFlights}
                </p>
              </div>
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
              >
                <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Programados</p>
                <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {scheduledFlights}
                </p>
              </div>
              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
              >
                <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Pasajeros</p>
                <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {totalPassengers}
                </p>
              </div>
            </div>
          </div>

          {/* Filtro de vuelos */}
          <div>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Filtrar Vuelos
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label
                  htmlFor="startDate"
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                >
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                >
                  Fecha Fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                />
              </div>

              <div>
                <button
                  onClick={generateCSV}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Descargar CSV
                </button>
              </div>
            </div>
          </div>

          {/* Últimos vuelos */}
          <div>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Historial de Vuelos {filteredFlights.length !== clientFlights.length ? "(Filtrados)" : ""}
            </h4>

            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-x-auto`}
            >
              <table className={`w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Ruta
                    </th>
                    <th
                      scope="col"
                      className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Piloto
                    </th>
                    <th
                      scope="col"
                      className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Duración
                    </th>
                    <th
                      scope="col"
                      className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
                >
                  {filteredFlights.length > 0 ? (
                    filteredFlights.map((flight) => (
                      <tr key={flight.id}>
                        <td
                          className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {new Date(flight.date).toLocaleDateString("es-ES")}
                        </td>
                        <td
                          className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {getLocationName(flight.originId).split(" ")[0]} →{" "}
                          {getLocationName(flight.destinationId).split(" ")[0]}
                        </td>
                        <td
                          className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {getPilotName(flight.pilotId)}
                        </td>
                        <td
                          className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {flight.flightHours}
                        </td>
                        <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm`}>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              flight.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {flight.status === "completed" ? "Completado" : "Programado"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className={`px-3 sm:px-6 py-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        No se encontraron vuelos para este cliente en el período seleccionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                darkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleEditClient}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Editar Cliente
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clientId={clientId ? Number.parseInt(clientId) : null}
        onEditClient={handleEditComplete}
        darkMode={darkMode}
      />
    </>
  )
}

export default ClientDetailsModal
