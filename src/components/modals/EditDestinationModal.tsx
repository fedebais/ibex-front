"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Edit } from "lucide-react"
import Modal from "../ui/Modal"
import { updateDestination } from "../../services/api"
import { useUser } from "../../context/UserContext"

interface EditDestinationModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdateDestination: (destination: any) => void
  destination: any
  darkMode: boolean
}

const EditDestinationModal: React.FC<EditDestinationModalProps> = ({
  isOpen,
  onClose,
  onUpdateDestination,
  destination,
  darkMode,
}) => {
  const { user, accessToken, isAuthenticated } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    altitude: "",
    active: true,
  })

  useEffect(() => {
    if (destination) {
      setFormData({
        name: destination.name || "",
        latitude: destination.latitude?.toString() || "",
        longitude: destination.longitude?.toString() || "",
        altitude: destination.altitude?.toString() || "",
        active: destination.active ?? true,
      })
    }
  }, [destination])

  const getAccessToken = () => {
    const token = accessToken || localStorage.getItem("accessToken")
    return token
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))

    if (error) setError("")
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("El nombre es requerido")
      return false
    }

    const lat = Number.parseFloat(formData.latitude)
    const lng = Number.parseFloat(formData.longitude)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError("La latitud debe estar entre -90 y 90")
      return false
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError("La longitud debe estar entre -180 y 180")
      return false
    }

    if (formData.altitude && isNaN(Number.parseFloat(formData.altitude))) {
      setError("La altitud debe ser un número válido")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const token = getAccessToken()
    if (!token) {
      setError("No hay token de autenticación disponible")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const destinationData = {
        name: formData.name.trim(),
        latitude: Number.parseFloat(formData.latitude),
        longitude: Number.parseFloat(formData.longitude),
        altitude: formData.altitude ? Number.parseFloat(formData.altitude) : null,
        active: formData.active,
      }

      const updatedDestination = await updateDestination(destination.id, destinationData, token)
      onUpdateDestination(updatedDestination)
      onClose()
    } catch (error: any) {
      console.error("Error al actualizar destino:", error)

      if (error.message?.includes("401")) {
        setError("No autorizado. Por favor, inicia sesión nuevamente.")
        localStorage.removeItem("accessToken")
      } else if (error.message?.includes("403")) {
        setError("No tienes permisos para editar destinos.")
      } else if (error.message?.includes("400")) {
        setError("Datos inválidos. Verifica la información ingresada.")
      } else {
        setError("Error al actualizar el destino. Inténtalo de nuevo.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setError("")
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-2xl">
      <div className={`p-6 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Edit className="w-6 h-6 text-orange-600" />
            Editar Destino
          </h2>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Nombre del Destino *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Ej: Aeropuerto Internacional"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Latitud *
              </label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                step="any"
                min="-90"
                max="90"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Ej: 19.4326"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Longitud *
              </label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                step="any"
                min="-180"
                max="180"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Ej: -99.1332"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Altitud (metros)
              </label>
              <input
                type="number"
                name="altitude"
                value={formData.altitude}
                onChange={handleInputChange}
                step="any"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                placeholder="Ej: 2240"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                disabled={isLoading}
              />
              <label className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Destino activo</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode ? "bg-gray-600 text-white hover:bg-gray-700" : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !isAuthenticated}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isLoading || !isAuthenticated
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isLoading ? "Actualizando..." : "Actualizar Destino"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default EditDestinationModal
