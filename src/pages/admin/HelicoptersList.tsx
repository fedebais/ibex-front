"use client"

import { useState, useEffect } from "react"
import { api } from "../../services/api"
import AddHelicopterModal from "../../components/modals/AddHelicopterModal"
import HelicopterDetailsModal from "../../components/modals/HelicopterDetailsModal"
import type { Helicopter } from "../../types/api"

interface HelicoptersListProps {
  darkMode: boolean
}

const HelicoptersList = ({ darkMode = false }: HelicoptersListProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedHelicopterId, setSelectedHelicopterId] = useState<number | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedHelicopter, setSelectedHelicopter] = useState<Helicopter | null>(null)

  // Cargar datos de helicópteros desde la API
  useEffect(() => {
    loadHelicopters()
  }, [])

  const loadHelicopters = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Obtener el token de autenticación
      const token = localStorage.getItem("ibex_access_token")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      // Llamar a la API para obtener los helicópteros
      const data = await api.getHelicopters(token)
      console.log("Datos de helicópteros cargados:", data)
      setHelicopters(data)
    } catch (err) {
      console.error("Error al cargar los helicópteros:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los helicópteros")
    } finally {
      setIsLoading(false)
    }
  }

  // Aplicar filtros
  const filteredHelicopters = helicopters
    .filter((helicopter) => {
      if (filterStatus === "all") return true

      // Convertir el status a lowercase para comparación
      const helicopterStatus = helicopter.status?.toLowerCase() || ""
      const filterStatusLower = filterStatus.toLowerCase()

      // Mapear los valores del filtro a los valores del enum
      if (filterStatusLower === "activo") {
        return helicopterStatus === "active"
      }
      if (filterStatusLower === "mantenimiento") {
        return helicopterStatus === "maintenance"
      }
      if (filterStatusLower === "inactivo") {
        return helicopterStatus === "inactive"
      }

      return helicopterStatus === filterStatusLower
    })
    .filter((helicopter) => {
      if (!searchTerm) return true

      const searchLower = searchTerm.toLowerCase()
      const modelName = helicopter.model?.name?.toLowerCase() || ""
      const registration = helicopter.registration?.toLowerCase() || ""

      return modelName.includes(searchLower) || registration.includes(searchLower)
    })

  const handleAddHelicopter = async () => {
    try {
      // ✅ NO lo crees de nuevo, solo actualiza la lista
      await loadHelicopters()
      alert("Helicóptero añadido correctamente")
      setIsAddModalOpen(false)
    } catch (err) {
      console.error("Error al actualizar la lista:", err)
      alert("Error al actualizar la lista: " + (err instanceof Error ? err.message : "Error desconocido"))
    }
  }

  const handleViewHelicopter = async (helicopterId: number) => {
    try {
      const token = localStorage.getItem("ibex_access_token")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      // Obtener los detalles del helicóptero directamente de la API
      const helicopter = await api.getHelicopterById(helicopterId, token)

      setSelectedHelicopter(helicopter)
      setSelectedHelicopterId(helicopterId)
      setIsDetailsModalOpen(true)
    } catch (err) {
      console.error("Error al obtener detalles del helicóptero:", err)
      alert("Error al obtener detalles del helicóptero: " + (err instanceof Error ? err.message : "Error desconocido"))
    }
  }

  const handleUpdateHelicopter = async (updatedHelicopter: Helicopter) => {
    try {
      const token = localStorage.getItem("ibex_access_token")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      // Llamar a la API para actualizar el helicóptero
      await api.updateHelicopter(updatedHelicopter.id, updatedHelicopter, token)

      // Recargar la lista completa para asegurar datos actualizados
      await loadHelicopters()

      // Actualizar el helicóptero seleccionado si está abierto el modal de detalles
      if (selectedHelicopterId === updatedHelicopter.id) {
        setSelectedHelicopter(updatedHelicopter)
      }

      // Mostrar mensaje de éxito
      alert("Helicóptero actualizado correctamente")
    } catch (err) {
      console.error("Error al actualizar el helicóptero:", err)
      alert("Error al actualizar el helicóptero: " + (err instanceof Error ? err.message : "Error desconocido"))
    }
  }

  // Función helper para obtener el texto del status en español
  const getStatusText = (status: string | null) => {
    if (!status) return "Desconocido"

    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "Activo"
      case "INACTIVE":
        return "Inactivo"
      case "MAINTENANCE":
        return "Mantenimiento"
      default:
        return status
    }
  }

  // Función helper para obtener las clases CSS del status
  const getStatusClasses = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800"

    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-red-100 text-red-800"
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Renderizar estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Renderizar estado de error
  if (error) {
    return (
      <div
        className={`p-6 text-center rounded-lg shadow border ${darkMode ? "bg-gray-800 text-gray-200 border-gray-700" : "bg-white text-gray-700 border-gray-200"}`}
      >
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={loadHelicopters}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Helicópteros</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={loadHelicopters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              ></path>
            </svg>
            Actualizar
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
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
              <option value="activo">Activos</option>
              <option value="mantenimiento">En Mantenimiento</option>
              <option value="inactivo">Inactivos</option>
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
                  src={helicopter.imageUrl || "/placeholder.svg?height=200&width=400&query=helicopter"}
                  alt={helicopter.model?.name || "Helicóptero"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(helicopter.status)}`}
                  >
                    {getStatusText(helicopter.status)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.model?.name || "Modelo desconocido"}
                </h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {helicopter.registration || "Sin matrícula"}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Año</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {helicopter.manufactureYear || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas de Vuelo</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {helicopter.totalFlightHours || 0}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Último Mantenimiento</p>
                    <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {helicopter.lastMaintenance
                        ? new Date(helicopter.lastMaintenance).toLocaleDateString("es-ES")
                        : "Sin registro"}
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
                  <button
                    onClick={() => {
                      setSelectedHelicopter(helicopter)
                      setSelectedHelicopterId(helicopter.id)
                      setIsDetailsModalOpen(true)
                    }}
                    className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
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
      
      />

      {/* Modal para ver detalles del helicóptero */}
      <HelicopterDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedHelicopter(null)
          setSelectedHelicopterId(null)
        }}
        helicopterId={selectedHelicopterId}
        helicopter={selectedHelicopter}
        onUpdateHelicopter={handleUpdateHelicopter}
        
      />
    </div>
  )
}

export default HelicoptersList
