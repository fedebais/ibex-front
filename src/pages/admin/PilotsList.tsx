"use client"

import { useState } from "react"
import { mockUsers } from "../../data/mockData"
import AddPilotModal from "../../components/modals/AddPilotModal"
import PilotDetailsModal from "../../components/modals/PilotDetailsModal"

interface PilotsListProps {
  darkMode: boolean
}

const PilotsList = ({ darkMode = false }: PilotsListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [pilots, setPilots] = useState(mockUsers.filter((user) => user.role === "pilot"))
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPilotId, setSelectedPilotId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Aplicar filtro de búsqueda
  const filteredPilots = pilots.filter((pilot) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      pilot.name.toLowerCase().includes(searchLower) ||
      pilot.email.toLowerCase().includes(searchLower) ||
      (pilot.licenseNumber && pilot.licenseNumber.toLowerCase().includes(searchLower))
    )
  })

  const handleAddPilot = (newPilot: any) => {
    setPilots([...pilots, newPilot])
  }

  const handleViewPilot = (pilotId: string) => {
    setSelectedPilotId(pilotId)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Pilotos</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
        >
          <svg
            className="h-5 w-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Añadir Piloto
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
                placeholder="Buscar pilotos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de pilotos */}
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
                  Piloto
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Licencia
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Horas de Vuelo
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
              {filteredPilots.length > 0 ? (
                filteredPilots.map((pilot) => (
                  <tr key={pilot.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {pilot.avatar ? (
                          <img
                            src={pilot.avatar || "/placeholder.svg"}
                            className="h-10 w-10 rounded-full"
                            alt={pilot.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                            {pilot.name.charAt(0)}
                          </div>
                        )}
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {pilot.name}
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{pilot.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {pilot.licenseNumber || "PL-12345"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {pilot.flightHours || "0"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Activo
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewPilot(pilot.id)}
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
                    colSpan={5}
                    className={`px-6 py-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    No se encontraron pilotos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para añadir piloto */}
      <AddPilotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPilot={handleAddPilot}
        darkMode={darkMode}
      />

      {/* Modal para ver detalles del piloto */}
      <PilotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        pilotId={selectedPilotId}
        darkMode={darkMode}
      />
    </div>
  )
}

export default PilotsList
