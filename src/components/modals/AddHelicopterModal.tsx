"use client"

import type React from "react"

import { useState } from "react"
import Modal from "../ui/Modal"



interface AddHelicopterModalProps {
  isOpen: boolean
  onClose: () => void
  onAddHelicopter: (newHelicopter: any) => void
  darkMode: boolean
}

const AddHelicopterModal = ({ isOpen, onClose, onAddHelicopter }: Omit<AddHelicopterModalProps, 'darkMode'>) => {
  const [model, setModel] = useState("")
  const [registration, setRegistration] = useState("")
  const [yearManufactured, setYearManufactured] = useState("")
  const [lastMaintenance, setLastMaintenance] = useState("")
  const [status, setStatus] = useState("active")
  const [totalFlightHours, setTotalFlightHours] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío de datos
    setTimeout(() => {
      const newHelicopter = {
        id: Date.now().toString(),
        model,
        registration,
        yearManufactured: Number.parseInt(yearManufactured) || new Date().getFullYear(),
        lastMaintenance,
        status,
        totalFlightHours: Number.parseInt(totalFlightHours) || 0,
        image:
          imageUrl ||
          "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Bell_407_Helicopter_CBP.jpg/1200px-Bell_407_Helicopter_CBP.jpg",
      }

      onAddHelicopter(newHelicopter)
      setIsSubmitting(false)
      resetForm()
      onClose()
    }, 1000)
  }

  const resetForm = () => {
    setModel("")
    setRegistration("")
    setYearManufactured("")
    setLastMaintenance("")
    setStatus("active")
    setTotalFlightHours("")
    setImageUrl("")
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Helicóptero" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Modelo
            </label>
            <input
              type="text"
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label htmlFor="registration" className="block text-sm font-medium text-gray-700 mb-1">
              Matrícula
            </label>
            <input
              type="text"
              id="registration"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="yearManufactured" className="block text-sm font-medium text-gray-700 mb-1">
              Año de Fabricación
            </label>
            <input
              type="number"
              id="yearManufactured"
              value={yearManufactured}
              onChange={(e) => setYearManufactured(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              min="1980"
              max={new Date().getFullYear()}
              required
            />
          </div>

          <div>
            <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700 mb-1">
              Último Mantenimiento
            </label>
            <input
              type="date"
              id="lastMaintenance"
              value={lastMaintenance}
              onChange={(e) => setLastMaintenance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="active">Activo</option>
              <option value="maintenance">En Mantenimiento</option>
            </select>
          </div>

          <div>
            <label htmlFor="totalFlightHours" className="block text-sm font-medium text-gray-700 mb-1">
              Horas de Vuelo Totales
            </label>
            <input
              type="number"
              id="totalFlightHours"
              value={totalFlightHours}
              onChange={(e) => setTotalFlightHours(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
            URL de Imagen (opcional)
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar Helicóptero"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHelicopterModal
