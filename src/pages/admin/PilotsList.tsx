"use client"

import { useState, useEffect } from "react"
import AddPilotModal from "../../components/modals/AddPilotModal"
import PilotDetailsModal from "../../components/modals/PilotDetailsModal"
import EditPilotModal from "../../components/modals/EditPilotModal"
import { getPilots, deletePilot, getPilotById } from "../../services/api"
import { useUser } from "../../context/UserContext"
import type { Pilot } from "../../types/api"

interface PilotsListProps {
  darkMode: boolean
}

const PilotsList = ({ darkMode = false }: PilotsListProps) => {
  const { user, accessToken, isLoading: userLoading } = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedPilotId, setSelectedPilotId] = useState<number | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editPilotId, setEditPilotId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug logs
  console.log("PilotsList - User:", user)
  console.log("PilotsList - AccessToken:", accessToken)
  console.log("PilotsList - UserLoading:", userLoading)

  // Cargar pilotos desde la API
  const loadPilots = async () => {
    // No hacer nada si el UserContext aún está cargando
    if (userLoading) {
      console.log("PilotsList - UserContext still loading, waiting...")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (!accessToken) {
        console.log("PilotsList - No access token available for loading pilots")
        setError("No se pudo obtener el token de autenticación. Por favor, inicie sesión nuevamente.")
        return
      }

      console.log("PilotsList - Loading pilots with token:", accessToken)
      const data = await getPilots(accessToken)
      console.log("PilotsList - Pilots loaded:", data)
      // Filtrar solo pilotos activos
      const activePilots = data.filter((pilot) => pilot.user.active === true)
      setPilots(activePilots)
    } catch (err) {
      console.error("PilotsList - Error loading pilots:", err)
      setError("No se pudieron cargar los pilotos. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPilots()
  }, [accessToken, userLoading])

  // Aplicar filtro de búsqueda
  const filteredPilots = pilots.filter((pilot) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const fullName = `${pilot.user.firstName} ${pilot.user.lastName}`.toLowerCase()

    return (
      fullName.includes(searchLower) ||
      pilot.user.email.toLowerCase().includes(searchLower) ||
      pilot.license.toLowerCase().includes(searchLower)
    )
  })

  const handleAddPilot = () => {
    loadPilots() // Recargar la lista completa después de añadir un piloto
  }

  const handleViewPilot = (pilotId: number) => {
    console.log("PilotsList - Opening modal for pilot ID:", pilotId)
    setSelectedPilotId(pilotId)
    setIsDetailsModalOpen(true)
  }

  const handleEditPilot = async (pilotId: number) => {
    console.log("PilotsList - Opening edit modal for pilot ID:", pilotId)

    try {
      if (!accessToken) {
        console.error("No access token available for loading pilot details")
        return
      }

      // Cargar los datos completos del piloto incluyendo certificaciones
      console.log("PilotsList - Loading complete pilot data for editing...")
      const completePilotData = await getPilotById(pilotId, accessToken)
      console.log("PilotsList - Complete pilot data loaded:", completePilotData)

      // Actualizar el piloto en la lista con los datos completos
      setPilots((prevPilots) => prevPilots.map((p) => (p.id === pilotId ? completePilotData : p)))

      setEditPilotId(pilotId)
      setIsEditModalOpen(true)
      console.log("PilotsList - Edit modal state set to true")
    } catch (error) {
      console.error("PilotsList - Error loading complete pilot data:", error)
      alert("Error al cargar los datos completos del piloto. Por favor, intente nuevamente.")
    }
  }

  const handleRefresh = () => {
    loadPilots()
  }

  // Agregar esta nueva función para manejar la actualización después de editar
  const handlePilotUpdated = () => {
    setEditPilotId(null)
    setIsEditModalOpen(false)
    loadPilots() // Recargar toda la lista para asegurar datos actualizados
  }

  const handleCloseModal = () => {
    console.log("PilotsList - Closing modal")
    setSelectedPilotId(null)
    setIsDetailsModalOpen(false)
  }

  const handleCloseEditModal = () => {
    console.log("PilotsList - Closing edit modal")
    setEditPilotId(null)
    setIsEditModalOpen(false)
  }

  const handleDeletePilot = async (pilotId: number, pilotName: string) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar al piloto ${pilotName}? Esta acción no se puede deshacer.`,
    )

    if (!confirmed) return

    try {
      if (!accessToken) {
        console.error("No access token available for deleting pilot")
        return
      }

      await deletePilot(pilotId, accessToken)
      console.log("Pilot deleted successfully")

      // Recargar la lista de pilotos
      loadPilots()
    } catch (error) {
      console.error("Error deleting pilot:", error)
      alert("Error al eliminar el piloto. Por favor, intente nuevamente.")
    }
  }

  // Mostrar loading mientras el UserContext está cargando
  if (userLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando sesión...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Pilotos</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isLoading}
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

      {/* Estado de carga */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando pilotos...</span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !isLoading && (
        <div className={`${darkMode ? "bg-red-900" : "bg-red-100"} p-4 rounded-md`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className={`h-5 w-5 ${darkMode ? "text-red-300" : "text-red-400"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"}`}>{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={handleRefresh}
                  className={`inline-flex rounded-md p-1.5 ${
                    darkMode ? "bg-red-800 text-red-300 hover:bg-red-700" : "bg-red-50 text-red-500 hover:bg-red-100"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                >
                  <span className="sr-only">Reintentar</span>
                  <svg
                    className="h-5 w-5"
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
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de pilotos */}
      {!isLoading && !error && (
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
                    <tr
                      key={pilot.id}
                      className={`${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"} cursor-pointer`}
                      onClick={() => handleViewPilot(pilot.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-white">
                            {pilot.user.firstName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {pilot.user.firstName} {pilot.user.lastName}
                            </div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {pilot.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {pilot.license}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {pilot.flightHours}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {pilot.user.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewPilot(pilot.id)
                          }}
                          className={`text-orange-600 hover:text-orange-900 mr-3 ${darkMode ? "hover:text-orange-400" : ""}`}
                        >
                          Ver
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditPilot(pilot.id)
                          }}
                          className={`text-orange-600 hover:text-orange-900 mr-3 ${darkMode ? "hover:text-orange-400" : ""}`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePilot(pilot.id, `${pilot.user.firstName} ${pilot.user.lastName}`)
                          }}
                          className={`text-red-600 hover:text-red-900 ${darkMode ? "hover:text-red-400" : ""}`}
                        >
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
      )}

      {/* Modal para añadir piloto */}
      <AddPilotModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPilotAdded={handleAddPilot} // ✅ Prop corregida
        darkMode={darkMode}
      />

      <PilotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        pilotId={selectedPilotId}
        darkMode={darkMode}
      />

      <EditPilotModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onPilotUpdated={handlePilotUpdated} // ✅ Usar la nueva función
        pilot={pilots.find((p) => p.id === editPilotId) || null}
        darkMode={darkMode}
      />
    </div>
  )
}

export default PilotsList
