"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { updateHelicopterModel } from "../../services/api"
import type { EditHelicopterModelModalProps } from "../../types/api"
import Modal from "../ui/Modal"
import { X } from "lucide-react"

const EditHelicopterModelModal: React.FC<EditHelicopterModelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  model,
  darkMode,
}) => {
  const { accessToken } = useUser()
  const { darkMode: contextDarkMode } = useTheme()

  // Usar darkMode de props o del contexto
  const isDarkMode = darkMode !== undefined ? darkMode : contextDarkMode

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
  })

  // Cargar datos del modelo cuando cambia
  useEffect(() => {
    if (model) {
      setFormData({
        name: model.name,
      })
    }
  }, [model])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!model) {
      setError("No hay modelo seleccionado")
      return
    }

    if (!formData.name.trim()) {
      setError("El nombre del modelo es requerido")
      return
    }

    const token = accessToken || localStorage.getItem("ibex_access_token")
    if (!token) {
      setError("No hay token de acceso disponible")
      return
    }

    setIsLoading(true)
    try {
      await updateHelicopterModel(model.id, formData, token)
      setError("")
      if (onSuccess) {
        onSuccess()
      }
      onClose()
    } catch (error) {
      console.error("Error al actualizar modelo:", error)
      setError("Error al actualizar el modelo de helicóptero")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: "" })
    setError("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md" title="Editar Modelo">
      <div className={`p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Editar Modelo de Helicóptero</h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-md transition-colors ${
              isDarkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              isDarkMode
                ? "bg-red-900 border border-red-700 text-red-200"
                : "bg-red-100 border border-red-200 text-red-800"
            }`}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Nombre del Modelo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                isDarkMode
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
              disabled={isLoading}
              className={`px-4 py-2 rounded-md border transition-colors ${
                isDarkMode
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
