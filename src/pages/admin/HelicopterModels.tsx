"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { getHelicopterModels, deleteHelicopterModel } from "../../services/api"
import type { HelicopterModel } from "../../types/api"
import AddHelicopterModelModal from "../../components/modals/AddHelicopterModelModal"
import EditHelicopterModelModal from "../../components/modals/EditHelicopterModelModal"
import { Plus, Edit, Trash2, Search } from "lucide-react"

const HelicopterModels: React.FC = () => {
  const { user, accessToken } = useUser()
  const { darkMode } = useTheme()
  const [models, setModels] = useState<HelicopterModel[]>([])
  const [filteredModels, setFilteredModels] = useState<HelicopterModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState<HelicopterModel | null>(null)

  useEffect(() => {
    loadModels()
  }, [])

  useEffect(() => {
    filterModels()
  }, [models, searchTerm])

  const loadModels = async () => {
    const token = accessToken || localStorage.getItem("ibex_access_token")

    if (!token) {
      console.error("No access token available")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const data = await getHelicopterModels(token)
      setModels(data)
    } catch (error) {
      console.error("Error al cargar modelos:", error)
      alert("Error al cargar los modelos de helicópteros")
    } finally {
      setIsLoading(false)
    }
  }

  const filterModels = () => {
    if (!searchTerm.trim()) {
      setFilteredModels(models)
      return
    }

    const filtered = models.filter((model) => model.name.toLowerCase().includes(searchTerm.toLowerCase()))
    setFilteredModels(filtered)
  }

  const handleEdit = (model: HelicopterModel) => {
    setSelectedModel(model)
    setShowEditModal(true)
  }

  const handleDelete = async (model: HelicopterModel) => {
    const token = accessToken || localStorage.getItem("ibex_access_token")

    if (!token) {
      alert("No hay token de acceso disponible")
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar el modelo "${model.name}"?\n\nEsta acción no se puede deshacer.`,
    )

    if (!confirmDelete) return

    try {
      await deleteHelicopterModel(model.id, token)
      alert("Modelo eliminado exitosamente")
      loadModels()
    } catch (error) {
      console.error("Error al eliminar modelo:", error)
      alert("Error al eliminar el modelo. Puede que esté siendo usado por helicópteros existentes.")
    }
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando modelos...</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-6 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Modelos de Helicópteros</h1>
        <p className={`${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Gestiona los modelos de helicópteros disponibles en el sistema
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar modelos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              darkMode
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
        >
          <Plus size={20} />
          Agregar Modelo
        </button>
      </div>

      {/* Models Grid */}
      {filteredModels.length === 0 ? (
        <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {searchTerm ? "No se encontraron modelos que coincidan con la búsqueda" : "No hay modelos registrados"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModels.map((model) => (
            <div
              key={model.id}
              className={`p-6 rounded-lg border transition-shadow hover:shadow-lg ${
                darkMode
                  ? "bg-gray-800 border-gray-700 hover:shadow-gray-900/20"
                  : "bg-white border-gray-200 hover:shadow-gray-200/50"
              }`}
            >
              {/* Model Info */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-center">{model.name}</h3>
              </div>

              {/* Actions */}
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handleEdit(model)}
                  className={`p-2 rounded-md transition-colors ${
                    darkMode ? "text-blue-400 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                  }`}
                  title="Editar modelo"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => handleDelete(model)}
                  className={`p-2 rounded-md transition-colors ${
                    darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                  }`}
                  title="Eliminar modelo"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div
        className={`mt-8 p-4 rounded-lg border ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            Total de modelos: {filteredModels.length}
            {searchTerm && ` (filtrados de ${models.length})`}
          </span>
        </div>
      </div>

      {/* Modals */}
      <AddHelicopterModelModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={loadModels} />

      <EditHelicopterModelModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={loadModels}
        model={selectedModel}
      />
    </div>
  )
}

export default HelicopterModels
