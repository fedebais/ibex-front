"use client"

import type React from "react"
import Modal from "../ui/Modal"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { createPilot, getCertificationTypes, getHelicopterModels } from "../../services/api"
import type {
  CreatePilotInput,
  CertificationType,
  HelicopterModel,
  AddPilotModalProps,
  AircraftCertification,
} from "../../types/api"

const AddPilotModal = ({ isOpen, onClose, onPilotAdded, darkMode = false }: AddPilotModalProps) => {
  const { accessToken } = useUser()

  // Usar CreatePilotInput directamente en lugar de un tipo separado
  const [formData, setFormData] = useState<CreatePilotInput>({
    user: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
    license: "",
    flightHours: 0,
    medicalExpiry: "",
    lastTraining: "",
    certificationTypeIds: [],
    aircraftCertifications: [],
  })

  const [certificationTypes, setCertificationTypes] = useState<CertificationType[]>([])
  const [helicopterModels, setHelicopterModels] = useState<HelicopterModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [dataError, setDataError] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
    }
  }, [isOpen])

  const loadInitialData = async () => {
    try {
      setIsLoadingData(true)
      setDataError("")
      const token = accessToken || localStorage.getItem("ibex_access_token")
      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      const [certTypes, models] = await Promise.all([getCertificationTypes(token), getHelicopterModels(token)])

      setCertificationTypes(certTypes)
      setHelicopterModels(models)
    } catch (err) {
      console.error("Error al cargar datos iniciales:", err)
      setDataError("Error al cargar los datos necesarios. Por favor, recargue la página.")
      setCertificationTypes([])
      setHelicopterModels([])
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        [name]: value,
      },
    }))
  }

  const handlePilotInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "flightHours" ? Number(value) : value,
    }))
  }

  const handleCertificationChange = (certificationId: number) => {
    setFormData((prev) => ({
      ...prev,
      certificationTypeIds: prev.certificationTypeIds.includes(certificationId)
        ? prev.certificationTypeIds.filter((id) => id !== certificationId)
        : [...prev.certificationTypeIds, certificationId],
    }))
  }

  const addAircraftCertification = () => {
    setFormData((prev) => ({
      ...prev,
      aircraftCertifications: [...prev.aircraftCertifications, { modelId: 0, certificationDate: "" }],
    }))
  }

  const removeAircraftCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      aircraftCertifications: prev.aircraftCertifications.filter((_, i) => i !== index),
    }))
  }

  const updateAircraftCertification = (index: number, field: keyof AircraftCertification, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      aircraftCertifications: prev.aircraftCertifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validaciones básicas
    if (!formData.user.firstName.trim() || !formData.user.lastName.trim()) {
      setError("Nombre y apellido son obligatorios")
      return
    }

    if (!formData.user.email.trim() || !formData.user.email.includes("@")) {
      setError("Email válido es obligatorio")
      return
    }

    if (!formData.user.password || formData.user.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (!formData.license.trim()) {
      setError("La licencia es obligatoria")
      return
    }

    if (formData.flightHours < 0) {
      setError("Las horas de vuelo no pueden ser negativas")
      return
    }

    if (!formData.medicalExpiry || !formData.lastTraining) {
      setError("Fecha de examen médico y último entrenamiento son obligatorios")
      return
    }

    const token = accessToken || localStorage.getItem("ibex_access_token")
    if (!token) {
      setError("No se pudo verificar la autenticación. Por favor, inicie sesión de nuevo.")
      return
    }

    try {
      setIsLoading(true)

      // Filtrar certificaciones de aeronaves válidas
      const validAircraftCertifications = formData.aircraftCertifications.filter(
        (cert) => cert.modelId > 0 && cert.certificationDate,
      )

      const pilotData: CreatePilotInput = {
        ...formData,
        aircraftCertifications: validAircraftCertifications,
      }

      await createPilot(pilotData, token)
      onPilotAdded()
      handleClose()
    } catch (err) {
      console.error("Error al crear el piloto:", err)
      setError("No se pudo crear el piloto. Por favor, intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      user: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
      },
      license: "",
      flightHours: 0,
      medicalExpiry: "",
      lastTraining: "",
      certificationTypeIds: [],
      aircraftCertifications: [],
    })
    setError("")
    setDataError("")
    onClose()
  }

  if (isLoadingData) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Nuevo Piloto" maxWidth="max-w-4xl">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className={`ml-3 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Cargando datos necesarios...</span>
        </div>
      </Modal>
    )
  }

  if (dataError) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Error" maxWidth="max-w-md">
        <div className="text-center py-8">
          <div className={`p-4 rounded-md ${darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"}`}>
            {dataError}
          </div>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Nuevo Piloto" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div
            className={`p-3 rounded-md text-sm ${
              darkMode
                ? "bg-red-900 border border-red-700 text-red-200"
                : "bg-red-100 border border-red-200 text-red-800"
            }`}
          >
            {error}
          </div>
        )}

        {/* Información Personal */}
        <div>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Nombre *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.user.firstName}
                onChange={handleUserInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Apellido *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.user.lastName}
                onChange={handleUserInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.user.email}
                onChange={handleUserInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.user.phone}
                onChange={handleUserInputChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.user.password}
                onChange={handleUserInputChange}
                required
                minLength={6}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Información Profesional */}
        <div>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Información Profesional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="license"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Licencia *
              </label>
              <input
                type="text"
                id="license"
                name="license"
                value={formData.license}
                onChange={handlePilotInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="flightHours"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Horas de Vuelo *
              </label>
              <input
                type="number"
                id="flightHours"
                name="flightHours"
                value={formData.flightHours}
                onChange={handlePilotInputChange}
                required
                min="0"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="medicalExpiry"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Vencimiento Examen Médico *
              </label>
              <input
                type="date"
                id="medicalExpiry"
                name="medicalExpiry"
                value={formData.medicalExpiry}
                onChange={handlePilotInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="lastTraining"
                className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                Último Entrenamiento *
              </label>
              <input
                type="date"
                id="lastTraining"
                name="lastTraining"
                value={formData.lastTraining}
                onChange={handlePilotInputChange}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Certificaciones */}
        <div>
          <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Certificaciones</h3>
          {certificationTypes.length === 0 ? (
            <div
              className={`p-3 rounded-md text-sm ${
                darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              No se pudieron cargar las certificaciones disponibles
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {certificationTypes.map((cert) => (
                <label
                  key={cert.id}
                  className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer hover:bg-opacity-50 ${
                    darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.certificationTypeIds.includes(cert.id)}
                    onChange={() => handleCertificationChange(cert.id)}
                    className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{cert.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Certificaciones de Aeronaves */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
              Certificaciones de Aeronaves
            </h3>
            <button
              type="button"
              onClick={addAircraftCertification}
              disabled={helicopterModels.length === 0}
              className="px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
            >
              Agregar
            </button>
          </div>

          {helicopterModels.length === 0 ? (
            <div
              className={`p-3 rounded-md text-sm ${
                darkMode ? "bg-yellow-900 text-yellow-200" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              No se pudieron cargar los modelos de helicópteros disponibles
            </div>
          ) : (
            <div className="space-y-3">
              {formData.aircraftCertifications.map((cert, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Modelo
                    </label>
                    <select
                      value={cert.modelId}
                      onChange={(e) => updateAircraftCertification(index, "modelId", Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value={0}>Seleccionar modelo</option>
                      {helicopterModels.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Fecha de Certificación
                    </label>
                    <input
                      type="date"
                      value={cert.certificationDate}
                      onChange={(e) => updateAircraftCertification(index, "certificationDate", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAircraftCertification(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
              darkMode
                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            }`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || certificationTypes.length === 0 || helicopterModels.length === 0}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </div>
            ) : (
              "Crear Piloto"
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddPilotModal
