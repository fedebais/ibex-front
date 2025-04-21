import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useUser } from "../../context/UserContext"
import { mockHelicopters, mockLocations } from "../../data/mockData"

interface NewFlightLogProps {
  darkMode: boolean
}

const NewFlightLog = ({ darkMode = false }: NewFlightLogProps) => {
  const { user } = useUser()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Estado para los datos del formulario
  const [flightDate, setFlightDate] = useState<string>(new Date().toISOString().split("T")[0])
  const [selectedHelicopter, setSelectedHelicopter] = useState<string>("")
  const [origin, setOrigin] = useState<string>("")
  const [destination, setDestination] = useState<string>("")
  const [departureTime, setDepartureTime] = useState<string>("")
  const [arrivalTime, setArrivalTime] = useState<string>("")
  const [flightHours, setFlightHours] = useState<string>("0:00")
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
  const [gachoTime, setGachoTime] = useState<string>("")

  const [isDrawing, setIsDrawing] = useState(false)

  // Canvas para firma
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasSignature, setHasSignature] = useState(false)

  // Calcular horas de vuelo cuando cambian los tiempos
  useEffect(() => {
    if (departureTime && arrivalTime) {
      const departure = new Date(`2000-01-01T${departureTime}:00`)
      const arrival = new Date(`2000-01-01T${arrivalTime}:00`)

      // Si el vuelo cruza la medianoche
      let diff = arrival.getTime() - departure.getTime()
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setFlightHours(`${hours}:${minutes.toString().padStart(2, "0")}`)
    }
  }, [departureTime, arrivalTime])

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

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío de datos
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false)

        // Resetear formulario
        setFlightDate(new Date().toISOString().split("T")[0])
        setSelectedHelicopter("")
        setOrigin("")
        setDestination("")
        setDepartureTime("")
        setArrivalTime("")
        setFlightHours("0:00")
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
        setGachoTime("")
        clearSignature()
      }, 3000)
    }, 1500)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold">Nueva Bitácora de Vuelo</h1>
      </div>

      {showSuccess && (
        <div
          className={`mb-6 border-l-4 border-green-500 p-4 rounded ${
            darkMode ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-800"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Bitácora registrada correctamente</p>
            </div>
          </div>
        </div>
      )}

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
            {/* Fecha del vuelo */}
            <div className="col-span-1">
              <label
                htmlFor="flightDate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Fecha del vuelo
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
              />
            </div>

            {/* Helicóptero */}
            <div className="col-span-1">
              <label
                htmlFor="helicopter"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Helicóptero
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
              >
                <option value="">Seleccionar helicóptero</option>
                {mockHelicopters
                  .filter((h) => h.status === "active")
                  .map((helicopter) => (
                    <option key={helicopter.id} value={helicopter.id}>
                      {helicopter.model} ({helicopter.registration})
                    </option>
                  ))}
              </select>
            </div>

            {/* Origen */}
            <div className="col-span-1">
              <label
                htmlFor="origin"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Origen
              </label>
              <select
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
              >
                <option value="">Seleccionar origen</option>
                {mockLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div className="col-span-1">
              <label
                htmlFor="destination"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Destino
              </label>
              <select
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
              >
                <option value="">Seleccionar destino</option>
                {mockLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Puesta en Marcha */}
            <div className="col-span-1">
              <label
                htmlFor="startupTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Puesta en Marcha
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
              />
            </div>

            {/* Corte */}
            <div className="col-span-1">
              <label
                htmlFor="shutdownTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Corte
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

            {/* Hora de salida */}
            <div className="col-span-1">
              <label
                htmlFor="departureTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Hora de salida
              </label>
              <input
                type="time"
                id="departureTime"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
              />
            </div>

            {/* Hora de llegada */}
            <div className="col-span-1">
              <label
                htmlFor="arrivalTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Hora de llegada
              </label>
              <input
                type="time"
                id="arrivalTime"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
              />
            </div>

            {/* Horas voladas (calculadas automáticamente) */}
            <div className="col-span-1">
              <label
                htmlFor="flightHours"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Horas voladas
              </label>
              <input
                type="text"
                id="flightHours"
                value={flightHours}
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
                required
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
                required
              />
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
              />
            </div>

            {/* Gacho */}
            <div className="col-span-1">
              <label
                htmlFor="gachoTime"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Gacho
              </label>
              <input
                type="time"
                id="gachoTime"
                value={gachoTime}
                onChange={(e) => setGachoTime(e.target.value)}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
              />
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
              />
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
            />
          </div>

          {/* Firma digital */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma digital</label>
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
                className="w-full h-40 rounded-md touch-none"
              />
            </div>
            <div className="mt-2 flex space-x-2">
              <button
                type="button"
                onClick={clearSignature}
                className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Limpiar firma
              </button>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode ? "focus:ring-offset-gray-800" : ""
              }`}
            >
              {isSubmitting ? "Registrando..." : "Registrar Vuelo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewFlightLog
