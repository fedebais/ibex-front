"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { updateFlightLog, getPilots, getHelicopters, getClients, getDestinations } from "../../services/api"
import { uploadFile } from "../../firebase/storage"
import { useUser } from "../../context/UserContext"
import type { FlightLog, Pilot, Helicopter, Client, Destination, FlightStatus, PaymentStatus } from "../../types/api"

interface EditFlightLogModalProps {
  isOpen: boolean
  onClose: () => void
  flightLog: FlightLog | null
  onFlightUpdated: () => void
  darkMode?: boolean
}

const EditFlightLogModal = ({
  isOpen,
  onClose,
  flightLog,
  onFlightUpdated,
  darkMode = false,
}: EditFlightLogModalProps) => {
  // Estados del formulario
  const [formData, setFormData] = useState({
    date: "",
    pilotId: "",
    helicopterId: "",
    clientId: "",
    destinationId: "",
    passengers: "",
    notes: "",
    status: "SCHEDULED" as FlightStatus,
    paymentStatus: "PENDING_INVOICE" as PaymentStatus,
    startTime: "",
    landingTime: "",
    odometer: "",
    initialOdometer: "",
    finalOdometer: "",
    starts: "1", // ✅ Campo para starts
    landings: "1", // ✅ Campo para aterrizajes
    launches: "0", // ✅ Campo para lanzamientos
    rin: "0", // ✅ Campo para RIN
    gachoTime: "0.00", // ✅ Campo para tiempo de gacho
    fuelConsumed: "0", // ✅ Campo para combustible consumido
    hookUsed: false,
    remarks: "",
  })

  // Estados para datos de la API
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [odometerImage, setOdometerImage] = useState<File | null>(null)
  const [odometerImageUrl, setOdometerImageUrl] = useState<string>("")
  const [weightBalanceFile, setWeightBalanceFile] = useState<File | null>(null)
  const [weightBalanceUrl, setWeightBalanceUrl] = useState<string>("")

  const { accessToken } = useUser()

  // Determinar si es un vuelo completado
  const isCompleted = formData.status === "COMPLETED"

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen && accessToken) {
      loadInitialData()
    }
  }, [isOpen, accessToken])

  // Cargar datos del vuelo cuando se abre el modal
  useEffect(() => {
    if (isOpen && flightLog) {
      setFormData({
        date: flightLog.date ? new Date(flightLog.date).toISOString().split("T")[0] : "",
        pilotId: flightLog.pilotId?.toString() || "",
        helicopterId: flightLog.helicopterId?.toString() || "",
        clientId: flightLog.clientId?.toString() || "",
        destinationId: flightLog.destinationId?.toString() || "",
        passengers: flightLog.passengers?.toString() || "",
        notes: flightLog.notes || "",
        status: flightLog.status || "SCHEDULED",
        paymentStatus: flightLog.paymentStatus || "PENDING_INVOICE",
        startTime: flightLog.startTime || "",
        landingTime: flightLog.landingTime || "",
        odometer: flightLog.odometer?.toString() || "",
        initialOdometer: flightLog.fuelStart?.toString() || "",
        finalOdometer: flightLog.fuelEnd?.toString() || "",
        starts: "1", // ✅ Valor por defecto
        landings: "1", // ✅ Valor por defecto
        launches: "0", // ✅ Valor por defecto
        rin: "0", // ✅ Valor por defecto
        gachoTime: "0.00", // ✅ Valor por defecto
        fuelConsumed: "0", // ✅ Valor por defecto
        hookUsed: flightLog.hookUsed || false,
        remarks: flightLog.remarks || "",
      })
      setOdometerImageUrl(flightLog.odometerPhotoUrl || "")
      setWeightBalanceUrl(flightLog.weightBalanceUrl || "")
    }
  }, [isOpen, flightLog])

  const loadInitialData = async () => {
    if (!accessToken) return

    try {
      const [pilotsData, helicoptersData, clientsData, destinationsData] = await Promise.all([
        getPilots(accessToken),
        getHelicopters(accessToken),
        getClients(accessToken),
        getDestinations(accessToken),
      ])

      setPilots(pilotsData)
      setHelicopters(helicoptersData)
      setClients(clientsData)
      setDestinations(destinationsData)
    } catch (err) {
      console.error("Error cargando datos:", err)
      setError("Error al cargar los datos necesarios")
    }
  }

  // Limpiar campos operacionales cuando no es completado
  useEffect(() => {
    if (!isCompleted) {
      setFormData((prev) => ({
        ...prev,
        landingTime: "",
        odometer: "",
        initialOdometer: "",
        finalOdometer: "",
        starts: "1",
        landings: "1",
        launches: "0",
        rin: "0",
        gachoTime: "0.00",
        fuelConsumed: "0",
        hookUsed: false,
        remarks: "",
      }))
      setOdometerImage(null)
      if (formData.status === "CANCELLED") {
        setFormData((prev) => ({
          ...prev,
          startTime: "",
        }))
      }
    }
  }, [isCompleted, formData.status])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOdometerImage(file)
    }
  }

  const handleWeightBalanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Validar que sea un archivo Excel
      const allowedTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xls') && !file.name.endsWith('.xlsx')) {
        setError('Solo se permiten archivos Excel (.xls, .xlsx)')
        return
      }
      setWeightBalanceFile(file)
    }
  }

  const calculateRunTime = () => {
    if (formData.startTime && formData.landingTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`)
      const end = new Date(`2000-01-01T${formData.landingTime}`)

      let diff = end.getTime() - start.getTime()
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000 // Agregar 24 horas si cruza medianoche
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      return `${hours}:${minutes.toString().padStart(2, "0")}`
    }
    return "0:00"
  }

  const calculateFlightTime = () => {
    if (formData.initialOdometer && formData.finalOdometer) {
      const initial = Number.parseFloat(formData.initialOdometer)
      const final = Number.parseFloat(formData.finalOdometer)

      if (!isNaN(initial) && !isNaN(final) && final >= initial) {
        const flightTimeValue = (final - initial).toFixed(1)
        return flightTimeValue
      }
    }
    return "0.0"
  }

  const resetForm = () => {
    setFormData({
      date: "",
      pilotId: "",
      helicopterId: "",
      clientId: "",
      destinationId: "",
      passengers: "",
      notes: "",
      status: "SCHEDULED",
      paymentStatus: "PENDING_INVOICE",
      startTime: "",
      landingTime: "",
      odometer: "",
      initialOdometer: "",
      finalOdometer: "",
      starts: "1",
      landings: "1",
      launches: "0",
      rin: "0",
      gachoTime: "0.00",
      fuelConsumed: "0",
      hookUsed: false,
      remarks: "",
    })
    setOdometerImage(null)
    setOdometerImageUrl("")
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accessToken || !flightLog) return

    setIsLoading(true)
    setError(null)

    try {
      // Validaciones básicas
      if (
        !formData.date ||
        !formData.pilotId ||
        !formData.helicopterId ||
        !formData.clientId ||
        !formData.destinationId
      ) {
        throw new Error("Por favor completa todos los campos requeridos")
      }

      // Validaciones para vuelos completados
      if (isCompleted) {
        if (!formData.startTime || !formData.landingTime) {
          throw new Error("Para vuelos completados, las horas de inicio y aterrizaje son requeridas")
        }
      }

      let finalOdometerImageUrl = odometerImageUrl
      let finalWeightBalanceUrl = weightBalanceUrl

      // Subir imagen del odómetro si hay una nueva
      if (odometerImage) {
        setIsUploadingImage(true)
        try {
          const imageUrl = await uploadFile(odometerImage, `odometer/${Date.now()}_${odometerImage.name}`)
          finalOdometerImageUrl = imageUrl
        } catch (uploadError) {
          console.error("Error subiendo imagen:", uploadError)
          throw new Error("Error al subir la imagen del odómetro")
        } finally {
          setIsUploadingImage(false)
        }
      }

      // Subir archivo Excel de Pesos y Balanceo si hay uno nuevo
      if (weightBalanceFile) {
        setIsUploadingImage(true)
        try {
          const excelUrl = await uploadFile(weightBalanceFile, `flight-logs/weight-balance/${Date.now()}_${weightBalanceFile.name}`)
          finalWeightBalanceUrl = excelUrl
        } catch (uploadError) {
          console.error("Error subiendo archivo Excel:", uploadError)
          throw new Error("Error al subir el archivo de Pesos y Balanceo")
        } finally {
          setIsUploadingImage(false)
        }
      }

      // Preparar datos según el tipo de vuelo
      const baseData = {
        date: new Date(formData.date).toISOString(),
        pilotId: Number.parseInt(formData.pilotId),
        helicopterId: Number.parseInt(formData.helicopterId),
        clientId: Number.parseInt(formData.clientId),
        destinationId: Number.parseInt(formData.destinationId),
        passengers: Number.parseInt(formData.passengers) || 0,
        notes: formData.notes,
        status: formData.status,
        paymentStatus: formData.paymentStatus,
      }

      let flightLogData: any = baseData

      if (isCompleted) {
        // Vuelo completado - incluir todos los datos operacionales
        const startDateTime = formData.startTime
          ? new Date(`${formData.date}T${formData.startTime}:00`).toISOString()
          : null
        const landingDateTime = formData.landingTime
          ? new Date(`${formData.date}T${formData.landingTime}:00`).toISOString()
          : null

        // ✅ Construir remarks con todos los datos operacionales
        const remarksData = [
          `Starts: ${formData.starts}`,
          `Landings: ${formData.landings}`,
          `Launches: ${formData.launches}`,
          `RIN: ${formData.rin}`,
          `Gacho: ${formData.gachoTime}`,
          `FuelConsumed: ${formData.fuelConsumed}`,
        ]

        let finalRemarks = remarksData.join(", ")
        if (formData.remarks) {
          finalRemarks = `${formData.remarks}\n${finalRemarks}`
        }

        flightLogData = {
          ...baseData,
          startTime: startDateTime,
          landingTime: landingDateTime,
          odometer:
            formData.initialOdometer && formData.finalOdometer
              ? Number.parseFloat(formData.finalOdometer) - Number.parseFloat(formData.initialOdometer)
              : 0, // ✅ Flight time (diferencia de odómetros)
          fuelEnd: Number.parseFloat(formData.finalOdometer) || 0, // ✅ Odómetro final
          fuelStart: Number.parseFloat(formData.initialOdometer) || 0, // ✅ Odómetro inicial
          hookUsed: formData.hookUsed,
          remarks: finalRemarks, // ✅ Remarks con todos los datos operacionales
          odometerPhotoUrl: finalOdometerImageUrl,
          weightBalanceUrl: finalWeightBalanceUrl,
        }
      } else if (formData.status === "SCHEDULED" && formData.startTime) {
        // Vuelo programado con hora de inicio planificada
        const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`).toISOString()

        flightLogData = {
          ...baseData,
          startTime: startDateTime,
        }
      }

      await updateFlightLog(flightLog.id.toString(), flightLogData, accessToken)

      onFlightUpdated()
      onClose()
      resetForm()
    } catch (err) {
      console.error("Error actualizando vuelo:", err)
      setError(err instanceof Error ? err.message : "Error al actualizar el vuelo")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!flightLog) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Vuelo" maxWidth="max-w-4xl" darkMode={darkMode}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Información básica del vuelo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status del vuelo */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Status del vuelo *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="SCHEDULED">Programado</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Fecha *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Piloto */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Piloto *
            </label>
            <select
              name="pilotId"
              value={formData.pilotId}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Seleccionar piloto</option>
              {pilots.map((pilot) => (
                <option key={pilot.id} value={pilot.id}>
                  {pilot.user.firstName} {pilot.user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Helicóptero */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Helicóptero *
            </label>
            <select
              name="helicopterId"
              value={formData.helicopterId}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Seleccionar helicóptero</option>
              {helicopters.map((helicopter) => (
                <option key={helicopter.id} value={helicopter.id}>
                  {helicopter.registration} - {helicopter.model.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cliente */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Cliente *
            </label>
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Destino */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Destino *
            </label>
            <select
              name="destinationId"
              value={formData.destinationId}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Seleccionar destino</option>
              {destinations.map((destination) => (
                <option key={destination.id} value={destination.id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pasajeros */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Pasajeros
            </label>
            <input
              type="number"
              name="passengers"
              value={formData.passengers}
              onChange={handleInputChange}
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Estado de pago */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              Estado de pago
            </label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="PENDING_INVOICE">Pendiente facturación</option>
              <option value="INVOICED">Facturado</option>
              <option value="PENDING_PAYMENT">Pendiente pago</option>
              <option value="PAID">Pagado</option>
            </select>
          </div>
        </div>

        {/* Notas generales */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Notas adicionales sobre el vuelo..."
          />
        </div>

        {/* Separador para datos operacionales */}
        {(isCompleted || formData.status === "SCHEDULED") && (
          <div className={`col-span-full border-t pt-6 ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
            <h3 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
              {isCompleted ? "Datos Operacionales del Vuelo" : "Datos de Planificación"}
            </h3>
            {!isCompleted && (
              <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Para vuelos programados, solo la puesta en marcha es opcional.
              </p>
            )}
          </div>
        )}

        {/* Campos operacionales */}
        {(isCompleted || formData.status === "SCHEDULED") && (
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Puesta en marcha */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Puesta en marcha {formData.status === "SCHEDULED" ? "(Planificada)" : "*"}
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required={isCompleted}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            {/* Campos solo para vuelos completados */}
            {isCompleted && (
              <>
                {/* Aterrizaje */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Aterrizaje *
                  </label>
                  <input
                    type="time"
                    name="landingTime"
                    value={formData.landingTime}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Run Time (calculado) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Run Time (SNMF)
                  </label>
                  <input
                    type="text"
                    value={calculateRunTime()}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-gray-600 border-gray-500 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    } cursor-not-allowed`}
                  />
                </div>

                {/* Flight Time (calculado) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Flight Time
                  </label>
                  <input
                    type="text"
                    value={calculateFlightTime()}
                    readOnly
                    className={`w-full px-3 py-2 border rounded-md ${
                      darkMode
                        ? "bg-gray-600 border-gray-500 text-gray-300"
                        : "bg-gray-100 border-gray-300 text-gray-600"
                    } cursor-not-allowed`}
                  />
                </div>

                {/* Odómetro Inicial */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Odómetro Inicial *
                  </label>
                  <input
                    type="number"
                    name="initialOdometer"
                    value={formData.initialOdometer}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required={isCompleted}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Odómetro Final */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Odómetro Final *
                  </label>
                  <input
                    type="number"
                    name="finalOdometer"
                    value={formData.finalOdometer}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    required={isCompleted}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Starts */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Starts
                  </label>
                  <input
                    type="number"
                    name="starts"
                    value={formData.starts}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Aterrizajes (ATE) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Aterrizajes (ATE)
                  </label>
                  <input
                    type="number"
                    name="landings"
                    value={formData.landings}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Lanzamientos */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Lanzamientos
                  </label>
                  <input
                    type="number"
                    name="launches"
                    value={formData.launches}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* RIN */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    RIN
                  </label>
                  <input
                    type="number"
                    name="rin"
                    value={formData.rin}
                    onChange={handleInputChange}
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Gacho (formato 0.00) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Gacho (formato 0.00)
                  </label>
                  <input
                    type="number"
                    name="gachoTime"
                    value={formData.gachoTime}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Formato aeronáutico (ejemplo: 1.30)
                  </p>
                </div>

                {/* Combustible consumido (litros) */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Combustible consumido (litros)
                  </label>
                  <input
                    type="number"
                    name="fuelConsumed"
                    value={formData.fuelConsumed}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>

                {/* Gacho usado */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hookUsed"
                    checked={formData.hookUsed}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Gacho usado</label>
                </div>

                {/* Foto del odómetro */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Foto del odómetro
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                  {(odometerImageUrl || odometerImage) && (
                    <div className="mt-2">
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {odometerImage ? "Nueva imagen seleccionada" : "Imagen actual disponible"}
                      </p>
                    </div>
                  )}
                  {isUploadingImage && <p className="text-sm text-orange-600 mt-1">Subiendo imagen...</p>}
                </div>

                {/* Archivo Excel de Pesos y Balanceo */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Pesos y Balanceo (Excel)
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleWeightBalanceFileChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                  {(weightBalanceUrl || weightBalanceFile) && (
                    <div className="mt-2 flex items-center space-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {weightBalanceFile ? `Nuevo archivo: ${weightBalanceFile.name}` : "Archivo actual disponible"}
                      </p>
                      {weightBalanceFile && (
                        <button
                          type="button"
                          onClick={() => setWeightBalanceFile(null)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  )}
                  {isUploadingImage && <p className="text-sm text-orange-600 mt-1">Subiendo archivo...</p>}
                </div>

                {/* Observaciones técnicas */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Observaciones técnicas
                  </label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Observaciones técnicas del vuelo..."
                  />
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Los datos operacionales se agregarán automáticamente a las observaciones.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6">
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
            disabled={isLoading || isUploadingImage}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Actualizando..." : isUploadingImage ? "Subiendo imagen..." : "Actualizar Vuelo"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default EditFlightLogModal
