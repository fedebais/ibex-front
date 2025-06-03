"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { updateClient, getClientById } from "../../services/api"
import { useUser } from "../../context/UserContext"

interface EditClientModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: number | null
  onEditClient: () => void
  darkMode?: boolean
}

const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  clientId,
  onEditClient,
  darkMode = false,
}) => {
  const { accessToken } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Estados del formulario
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [contact, setContact] = useState("")
  const [address, setAddress] = useState("")
  const [type, setType] = useState<"corporate" | "individual" | "government">("corporate")
  const [notes, setNotes] = useState("")
  const [active, setActive] = useState(true)

  // Cargar datos del cliente
  useEffect(() => {
    const loadClientData = async () => {
      if (!clientId || !accessToken || !isOpen) return

      setIsLoading(true)
      setError("")

      try {
        const client = await getClientById(clientId, accessToken)

        setName(client.name || "")
        setEmail(client.email || "")
        setPhone(client.phone || "")
        setContact(client.contact || "")
        setAddress(client.address || "")
        setType(client.type || "corporate")
        setNotes(client.notes || "")
        setActive(client.active !== false)
      } catch (error: any) {
        console.error("Error loading client:", error)
        setError("Error al cargar los datos del cliente")
      } finally {
        setIsLoading(false)
      }
    }

    loadClientData()
  }, [clientId, accessToken, isOpen])

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setContact("")
    setAddress("")
    setType("corporate")
    setNotes("")
    setActive(true)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clientId || !accessToken) {
      setError("No se puede actualizar el cliente. Falta información de autenticación.")
      return
    }

    if (!name.trim() || !email.trim() || !phone.trim() || !contact.trim()) {
      setError("Por favor, completa todos los campos obligatorios.")
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un email válido.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const clientData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        contact: contact.trim(),
        address: address.trim(),
        type,
        notes: notes.trim(),
        active,
      }

      await updateClient(clientId, clientData, accessToken)

      resetForm()
      onEditClient()
      onClose()
    } catch (error: any) {
      console.error("Error updating client:", error)
      if (error.response?.status === 401) {
        setError("No tienes autorización para realizar esta acción.")
      } else if (error.response?.status === 403) {
        setError("No tienes permisos para editar clientes.")
      } else if (error.response?.status === 400) {
        setError("Datos inválidos. Verifica la información ingresada.")
      } else {
        setError("Error al actualizar el cliente. Inténtalo de nuevo.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Editar Cliente" darkMode={darkMode}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className={`ml-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Cargando datos del cliente...</span>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Cliente" darkMode={darkMode}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

        {/* Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="name"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Nombre *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="contact"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Persona de Contacto *
            </label>
            <input
              type="text"
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
          >
            Correo Electrónico *
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
            }`}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="phone"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="type"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Tipo de Cliente *
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "corporate" | "individual" | "government")}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              required
              disabled={isSubmitting}
            >
              <option value="corporate">Corporativo</option>
              <option value="individual">Individual</option>
              <option value="government">Gubernamental</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="address"
            className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
          >
            Dirección
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
            }`}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
          >
            Notas
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
            }`}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="active" className={`ml-2 block text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Cliente activo
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              darkMode
                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Actualizando..." : "Actualizar Cliente"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditClientModal
