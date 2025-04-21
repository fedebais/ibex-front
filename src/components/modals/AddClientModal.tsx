"use client"

import type React from "react"

import { useState } from "react"
import Modal from "../ui/Modal"

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onAddClient: (clientData: any) => void
  darkMode?: boolean
}

const AddClientModal = ({ isOpen, onClose, onAddClient, darkMode = false }: AddClientModalProps) => {
  const [name, setName] = useState("")
  const [contactPerson, setContactPerson] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [type, setType] = useState("corporate")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío de datos
    setTimeout(() => {
      const newClient = {
        id: Date.now().toString(),
        name,
        contactPerson,
        email,
        phone,
        address,
        type,
        status: "active",
        notes,
      }

      onAddClient(newClient)
      setIsSubmitting(false)
      resetForm()
      onClose()
    }, 1000)
  }

  const resetForm = () => {
    setName("")
    setContactPerson("")
    setEmail("")
    setPhone("")
    setAddress("")
    setType("corporate")
    setNotes("")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Cliente" maxWidth="max-w-lg" darkMode={darkMode}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
          >
            Nombre / Empresa
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
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="contactPerson"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Persona de Contacto
            </label>
            <input
              type="text"
              id="contactPerson"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              required
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
              required
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
              required
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
              required
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
            required
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
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              darkMode
                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar Cliente"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddClientModal
