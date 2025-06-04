"use client"

import { useState, useEffect } from "react"
import { getClients, deleteClient } from "../../services/api"
import type { Client } from "../../types/api"
import { getClientFlights } from "../../data/mockData"
import AddClientModal from "../../components/modals/AddClientModal"
import ClientDetailsModal from "../../components/modals/ClientDetailsModal"
import { Building2, User, Phone, Mail, MapPin, Trash2 } from "lucide-react"
import { useUser } from "../../context/UserContext"

interface ClientsListProps {
  darkMode: boolean
}

const ClientsList = ({ darkMode = false }: ClientsListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { accessToken, isAuthenticated } = useUser()

  const getAccessToken = (): string | null => {
    // Primero intentar obtener del contexto
    if (accessToken) {
      console.log("✅ Token obtenido del contexto para ClientsList")
      return accessToken
    }

    // Si no está en el contexto, obtener de localStorage
    const tokenFromStorage = localStorage.getItem("ibex_access_token")
    if (tokenFromStorage) {
      console.log("✅ Token obtenido de localStorage para ClientsList")
      return tokenFromStorage
    }

    console.log("❌ No se encontró token para ClientsList")
    return null
  }

  const loadClients = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = getAccessToken()

      if (!token) {
        throw new Error("No hay token de autenticación disponible")
      }

      console.log("=== CARGANDO CLIENTES ===")
      console.log("Token disponible:", !!token)
      console.log("isAuthenticated:", isAuthenticated)

      const data = await getClients(token)
      console.log("✅ Clientes cargados:", data.length)

      // Filtrar solo clientes activos
      const activeClients = data.filter((client) => client.active === true)
      console.log("✅ Clientes activos:", activeClients.length)

      setClients(activeClients)
    } catch (err: any) {
      console.error("❌ Error al cargar clientes:", err)

      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        // Limpiar localStorage si el token es inválido
        localStorage.removeItem("ibex_access_token")
        localStorage.removeItem("ibex_user")
        localStorage.removeItem("ibex_user_id")
      } else if (err.message.includes("403") || err.message.includes("Forbidden")) {
        setError("No tienes permisos para ver los clientes.")
      } else if (err.message.includes("Can't reach database")) {
        setError("Error de conexión con la base de datos. Inténtalo más tarde.")
      } else {
        setError("Error al cargar los clientes: " + (err.message || "Error desconocido"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async (clientId: number, clientName: string) => {
    try {
      // Prevenir múltiples clicks
      if (isDeleting) return

      // Confirmar eliminación
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas eliminar al cliente "${clientName}"? Esta acción no se puede deshacer.`,
      )
      if (!confirmed) return

      setIsDeleting(true)

      const token = getAccessToken()
      if (!token) {
        throw new Error("No hay token de autenticación disponible")
      }

      // Llamar a la API para eliminar
      await deleteClient(clientId, token)

      // Recargar la lista después de eliminar
      await loadClients()

      // Mostrar confirmación
      alert(`Cliente "${clientName}" eliminado correctamente`)
    } catch (err: any) {
      console.error("❌ Error al eliminar cliente:", err)

      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        alert("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else if (err.message.includes("403") || err.message.includes("Forbidden")) {
        alert("No tienes permisos para eliminar este cliente.")
      } else {
        alert("Error al eliminar el cliente: " + (err.message || "Error desconocido"))
      }
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    console.log("=== ClientsList useEffect ===")
    console.log("isAuthenticated:", isAuthenticated)
    console.log("accessToken exists:", !!accessToken)

    if (isAuthenticated || localStorage.getItem("ibex_access_token")) {
      loadClients()
    } else {
      setIsLoading(false)
      setError("No estás autenticado. Por favor, inicia sesión.")
    }
  }, [isAuthenticated, accessToken])

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
        (client.contact && client.contact.toLowerCase().includes(searchLower)) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.phone && client.phone.includes(searchLower)) ||
        (client.address && client.address.toLowerCase().includes(searchLower))
      )
    })

  const handleAddClient = async () => {
    console.log("Cliente agregado, recargando lista...")
    await loadClients() // Recargar la lista después de agregar
  }

  const handleViewClient = (clientId: number) => {
    console.log("=== ABRIENDO MODAL CLIENTE ===")
    console.log("Cliente ID:", clientId)
    console.log("Tipo de ID:", typeof clientId)

    // Forzar la apertura del modal
    setSelectedClientId(clientId.toString())
    setIsDetailsModalOpen(true)

    console.log("Estado después de setear:")
    console.log("selectedClientId será:", clientId.toString())
    console.log("isDetailsModalOpen será:", true)
  }

  const handleRetry = () => {
    console.log("Reintentando cargar clientes...")
    loadClients()
  }

  // Función para obtener el ícono según el tipo de cliente
  const getClientTypeIcon = (type: string | null) => {
    if (!type) return <Building2 className="h-5 w-5 text-gray-500" />
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
  const getClientTypeText = (type: string | null) => {
    if (!type) return "Sin especificar"
    switch (type) {
      case "corporate":
        return "Corporativo"
      case "individual":
        return "Individual"
      case "government":
        return "Gubernamental"
      default:
        return "Otros"
    }
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Clientes Activos</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!isAuthenticated && !localStorage.getItem("ibex_access_token")}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow rounded-lg overflow-hidden border animate-pulse`}
            >
              <div className="p-5">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          className={`${darkMode ? "bg-red-900 border-red-700 text-red-300" : "bg-red-50 border-red-200 text-red-700"} p-6 text-center rounded-lg border`}
        >
          <p className="font-medium">Error al cargar clientes</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => {
              const clientFlights = getClientFlights(client.id.toString())
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
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center">
                        <User className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2`} />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {client.contact || "Sin contacto"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Mail className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2`} />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {client.email || "Sin email"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2`} />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {client.phone || "Sin teléfono"}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-2 mt-0.5`} />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {client.address || "Sin dirección"}
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
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              console.log("Click en Ver Detalles para cliente:", client.id)
                              handleViewClient(client.id)
                            }}
                            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded ${
                              darkMode
                                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                          >
                            Ver Detalles
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClient(client.id, client.name)
                            }}
                            disabled={isDeleting}
                            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-xs font-medium rounded ${
                              darkMode
                                ? "border-red-800 text-red-300 bg-red-900 hover:bg-red-800"
                                : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50`}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Eliminar
                          </button>
                        </div>
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
              No se encontraron clientes activos con los filtros seleccionados.
            </div>
          )}
        </div>
      )}

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
        onClose={() => {
          console.log("Cerrando modal de detalles")
          setIsDetailsModalOpen(false)
          setSelectedClientId(null)
        }}
       client={clients.find((c) => c.id.toString() === selectedClientId) || null} // ✅ PASAR EL OBJETO COMPLETO

        darkMode={darkMode}
      />
    </div>
  )
}

export default ClientsList
