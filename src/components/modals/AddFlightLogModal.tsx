"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { createFlightLog, getPilots, getHelicopters, getClients, getDestinations } from "../../services/api"
import type { NewFlightLog, FlightStatus, PaymentStatus, Pilot, Client, Destination, Helicopter } from "../../types/api"
import Modal from "../ui/Modal"

interface AddFlightLogModalProps {
  isOpen: boolean
  onClose: () => void
  onFlightCreated?: () => void
}

interface AutocompleteOption {
  id: number | string
  name: string
  isCustom?: boolean
}

const AddFlightLogModal: React.FC<AddFlightLogModalProps> = ({ isOpen, onClose, onFlightCreated }) => {
  const { user, accessToken, isLoading: userLoading } = useUser()
  const { darkMode } = useTheme()

  // Estados para datos de la API
  const [pilots, setPilots] = useState<Pilot[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Estado para los datos del formulario
  const [selectedPilot, setSelectedPilot] = useState<string>("")
  const [flightDate, setFlightDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedHelicopter, setSelectedHelicopter] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<string>("")

  // Estados para origen y destino con autocompletado
  const [originInput, setOriginInput] = useState<string>("")
  const [originId, setOriginId] = useState<string>("")
  const [originResults, setOriginResults] = useState<Destination[]>([])
  const [showOriginResults, setShowOriginResults] = useState(false)
  const [customOrigin, setCustomOrigin] = useState(false)

  const [destinationInput, setDestinationInput] = useState<string>("")
  const [destinationId, setDestinationId] = useState<string>("")
  const [destinationResults, setDestinationResults] = useState<Destination[]>([])
  const [showDestinationResults, setShowDestinationResults] = useState(false)
  const [customDestination, setCustomDestination] = useState(false)

  const [notes, setNotes] = useState<string>("")
  const [passengers, setPassengers] = useState<string>("0")
  const [fuelConsumed, setFuelConsumed] = useState<string>("0")

  // Nuevos campos
  const [startupTime, setStartupTime] = useState<string>("")
  const [shutdownTime, setShutdownTime] = useState<string>("")
  const [runTime, setRunTime] = useState<string>("0:00")
  const [initialOdometer, setInitialOdometer] = useState<string>("")
  const [finalOdometer, setFinalOdometer] = useState<string>("")
  const [flightTime, setFlightTime] = useState<string>("0.0")
  const [starts, setStarts] = useState<string>("1")
  const [landings, setLandings] = useState<string>("1")
  const [launches, setLaunches] = useState<string>("0")
  const [rin, setRin] = useState<string>("0")
  const [gachoTime, setGachoTime] = useState<string>("0.00")
  const [flightStatus, setFlightStatus] = useState<string>("COMPLETED")

  // Estados para foto de odómetro final
  const [finalOdometerPhoto, setFinalOdometerPhoto] = useState<File | null>(null)
  const [finalOdometerPhotoPreview, setFinalOdometerPhotoPreview] = useState<string>("")

  const [isDrawing, setIsDrawing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")

  // Canvas para firma
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasSignature, setHasSignature] = useState(false)

  // Referencias para los dropdowns de autocompletado
  const originRef = useRef<HTMLDivElement>(null)
  const destinationRef = useRef<HTMLDivElement>(null)

  // Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen || !accessToken || userLoading) return

      try {
        setIsLoadingData(true)
        setError("")

        console.log("🔄 Cargando datos desde la API...")

        // Cargar datos en paralelo
        const [pilotsData, clientsData, destinationsData, helicoptersData] = await Promise.all([
          getPilots(accessToken),
          getClients(accessToken),
          getDestinations(accessToken),
          getHelicopters(accessToken),
        ])

        console.log("✅ Datos cargados:", {
          pilots: pilotsData.length,
          clients: clientsData.length,
          destinations: destinationsData.length,
          helicopters: helicoptersData.length,
        })

        setPilots(pilotsData)
        setClients(clientsData)
        setDestinations(destinationsData.filter((d) => d.active)) // Solo destinos activos
        setHelicopters(helicoptersData.filter((h) => h.status === "ACTIVE")) // Solo helicópteros activos
      } catch (error) {
        console.error("❌ Error al cargar datos:", error)
        setError("Error al cargar los datos necesarios")
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [isOpen, accessToken, userLoading])

  // Manejar clics fuera de los dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginResults(false)
      }
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinationResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filtrar resultados de origen
  useEffect(() => {
    if (originInput.length > 0) {
      const filtered = destinations.filter((destination) =>
        destination.name.toLowerCase().includes(originInput.toLowerCase()),
      )
      setOriginResults(filtered)
    } else {
      setOriginResults([])
    }
  }, [originInput, destinations])

  // Filtrar resultados de destino
  useEffect(() => {
    if (destinationInput.length > 0) {
      const filtered = destinations.filter((destination) =>
        destination.name.toLowerCase().includes(destinationInput.toLowerCase()),
      )
      setDestinationResults(filtered)
    } else {
      setDestinationResults([])
    }
  }, [destinationInput, destinations])

  // Calcular Run Time (SNMF) cuando cambian los tiempos de puesta en marcha y corte
  useEffect(() => {
    if (startupTime && shutdownTime) {
      // Convertir a objetos Date para calcular la diferencia
      const startup = new Date(`2000-01-01T${startupTime}:00`)
      const shutdown = new Date(`2000-01-01T${shutdownTime}:00`)

      // Si cruza la medianoche
      let diff = shutdown.getTime() - startup.getTime()
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setRunTime(`${hours}:${minutes.toString().padStart(2, "0")}`)
    }
  }, [startupTime, shutdownTime])

  // Calcular Flight Time cuando cambian los odómetros
  useEffect(() => {
    if (initialOdometer && finalOdometer) {
      const initial = Number.parseFloat(initialOdometer)
      const final = Number.parseFloat(finalOdometer)

      if (!isNaN(initial) && !isNaN(final) && final >= initial) {
        const flightTimeValue = (final - initial).toFixed(1)
        setFlightTime(flightTimeValue)
      }
    }
  }, [initialOdometer, finalOdometer])

  // Manejar selección de origen
  const handleOriginSelect = (destination: Destination) => {
    setOriginInput(destination.name)
    setOriginId(destination.id)
    setShowOriginResults(false)
    setCustomOrigin(false)
  }

  // Manejar selección de destino
  const handleDestinationSelect = (destination: Destination) => {
    setDestinationInput(destination.name)
    setDestinationId(destination.id)
    setShowDestinationResults(false)
    setCustomDestination(false)
  }

  // Manejar cambio de foto de odómetro final
  const handleFinalOdometerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setFinalOdometerPhoto(file)

      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setFinalOdometerPhotoPreview(event.target.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Funciones para el canvas de firma
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    setHasSignature(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()

    // Obtener coordenadas
    let x, y
    if ("touches" in e) {
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Obtener coordenadas
    let x, y
    if ("touches" in e) {
      e.preventDefault() // Prevenir scroll en dispositivos táctiles
      const rect = canvas.getBoundingClientRect()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.nativeEvent.offsetX
      y = e.nativeEvent.offsetY
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const endDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  // Validar formato de Gacho (formato aeronáutico 0.00)
  const validateGachoFormat = (value: string) => {
    // Permitir solo números y un punto decimal
    const regex = /^(\d+)?(\.\d{0,2})?$/
    return regex.test(value)
  }

  // Manejar cambio en el campo Gacho
  const handleGachoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (validateGachoFormat(value)) {
      setGachoTime(value)
    }
  }

  // Calcular duración en minutos
  const calculateDurationInMinutes = (): number => {
    if (!startupTime || !shutdownTime) return 0

    const startup = new Date(`2000-01-01T${startupTime}:00`)
    const shutdown = new Date(`2000-01-01T${shutdownTime}:00`)

    let diff = shutdown.getTime() - startup.getTime()
    if (diff < 0) {
      diff += 24 * 60 * 60 * 1000 // Agregar 24 horas si cruza medianoche
    }

    return Math.floor(diff / (1000 * 60)) // Convertir a minutos
  }

  // Función para convertir tiempo HH:MM a DateTime ISO
  const convertTimeToDateTime = (timeString: string, baseDate: string): Date => {
    return new Date(`${baseDate}T${timeString}:00Z`)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Verificar autenticación
      if (!accessToken) {
        throw new Error("No hay token de autenticación disponible")
      }

      // Validar campos requeridos
      if (!selectedPilot) {
        throw new Error("Debe seleccionar un piloto")
      }
      if (!selectedHelicopter) {
        throw new Error("Debe seleccionar un helicóptero")
      }
      if (!selectedClient) {
        throw new Error("Debe seleccionar un cliente")
      }
      if (!destinationId && !customDestination) {
        throw new Error("Debe seleccionar o ingresar un destino")
      }
      if (!startupTime || !shutdownTime) {
        throw new Error("Debe ingresar los tiempos de puesta en marcha y corte")
      }

      // Preparar datos para la API
      const flightLogData: Partial<NewFlightLog> = {
        pilotId: Number(selectedPilot),
        helicopterId: Number(selectedHelicopter),
        clientId: Number(selectedClient),
        destinationId: destinationId ? Number(destinationId) : undefined,
        date: new Date(`${flightDate}T00:00:00Z`),
        duration: calculateDurationInMinutes(),
        passengers: passengers ? Number(passengers) : undefined,
        notes: notes.trim() || undefined,
        status: flightStatus as FlightStatus,
        paymentStatus: "PENDING_INVOICE" as PaymentStatus,
        startTime: convertTimeToDateTime(startupTime, flightDate),
        landingTime: convertTimeToDateTime(shutdownTime, flightDate),
        odometer: finalOdometer ? Number(finalOdometer) : undefined,
        fuelEnd: fuelConsumed ? Number(fuelConsumed) : undefined,
        hookUsed: false,
        remarks: `Starts: ${starts}, Landings: ${landings}, Launches: ${launches}, RIN: ${rin}, Gacho: ${gachoTime}`,
        fuelStart: initialOdometer ? Number(initialOdometer) : undefined,
      }

      console.log("📤 Enviando flight log:", flightLogData)

      // Llamar a la API
      const createdFlightLog = await createFlightLog(flightLogData, accessToken)

      console.log("✅ Flight log creado:", createdFlightLog)

      // Resetear formulario
      resetForm()

      // Notificar éxito y cerrar
      onFlightCreated?.()
      onClose()
    } catch (error) {
      console.error("❌ Error al crear flight log:", error)

      if (error instanceof Error) {
        if (error.message.includes("401") || error.message.includes("unauthorized")) {
          setError("Sesión expirada. Por favor, inicie sesión nuevamente.")
        } else if (error.message.includes("403")) {
          setError("No tiene permisos para realizar esta acción.")
        } else if (error.message.includes("400")) {
          setError("Datos inválidos. Verifique la información ingresada.")
        } else {
          setError(error.message || "Error al crear la bitácora de vuelo")
        }
      } else {
        setError("Error inesperado al crear la bitácora de vuelo")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Función para resetear el formulario
  const resetForm = () => {
    setSelectedPilot("")
    setFlightDate(new Date().toISOString().split("T")[0])
    setSelectedHelicopter("")
    setSelectedClient("")
    setOriginInput("")
    setOriginId("")
    setDestinationInput("")
    setDestinationId("")
    setNotes("")
    setPassengers("0")
    setFuelConsumed("0")
    setStartupTime("")
    setShutdownTime("")
    setRunTime("0:00")
    setInitialOdometer("")
    setFinalOdometer("")
    setFlightTime("0.0")
    setStarts("1")
    setLandings("1")
    setLaunches("0")
    setRin("0")
    setGachoTime("0.00")
    setFlightStatus("COMPLETED")
    setFinalOdometerPhoto(null)
    setFinalOdometerPhotoPreview("")
    setCustomOrigin(false)
    setCustomDestination(false)
    setError("")
    clearSignature()
  }

  if (isLoadingData) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Vuelo" maxWidth="max-w-4xl">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className={`mt-4 text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Cargando datos necesarios...</p>
        </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Bitácora de Vuelo" maxWidth="max-w-4xl">
      <div
        className={`${darkMode ? "bg-gray-800 text-white border border-gray-700" : "bg-white text-gray-900 border border-gray-200"} shadow rounded-lg overflow-hidden`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Información del Vuelo</h3>
          <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Completa todos los campos para registrar un nuevo vuelo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Piloto - NUEVO CAMPO */}
            <div className="col-span-1">
              <label
                htmlFor="pilot"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Piloto *
              </label>
              <select
                id="pilot"
                value={selectedPilot}
                onChange={(e) => setSelectedPilot(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar piloto</option>
                {pilots.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>
                    {pilot.user.firstName} {pilot.user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha del vuelo */}
            <div className="col-span-1">
              <label
                htmlFor="flightDate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Fecha del vuelo *
              </label>
              <input
                type="date"
                id="flightDate"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Helicóptero */}
            <div className="col-span-1">
              <label
                htmlFor="helicopter"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Helicóptero *
              </label>
              <select
                id="helicopter"
                value={selectedHelicopter}
                onChange={(e) => setSelectedHelicopter(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar helicóptero</option>
                {helicopters.map((helicopter) => (
                  <option key={helicopter.id} value={helicopter.id}>
                    {helicopter.model.name} ({helicopter.registration})
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente */}
            <div className="col-span-1">
              <label
                htmlFor="client"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Cliente *
              </label>
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="">Seleccionar cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Origen con autocompletado */}
            <div className="col-span-1 relative" ref={originRef}>
              <label
                htmlFor="origin"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Origen
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="origin"
                  value={originInput}
                  onChange={(e) => {
                    setOriginInput(e.target.value)
                    setShowOriginResults(true)
                    if (e.target.value === "") {
                      setOriginId("")
                    }
                  }}
                  onFocus={() => setShowOriginResults(true)}
                  placeholder="Buscar o ingresar origen personalizado"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  disabled={isSubmitting}
                />
                {showOriginResults && (
                  <div
                    className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                      darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                    }`}
                  >
                    {originResults.length > 0 ? (
                      <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        {originResults.map((destination) => (
                          <li
                            key={destination.id}
                            onClick={() => handleOriginSelect(destination)}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                              darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-900"
                            }`}
                          >
                            {destination.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2">
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No se encontraron resultados
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomOrigin(true)
                            setShowOriginResults(false)
                          }}
                          className={`mt-1 w-full text-left text-sm px-2 py-1 rounded ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          }`}
                        >
                          Usar "{originInput}" como origen personalizado
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {customOrigin && <p className="mt-1 text-sm text-orange-500">Usando origen personalizado</p>}
            </div>

            {/* Destino con autocompletado */}
            <div className="col-span-1 relative" ref={destinationRef}>
              <label
                htmlFor="destination"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Destino *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="destination"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value)
                    setShowDestinationResults(true)
                    if (e.target.value === "") {
                      setDestinationId("")
                    }
                  }}
                  onFocus={() => setShowDestinationResults(true)}
                  placeholder="Buscar o ingresar destino personalizado"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  required
                  disabled={isSubmitting}
                />
                {showDestinationResults && (
                  <div
                    className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${
                      darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                    }`}
                  >
                    {destinationResults.length > 0 ? (
                      <ul className="max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                        {destinationResults.map((destination) => (
                          <li
                            key={destination.id}
                            onClick={() => handleDestinationSelect(destination)}
                            className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                              darkMode ? "hover:bg-gray-700 text-white" : "hover:bg-gray-100 text-gray-900"
                            }`}
                          >
                            {destination.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-2">
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          No se encontraron resultados
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomDestination(true)
                            setShowDestinationResults(false)
                          }}
                          className={`mt-1 w-full text-left text-sm px-2 py-1 rounded ${
                            darkMode
                              ? "bg-gray-700 hover:bg-gray-600 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                          }`}
                        >
                          Usar "{destinationInput}" como destino personalizado
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {customDestination && <p className="mt-1 text-sm text-orange-500">Usando destino personalizado</p>}
            </div>

            {/* Puesta en Marcha */}
            <div className="col-span-1">
              <label
                htmlFor="startupTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Puesta en Marcha *
              </label>
              <input
                type="time"
                id="startupTime"
                value={startupTime}
                onChange={(e) => setStartupTime(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Corte */}
            <div className="col-span-1">
              <label
                htmlFor="shutdownTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Corte *
              </label>
              <input
                type="time"
                id="shutdownTime"
                value={shutdownTime}
                onChange={(e) => setShutdownTime(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Run Time (SNMF) - calculado automáticamente */}
            <div className="col-span-1">
              <label
                htmlFor="runTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Run Time (SNMF)
              </label>
              <input
                type="text"
                id="runTime"
                value={runTime}
                readOnly
                className={`mt-1 block w-full rounded-md bg-gray-100 shadow-sm text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Odómetro Inicial */}
            <div className="col-span-1">
              <label
                htmlFor="initialOdometer"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Odómetro Inicial
              </label>
              <input
                type="number"
                id="initialOdometer"
                step="0.1"
                value={initialOdometer}
                onChange={(e) => setInitialOdometer(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Odómetro Final */}
            <div className="col-span-1">
              <label
                htmlFor="finalOdometer"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Odómetro Final
              </label>
              <input
                type="number"
                id="finalOdometer"
                step="0.1"
                value={finalOdometer}
                onChange={(e) => setFinalOdometer(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />

              {/* Foto del odómetro final */}
              <div className="mt-2">
                <label
                  htmlFor="finalOdometerPhoto"
                  className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                >
                  Foto del odómetro final
                </label>
                <input
                  type="file"
                  id="finalOdometerPhoto"
                  accept="image/*"
                  onChange={handleFinalOdometerPhotoChange}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="finalOdometerPhoto"
                  className={`cursor-pointer flex items-center justify-center border-2 border-dashed rounded-md p-2 ${
                    darkMode ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {finalOdometerPhotoPreview ? (
                    <div className="relative w-full">
                      <img
                        src={finalOdometerPhotoPreview || "/placeholder.svg"}
                        alt="Vista previa del odómetro final"
                        className="h-32 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setFinalOdometerPhoto(null)
                          setFinalOdometerPhotoPreview("")
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
                      <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Subir foto</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Flight Time (calculado automáticamente) */}
            <div className="col-span-1">
              <label
                htmlFor="flightTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Flight Time
              </label>
              <input
                type="text"
                id="flightTime"
                value={flightTime}
                readOnly
                className={`mt-1 block w-full rounded-md bg-gray-100 shadow-sm text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
            </div>

            {/* Starts */}
            <div className="col-span-1">
              <label
                htmlFor="starts"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Starts
              </label>
              <input
                type="number"
                id="starts"
                min="0"
                value={starts}
                onChange={(e) => setStarts(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Aterrizajes (ATE) */}
            <div className="col-span-1">
              <label
                htmlFor="landings"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Aterrizajes (ATE)
              </label>
              <input
                type="number"
                id="landings"
                min="0"
                value={landings}
                onChange={(e) => setLandings(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Lanzamientos */}
            <div className="col-span-1">
              <label
                htmlFor="launches"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Lanzamientos
              </label>
              <input
                type="number"
                id="launches"
                min="0"
                value={launches}
                onChange={(e) => setLaunches(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* RIN */}
            <div className="col-span-1">
              <label
                htmlFor="rin"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                RIN
              </label>
              <input
                type="number"
                id="rin"
                min="0"
                value={rin}
                onChange={(e) => setRin(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Gacho (formato aeronáutico 0.00) */}
            <div className="col-span-1">
              <label
                htmlFor="gachoTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Gacho (formato 0.00)
              </label>
              <input
                type="text"
                id="gachoTime"
                value={gachoTime}
                onChange={handleGachoChange}
                placeholder="0.00"
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
              <p className={`mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Formato aeronáutico (ejemplo: 1.30)
              </p>
            </div>

            {/* Pasajeros */}
            <div className="col-span-1">
              <label
                htmlFor="passengers"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Pasajeros
              </label>
              <input
                type="number"
                id="passengers"
                min="0"
                max="10"
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Combustible consumido */}
            <div className="col-span-1">
              <label
                htmlFor="fuelConsumed"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Combustible consumido (litros)
              </label>
              <input
                type="number"
                id="fuelConsumed"
                min="0"
                value={fuelConsumed}
                onChange={(e) => setFuelConsumed(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                disabled={isSubmitting}
              />
            </div>

            {/* Status del vuelo */}
            <div className="col-span-1">
              <label
                htmlFor="flightStatus"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Status del vuelo *
              </label>
              <select
                id="flightStatus"
                value={flightStatus}
                onChange={(e) => setFlightStatus(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
                disabled={isSubmitting}
              >
                <option value="SCHEDULED">Programado</option>
                <option value="COMPLETED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Notas adicionales */}
          <div className="mt-6">
            <label
              htmlFor="notes"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Notas adicionales
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              placeholder="Ingrese notas adicionales sobre el vuelo..."
              disabled={isSubmitting}
            />
          </div>

          {/* Firma digital */}
          <div className="mt-6">
            <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}>
              Firma digital
            </label>
            <div className={`border-2 ${darkMode ? "border-gray-600" : "border-gray-300"} rounded-md`}>
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={endDrawing}
                onMouseLeave={endDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={endDrawing}
                className={`w-full h-40 rounded-md touch-none ${isSubmitting ? "opacity-50" : ""}`}
                style={{ pointerEvents: isSubmitting ? "none" : "auto" }}
              />
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                onClick={clearSignature}
                disabled={isSubmitting}
                className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Limpiar firma
              </button>
            </div>
          </div>

          {hasSignature && <p className="text-sm text-green-500 mt-1">✔ Firma registrada</p>}

          {/* Error */}
          {error && (
            <div
              className={`mt-6 border-l-4 border-red-500 p-4 rounded ${
                darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-800"
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
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

          {/* Botón de envío */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting || !accessToken}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode ? "focus:ring-offset-gray-800" : ""
              }`}
            >
              {isSubmitting ? "Registrando..." : "Registrar Vuelo"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default AddFlightLogModal
