"use client"

import { useState } from "react"
import Modal from "../ui/Modal"
import EditClientModal from "./EditClientModal"
import type { ClientDetailsModalProps } from "../../types/api"

const ClientDetailsModal = ({ isOpen, onClose, client, darkMode = false, onUpdateClient }: ClientDetailsModalProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  console.log("=== ClientDetailsModal Debug ===")
  console.log("isOpen:", isOpen)
  console.log("client recibido:", client)

  if (!client) {
    console.log("❌ No hay cliente - modal no se renderiza")
    return null
  }

  const handleEditClient = () => {
    setIsEditModalOpen(true)
  }

  const handleEditComplete = () => {
    setIsEditModalOpen(false)
    if (onUpdateClient) {
      onUpdateClient()
    }
  }

  const getTypeLabel = (type: string | null): string => {
    if (!type) return "No especificado"

    switch (type.toLowerCase()) {
      case "corporate":
        return "Corporativo"
      case "individual":
        return "Individual"
      case "government":
        return "Gubernamental"
      default:
        return "No especificado"
    }
  }

  const getStatusLabel = (status: string | undefined): string => {
    if (!status) return client.active ? "Activo" : "Inactivo"

    switch (status.toLowerCase()) {
      case "active":
        return "Activo"
      case "inactive":
        return "Inactivo"
      default:
        return "No especificado"
    }
  }

  const getStatusBadgeColor = (status: string | undefined): string => {
    if (!status) {
      return client.active
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }

    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  console.log("✅ Modal se va a renderizar con cliente:", client)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Cliente" maxWidth="max-w-2xl" darkMode={darkMode}>
        <div className="space-y-6">
          {/* Información básica del cliente */}
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{client.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(client.status)}`}>
                {getStatusLabel(client.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Persona de Contacto</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {client.contactPerson || client.contact || "No disponible"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tipo</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {getTypeLabel(client.type)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {client.email || "No disponible"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {client.phone || "No disponible"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dirección</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {client.address || "No disponible"}
                </p>
              </div>
              {client.notes && (
                <div className="md:col-span-2">
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Notas</p>
                  <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{client.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Información Adicional
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>ID del Cliente</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{client.id}</p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Estado</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(client.status)}`}
                >
                  {getStatusLabel(client.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Nota informativa */}
          <div
            className={`p-4 rounded-lg border ${
              darkMode ? "bg-blue-900 border-blue-700 text-blue-200" : "bg-blue-50 border-blue-200 text-blue-700"
            }`}
          >
            <div className="flex items-center">
              <svg
                className={`h-5 w-5 mr-2 ${darkMode ? "text-blue-300" : "text-blue-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">
                Para ver el historial de vuelos y estadísticas detalladas, consulte el módulo de gestión de vuelos.
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                darkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleEditClient}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Editar Cliente
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clientId={client.id}
        onEditClient={handleEditComplete}
        darkMode={darkMode}
      />
    </>
  )
}

export default ClientDetailsModal
