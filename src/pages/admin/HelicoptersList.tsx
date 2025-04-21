import { useState } from "react"
import { mockHelicopters } from "../../data/mockData"
import AddHelicopterModal from "../../components/modals/AddHelicopterModal"
import HelicopterDetailsModal from "../../components/modals/HelicopterDetailsModal"

interface HelicoptersListProps {
  darkMode: boolean
}

const HelicoptersList = ({ darkMode = false }: HelicoptersListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [helicopters, setHelicopters] = useState(mockHelicopters)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedHelicopterId, setSelectedHelicopterId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Aplicar filtros
  const filteredHelicopters = helicopters
    .filter((helicopter) => {
      if (filterStatus === "all") return true
      return helicopter.status === filterStatus
    })
    .filter((helicopter) => {
      if (!searchTerm) return true

      const searchLower = searchTerm.toLowerCase()
      return (
        helicopter.model.toLowerCase().includes(searchLower) ||
        helicopter.registration.toLowerCase().includes(searchLower)
      )
    })

  const handleAddHelicopter = (newHelicopter: any) => {
    setHelicopters([...helicopters, newHelicopter])
  }

  const handleViewHelicopter = (helicopterId: string) => {
    setSelectedHelicopterId(helicopterId)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Helicópteros</h1>
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
          Añadir Helicóptero
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
                placeholder="Buscar helicópteros..."
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
              <option value="active">Activos</option>
              <option value="maintenance">En Mantenimiento</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de helicópteros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHelicopters.length > 0 ? (
          filteredHelicopters.map((helicopter) => (
            <div
              key={helicopter.id}
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow rounded-lg overflow-hidden border`}
            >
              <div className="h-48 w-full relative">
                <img
                  src={helicopter.image || "/placeholder.svg?height=200&width=400"}
                  alt={helicopter.model}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      helicopter.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {helicopter.status === "active" ? "Activo" : "En Mantenimiento"}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.model}
                </h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{helicopter.registration}</p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Año</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {helicopter.yearManufactured}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas de Vuelo</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {helicopter.totalFlightHours}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Último Mantenimiento</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {new Date(helicopter.lastMaintenance).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleViewHelicopter(helicopter.id)}
                    className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded ${
                      darkMode
                        ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                  >
                    Ver Detalles
                  </button>
                  <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`col-span-full ${darkMode ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-white text-gray-500 border-gray-200"} p-6 text-center rounded-lg shadow border`}
          >
            No se encontraron helicópteros con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* Modal para añadir helicóptero */}
      <AddHelicopterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddHelicopter={handleAddHelicopter}
        darkMode={darkMode}
      />

      {/* Modal para ver detalles del helicóptero */}
      <HelicopterDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        helicopterId={selectedHelicopterId}
        darkMode={darkMode}
      />
    </div>
  )
}

export default HelicoptersList
