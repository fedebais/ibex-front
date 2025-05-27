"use client"

import type React from "react"
import { MapPin, Navigation, Mountain, Calendar, CheckCircle, XCircle } from "lucide-react"
import Modal from "../ui/Modal"

interface DestinationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  destination: any
  darkMode: boolean
}

const DestinationDetailsModal: React.FC<DestinationDetailsModalProps> = ({
  isOpen,
  onClose,
  destination,
  darkMode,
}) => {
  if (!destination) return null

  const formatCoordinate = (value: number, type: "lat" | "lng") => {
    if (typeof value !== "number") return "N/A"

    const direction = type === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W"

    return `${Math.abs(value).toFixed(6)}° ${direction}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Fecha inválida"
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Destino" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Información básica */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-600" />
            Información General
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Nombre
              </label>
              <p className="text-lg font-medium">{destination.name || "N/A"}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Estado
              </label>
              <div className="flex items-center gap-2">
                {destination.active ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-600 font-medium">Activo</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-600 font-medium">Inactivo</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Coordenadas */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-orange-600" />
            Coordenadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Latitud
              </label>
              <p className="text-lg font-mono">{formatCoordinate(destination.latitude, "lat")}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {destination.latitude || "N/A"}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Longitud
              </label>
              <p className="text-lg font-mono">{formatCoordinate(destination.longitude, "lng")}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {destination.longitude || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Altitud */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-orange-600" />
            Altitud
          </h3>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Altura sobre el nivel del mar
            </label>
            <p className="text-lg font-medium">
              {destination.altitude ? `${destination.altitude} metros` : "No especificada"}
            </p>
          </div>
        </div>

        {/* Fechas */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Información de Registro
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Fecha de Creación
              </label>
              <p className="text-sm">{formatDate(destination.createdAt)}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                Última Actualización
              </label>
              <p className="text-sm">{formatDate(destination.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* ID del destino */}
        <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              ID del Destino
            </label>
            <p className="text-sm font-mono text-gray-500">#{destination.id}</p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default DestinationDetailsModal
