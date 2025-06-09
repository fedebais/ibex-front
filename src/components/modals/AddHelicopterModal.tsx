"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { createHelicopter, getHelicopterModels } from "../../services/api"
import type { CreateHelicopterInput, HelicopterModel, HelicopterStatus } from "../../types/api"
import { uploadFile } from "../../firebase/storage"

interface AddHelicopterModalProps {
  isOpen: boolean
  onClose: () => void
  onAddHelicopter: (newHelicopter: any) => void
  darkMode: boolean
}

const AddHelicopterModal = ({ isOpen, onClose, onAddHelicopter }: AddHelicopterModalProps) => {
  const { accessToken, isLoading: userLoading } = useUser()
  const { darkMode } = useTheme()

  // Estados del formulario
  const [modelId, setModelId] = useState("")
  const [registration, setRegistration] = useState("")
  const [manufactureYear, setManufactureYear] = useState("")
  const [lastMaintenance, setLastMaintenance] = useState("")
  const [totalFlightHours, setTotalFlightHours] = useState("")
  const [status, setStatus] = useState<HelicopterStatus>("ACTIVE")
  const [imageUrl, setImageUrl] = useState("")
  const [capacity, setCapacity] = useState("")
  const [speedKmh, setSpeedKmh] = useState("")
  const [rangeKm, setRangeKm] = useState("")
  const [ceilingMeters, setCeilingMeters] = useState("")

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Estados de control
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [helicopterModels, setHelicopterModels] = useState<HelicopterModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)

  // Cargar modelos de helicópteros
  useEffect(() => {
    const loadModels = async () => {
      if (!isOpen || userLoading || !accessToken) return

      setLoadingModels(true)
      try {
        const models = await getHelicopterModels(accessToken)
        setHelicopterModels(models)
      } catch (err) {
        console.error("Error loading helicopter models:", err)
      } finally {
        setLoadingModels(false)
      }
    }

    loadModels()
  }, [isOpen, userLoading, accessToken])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)

      // Crear vista previa
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setImagePreview(event.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userLoading) {
      console.log("AddHelicopterModal - UserContext still loading")
      return
    }

    if (!accessToken) {
      setError("No se pudo obtener el token de autenticación. Por favor, inicie sesión nuevamente.")
      return
    }

    if (!modelId) {
      setError("Por favor seleccione un modelo de helicóptero.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Subir imagen a Firebase si existe
      let uploadedImageUrl = imageUrl
      if (imageFile) {
        setIsUploadingImage(true)
        try {
          const fileName = `helicopters/${Date.now()}-${imageFile.name}`
          uploadedImageUrl = await uploadFile(imageFile, fileName)
          console.log("Imagen subida exitosamente:", uploadedImageUrl)
        } catch (err) {
          console.error("Error al subir la imagen:", err)
          setError("Error al subir la imagen. Intente nuevamente.")
          setIsSubmitting(false)
          setIsUploadingImage(false)
          return
        } finally {
          setIsUploadingImage(false)
        }
      }

      const helicopterData: CreateHelicopterInput = {
        modelId: Number.parseInt(modelId),
        registration: registration.trim().toUpperCase(),
        manufactureYear: manufactureYear ? Number.parseInt(manufactureYear) : undefined,
        lastMaintenance: lastMaintenance || undefined,
        totalFlightHours: totalFlightHours ? Number.parseInt(totalFlightHours) : undefined,
        status: status || "ACTIVE",
        imageUrl: uploadedImageUrl.trim() || undefined,
        capacity: capacity ? Number.parseInt(capacity) : undefined,
        speedKmh: speedKmh ? Number.parseInt(speedKmh) : undefined,
        rangeKm: rangeKm ? Number.parseInt(rangeKm) : undefined,
        ceilingMeters: ceilingMeters ? Number.parseInt(ceilingMeters) : undefined,
      }

      console.log("AddHelicopterModal - Sending to API:", helicopterData)

      const newHelicopter = await createHelicopter(helicopterData, accessToken)

      console.log("AddHelicopterModal - Helicopter created successfully:", newHelicopter)

      onAddHelicopter(newHelicopter)
      resetForm()
      onClose()
    } catch (err) {
      console.error("AddHelicopterModal - Error creating helicopter:", err)
      setError(err instanceof Error ? err.message : "Error al crear el helicóptero")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setModelId("")
    setRegistration("")
    setManufactureYear("")
    setLastMaintenance("")
    setTotalFlightHours("")
    setStatus("ACTIVE")
    setImageUrl("")
    setImageFile(null)
    setImagePreview("")
    setCapacity("")
    setSpeedKmh("")
    setRangeKm("")
    setCeilingMeters("")
    setError(null)
  }

  // Clases CSS dinámicas para dark mode
  const inputClasses = `w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
    darkMode
      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  }`

  const labelClasses = `block text-sm font-bold mb-2 ${darkMode ? "text-white" : "text-gray-700"}`

  const sectionTitleClasses = `text-lg font-bold mb-4 pb-2 border-b ${
    darkMode ? "text-white border-gray-700" : "text-gray-900 border-gray-200"
  }`

  const buttonClasses = `px-4 py-2 border rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
    darkMode
      ? "border-gray-600 text-white hover:bg-gray-700 focus:ring-offset-gray-900 bg-gray-800"
      : "border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-offset-white bg-white"
  }`

  const errorClasses = `p-4 rounded-md border ${
    darkMode ? "bg-red-900/30 border-red-700 text-red-200" : "bg-red-50 border-red-200 text-red-700"
  }`

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir Nuevo Helicóptero" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className={errorClasses}>
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className={sectionTitleClasses}>Información Básica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="modelId" className={labelClasses}>
                Modelo de Helicóptero *
              </label>
              <select
                id="modelId"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className={inputClasses}
                required
                disabled={loadingModels}
              >
                <option value="">{loadingModels ? "Cargando modelos..." : "Seleccionar modelo"}</option>
                {helicopterModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="registration" className={labelClasses}>
                Matrícula *
              </label>
              <input
                type="text"
                id="registration"
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                className={inputClasses}
                placeholder="LV-ABC"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="manufactureYear" className={labelClasses}>
                Año de Fabricación
              </label>
              <input
                type="number"
                id="manufactureYear"
                value={manufactureYear}
                onChange={(e) => setManufactureYear(e.target.value)}
                className={inputClasses}
                min="1980"
                max={new Date().getFullYear()}
                placeholder="2020"
              />
            </div>

            <div>
              <label htmlFor="status" className={labelClasses}>
                Estado
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as HelicopterStatus)}
                className={inputClasses}
              >
                <option value="ACTIVE">Activo</option>
                <option value="MAINTENANCE">En Mantenimiento</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>

            <div>
              <label htmlFor="capacity" className={labelClasses}>
                Capacidad (pasajeros)
              </label>
              <input
                type="number"
                id="capacity"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={inputClasses}
                min="1"
                max="20"
                placeholder="6"
              />
            </div>
          </div>
        </div>

        {/* Información Operacional */}
        <div className="space-y-4">
          <h3 className={sectionTitleClasses}>Información Operacional</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalFlightHours" className={labelClasses}>
                Horas de Vuelo Totales
              </label>
              <input
                type="number"
                id="totalFlightHours"
                value={totalFlightHours}
                onChange={(e) => setTotalFlightHours(e.target.value)}
                className={inputClasses}
                min="0"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="lastMaintenance" className={labelClasses}>
                Último Mantenimiento
              </label>
              <input
                type="date"
                id="lastMaintenance"
                value={lastMaintenance}
                onChange={(e) => setLastMaintenance(e.target.value)}
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Especificaciones Técnicas */}
        <div className="space-y-4">
          <h3 className={sectionTitleClasses}>Especificaciones Técnicas</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="speedKmh" className={labelClasses}>
                Velocidad Máxima (km/h)
              </label>
              <input
                type="number"
                id="speedKmh"
                value={speedKmh}
                onChange={(e) => setSpeedKmh(e.target.value)}
                className={inputClasses}
                min="0"
                placeholder="250"
              />
            </div>

            <div>
              <label htmlFor="rangeKm" className={labelClasses}>
                Alcance (km)
              </label>
              <input
                type="number"
                id="rangeKm"
                value={rangeKm}
                onChange={(e) => setRangeKm(e.target.value)}
                className={inputClasses}
                min="0"
                placeholder="600"
              />
            </div>

            <div>
              <label htmlFor="ceilingMeters" className={labelClasses}>
                Techo de Servicio (metros)
              </label>
              <input
                type="number"
                id="ceilingMeters"
                value={ceilingMeters}
                onChange={(e) => setCeilingMeters(e.target.value)}
                className={inputClasses}
                min="0"
                placeholder="6000"
              />
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="space-y-4">
          <h3 className={sectionTitleClasses}>Imagen</h3>

          <div>
            <label htmlFor="imageUrl" className={labelClasses}>
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className={inputClasses}
              placeholder="https://ejemplo.com/imagen.jpg"
              disabled={!!imageFile}
            />
          </div>

          <div className="mt-4">
            <label htmlFor="imageFile" className={labelClasses}>
              O subir imagen
            </label>
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={isSubmitting}
            />
            <label
              htmlFor="imageFile"
              className={`cursor-pointer flex items-center justify-center border-2 border-dashed rounded-md p-2 ${
                darkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
              } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Vista previa de la imagen"
                    className="h-32 w-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      setImageFile(null)
                      setImagePreview("")
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    disabled={isSubmitting}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Haga clic para subir una imagen
                  </p>
                </div>
              )}
            </label>
            {isUploadingImage && <p className="mt-2 text-sm text-orange-500">Subiendo imagen, por favor espere...</p>}
          </div>
        </div>

        {/* Botones */}
        <div className={`flex justify-end space-x-3 pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <button type="button" onClick={onClose} className={buttonClasses} disabled={isSubmitting}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || userLoading || !accessToken || loadingModels || isUploadingImage}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting
              ? "Guardando..."
              : isUploadingImage
                ? "Subiendo imagen..."
                : userLoading
                  ? "Cargando..."
                  : "Guardar Helicóptero"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default AddHelicopterModal
