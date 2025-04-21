"use client"

import type React from "react"

import { useState } from "react"
import Modal from "../ui/Modal"

interface AddPilotModalProps {
  isOpen: boolean
  onClose: () => void
  onAddPilot: (pilotData: any) => void
  darkMode?: boolean
}

const AddPilotModal = ({ isOpen, onClose, onAddPilot, darkMode = false }: AddPilotModalProps) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [flightHours, setFlightHours] = useState("")
 // const [licenseExpiry, setLicenseExpiry] = useState("")
  const [medicalExpiry, setMedicalExpiry] = useState("")
  const [lastTraining, setLastTraining] = useState("")
  const [certifications, setCertifications] = useState<string[]>(["VFR"])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Añadir al inicio del componente, después de los otros estados
  const [aircraftCertifications, setAircraftCertifications] = useState<{ model: string; date: string }[]>([
    { model: "", date: "" }
  ])
  

  // Lista de modelos de helicópteros disponibles
  const helicopterModels = ["Bell 407", "Airbus H125", "Robinson R44", "Sikorsky S-76"]

  // Funciones para manejar las certificaciones por aeronave
  const handleAircraftCertChange = (index: number, field: "model" | "date", value: string) => {
    const newCerts = [...aircraftCertifications]
    newCerts[index][field] = value
    setAircraftCertifications(newCerts)
  }

  const addAircraftCert = () => {
    setAircraftCertifications([...aircraftCertifications, { model: "", date: "" }])
  }

  const removeAircraftCert = (index: number) => {
    if (aircraftCertifications.length > 1) {
      const newCerts = [...aircraftCertifications]
      newCerts.splice(index, 1)
      setAircraftCertifications(newCerts)
    }
  }

  // Opciones de certificaciones
  const certificationOptions = [
    "VFR",
    "IFR",
    "Night Flying",
    "Mountain Operations",
    "Offshore",
    "External Load",
    "Firefighting",
    "SAR",
  ]

  const handleCertificationChange = (cert: string) => {
    if (certifications.includes(cert)) {
      setCertifications(certifications.filter((c) => c !== cert))
    } else {
      setCertifications([...certifications, cert])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío de datos
    setTimeout(() => {
      // En la función handleSubmit, actualizar el objeto newPilot
      const newPilot = {
        id: Date.now().toString(),
        name,
        email,
        role: "pilot",
        licenseNumber,
        flightHours: Number.parseInt(flightHours) || 0,
        medicalExpiry,
        lastTraining,
        certifications,
        aircraftCertifications: aircraftCertifications.filter((cert) => cert.model && cert.date),
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(
          Math.random() * 100,
        )}.jpg`,
      }

      onAddPilot(newPilot)
      setIsSubmitting(false)
      resetForm()
      onClose()
    }, 1000)
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setLicenseNumber("")
    setFlightHours("")
    setMedicalExpiry("")
    setLastTraining("")
    setCertifications(["VFR"])
    setAircraftCertifications([{ model: "", date: "" }])
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Piloto" maxWidth="max-w-lg" darkMode={darkMode}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
          >
            Nombre Completo
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

        {/* Quitar el campo de vencimiento de licencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="licenseNumber"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Número de Licencia
            </label>
            <input
              type="text"
              id="licenseNumber"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
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
              htmlFor="medicalExpiry"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Vencimiento Médico
            </label>
            <input
              type="date"
              id="medicalExpiry"
              value={medicalExpiry}
              onChange={(e) => setMedicalExpiry(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="lastTraining"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Último Entrenamiento
            </label>
            <input
              type="date"
              id="lastTraining"
              value={lastTraining}
              onChange={(e) => setLastTraining(e.target.value)}
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
              htmlFor="flightHours"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Horas de Vuelo
            </label>
            <input
              type="number"
              id="flightHours"
              value={flightHours}
              onChange={(e) => setFlightHours(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              }`}
              min="0"
              required
            />
          </div>
        </div>

        {/* Certificaciones */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
            Certificaciones
          </label>
          <div className="grid grid-cols-2 gap-2">
            {certificationOptions.map((cert) => (
              <div key={cert} className="flex items-center">
                <input
                  type="checkbox"
                  id={`cert-${cert}`}
                  checked={certifications.includes(cert)}
                  onChange={() => handleCertificationChange(cert)}
                  className={`h-4 w-4 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                      : "border-gray-300 text-orange-600 focus:ring-orange-500"
                  }`}
                />
                <label
                  htmlFor={`cert-${cert}`}
                  className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  {cert}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Certificaciones por Aeronave */}
        <div>
          <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
            Certificaciones por Aeronave
          </label>
          <div className="space-y-2">
            {aircraftCertifications.map((cert, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={cert.model}
                  onChange={(e) => handleAircraftCertChange(index, "model", e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                >
                  <option value="">Seleccionar modelo</option>
                  {helicopterModels.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={cert.date}
                  onChange={(e) => handleAircraftCertChange(index, "date", e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                      : "border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => removeAircraftCert(index)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addAircraftCert}
              className={`mt-2 inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                darkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              Añadir Certificación
            </button>
          </div>
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
            {isSubmitting ? "Guardando..." : "Guardar Piloto"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddPilotModal
