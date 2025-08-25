"use client"

import { useState, useEffect, useRef } from "react"
import { getFlightLogs, deleteFlightLog } from "../../services/api"
import FlightDetailsModal from "../../components/modals/FlightDetailsModal"
import { Search, Trash2 } from "lucide-react"
import AddFlightLogModal from "../../components/modals/AddFlightLogModal"
import { useUser } from "../../context/UserContext"
import type { FlightLog, FlightStatus, PaymentStatus } from "../../types/api"
import { formatDate } from "../../utils/dateUtils"

interface FlightLogsProps {
  darkMode: boolean
  selectedMonth?: number
  selectedYear?: number
}

const FlightLogs = ({ darkMode, selectedMonth, selectedYear }: FlightLogsProps) => {
  const [allFlights, setAllFlights] = useState<FlightLog[]>([]) // Datos originales de la API
  const [filteredFlights, setFilteredFlights] = useState<FlightLog[]>([]) // Datos filtrados
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [billingFilter, setBillingFilter] = useState<string>("all")
  const [pilotFilter, setPilotFilter] = useState("all")
  const [selectedFlightLog, setSelectedFlightLog] = useState<FlightLog | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [flightToDelete, setFlightToDelete] = useState<FlightLog | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const isMounted = useRef(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accessToken, isLoading: userLoading, user } = useUser()
  // Remover la función loadPilots y el estado pilots
  // En su lugar, obtener pilotos únicos de los vuelos cargados
  const uniquePilots = allFlights
    .filter((flight) => flight.pilot?.user)
    .reduce((acc, flight) => {
      if (flight.pilot?.user && !acc.find((p) => p.id === flight.pilotId)) {
        acc.push({
          id: flight.pilot.id,
          firstName: flight.pilot.user.firstName,
          lastName: flight.pilot.user.lastName,
        })
      }
      return acc
    }, [] as Array<{ id: number; firstName: string; lastName: string }>)

  // Función para obtener el texto del estado del vuelo
  const getStatusText = (status: FlightStatus) => {
    switch (status) {
      case "COMPLETED":
        return "Completado"
      case "SCHEDULED":
        return "Programado"
      case "CANCELLED":
        return "Cancelado"
      default:
        return "Desconocido"
    }
  }

  // Función para obtener la clase CSS según el estado del vuelo
  const getStatusClass = (status: FlightStatus) => {
    switch (status) {
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "SCHEDULED":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "PENDING_INVOICE":
        return "Pendiente facturación"
      case "INVOICED":
        return "Facturado"
      case "PENDING_PAYMENT":
        return "Pendiente pago"
      case "PAID":
        return "Pagado"
      default:
        return "Desconocido"
    }
  }

  const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
      case "PENDING_INVOICE":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "INVOICED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "PENDING_PAYMENT":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      case "PAID":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  // Función para cargar pilotos
  /*
  const loadPilots = async () => {
    if (!accessToken) return

    try {
      const pilotsData = await getPilots(accessToken)
      setPilots(pilotsData)
    } catch (err) {
      console.error("Error al cargar pilotos:", err)
    }
  }
  */

  // Cargar todos los vuelos al inicio
  useEffect(() => {
    const loadFlights = async () => {
      if (userLoading) return

      if (!accessToken) {
        setError("No se pudo obtener el token de autenticación")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        console.log("FlightLogs: Cargando vuelos desde API...")

        const data = await getFlightLogs(accessToken)
        console.log("FlightLogs: Vuelos cargados:", data.length)
        console.log("getFlightLogs raw (primeros 3):", data.slice(0, 3))

        setAllFlights(data)
        setFilteredFlights(data) // Inicialmente mostrar todos
        //loadPilots()
      } catch (err) {
        console.error("Error al cargar vuelos:", err)
        setError("Error al cargar los vuelos")
      } finally {
        setIsLoading(false)
      }
    }

    loadFlights()
  }, [accessToken, userLoading])

  // Filtrar vuelos cuando cambian los filtros
  useEffect(() => {
    if (!isMounted.current) return

    // Validación protectora
    if (!Array.isArray(allFlights) || allFlights.length === 0) {
      console.log("FlightLogs: allFlights está vacío o no es array")
      setFilteredFlights([])
      return
    }

    console.log("FlightLogs: Aplicando filtros", {
      searchTerm,
      statusFilter,
      billingFilter,
      pilotFilter,
      selectedMonth,
      selectedYear,
      totalFlights: allFlights.length,
    })

    // Debug de valores de filtros
    console.log("Valores de filtros actuales:", {
      statusFilter,
      billingFilter,
      pilotFilter,
      statusFilterType: typeof statusFilter,
      billingFilterType: typeof billingFilter,
      pilotFilterType: typeof pilotFilter,
    })

    let filtered = [...allFlights] // Siempre filtrar desde los datos originales

    // Debug del primer vuelo antes de filtrar
    if (filtered.length > 0) {
      console.log("Ejemplo de flight[0] antes de filtrar:", filtered[0])
      console.log("flight.status:", filtered[0]?.status, "tipo:", typeof filtered[0]?.status)
      console.log("flight.paymentStatus:", filtered[0]?.paymentStatus, "tipo:", typeof filtered[0]?.paymentStatus)
      console.log("flight.pilotId:", filtered[0]?.pilotId, "tipo:", typeof filtered[0]?.pilotId)
    }

    // Filtrar por mes y año si están definidos
    // COMENTADO TEMPORALMENTE PARA MOSTRAR TODOS LOS VUELOS
    /*
    if (selectedMonth !== undefined && selectedYear !== undefined) {
      const beforeMonthFilter = filtered.length
      filtered = filtered.filter((flight) => {
        const flightDate = new Date(flight.date)
        return flightDate.getMonth() === selectedMonth && flightDate.getFullYear() === selectedYear
      })
      console.log(`Filtro por mes/año: ${beforeMonthFilter} → ${filtered.length}`)
    }
    */

    // Filtrar por término de búsqueda
    if (searchTerm && searchTerm.trim() !== "") {
      const beforeSearchFilter = filtered.length
      filtered = filtered.filter((flight) => {
        const searchLower = searchTerm.toLowerCase()
        return (
          flight.id.toString().includes(searchLower) ||
          flight.pilot?.user?.firstName?.toLowerCase().includes(searchLower) ||
          flight.pilot?.user?.lastName?.toLowerCase().includes(searchLower) ||
          flight.helicopter?.registration?.toLowerCase().includes(searchLower) ||
          flight.destination?.name?.toLowerCase().includes(searchLower) ||
          flight.client?.name?.toLowerCase().includes(searchLower) ||
          flight.date.includes(searchLower)
        )
      })
      console.log(`Filtro por búsqueda: ${beforeSearchFilter} → ${filtered.length}`)
    }

    // Filtrar por estado - con validación reforzada
    if (statusFilter && statusFilter !== "all") {
      const beforeStatusFilter = filtered.length
      console.log(`Aplicando filtro de estado: "${statusFilter}" (tipo: ${typeof statusFilter})`)
      filtered = filtered.filter((flight) => {
        const match = flight.status === statusFilter
        if (!match && beforeStatusFilter > 0) {
          console.log(`Estado no coincide: flight.status="${flight.status}" vs statusFilter="${statusFilter}"`)
        }
        return match
      })
      console.log(`Filtro por estado: ${beforeStatusFilter} → ${filtered.length}`)
    }

    // Filtrar por estado de facturación - con validación reforzada
    if (billingFilter && billingFilter !== "all") {
      const beforeBillingFilter = filtered.length
      console.log(`Aplicando filtro de facturación: "${billingFilter}" (tipo: ${typeof billingFilter})`)
      filtered = filtered.filter((flight) => {
        const match = flight.paymentStatus === billingFilter
        if (!match && beforeBillingFilter > 0) {
          console.log(
            `PaymentStatus no coincide: flight.paymentStatus="${flight.paymentStatus}" vs billingFilter="${billingFilter}"`,
          )
        }
        return match
      })
      console.log(`Filtro por facturación: ${beforeBillingFilter} → ${filtered.length}`)
    }

    // Filtrar por piloto - con validación reforzada
    if (pilotFilter && pilotFilter !== "all") {
      const beforePilotFilter = filtered.length
      console.log(`Aplicando filtro de piloto: "${pilotFilter}" (tipo: ${typeof pilotFilter})`)
      filtered = filtered.filter((flight) => {
        const match = flight.pilot?.id.toString() === pilotFilter
        if (!match && beforePilotFilter > 0) {
          console.log(`PilotId no coincide: flight.pilotId="${flight.pilotId}" vs pilotFilter="${pilotFilter}"`)
        }
        return match
      })
      console.log(`Filtro por piloto: ${beforePilotFilter} → ${filtered.length}`)
    }

    console.log(`FlightLogs: Vuelos filtrados: ${filtered.length}`)

    // Debug del primer vuelo después de filtrar
    if (filtered.length > 0) {
      console.log("Ejemplo de flight[0] después de filtrar:", filtered[0])
    } else if (allFlights.length > 0) {
      console.log("No hay vuelos después del filtrado, pero sí había vuelos originales")
    }

    setFilteredFlights(filtered)
  }, [searchTerm, statusFilter, billingFilter, pilotFilter, selectedMonth, selectedYear, allFlights])

  // Manejar la apertura del modal de detalles
  const handleViewFlight = (flightId: string) => {
    const flight = filteredFlights.find((f) => f.id.toString() === flightId)
    setSelectedFlightLog(flight || null)
    setIsDetailsModalOpen(true)
  }

  // Manejar la eliminación de un vuelo
  const handleDeleteFlight = (flight: FlightLog) => {
    setFlightToDelete(flight)
    setIsDeleteModalOpen(true)
  }

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!flightToDelete || !accessToken) return

    try {
      await deleteFlightLog(flightToDelete.id, accessToken)
      
      // Remover el vuelo de la lista
      setAllFlights(prev => prev.filter(f => f.id !== flightToDelete.id))
      setFilteredFlights(prev => prev.filter(f => f.id !== flightToDelete.id))
      
      // Cerrar modal y limpiar estado
      setIsDeleteModalOpen(false)
      setFlightToDelete(null)
      
      // Mostrar mensaje de éxito
      alert('Vuelo eliminado exitosamente')
    } catch (error) {
      console.error('Error al eliminar vuelo:', error)
      alert('Error al eliminar el vuelo')
    }
  }

  // Clases condicionales
  const cardClass = darkMode
    ? "bg-gray-800 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-200"

  if (userLoading || isLoading) {
    return (
      <div className="pt-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando vuelos...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bitácoras de Vuelo</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Nuevo Vuelo
        </button>
      </div>

      <div className={`${cardClass} rounded-lg shadow-md p-6 mb-6`}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Filtros en una sola fila */}
          <div className="flex flex-col md:flex-row gap-4 w-full">
            {/* Buscador */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar vuelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 pr-4 py-2 w-full rounded-md ${
                  darkMode
                    ? "bg-gray-700 text-white border-gray-600 focus:border-orange-500"
                    : "bg-white text-gray-900 border-gray-300 focus:border-orange-500"
                } border focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
            </div>

            {/* Filtro de estado - CORREGIDO con valores de la API */}
            <div className="w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`rounded-md border py-2 px-3 w-full ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              >
                <option value="all">Todos los estados</option>
                <option value="COMPLETED">Completados</option>
                <option value="SCHEDULED">Programados</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>

            {/* Filtro de facturación - CORREGIDO con valores de la API */}
            <div className="w-full md:w-auto">
              <select
                value={billingFilter}
                onChange={(e) => setBillingFilter(e.target.value)}
                className={`rounded-md border py-2 px-3 w-full ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              >
                <option value="all">Todas las facturas</option>
                <option value="PENDING_INVOICE">Pendiente facturación</option>
                <option value="INVOICED">Facturado</option>
                <option value="PENDING_PAYMENT">Pendiente pago</option>
                <option value="PAID">Pagado</option>
              </select>
            </div>

            {/* Filtro de piloto */}
            <div className="w-full md:w-auto">
              <select
                value={pilotFilter}
                onChange={(e) => setPilotFilter(e.target.value)}
                className={`rounded-md border py-2 px-3 w-full ${
                  darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              >
                <option value="all">Todos los pilotos</option>
                {uniquePilots.map((pilot) => (
                  <option key={pilot.id} value={pilot.id}>
                    {pilot.firstName} {pilot.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Información de resultados */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredFlights.length} de {allFlights.length} vuelos
        </p>
      </div>

      {/* Tabla de vuelos */}
      <div className={`${cardClass} rounded-lg shadow-md overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Piloto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Origen → Destino
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Helicóptero
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Horario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Duración
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Facturación
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {filteredFlights.length > 0 ? (
                filteredFlights.map((flight) => (
                  <tr
                    key={flight.id}
                    className={`cursor-pointer ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                    onClick={() => handleViewFlight(flight.id.toString())}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(flight.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {flight.pilot?.user
                        ? `${flight.pilot.user.firstName} ${flight.pilot.user.lastName}`
                        : `Piloto ${flight.pilotId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {flight.origin?.name ? (
                        <span>
                          <span className="font-medium">{flight.origin.name}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="font-medium">{flight.destination?.name || `Destino ${flight.destinationId}`}</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">→ {flight.destination?.name || `Destino ${flight.destinationId}`}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {flight.helicopter?.registration || `Helicóptero ${flight.helicopterId}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {flight.startTime} - {flight.landingTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{flight.duration} min</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(flight.status)}`}>
                        {getStatusText(flight.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(flight.paymentStatus)}`}
                      >
                        {getPaymentStatusText(flight.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewFlight(flight.id.toString())
                          }}
                          className={`text-orange-600 hover:text-orange-900 font-medium ${
                            darkMode ? "hover:text-orange-400" : ""
                          }`}
                        >
                          Ver detalles
                        </button>
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteFlight(flight)
                            }}
                            className="text-red-600 hover:text-red-900 font-medium"
                            title="Eliminar vuelo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-sm">
                    No se encontraron vuelos con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles de vuelo */}
      <FlightDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        flightLog={selectedFlightLog}
        darkMode={darkMode}
      />

      {/* Modal para agregar nuevo vuelo */}
      <AddFlightLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onFlightCreated={() => {
          // Recargar la lista de vuelos
          window.location.reload() // Temporal, se puede mejorar
        }}
      />

      {/* Modal de confirmación de eliminación */}
      {isDeleteModalOpen && flightToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          {/* Overlay opacado */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          
          {/* Modal centrado */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
            {/* Header del modal */}
            <div className="flex items-center p-6 border-b border-gray-200">
              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar eliminación
                </h3>
              </div>
            </div>
            
            {/* Contenido del modal */}
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de que quieres eliminar el vuelo a{' '}
                <strong className="text-gray-900">{flightToDelete.destination?.name}</strong> del{' '}
                <strong className="text-gray-900">{formatDate(flightToDelete.date)}</strong>?
              </p>
              <p className="text-sm text-red-600 font-medium">
                ⚠️ Esta acción no se puede deshacer.
              </p>
            </div>
            
            {/* Footer del modal */}
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                onClick={confirmDelete}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FlightLogs
