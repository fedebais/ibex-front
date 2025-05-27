"use client"

import type React from "react"
import { useState } from "react"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { createHelicopterModel } from "../../services/api"
import Modal from "../ui/Modal"

interface AddHelicopterModelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const AddHelicopterModelModal: React.FC<AddHelicopterModelModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useUser()
  const { darkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const token = user?.accessToken || localStorage.getItem("ibex_access_token")

    if (!token) {
      alert("No hay token de acceso disponible")
      return
    }

    if (!formData.name.trim()) {
      alert("El nombre del modelo es requerido")
      return
    }

    setIsLoading(true)
    try {
      await createHelicopterModel(formData, token)
      alert("Modelo de helicóptero creado exitosamente")
      setFormData({ name: "" })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error al crear modelo:", error)
      alert("Error al crear el modelo de helicóptero")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: "" })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Modelo de Helicóptero" maxWidth="max-w-md">
      <div className={`p-6 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
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
              {isLoading ? "Creando..." : "Crear Modelo"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddHelicopterModelModal
