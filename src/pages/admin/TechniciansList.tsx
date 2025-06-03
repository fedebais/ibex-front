"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Plus, Eye, Filter, Users, Award, Clock, Edit, Trash2 } from "lucide-react"
import { getTechnicians, getTechnicianById, deleteTechnician } from "../../services/api"
import { useUser } from "../../context/UserContext"
import type { Technician } from "../../types/api"
import TechnicianDetailsModal from "../../components/modals/TechnicianDetailsModal"
import AddTechnicianModal from "../../components/modals/AddTechnicianModal"
import EditTechnicianModal from "../../components/modals/EditTechnicianModal"

interface TechniciansListProps {
  darkMode: boolean
}

const TechniciansList: React.FC<TechniciansListProps> = ({ darkMode }) => {
  const { accessToken } = useUser()
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [filteredTechnicians, setFilteredTechnicians] = useState<Technician[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [specializationFilter, setSpecializationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editTechnicianId, setEditTechnicianId] = useState<number | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  useEffect(() => {
    loadTechnicians()
  }, [])

  useEffect(() => {
    filterTechnicians()
  }, [technicians, searchTerm, specializationFilter, statusFilter])

  const loadTechnicians = async () => {
    if (!accessToken) {
      setError("No hay token de autenticación")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getTechnicians(accessToken)
      console.log("Técnicos cargados:", data)
      setTechnicians(data)
      setError(null)
    } catch (error) {
      console.error("Error al cargar técnicos:", error)
      setError("Error al cargar la lista de técnicos")
    } finally {
      setIsLoading(false)
    }
  }

  const filterTechnicians = () => {
    let filtered = technicians

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (technician) =>
          technician.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          technician.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          technician.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          technician.specialty?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por especialización
    if (specializationFilter) {
      filtered = filtered.filter((technician) => technician.specialty === specializationFilter)
    }

    // Filtro por estado
    if (statusFilter) {
      const isActive = statusFilter === "active"
      filtered = filtered.filter((technician) => technician.active === isActive)
    }

    setFilteredTechnicians(filtered)
  }

  const handleViewDetails = async (technician: Technician) => {
    if (!accessToken) {
      setError("No hay token de autenticación")
      return
    }

    try {
      setIsLoadingDetails(true)
      console.log("Cargando detalles del técnico:", technician.id)

      // Obtener datos completos del técnico
      const fullTechnicianData = await getTechnicianById(technician.id, accessToken)
      console.log("Datos completos del técnico:", fullTechnicianData)

      setSelectedTechnician(fullTechnicianData)
      setIsDetailsModalOpen(true)
    } catch (error) {
      console.error("Error al cargar detalles del técnico:", error)
      setError("Error al cargar los detalles del técnico")
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleEditTechnician = (technicianId: number) => {
    console.log("Editando técnico:", technicianId)
    setEditTechnicianId(technicianId)
    setIsEditModalOpen(true)
  }

  const handleDeleteTechnician = async (technicianId: number) => {
    if (!accessToken) {
      setError("No hay token de autenticación")
      return
    }

    if (!confirm("¿Estás seguro de que quieres eliminar este técnico?")) {
      return
    }

    try {
      await deleteTechnician(technicianId, accessToken)
      setTechnicians((prev) => prev.filter((t) => t.id !== technicianId))
      console.log("Técnico eliminado exitosamente")
    } catch (error) {
      console.error("Error al eliminar técnico:", error)
      setError("Error al eliminar el técnico")
    }
  }

  const handleAddTechnician = (newTechnician: Technician) => {
    setTechnicians((prev) => [...prev, newTechnician])
  }

  const getUniqueSpecializations = () => {
    const specializations = technicians.map((t) => t.specialty).filter(Boolean)
    return [...new Set(specializations)]
  }

  if (isLoading) {
    return (
      <div className="space-y-6 ">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Técnicos</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`p-6 rounded-lg border animate-pulse ${
                darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Técnicos</h1>
        </div>
        <div
          className={`p-6 rounded-lg border text-center ${
            darkMode ? "bg-gray-800 border-gray-700 text-red-400" : "bg-white border-gray-200 text-red-600"
          }`}
        >
          <p>{error}</p>
          <button
            onClick={loadTechnicians}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Técnicos</h1>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {filteredTechnicians.length} técnico{filteredTechnicians.length !== 1 ? "s" : ""} encontrado
            {filteredTechnicians.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Técnico
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar técnicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="">Todas las especializaciones</option>
          {getUniqueSpecializations().map((specialization) => (
            <option key={specialization} value={specialization}>
              {specialization}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        <button
          onClick={() => {
            setSearchTerm("")
            setSpecializationFilter("")
            setStatusFilter("")
          }}
          className={`flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            darkMode
              ? "border-gray-700 text-gray-300 hover:bg-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Limpiar
        </button>
      </div>

      {/* Lista de Técnicos */}
      {filteredTechnicians.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No se encontraron técnicos</p>
          <p className="text-sm">
            {searchTerm || specializationFilter || statusFilter
              ? "Intenta ajustar los filtros de búsqueda"
              : "Comienza agregando tu primer técnico"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnicians.map((technician) => (
            <div
              key={technician.id}
              className={`p-6 rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleViewDetails(technician)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {technician.user.firstName} {technician.user.lastName}
                  </h3>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{technician.user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    technician.active
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}
                >
                  {technician.active ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">{technician.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">{technician.yearsOfExperience} años de experiencia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Nivel: {technician.certificationLevel}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleViewDetails(technician)
                  }}
                  disabled={isLoadingDetails}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-orange-600 hover:text-orange-700 transition-colors disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" />
                  {isLoadingDetails ? "Cargando..." : "Ver detalle"}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditTechnician(technician.id)
                    }}
                    className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
                    title="Editar técnico"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTechnician(technician.id)
                    }}
                    className="p-1 text-red-600 hover:text-red-700 transition-colors"
                    title="Eliminar técnico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      <TechnicianDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedTechnician(null)
        }}
        technician={selectedTechnician}
        darkMode={darkMode}
      />

      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTechnician={handleAddTechnician}
        darkMode={darkMode}
      />

      <EditTechnicianModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditTechnicianId(null)
        }}
        technicianId={editTechnicianId}
        onEditTechnician={loadTechnicians}
        darkMode={darkMode}
      />
    </div>
  )
}

export default TechniciansList
