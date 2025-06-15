"use client"

import React from "react"
import { useState } from "react"
import Modal from "../ui/Modal"
import { updateClient, deleteClient } from "../../services/api"
import { useUser } from "../../context/UserContext"
import type { Client } from "../../types/api"
import { Edit, Trash2, User, Mail, Phone, MapPin, Calendar, Building } from "lucide-react"

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  darkMode: boolean
  onUpdateClient: () => Promise<void>
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
  darkMode,
  onUpdateClient,
}) => {
  const { accessToken } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  })

  // Inicializar datos de edición cuando se abre el modal
  React.useEffect(() => {
    if (client && isOpen) {
      setEditFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        company: client.company || "",
      })
      setIsEditing(false)
      setShowDeleteConfirm(false)
      setError(null)
    }
  }, [client, isOpen])

  const handleEdit = () => {
    setIsEditing(true)
    setError(null)
  }

  const handleCancelEdit = () => {
    if (client) {
      setEditFormData({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        company: client.company || "",
      })
    }
    setIsEditing(false)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError(null)
  }

  const handleSaveEdit = async () => {
    if (!client || !accessToken) {
      setError("Error: No se puede actualizar el cliente.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await updateClient(
        client.id,
        {
          name: editFormData.name.trim(),
          email: editFormData.email.trim().toLowerCase(),
          phone: editFormData.phone.trim(),
          address: editFormData.address.trim(),
          company: editFormData.company.trim(),
        },
        accessToken,
      )

      await onUpdateClient()
      setIsEditing(false)
    } catch (error: any) {
      console.error("Error al actualizar cliente:", error)
      setError(error.message || "Error al actualizar el cliente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!client || !accessToken) {
      setError("Error: No se puede eliminar el cliente.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await deleteClient(client.id, accessToken)
      await onUpdateClient()
      onClose()
    } catch (error: any) {
      console.error("Error al eliminar cliente:", error)
      setError(error.message || "Error al eliminar el cliente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!client) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Cliente" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Mostrar error si existe */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Información del Cliente */}
        <div className="space-y-4">
          {isEditing ? (
            // Modo de edición
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Building className="inline w-4 h-4 mr-2" />
                  Empresa
                </label>
                <input
                  type="text"
                  name="company"
                  value={editFormData.company}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Dirección
                </label>
                <textarea
                  name="address"
                  value={editFormData.address}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>
          ) : (
            // Modo de visualización
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Nombre</p>
                  <p className="font-medium">{client.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{client.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{client.phone}</p>
                </div>
              </div>

              {client.company && (
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-500">Empresa</p>
                    <p className="font-medium">{client.company}</p>
                  </div>
                </div>
              )}

              {client.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de registro</p>
                  <p className="font-medium">{formatDate(client.createdAt)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-3">¿Estás seguro de que deseas eliminar este cliente?</p>
            <p className="text-red-600 text-sm mb-4">
              Esta acción no se puede deshacer. Se eliminará toda la información del cliente.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-between pt-6">
          <div className="flex space-x-3">
            {!isEditing && !showDeleteConfirm && (
              <>
                <button
                  onClick={handleEdit}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isLoading}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar
                </button>
              </>
            )}

            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={
                    isLoading || !editFormData.name.trim() || !editFormData.email.trim() || !editFormData.phone.trim()
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ClientDetailsModal
