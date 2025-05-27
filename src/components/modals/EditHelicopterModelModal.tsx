"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { updateHelicopterModel } from "../../services/api"
import type { HelicopterModel } from "../../types/api"
import Modal from "../ui/Modal"
import { X } from "lucide-react"

interface EditHelicopterModelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  model: HelicopterModel | null
}

const EditHelicopterModelModal: React.FC<EditHelicopterModelModalProps> = ({ isOpen, onClose, onSuccess, model }) => {
  const { user } = useUser()
  const { darkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
  })

  useEffect(() => {
    if (model) {
      setFormData({
        name: model.name,
      })
    }
  }, [model])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.accessToken || !model) {
      alert("No hay token de acceso disponible o modelo seleccionado")
      return
    }

    if (!formData.name.trim()) {
      alert("El nombre del modelo es requerido")
      return
    }

    setIsLoading(true)
    try {
      await updateHelicopterModel(model.id, formData, user.accessToken)
      alert("Modelo de helicóptero actualizado exitosamente")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al actualizar modelo:", error)
      alert("Error al actualizar el modelo de helicóptero")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: "" })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
      <div className={`p-6 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Editar Modelo de Helicóptero</h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-md transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Nombre del Modelo *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Ej: Bell 206, Robinson R44, etc."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-md border transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Actualizando..." : "Actualizar Modelo"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default EditHelicopterModelModal
