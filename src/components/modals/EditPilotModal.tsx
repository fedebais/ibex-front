"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { updatePilot, getPilotById } from "../../services/api"
import { useUser } from "../../context/UserContext"
import type { Pilot } from "../../types/api"

interface EditPilotModalProps {
  isOpen: boolean
  onClose: () => void
  onEditPilot: () => void
  pilotId: number | null
  darkMode?: boolean
}

const EditPilotModal: React.FC<EditPilotModalProps> = ({ isOpen, onClose, onEditPilot, pilotId, darkMode = false }) => {
  const { accessToken } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPilot, setIsLoadingPilot] = useState(false)
  const [pilot, setPilot] = useState<Pilot | null>(null)

  // Estados del formulario
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [license, setLicense] = useState("")
  const [flightHours, setFlightHours] = useState("")
  const [medicalExpiry, setMedicalExpiry] = useState("")
  const [lastTraining, setLastTraining] = useState("")
  const [certifications, setCertifications] = useState<string[]>(["VFR"])

  const [aircraftCertifications, setAircraftCertifications] = useState<{ model: string; certificationDate: string }[]>([
    { model: "", certificationDate: "" },
  ])

  // Lista de modelos de helicópteros disponibles
  const helicopterModels = ["Bell 407", "Airbus H125", "Robinson R44", "Sikorsky S-76"]

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

  // Cargar datos del piloto cuando se abre el modal
  useEffect(() => {
    if (isOpen && pilotId && accessToken) {
      loadPilotData()
    }
  }, [isOpen, pilotId, accessToken])

  const loadPilotData = async () => {
    if (!pilotId || !accessToken) return

    setIsLoadingPilot(true)
    try {
      const pilotData = await getPilotById(pilotId, accessToken)
      setPilot(pilotData)

      // Llenar el formulario con los datos actuales
      setFirstName(pilotData.user.firstName)
      setLastName(pilotData.user.lastName)
      setEmail(pilotData.user.email)
      setPhone(pilotData.user.phone)
      setLicense(pilotData.license)
      setFlightHours(pilotData.flightHours.toString())
      setMedicalExpiry(pilotData.medicalExpiry ? pilotData.medicalExpiry.split("T")[0] : "")
      setLastTraining(pilotData.lastTraining ? pilotData.lastTraining.split("T")[0] : "")

      // Cargar certificaciones si existen
      if (pilotData.certifications && pilotData.certifications.length > 0) {
        setCertifications(pilotData.certifications)
      }

      // Cargar certificaciones por aeronave si existen
      if (pilotData.aircraftCertifications && pilotData.aircraftCertifications.length > 0) {
        setAircraftCertifications(
          pilotData.aircraftCertifications.map((cert) => ({
            model: cert.model,
            certificationDate: cert.certificationDate ? cert.certificationDate.split("T")[0] : "",
          })),
        )
      }
    } catch (error) {
      console.error("Error loading pilot data:", error)
      alert("Error al cargar los datos del piloto")
    } finally {
      setIsLoadingPilot(false)
    }
  }

  // Funciones para manejar las certificaciones por aeronave
  const handleAircraftCertChange = (index: number, field: "model" | "certificationDate", value: string) => {
    const newCerts = [...aircraftCertifications]
    newCerts[index][field] = value
    setAircraftCertifications(newCerts)
  }

  const addAircraftCert = () => {
    setAircraftCertifications([...aircraftCertifications, { model: "", certificationDate: "" }])
  }

  const removeAircraftCert = (index: number) => {
    if (aircraftCertifications.length > 1) {
      const newCerts = [...aircraftCertifications]
      newCerts.splice(index, 1)
      setAircraftCertifications(newCerts)
    }
  }

  const handleCertificationChange = (cert: string) => {
    if (certifications.includes(cert)) {
      setCertifications(certifications.filter((c) => c !== cert))
    } else {
      setCertifications([...certifications, cert])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pilotId || !accessToken) {
      alert("Error: No se pudo obtener la información necesaria")
      return
    }

    // Validar que todos los campos requeridos estén completos
    if (!firstName || !lastName || !email || !phone || !license) {
      alert("Faltan campos requeridos")
      return
    }

    setIsLoading(true)

    try {
      // Preparar datos para actualizar
      const updateData = {
        user: {
          firstName,
          lastName,
          email,
          phone,
        },
        license,
        flightHours: Number.parseInt(flightHours) || 0,
        medicalExpiry,
        lastTraining,
        certifications,
        aircraftCertifications: aircraftCertifications
          .filter((cert) => cert.model && cert.certificationDate)
          .map((cert) => ({
            model: cert.model,
            certificationDate: cert.certificationDate,
          })),
      }

      console.log("Actualizando datos del piloto:", updateData)

      await updatePilot(pilotId, updateData, accessToken)

      alert("Piloto actualizado exitosamente")
      onEditPilot() // Callback para recargar la lista
      onClose()
      resetForm()
    } catch (error) {
      console.error("Error updating pilot:", error)
      alert("Error al actualizar el piloto. Por favor, intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFirstName("")
    setLastName("")
    setEmail("")
    setPhone("")
    setLicense("")
    setFlightHours("")
    setMedicalExpiry("")
    setLastTraining("")
    setCertifications(["VFR"])
    setAircraftCertifications([{ model: "", certificationDate: "" }])
    setPilot(null)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Piloto" maxWidth="max-w-lg" darkMode={darkMode}>
      {isLoadingPilot ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando datos del piloto...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
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
                htmlFor="lastName"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="+54 9 2944 123456"
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
                htmlFor="license"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Número de Licencia
              </label>
              <input
                type="text"
                id="license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={cert.certificationDate}
                    onChange={(e) => handleAircraftCertChange(index, "certificationDate", e.target.value)}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
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
              onClick={handleClose}
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
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {isLoading ? "Actualizando..." : "Actualizar Piloto"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default EditPilotModal
