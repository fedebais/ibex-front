"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { getTechnicianById, updateTechnician } from "../../services/api"
import type { CertificationLevel, TechnicianSpecialty, UpdateTechnicianInput } from "../../types/api"
import { useUser } from "../../context/UserContext"
import Modal from "../ui/Modal"

interface EditTechnicianModalProps {
  isOpen: boolean
  onClose: () => void
  technicianId: number | null
  onEditTechnician: () => void
  darkMode: boolean
}

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  isOpen,
  onClose,
  technicianId,
  onEditTechnician,
  darkMode,
}) => {
  const { accessToken } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados del formulario - usando nombres correctos de la API
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
 const [specialty, setSpecialty] = useState<TechnicianSpecialty | "">("")
  const [certificationLevel, setCertificationLevel] = useState<CertificationLevel | "">("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [lastCertification, setLastCertification] = useState("")

  // Cargar datos del técnico cuando se abre el modal
  useEffect(() => {
    if (isOpen && technicianId && accessToken) {
      loadTechnicianData()
    }
  }, [isOpen, technicianId, accessToken])

  const loadTechnicianData = async () => {
    if (!technicianId || !accessToken) return

    try {
      setIsLoading(true)
      setError(null)
      console.log("Cargando datos del técnico ID:", technicianId)

      const technician = await getTechnicianById(technicianId, accessToken)
      console.log("Datos del técnico cargados:", technician)

      // Llenar el formulario con los datos existentes - usando nombres correctos
      setFirstName(technician.user.firstName || "")
      setLastName(technician.user.lastName || "")
      setEmail(technician.user.email || "")
      setPhone(technician.user.phone || "")
      setSpecialty(technician.specialty || "")
      setCertificationLevel(technician.certificationLevel || "")
      setYearsOfExperience(technician.yearsOfExperience?.toString() || "")
      setLastCertification(
        technician.lastCertification ? new Date(technician.lastCertification).toISOString().split("T")[0] : "",
      )
    } catch (error) {
      console.error("Error al cargar datos del técnico:", error)
      setError("Error al cargar los datos del técnico")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setSpecialty("")
    setCertificationLevel("")
    setYearsOfExperience("")
    setLastCertification("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!accessToken || !technicianId) {
      setError("No hay token de autenticación o ID de técnico")
      return
    }

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !specialty || !certificationLevel) {
      setError("Por favor completa todos los campos obligatorios")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido")
      return
    }

    const years = Number.parseInt(yearsOfExperience)
    if (isNaN(years) || years < 0 || years > 50) {
      setError("Los años de experiencia deben ser un número entre 0 y 50")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

const technicianData = {
  specialization: specialty as TechnicianSpecialty,
  certificationLevel: certificationLevel as CertificationLevel,
  experienceYears: years,
  lastCertification: lastCertification ? new Date(lastCertification).toISOString() : "",
  user: {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: phone.trim(),
  },
}



      console.log("Actualizando técnico con datos:", technicianData)
      await updateTechnician(technicianId, technicianData, accessToken)

      // Llamar al callback para actualizar la lista
      onEditTechnician()

      // Cerrar el modal
      onClose()
      resetForm()

      console.log("Técnico actualizado exitosamente")
    } catch (error: any) {
      console.error("Error al actualizar técnico:", error)

      if (error.response?.status === 401) {
        setError("No tienes autorización para realizar esta acción")
      } else if (error.response?.status === 403) {
        setError("No tienes permisos para actualizar técnicos")
      } else if (error.response?.status === 400) {
        setError("Datos inválidos. Verifica la información ingresada")
      } else {
        setError("Error al actualizar el técnico. Inténtalo de nuevo")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} darkMode={darkMode}  title="Editar Técnico">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Editar Técnico</h2>
        <button
          onClick={handleClose}
          className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900 dark:border-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Apellido *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Correo Electrónico *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 2944 123456"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              disabled={isSubmitting}
            />
          </div>

          {/* Información Técnica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Especialización *</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value as TechnicianSpecialty)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar especialización</option>
                <option value="MOTORES">Motores</option>
                <option value="AVIONICA">Aviónica</option>
                <option value="ESTRUCTURAS">Estructuras</option>
                <option value="SISTEMAS_HIDRAULICOS">Sistemas Hidráulicos</option>
                <option value="SISTEMAS_ELECTRICOS">Sistemas Eléctricos</option>
                <option value="MANTENIMIENTO_GENERAL">Mantenimiento General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nivel de Certificación *</label>
              <select
                value={certificationLevel}
                onChange={(e) => setCertificationLevel(e.target.value as CertificationLevel)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar nivel</option>
                <option value="BASICO">Básico</option>
                <option value="INTERMEDIO">Intermedio</option>
                <option value="AVANZADO">Avanzado</option>
                <option value="EXPERTO">Experto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Años de Experiencia *</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(e.target.value)}
                min="0"
                max="50"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Última Certificación</label>
              <input
                type="date"
                value={lastCertification}
                onChange={(e) => setLastCertification(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                  darkMode ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                darkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar Técnico"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditTechnicianModal
