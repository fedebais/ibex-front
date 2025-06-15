"use client"

import React from "react"
import { useState } from "react"
import Modal from "../ui/Modal"
import { useUser } from "../../context/UserContext"
import type { Client } from "../../types/api"
import { Edit, Trash2, User, Mail, Phone, MapPin, Building, FileText } from "lucide-react"
import { updateClient, deleteClient } from "../../services/api"

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
    contact: "",
    cuit: "",
    email: "",
    phone: "",
    address: "",
    type: "",
    notes: "",
  })

  // Inicializar datos de edición cuando se abre el modal
  React.useEffect(() => {
    if (client && isOpen) {
      console.log("=== INICIALIZANDO MODAL CLIENTE ===")
      console.log("Cliente completo:", client)
      console.log("CUIT del cliente:", client.cuit)
      console.log("Tipo de CUIT:", typeof client.cuit)

      setEditFormData({
        name: client.name || "",
        contact: client.contact || "",
        cuit: client.cuit || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        type: client.type || "",
        notes: client.notes || "",
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
        contact: client.contact || "",
        cuit: client.cuit || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        type: client.type || "",
        notes: client.notes || "",
      })
    }
    setIsEditing(false)
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
          contact: editFormData.contact.trim(),
          cuit: editFormData.cuit.trim(),
          email: editFormData.email.trim() || null,
          phone: editFormData.phone.trim() || null,
          address: editFormData.address.trim() || null,
          type: editFormData.type || null,
          notes: editFormData.notes.trim() || null,
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

  const formatCuit = (cuit: string | null | undefined): string => {
    console.log("=== FORMATEANDO CUIT EN MODAL ===")
    console.log("CUIT recibido:", cuit)
    console.log("Tipo de CUIT:", typeof cuit)

    if (!cuit || cuit === null || cuit === undefined) {
      console.log("CUIT vacío, devolviendo 'No especificado'")
      return "No especificado"
    }

    const cuitString = String(cuit).trim()
    console.log("CUIT como string:", cuitString)

    if (cuitString === "" || cuitString === "null" || cuitString === "undefined") {
      console.log("CUIT string vacío, devolviendo 'No especificado'")
      return "No especificado"
    }

    const numbers = cuitString.replace(/\D/g, "")
    console.log("Solo números:", numbers)

    if (numbers.length === 11) {
      const formatted = `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10)}`
      console.log("CUIT formateado:", formatted)
      return formatted
    }

    console.log("CUIT sin formato estándar, devolviendo tal como está:", cuitString)
    return cuitString
  }

  const getTypeLabel = (type: string | null) => {
    switch (type) {
      case "corporate":
        return "Corporativo"
      case "individual":
        return "Individual"
      case "government":
        return "Gubernamental"
      default:
        return "Sin especificar"
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Cliente" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Mostrar error si existe */}
        {error && (
          <div
            className={`p-3 rounded-md ${
              darkMode ? "bg-red-900/50 border border-red-700" : "bg-red-50 border border-red-200"
            }`}
          >
            <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>{error}</p>
          </div>
        )}

        {/* Información del Cliente */}
        <div className="space-y-4">
          {isEditing ? (
            // Modo de edición
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Building className="inline w-4 h-4 mr-2" />
                  Nombre/Empresa *
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
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <User className="inline w-4 h-4 mr-2" />
                  Persona de Contacto *
                </label>
                <input
                  type="text"
                  name="contact"
                  value={editFormData.contact}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <FileText className="inline w-4 h-4 mr-2" />
                  CUIT *
                </label>
                <input
                  type="text"
                  name="cuit"
                  value={editFormData.cuit}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  placeholder="XX-XXXXXXXX-X"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Phone className="inline w-4 h-4 mr-2" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <Building className="inline w-4 h-4 mr-2" />
                  Tipo de Cliente
                </label>
                <select
                  name="type"
                  value={editFormData.type}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="individual">Individual</option>
                  <option value="corporate">Corporativo</option>
                  <option value="government">Gubernamental</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
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

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  <FileText className="inline w-4 h-4 mr-2" />
                  Notas
                </label>
                <textarea
                  name="notes"
                  value={editFormData.notes}
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
            <div className={`space-y-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-orange-600" />
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nombre/Empresa</p>
                  <p className="font-medium">{client.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-orange-600" />
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Persona de Contacto</p>
                  <p className="font-medium">{client.contact}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-orange-600" />
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>CUIT</p>
                  <p className="font-medium">{formatCuit(client.cuit)}</p>
                </div>
              </div>

              {client.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                    <p className="font-medium">{client.email}</p>
                  </div>
                </div>
              )}

              {client.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</p>
                    <p className="font-medium">{client.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-orange-600" />
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tipo</p>
                  <p className="font-medium">{getTypeLabel(client.type)}</p>
                </div>
              </div>

              {client.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Dirección</p>
                    <p className="font-medium">{client.address}</p>
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Notas</p>
                    <p className="font-medium">{client.notes}</p>
                  </div>
                </div>
              )}

              {/* Estado del cliente */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Estado del cliente:
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {client.active ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Confirmación de eliminación */}
        {showDeleteConfirm && (
          <div
            className={`p-4 rounded-lg ${
              darkMode ? "bg-red-900/50 border border-red-700" : "bg-red-50 border border-red-200"
            }`}
          >
            <p className={`font-medium mb-3 ${darkMode ? "text-red-300" : "text-red-800"}`}>
              ¿Estás seguro de que deseas eliminar este cliente?
            </p>
            <p className={`text-sm mb-4 ${darkMode ? "text-red-400" : "text-red-600"}`}>
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
                className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
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
                    isLoading || !editFormData.name.trim() || !editFormData.contact.trim() || !editFormData.cuit.trim()
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className={`px-4 py-2 border rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    darkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
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
