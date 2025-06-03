"use client"

import type React from "react"
import Modal from "../ui/Modal"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { updateHelicopter, getHelicopterModels } from "../../services/api"
import type { Helicopter, HelicopterModel } from "../../types/api"

interface EditHelicopterModalProps {
  isOpen: boolean
  onClose: () => void
  helicopter: Helicopter | null
  onUpdateHelicopter: (updated: Partial<Helicopter>) => void
  darkMode?: boolean
}

interface EditHelicopterFormData {
  modelId: number
  registration: string
  manufactureYear: number | null
  totalFlightHours: number | null
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE"
  imageUrl: string
}

const EditHelicopterModal = ({
  isOpen,
  onClose,
  helicopter,
  onUpdateHelicopter,
  darkMode = false,
}: EditHelicopterModalProps) => {
  const { accessToken } = useUser()
  const [formData, setFormData] = useState<EditHelicopterFormData>({
    modelId: 0,
    registration: "",
    manufactureYear: null,
    totalFlightHours: null,
    status: "ACTIVE",
    imageUrl: "",
  })
  const [helicopterModels, setHelicopterModels] = useState<HelicopterModel[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState("")

  // Cargar modelos de helicópteros
  useEffect(() => {
    if (isOpen) {
      loadHelicopterModels()
    }
  }, [isOpen])

  // Cargar datos del helicóptero cuando se abre el modal
  useEffect(() => {
    if (helicopter && isOpen) {
      setFormData({
        modelId: helicopter.modelId,
        registration: helicopter.registration,
        manufactureYear: helicopter.manufactureYear ?? null,
        totalFlightHours: helicopter.totalFlightHours ?? null,
        status: helicopter.status ?? "ACTIVE",
        imageUrl: helicopter.imageUrl || "",
      })
    }
  }, [helicopter, isOpen])

  const loadHelicopterModels = async () => {
    try {
      setIsLoadingModels(true)
      setModelsError("")
      const token = accessToken || localStorage.getItem("ibex_access_token")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const models = await getHelicopterModels(token)
      setHelicopterModels(models)
    } catch (err) {
      console.error("Error al cargar modelos de helicópteros:", err)
      setModelsError("Error al cargar los modelos de helicópteros. Por favor, recargue la página.")
      setHelicopterModels([])
    } finally {
      setIsLoadingModels(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "manufactureYear" || name === "totalFlightHours" || name === "modelId" ? Number(value) || null : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones
    if (!formData.modelId || formData.modelId === 0) {
      setError("Debe seleccionar un modelo válido")
      return
    }

    if (!formData.registration.trim()) {
      setError("La matrícula es obligatoria")
      return
    }

    if (!formData.manufactureYear || formData.manufactureYear < 1950) {
      setError("El año de fabricación debe ser válido (posterior a 1950)")
      return
    }

    if (formData.totalFlightHours === null || formData.totalFlightHours < 0) {
      setError("Las horas de vuelo no pueden ser negativas")
      return
    }

    const token = accessToken || localStorage.getItem("ibex_access_token")
    if (!token) {
      setError("No se pudo verificar la autenticación. Por favor, inicie sesión de nuevo.")
      return
    }

    if (!helicopter) {
      setError("No se encontró la información del helicóptero")
      return
    }

    try {
      setIsUpdating(true)

      const updatedHelicopter = {
        registration: formData.registration,
        manufactureYear: formData.manufactureYear,
        totalFlightHours: formData.totalFlightHours,
        status: formData.status,
        imageUrl: formData.imageUrl,
        modelId: formData.modelId,
      }

      await updateHelicopter(helicopter.id, updatedHelicopter, token)

      // Actualizar el helicóptero en el componente padre
      if (onUpdateHelicopter) {
        onUpdateHelicopter({
          ...helicopter,
          ...updatedHelicopter,
        })
      }

      onClose()
    } catch (err) {
      console.error("Error al actualizar el helicóptero:", err)
      setError("No se pudo actualizar el helicóptero. Por favor, intente de nuevo.")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClose = () => {
    setError("")
    setModelsError("")
    onClose()
  }

  if (!helicopter) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Helicóptero" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className={`p-3 rounded-md text-sm ${
              darkMode
                ? "bg-red-900 border border-red-700 text-red-200"
                : "bg-red-100 border border-red-200 text-red-800"
            }`}
          >
            {error}
          </div>
        )}

        {modelsError && (
          <div
            className={`p-3 rounded-md text-sm ${
              darkMode
                ? "bg-red-900 border border-red-700 text-red-200"
                : "bg-red-100 border border-red-200 text-red-800"
            }`}
          >
            {modelsError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Modelo */}
          <div>
            <label
              htmlFor="modelId"
              className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Modelo *
            </label>
            {isLoadingModels ? (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                <span className={`ml-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Cargando modelos...
                </span>
              </div>
            ) : modelsError ? (
              <div
                className={`p-2 rounded border text-sm ${
                  darkMode ? "bg-gray-700 border-red-600 text-red-300" : "bg-red-50 border-red-300 text-red-700"
                }`}
              >
                No se pudieron cargar los modelos
              </div>
            ) : (
              <select
                id="modelId"
                name="modelId"
                value={formData.modelId}
                onChange={handleInputChange}
                required
                disabled={helicopterModels.length === 0}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value={0}>
                  {helicopterModels.length === 0 ? "No hay modelos disponibles" : "Seleccionar modelo"}
                </option>
                {helicopterModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Matrícula */}
          <div>
            <label
              htmlFor="registration"
              className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Matrícula *
            </label>
            <input
              type="text"
              id="registration"
              name="registration"
              value={formData.registration}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Ej: XA-ABC"
            />
          </div>

          {/* Año de Fabricación */}
          <div>
            <label
              htmlFor="manufactureYear"
              className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Año de Fabricación *
            </label>
            <input
              type="number"
              id="manufactureYear"
              name="manufactureYear"
              value={formData.manufactureYear ?? ""}
              onChange={handleInputChange}
              required
              min="1950"
              max={new Date().getFullYear()}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="2020"
            />
          </div>

          {/* Horas de Vuelo */}
          <div>
            <label
              htmlFor="totalFlightHours"
              className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Horas de Vuelo *
            </label>
            <input
              type="number"
              id="totalFlightHours"
              name="totalFlightHours"
              value={formData.totalFlightHours ?? ""}
              onChange={handleInputChange}
              required
              min="0"
              step="0.1"
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="0"
            />
          </div>

          {/* Estado */}
          <div>
            <label
              htmlFor="status"
              className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Estado *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="ACTIVE">Activo</option>
              <option value="MAINTENANCE">En Mantenimiento</option>
              <option value="INACTIVE">Inactivo</option>
            </select>
          </div>
        </div>

        {/* URL de la Imagen */}
        <div>
          <label
            htmlFor="imageUrl"
            className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
          >
            URL de la Imagen
          </label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {/* Vista previa de la imagen */}
        {formData.imageUrl && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Vista Previa
            </label>
            <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-300">
              <img
                src={formData.imageUrl || "/placeholder.svg"}
                alt="Vista previa"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=200&width=400"
                }}
              />
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isUpdating}
            className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
              darkMode
                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isUpdating || modelsError !== ""}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isUpdating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditHelicopterModal
