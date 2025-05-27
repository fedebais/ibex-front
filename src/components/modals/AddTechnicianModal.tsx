"use client"

import type React from "react"
import { useState } from "react"
import Modal from "../ui/Modal"
import { createTechnician } from "../../services/api"
import { useUser } from "../../context/UserContext"
import type { Technician, TechnicianSpecialization, CertificationLevel } from "../../types/api"

interface AddTechnicianModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTechnician: (technician: Technician) => void
  darkMode: boolean
}

// Mapeo de valores para mostrar en español pero enviar en inglés
const SPECIALIZATION_OPTIONS: { value: TechnicianSpecialization; label: string }[] = [
  { value: "MOTORES", label: "Motores" },
  { value: "AVIONICA", label: "Aviónica" },
  { value: "ESTRUCTURAS", label: "Estructuras" },
  { value: "SISTEMAS_HIDRAULICOS", label: "Sistemas Hidráulicos" },
  { value: "SISTEMAS_ELECTRICOS", label: "Sistemas Eléctricos" },
  { value: "MANTENIMIENTO_GENERAL", label: "Mantenimiento General" },
]

const CERTIFICATION_LEVEL_OPTIONS: { value: CertificationLevel; label: string }[] = [
  { value: "BASICO", label: "Básico" },
  { value: "INTERMEDIO", label: "Intermedio" },
  { value: "AVANZADO", label: "Avanzado" },
  { value: "EXPERTO", label: "Experto" },
]

const AddTechnicianModal: React.FC<AddTechnicianModalProps> = ({ isOpen, onClose, onAddTechnician, darkMode }) => {
  const { accessToken } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    specialization: "" as TechnicianSpecialization | "",
    certificationLevel: "" as CertificationLevel | "",
    experienceYears: 0,
    lastCertification: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setError(null) // Limpiar error al cambiar campos

    setFormData((prev) => ({
      ...prev,
      [name]: name === "experienceYears" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!accessToken) {
      setError("No hay token de autenticación. Por favor, inicia sesión nuevamente.")
      return
    }

    // Validaciones adicionales
    if (!formData.specialization || !formData.certificationLevel) {
      setError("Por favor, selecciona una especialización y nivel de certificación.")
      return
    }

    if (formData.experienceYears < 0 || formData.experienceYears > 50) {
      setError("Los años de experiencia deben estar entre 0 y 50.")
      return
    }

    setIsLoading(true)

    try {
      const technicianData = {
        user: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
        },
        specialization: formData.specialization as TechnicianSpecialization,
        certificationLevel: formData.certificationLevel as CertificationLevel,
        experienceYears: formData.experienceYears,
        lastCertification: formData.lastCertification,
      }

      console.log("Enviando datos del técnico:", technicianData)

      const newTechnician = await createTechnician(technicianData, accessToken)

      console.log("Técnico creado exitosamente:", newTechnician)

      onAddTechnician(newTechnician)

      // Limpiar formulario
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        specialization: "",
        certificationLevel: "",
        experienceYears: 0,
        lastCertification: "",
      })

      onClose()
    } catch (error: any) {
      console.error("Error al crear técnico:", error)

      // Manejo específico de errores
      if (error.message?.includes("401")) {
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.")
        // Limpiar token inválido
        localStorage.removeItem("accessToken")
      } else if (error.message?.includes("403")) {
        setError("No tienes permisos para crear técnicos.")
      } else if (error.message?.includes("400")) {
        setError("Datos inválidos. Verifica que el email no esté en uso.")
      } else if (error.message?.includes("email")) {
        setError("El email ya está registrado en el sistema.")
      } else {
        setError(error.message || "Error al crear el técnico. Inténtalo nuevamente.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.password &&
    formData.specialization &&
    formData.certificationLevel &&
    formData.lastCertification &&
    formData.experienceYears >= 0

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agregar Nuevo Técnico" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mostrar error si existe */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        {/* Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="col-span-full text-lg font-semibold mb-4">Información Personal</h3>

          <div>
            <label className="block text-sm font-medium mb-2">Nombre *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Apellido *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teléfono *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div className="col-span-full">
            <label className="block text-sm font-medium mb-2">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              minLength={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
          </div>
        </div>

        {/* Información Técnica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <h3 className="col-span-full text-lg font-semibold mb-4">Información Técnica</h3>

          <div>
            <label className="block text-sm font-medium mb-2">Especialización *</label>
            <select
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">Seleccionar especialización</option>
              {SPECIALIZATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nivel de Certificación *</label>
            <select
              name="certificationLevel"
              value={formData.certificationLevel}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <option value="">Seleccionar nivel</option>
              {CERTIFICATION_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Años de Experiencia *</label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleInputChange}
              min="0"
              max="50"
              required
              disabled={isLoading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Última Certificación *</label>
            <input
              type="date"
              name="lastCertification"
              value={formData.lastCertification}
              onChange={handleInputChange}
              required
              disabled={isLoading}
              max={new Date().toISOString().split("T")[0]} // No permitir fechas futuras
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isFormValid && !isLoading
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Creando..." : "Crear Técnico"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddTechnicianModal
