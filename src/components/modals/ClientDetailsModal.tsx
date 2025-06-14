"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { getClientById } from "../../services/api"
import { useUser } from "../../context/UserContext"
import { Building2, User, Phone, Mail, MapPin, FileText, Edit } from "lucide-react"
import EditClientModal from "./EditClientModal"
import type { Client } from "../../types/api"

// Función para formatear CUIT para visualización
const formatCuitDisplay = (cuit: string | null | undefined): string => {
  if (!cuit) return "No especificado"

  const numbers = cuit.replace(/\D/g, "")

  if (numbers.length === 11) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10)}`
  }

  return cuit // Devolver tal como está si no tiene 11 dígitos
}

interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  darkMode?: boolean
  onUpdateClient?: () => void
}

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  isOpen,
  onClose,
  client,
  darkMode = false,
  onUpdateClient,
}) => {
  const { accessToken } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [clientData, set_ClientData] = useState<Client | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Cargar datos completos del cliente
  useEffect(() => {
    const loadClientData = async () => {
      if (!client?.id || !accessToken || !isOpen) return

      setIsLoading(true)
      setError("")

      try {
        const fullClientData = await getClientById(client.id, accessToken)
        set_ClientData(fullClientData)
      } catch (error: any) {
        console.error("Error loading client:", error)
        setError("Error al cargar los datos del cliente")
        set_ClientData(client) // Usar datos básicos como fallback
      } finally {
        setIsLoading(false)
      }
    }

    loadClientData()
  }, [client?.id, accessToken, isOpen])

  const handleEditSuccess = async () => {
    // Recargar datos después de editar
    if (client?.id && accessToken) {
      try {
        const updatedClient = await getClientById(client.id, accessToken)
        set_ClientData(updatedClient)
        if (onUpdateClient) {
          onUpdateClient()
        }
      } catch (error) {
        console.error("Error reloading client data:", error)
      }
    }
  }

  const displayClient = clientData || client

  if (!displayClient) {
    return null
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Cliente" darkMode={darkMode}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className={`ml-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Cargando detalles del cliente...</span>
        </div>
      </Modal>
    )
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Cliente" darkMode={darkMode}>
        <div className="space-y-6">
          {error && (
            <div
              className={`p-3 rounded-md ${darkMode ? "bg-red-900/50 border border-red-700" : "bg-red-50 border border-red-200"}`}
            >
              <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>{error}</p>
            </div>
          )}

          {/* Información básica */}
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} p-4 rounded-lg border`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                Información General
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar Cliente
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Building2 className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Nombre/Empresa
                  </p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{displayClient.name}</p>
                </div>
              </div>

              <div className="flex items-center">
                <FileText className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>CUIT</p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {formatCuitDisplay(displayClient.cuit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <User className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Contacto</p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>{displayClient.contact}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Building2 className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Tipo</p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {displayClient.type === "corporate"
                      ? "Corporativo"
                      : displayClient.type === "individual"
                        ? "Individual"
                        : displayClient.type === "government"
                          ? "Gubernamental"
                          : "Sin especificar"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} p-4 rounded-lg border`}
          >
            <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-4`}>
              Información de Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Mail className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email</p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {displayClient.email || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <Phone className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Teléfono</p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {displayClient.phone || "No especificado"}
                  </p>
                </div>
              </div>

              <div className="flex items-start md:col-span-2">
                <MapPin className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-500"} mr-3 mt-0.5`} />
                <div>
                  <p className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Dirección</p>
                  <p className={`text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {displayClient.address || "No especificada"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notas */}
          {displayClient.notes && (
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"} p-4 rounded-lg border`}
            >
              <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>Notas</h3>
              <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{displayClient.notes}</p>
            </div>
          )}

          {/* Estado */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Estado del cliente:
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                displayClient.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {displayClient.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
      </Modal>

      {/* Modal de edición */}
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clientId={displayClient.id}
        onEditClient={handleEditSuccess}
        darkMode={darkMode}
      />
    </>
  )
}

export default ClientDetailsModal
