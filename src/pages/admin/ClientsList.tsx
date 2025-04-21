"use client"

import { useState } from "react"
import { mockClients, getClientFlights } from "../../data/mockData"
import AddClientModal from "../../components/modals/AddClientModal"
import ClientDetailsModal from "../../components/modals/ClientDetailsModal"
import { Building2, User, Phone, Mail, MapPin } from "lucide-react"

interface ClientsListProps {
  darkMode: boolean
}

const ClientsList = ({ darkMode = false }: ClientsListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [clients, setClients] = useState(mockClients)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Aplicar filtros
  const filteredClients = clients
    .filter((client) => {
      if (filterType === "all") return true
      return client.type === filterType
    })
    .filter((client) => {
      if (!searchTerm) return true

      const searchLower = searchTerm.toLowerCase()
      return (
        client.name.toLowerCase().includes(searchLower) ||
        client.contactPerson.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.includes(searchLower) ||
        client.address.toLowerCase().includes(searchLower)
      )
    })

  const handleAddClient = (newClient: any) => {
    setClients([...clients, newClient])
  }

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId)
    setIsDetailsModalOpen(true)
  }

  // Función para obtener el ícono según el tipo de cliente
  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case "corporate":
        return <Building2 className="h-5 w-5 text-blue-500" />
      case "individual":
        return <User className="h-5 w-5 text-green-500" />
      case "government":
        return <Building2 className="h-5 w-5 text-purple-500" />
      default:
        return <Building2 className="h-5 w-5 text-gray-500" />
    }
  }

  // Función para obtener el texto del tipo de cliente
  const getClientTypeText = (type: string) => {
    switch (type) {
      case "corporate":
        return "Corporativo"
      case "individual":
        return "Individual"
      case "government":
        return "Gubernamental"
      default:
        return "Desconocido"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Clientes</h1>
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
          Añadir Cliente
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
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Tipo:</span>
            <select
              className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              }`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos</option>
              <option value="corporate">Corporativo</option>
              <option value="individual">Individual</option>
              <option value="government">Gubernamental</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const clientFlights = getClientFlights(client.id)
            return (
              <div
                key={client.id}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow rounded-lg overflow-hidden border`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {client.name}
                      </h3>
                      <div className="flex items-center mt-1">
                        {getClientTypeIcon(client.type)}
                        <span className={`ml-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {getClientTypeText(client.type)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {client.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <User className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2`} />
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {client.contactPerson}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2`} />
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{client.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2`} />
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{client.phone}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2 mt-0.5`} />
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {client.address}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Vuelos:</span>
                        <span className={`ml-1 font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {clientFlights.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewClient(client.id)}
                        className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded ${
                          darkMode
                            ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                            : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div
            className={`col-span-full ${darkMode ? "bg-gray-800 text-gray-400 border-gray-700" : "bg-white text-gray-500 border-gray-200"} p-6 text-center rounded-lg shadow border`}
          >
            No se encontraron clientes con los filtros seleccionados.
          </div>
        )}
      </div>

      {/* Modal para añadir cliente */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
        darkMode={darkMode}
      />

      {/* Modal para ver detalles del cliente */}
      <ClientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        clientId={selectedClientId}
        darkMode={darkMode}
      />
    </div>
  )
}

export default ClientsList
