"use client"

import type React from "react"

import { useState } from "react"
import Modal from "../ui/Modal"
import { createClient } from "../../services/api"
import { useUser } from "../../context/UserContext"

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onAddClient: (clientData: any) => void
  darkMode?: boolean
}

const AddClientModal = ({ isOpen, onClose, onAddClient, darkMode = false }: AddClientModalProps) => {
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [type, setType] = useState("corporate")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { user, accessToken, isAuthenticated } = useUser()

  const getAccessToken = (): string | null => {
    // Primero intentar obtener del contexto
    if (accessToken) {
      return accessToken
    }

    // Si no está en el contexto, obtener de localStorage
    const tokenFromStorage = localStorage.getItem("ibex_access_token")
    if (tokenFromStorage) {
      return tokenFromStorage
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const token = getAccessToken()

      if (!token) {
        throw new Error("No hay token de autenticación disponible. Por favor, inicia sesión nuevamente.")
      }

      if (!isAuthenticated) {
        throw new Error("Usuario no autenticado. Por favor, inicia sesión.")
      }

      const clientData = {
        name: name.trim(),
        contact: contact.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        type: type || null,
        notes: notes.trim() || null,
      }

      console.log("Enviando datos del cliente:", clientData)
      console.log("Token disponible:", !!token)

      const newClient = await createClient(clientData, token)

      console.log("Cliente creado exitosamente:", newClient)
      onAddClient(newClient)
      resetForm()
      onClose()
    } catch (error: any) {
      console.error("Error al crear cliente:", error)

      // Manejar diferentes tipos de errores
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
      } else if (error.message.includes("403") || error.message.includes("Forbidden")) {
        setError("No tienes permisos para realizar esta acción.")
      } else if (error.message.includes("400") || error.message.includes("Bad Request")) {
        setError("Datos inválidos. Por favor, verifica la información.")
      } else {
        setError(error.message || "Error al crear el cliente. Inténtalo nuevamente.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName("")
    setContact("")
    setEmail("")
    setPhone("")
    setAddress("")
    setType("corporate")
    setNotes("")
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Añadir Nuevo Cliente" maxWidth="max-w-lg" darkMode={darkMode}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div
            className={`p-3 rounded-md ${darkMode ? "bg-red-900/50 border border-red-700" : "bg-red-50 border border-red-200"}`}
          >
            <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-600"}`}>{error}</p>
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
          >
            Nombre / Empresa *
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label
              htmlFor="type"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Tipo de Cliente
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              disabled={isSubmitting}
            >
              <option value="corporate">Corporativo</option>
              <option value="individual">Individual</option>
              <option value="government">Gubernamental</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Correo Electrónico
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
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Teléfono
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
              disabled={isSubmitting}
            />
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
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
            }`}
            placeholder="Información adicional sobre el cliente..."
            disabled={isSubmitting}
          />
        </div>

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
            disabled={isSubmitting || !isAuthenticated}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cliente"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddClientModal
