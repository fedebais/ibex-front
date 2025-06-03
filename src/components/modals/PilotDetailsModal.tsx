"use client"

import { useState, useEffect } from "react"
import Modal from "../ui/Modal"
import { getPilotById, getFlightLogsByPilotId, getHelicopterById } from "../../services/api"
import { useUser } from "../../context/UserContext"
import type { Pilot, FlightLog, Helicopter } from "../../types/api"

interface PilotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  pilotId: number | null
  darkMode?: boolean
}

const PilotDetailsModal = ({ isOpen, onClose, pilotId, darkMode = false }: PilotDetailsModalProps) => {
  const { user, accessToken, isLoading: userLoading } = useUser()
  const [pilot, setPilot] = useState<Pilot | null>(null)
  const [pilotFlights, setPilotFlights] = useState<FlightLog[]>([])
  const [helicopter, setHelicopter] = useState<Helicopter | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "flights" | "documents">("info")

  // Debug logs
  console.log("PilotDetailsModal - Props:", { isOpen, pilotId })
  console.log("PilotDetailsModal - User:", user)
  console.log("PilotDetailsModal - AccessToken:", user?.accessToken)

  // Cargar datos del piloto
  useEffect(() => {
    console.log("PilotDetailsModal - useEffect triggered with:", {
      pilotId,
      isOpen,
      hasToken: !!accessToken,
      userLoading,
    })

    const loadPilotData = async () => {
      // Esperar a que termine la carga del UserContext
      if (userLoading) {
        console.log("PilotDetailsModal - UserContext is still loading")
        return
      }

      // Verificar condiciones una por una
      if (!pilotId) {
        console.log("PilotDetailsModal - No pilotId provided")
        return
      }

      if (!isOpen) {
        console.log("PilotDetailsModal - Modal is not open")
        return
      }

      if (!accessToken) {
        console.log("PilotDetailsModal - No access token available")
        return
      }

      console.log("PilotDetailsModal - Starting to load pilot data for ID:", pilotId)
      setIsLoading(true)
      setError(null)

      try {
        console.log("PilotDetailsModal - Calling getPilotById with:", { pilotId, token: accessToken })

        // Cargar datos del piloto
        const pilotData = await getPilotById(pilotId, accessToken)
        console.log("PilotDetailsModal - Pilot data received:", pilotData)
        setPilot(pilotData)

        // Cargar vuelos del piloto
        console.log("PilotDetailsModal - Loading flight logs for pilot:", pilotId)
        const flightsData = await getFlightLogsByPilotId(pilotId, accessToken)
        console.log("PilotDetailsModal - Flight logs received:", flightsData)
        setPilotFlights(flightsData)

        // Cargar datos del helicóptero asignado
        if (pilotData.helicopterId) {
          console.log("PilotDetailsModal - Loading helicopter data for ID:", pilotData.helicopterId)
          const helicopterData = await getHelicopterById(pilotData.helicopterId, accessToken)
          console.log("PilotDetailsModal - Helicopter data received:", helicopterData)
          setHelicopter(helicopterData)
        }
      } catch (err) {
        console.error("PilotDetailsModal - Error loading pilot data:", err)
        setError("No se pudieron cargar los datos del piloto. Por favor, intente nuevamente.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPilotData()
  }, [pilotId, isOpen, accessToken, userLoading])

  // Limpiar estados al cerrar el modal
  const handleClose = () => {
    console.log("PilotDetailsModal - Closing modal and clearing states")
    setPilot(null)
    setPilotFlights([])
    setHelicopter(null)
    setError(null)
    setActiveTab("info")
    onClose()
  }

  // Calcular estadísticas
  const totalFlights = pilotFlights.length
  const completedFlights = pilotFlights.filter((f) => f.status === "Completado").length
  const scheduledFlights = pilotFlights.filter((f) => f.status === "Programado").length

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  // Formatear duración
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (!isOpen) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Detalles del Piloto" maxWidth="max-w-4xl" darkMode={darkMode}>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className={`ml-4 ${darkMode ? "text-white" : "text-gray-900"}`}>Cargando datos del piloto...</p>
        </div>
      ) : error ? (
        <div className={`${darkMode ? "bg-red-900" : "bg-red-100"} p-4 rounded-md`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className={`h-5 w-5 ${darkMode ? "text-red-300" : "text-red-400"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className={`text-sm ${darkMode ? "text-red-300" : "text-red-700"}`}>{error}</p>
            </div>
          </div>
        </div>
      ) : pilot ? (
        <div className="space-y-6">
          {/* Tabs de navegación */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "info"
                    ? `border-orange-500 ${darkMode ? "text-orange-400" : "text-orange-600"}`
                    : `border-transparent ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`
                }`}
              >
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab("flights")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "flights"
                    ? `border-orange-500 ${darkMode ? "text-orange-400" : "text-orange-600"}`
                    : `border-transparent ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`
                }`}
              >
                Vuelos ({totalFlights})
              </button>
              <button
                onClick={() => setActiveTab("documents")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "documents"
                    ? `border-orange-500 ${darkMode ? "text-orange-400" : "text-orange-600"}`
                    : `border-transparent ${darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`
                }`}
              >
                Documentos
              </button>
            </nav>
          </div>

          {/* Contenido según la pestaña activa */}
          {activeTab === "info" && (
            <>
              {/* Información básica del piloto */}
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/4 flex justify-center">
                  <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl">
                    {pilot.user.firstName.charAt(0)}
                  </div>
                </div>

                <div className="w-full sm:w-3/4 space-y-2 sm:space-y-4">
                  <div>
                    <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {pilot.user.firstName} {pilot.user.lastName}
                    </h3>
                    <p className={`text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {pilot.user.email}
                    </p>
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Piloto</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Número de Licencia
                      </p>
                      <p className={`text-sm sm:text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {pilot.license}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Horas de Vuelo
                      </p>
                      <p className={`text-sm sm:text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {pilot.flightHours}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</p>
                      <p className={`text-sm sm:text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {pilot.user.phone}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Estado</p>
                      <p className={`text-sm sm:text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            pilot.user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pilot.user.active ? "Activo" : "Inactivo"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de licencia y certificaciones */}
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
                <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Información de Licencia
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Número de Licencia</p>
                    <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {pilot.license}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Vencimiento Médico</p>
                    <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {formatDate(pilot.medicalExpiry)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Último Entrenamiento</p>
                    <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {formatDate(pilot.lastTraining)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificaciones */}
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
                <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Certificaciones
                </h4>

                {pilot.certifications && pilot.certifications.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pilot.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className={`px-3 py-2 rounded-md text-sm font-medium ${
                          darkMode
                            ? "bg-orange-900 text-orange-200 border border-orange-700"
                            : "bg-orange-100 text-orange-800 border border-orange-200"
                        }`}
                      >
                        {cert.certificationType.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No hay certificaciones registradas
                  </p>
                )}
              </div>

              {/* Certificaciones por Aeronave */}
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
                <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Certificaciones por Aeronave
                </h4>

                {pilot.aircraftRatings && pilot.aircraftRatings.length > 0 ? (
                  <div className="space-y-3">
                    {pilot.aircraftRatings.map((rating, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-md ${
                          darkMode ? "bg-gray-800 border border-gray-600" : "bg-white border border-gray-200"
                        }`}
                      >
                        <div>
                          <p className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {rating.aircraftModel || rating.model}
                          </p>
                          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            Certificado: {formatDate(rating.certificationDate)}
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            darkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-800"
                          }`}
                        >
                          Certificado
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No hay certificaciones por aeronave registradas
                  </p>
                )}
              </div>

              {/* Helicóptero asignado */}
              <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
                <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Helicóptero Asignado
                </h4>

                {helicopter ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        src={helicopter.imageUrl || "/placeholder.svg"}
                        alt={helicopter.model}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        {helicopter.model} - {helicopter.registration}
                      </p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Estado:{" "}
                        <span className={helicopter.status === "Activo" ? "text-green-500" : "text-yellow-500"}>
                          {helicopter.status}
                        </span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    No hay helicóptero asignado
                  </p>
                )}
              </div>

              {/* Estadísticas de vuelo */}
              <div>
                <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Estadísticas de Vuelo
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                  <div
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
                  >
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Vuelos</p>
                    <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {totalFlights}
                    </p>
                  </div>
                  <div
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
                  >
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Completados</p>
                    <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {completedFlights}
                    </p>
                  </div>
                  <div
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
                  >
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Programados</p>
                    <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {scheduledFlights}
                    </p>
                  </div>
                  <div
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
                  >
                    <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas Vuelo</p>
                    <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {pilot.flightHours}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "flights" && (
            <div>
              <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Historial de Vuelos
              </h4>

              {pilotFlights.length > 0 ? (
                <div
                  className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-x-auto`}
                >
                  <table className={`w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                        >
                          Fecha
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                        >
                          Destino
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                        >
                          Cliente
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                        >
                          Duración
                        </th>
                        <th
                          scope="col"
                          className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                        >
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
                    >
                      {pilotFlights.map((flight) => (
                        <tr key={flight.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                          <td
                            className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {formatDate(flight.date)}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {flight.destination?.name || "N/A"}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {flight.client?.name || "N/A"}
                          </td>
                          <td
                            className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {formatDuration(flight.duration)}
                          </td>
                          <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm`}>
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                flight.status === "Completado"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {flight.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  No hay vuelos registrados para este piloto.
                </div>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Documentos</h4>

              <div
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
              >
                <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg
                        className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Licencia de Piloto
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs mr-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Número: {pilot.license}
                      </span>
                      <button
                        className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
                      >
                        Ver
                      </button>
                    </div>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg
                        className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Certificado Médico
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs mr-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Vence: {formatDate(pilot.medicalExpiry)}
                      </span>
                      <button
                        className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
                      >
                        Ver
                      </button>
                    </div>
                  </li>
                  <li className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center">
                      <svg
                        className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Certificado de Entrenamiento
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-xs mr-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        Fecha: {formatDate(pilot.lastTraining)}
                      </span>
                      <button
                        className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
                      >
                        Ver
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                darkMode
                  ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
            >
              Descargar Informe
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Editar Piloto
            </button>
          </div>
        </div>
      ) : (
        <div className={`text-center py-8 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          <p>No se encontró información del piloto.</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>Debug info:</p>
            <p>Pilot ID: {pilotId}</p>
            <p>Modal Open: {isOpen ? "Yes" : "No"}</p>
            <p>Has Token: {accessToken ? "Yes" : "No"}</p>
            <p>User Loading: {userLoading ? "Yes" : "No"}</p>
            <p>Loading: {isLoading ? "Yes" : "No"}</p>
            <p>Error: {error || "None"}</p>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default PilotDetailsModal
