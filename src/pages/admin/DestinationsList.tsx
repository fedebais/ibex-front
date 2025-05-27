"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MapPin, Plus, Search, Filter, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
import AddDestinationModal from "../../components/modals/AddDestinationModal"
import EditDestinationModal from "../../components/modals/EditDestinationModal"
import DestinationDetailsModal from "../../components/modals/DestinationDetailsModal"
import { getDestinations, deleteDestination } from "../../services/api"
import { useUser } from "../../context/UserContext"

interface DestinationsListProps {
  darkMode: boolean
}

const DestinationsList: React.FC<DestinationsListProps> = ({ darkMode }) => {
  const { user, accessToken, isAuthenticated } = useUser()
  const [destinations, setDestinations] = useState<any[]>([])
  const [filteredDestinations, setFilteredDestinations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState<any>(null)

  const getAccessToken = () => {
    console.log("🔐 Obteniendo token para cargar destinos...")
    console.log("📊 Estado de autenticación:", isAuthenticated)
    console.log("👤 Usuario:", user?.firstName, user?.lastName)

    const token = accessToken || localStorage.getItem("accessToken")
    console.log("🎫 Token encontrado:", token ? `${token.substring(0, 20)}...` : "No disponible")

    return token
  }

  const loadDestinations = async () => {
    if (!isAuthenticated) {
      console.log("❌ Usuario no autenticado, no se cargarán destinos")
      setError("Usuario no autenticado")
      setIsLoading(false)
      return
    }

    const token = getAccessToken()
    if (!token) {
      setError("No hay token de autenticación disponible")
      setIsLoading(false)
      return
    }

    try {
      console.log("📤 Cargando destinos desde la API...")
      setIsLoading(true)
      setError("")

      const data = await getDestinations(token)
      console.log("✅ Destinos cargados exitosamente:", data)

      setDestinations(data)
      setFilteredDestinations(data)
    } catch (error: any) {
      console.error("❌ Error al cargar destinos:", error)

      if (error.message?.includes("401")) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        localStorage.removeItem("accessToken")
      } else if (error.message?.includes("403")) {
        setError("No tienes permisos para ver los destinos.")
      } else if (error.message?.includes("Can't reach database")) {
        setError("Error de conexión con la base de datos. Inténtalo más tarde.")
      } else {
        setError("Error al cargar los destinos. Inténtalo de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log("🔄 useEffect - Cargando destinos...")
    console.log("📊 Estado de autenticación:", isAuthenticated)

    if (isAuthenticated) {
      loadDestinations()
    } else {
      setIsLoading(false)
      setError("Usuario no autenticado")
    }
  }, [isAuthenticated])

  useEffect(() => {
    let filtered = destinations

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter((destination) => destination.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((destination) => {
        if (statusFilter === "active") return destination.active === true
        if (statusFilter === "inactive") return destination.active === false
        return true
      })
    }

    setFilteredDestinations(filtered)
  }, [destinations, searchTerm, statusFilter])

  const handleAddDestination = (newDestination: any) => {
    setDestinations((prev) => [...prev, newDestination])
  }

  const handleUpdateDestination = (updatedDestination: any) => {
    setDestinations((prev) => prev.map((dest) => (dest.id === updatedDestination.id ? updatedDestination : dest)))
  }

  const handleDeleteDestination = async (destinationId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este destino?")) {
      return
    }

    const token = getAccessToken()
    if (!token) {
      alert("No hay token de autenticación disponible")
      return
    }

    try {
      await deleteDestination(destinationId, token)
      setDestinations((prev) => prev.filter((dest) => dest.id !== destinationId))
    } catch (error: any) {
      console.error("Error al eliminar destino:", error)

      if (error.message?.includes("400")) {
        alert("No se puede eliminar este destino porque está siendo utilizado en vuelos.")
      } else {
        alert("Error al eliminar el destino. Inténtalo de nuevo.")
      }
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
  }

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    if (typeof value !== "number") return "N/A"

    const direction = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"

    return `${Math.abs(value).toFixed(4)}° ${direction}`
  }

  if (isLoading) {
    return (
      <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
            <span>Cargando destinos...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="text-center py-12">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={loadDestinations}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-8 h-8 text-orange-600" />
            Gestión de Destinos
          </h1>
          <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Administra los destinos de vuelo disponibles
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!isAuthenticated}
          className={`mt-4 sm:mt-0 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            !isAuthenticated
              ? "bg-gray-400 text-gray-600 cursor-not-allowed"
              : "bg-orange-600 text-white hover:bg-orange-700"
          }`}
        >
          <Plus className="w-5 h-5" />
          Añadir Destino
        </button>
      </div>

      {/* Filtros */}
      <div className={`p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-800" : "bg-white"} shadow-sm`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar destinos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
            <button
              onClick={clearFilters}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Filter className="w-4 h-4" />
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-4">
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Mostrando {filteredDestinations.length} de {destinations.length} destinos
        </p>
      </div>

      {/* Lista de destinos */}
      {filteredDestinations.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow-sm`}>
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            {searchTerm || statusFilter !== "all" ? "No se encontraron destinos" : "No hay destinos registrados"}
          </h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer destino"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Agregar Primer Destino
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => (
            <div
              key={destination.id}
              className={`p-6 rounded-lg shadow-sm border transition-all hover:shadow-md ${
                darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{destination.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {destination.active ? (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-full">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Latitud:</span>
                  <span className="text-sm font-mono">{formatCoordinate(destination.latitude, "lat")}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Longitud:</span>
                  <span className="text-sm font-mono">{formatCoordinate(destination.longitude, "lng")}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Altitud:</span>
                  <span className="text-sm">{destination.altitude ? `${destination.altitude}m` : "N/A"}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDestination(destination)
                    setIsDetailsModalOpen(true)
                  }}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    darkMode
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => {
                    setSelectedDestination(destination)
                    setIsEditModalOpen(true)
                  }}
                  className="flex-1 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteDestination(destination.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddDestination={handleAddDestination}
        darkMode={darkMode}
      />

      <EditDestinationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdateDestination={handleUpdateDestination}
        destination={selectedDestination}
        darkMode={darkMode}
      />

      <DestinationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        destination={selectedDestination}
        darkMode={darkMode}
      />
    </div>
  )
}

export default DestinationsList
