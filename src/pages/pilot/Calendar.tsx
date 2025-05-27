"use client"

import { useState, useEffect } from "react"
import { mockFlights, mockHelicopters, getPilotName, getHelicopterInfo, getLocationName } from "../../data/mockData"
import { useUser } from "../../context/UserContext"
import { ChevronLeft, ChevronRight, CalendarIcon, Clock, MapPin, User, Plane } from "lucide-react"

interface Event {
  id: string
  title: string
  date: Date
  type: "flight" | "maintenance" | "service"
  status: string
  details: {
    pilot?: string
    helicopter?: string
    origin?: string
    destination?: string
    time?: string
    duration?: string
    maintenanceType?: string
    technician?: string
  }
}

const Calendar = ({ darkMode }: { darkMode: boolean }) => {
  const { user } = useUser()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  // Obtener el primer día del mes actual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // Obtener el día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Obtener el número de días en el mes actual
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()

  // Obtener el nombre del mes actual
  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  const currentMonthName = monthNames[currentDate.getMonth()]

  // Cargar eventos (vuelos y mantenimientos)
  useEffect(() => {
    // Filtrar vuelos solo para el piloto actual
    const pilotId = user?.id || "pilot1" // Usar un ID por defecto si no hay usuario

    // Convertir vuelos a eventos (solo los del piloto actual)
    const flightEvents = mockFlights
      .filter((flight) => flight.pilotId === pilotId)
      .map((flight) => {
        const flightDate = new Date(flight.date)
        return {
          id: `flight-${flight.id}`,
          title: `Vuelo: ${getLocationName(flight.originId)} → ${getLocationName(flight.destinationId)}`,
          date: flightDate,
          type: "flight" as const,
          status: flight.status,
          details: {
            pilot: getPilotName(flight.pilotId),
            helicopter: getHelicopterInfo(flight.helicopterId),
            origin: getLocationName(flight.originId),
            destination: getLocationName(flight.destinationId),
            time: `${flight.departureTime} - ${flight.arrivalTime}`,
            duration: flight.flightHours,
          },
        }
      })

    // Crear eventos de mantenimiento simulados (solo para helicópteros que el piloto ha volado)
    const pilotHelicopterIds = new Set(
      mockFlights.filter((flight) => flight.pilotId === pilotId).map((flight) => flight.helicopterId),
    )

    const maintenanceEvents = mockHelicopters
      .filter((helicopter) => pilotHelicopterIds.has(helicopter.id))
      .flatMap((helicopter) => {
        // Crear algunos eventos de mantenimiento aleatorios para cada helicóptero
        const maintenanceTypes = [
          "Revisión 100 horas",
          "Cambio de aceite",
          "Inspección general",
          "Mantenimiento programado",
        ]
        const events = []

        // Mantenimiento pasado
        const pastDate = new Date(currentDate)
        pastDate.setDate(Math.floor(Math.random() * 15) + 1) // Día aleatorio entre 1 y 15
        events.push({
          id: `maintenance-${helicopter.id}-1`,
          title: `Mantenimiento: ${helicopter.model}`,
          date: pastDate,
          type: "maintenance" as const,
          status: "completed",
          details: {
            helicopter: `${helicopter.model} (${helicopter.registration})`,
            maintenanceType: maintenanceTypes[Math.floor(Math.random() * maintenanceTypes.length)],
            technician: "Juan Técnico",
          },
        })

        // Servicio futuro
        const futureDate = new Date(currentDate)
        futureDate.setDate(Math.floor(Math.random() * 10) + 20) // Día aleatorio entre 20 y 30
        events.push({
          id: `service-${helicopter.id}-1`,
          title: `Servicio: ${helicopter.model}`,
          date: futureDate,
          type: "service" as const,
          status: "scheduled",
          details: {
            helicopter: `${helicopter.model} (${helicopter.registration})`,
            maintenanceType: "Servicio regular",
            technician: "Carlos Mecánico",
          },
        })

        return events
      })

    // Combinar todos los eventos
    setEvents([...flightEvents, ...maintenanceEvents])
  }, [currentDate, user])

  // Cambiar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Cambiar al mes siguiente
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Cambiar al mes actual
  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
  }

  // Obtener eventos para un día específico
  const getEventsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return events.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Obtener el color de fondo según el tipo de evento
  const getEventColor = (type: string, status: string) => {
    if (type === "flight") {
      return status === "completed"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
    } else if (type === "maintenance") {
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    } else if (type === "service") {
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
  }

  // Abrir modal con detalles del evento
  const openEventDetails = (event: Event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }

  // Renderizar los días del calendario
  const renderCalendarDays = () => {
    const days = []
    const today = new Date()

    // Añadir celdas vacías para los días anteriores al primer día del mes
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700"></div>)
    }

    // Añadir los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear()

      const dayEvents = getEventsForDay(day)

      days.push(
        <div
          key={`day-${day}`}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-1 overflow-hidden ${
            isToday ? "bg-orange-50 dark:bg-orange-900/10" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span className={`text-sm font-semibold ${isToday ? "text-orange-600 dark:text-orange-400" : ""}`}>
              {day}
            </span>
            {isToday && <span className="text-xs bg-orange-600 text-white px-1 rounded">Hoy</span>}
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
            {dayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => openEventDetails(event)}
                className={`text-xs truncate px-1 py-0.5 rounded cursor-pointer ${getEventColor(event.type, event.status)}`}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return days
  }

  // Obtener la semana actual
  const getCurrentWeek = () => {
    const today = new Date(currentDate)
    const day = today.getDay() // 0 = Domingo, 1 = Lunes, etc.
    const diff = today.getDate() - day
    const weekStart = new Date(today)
    weekStart.setDate(diff)

    const week = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      week.push(day)
    }

    return week
  }

  // Renderizar la vista semanal
  const renderWeekView = () => {
    const week = getCurrentWeek()
    const today = new Date()

    return (
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
        {/* Días de la semana */}
        {week.map((day, index) => {
          const isToday =
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear()

          const dayEvents = events.filter(
            (event) =>
              event.date.getDate() === day.getDate() &&
              event.date.getMonth() === day.getMonth() &&
              event.date.getFullYear() === day.getFullYear(),
          )

          return (
            <div key={index} className="flex flex-col">
              <div
                className={`text-center py-2 font-medium ${
                  isToday ? "bg-orange-100 dark:bg-orange-900/30" : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <div className="text-xs uppercase">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][day.getDay()]}
                </div>
                <div className={`text-lg ${isToday ? "text-orange-600 dark:text-orange-400" : ""}`}>
                  {day.getDate()}
                </div>
                <div className="text-xs">{monthNames[day.getMonth()].substring(0, 3)}</div>
              </div>

              <div className="flex-1 min-h-[400px] bg-white dark:bg-gray-900 p-1 overflow-y-auto">
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => openEventDetails(event)}
                    className={`mb-1 p-2 text-sm rounded cursor-pointer ${getEventColor(event.type, event.status)}`}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.details.time && (
                      <div className="text-xs flex items-center mt-1">
                        <Clock size={12} className="mr-1" />
                        {event.details.time}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="p-6 pt-6">
      <h1 className="text-2xl font-bold mb-6">Mi Calendario</h1>

      {/* Controles del calendario */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex items-center space-x-2 mb-4 sm:mb-0">
          <button
            onClick={goToPreviousMonth}
            className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">
            {currentMonthName} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToNextMonth}
            className={`p-2 rounded-full ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-md p-1 flex">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "month"
                  ? "bg-orange-600 text-white"
                  : "bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === "week"
                  ? "bg-orange-600 text-white"
                  : "bg-transparent hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Semana
            </button>
          </div>

          <button
            onClick={goToCurrentMonth}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2"
          >
            <CalendarIcon size={16} />
            <span>Hoy</span>
          </button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-sm">Vuelo Completado</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span className="text-sm">Vuelo Programado</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm">Mantenimiento</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Servicio</span>
        </div>
      </div>

      {/* Calendario */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {viewMode === "month" ? (
          <>
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Dom</div>
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Lun</div>
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Mar</div>
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Mié</div>
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Jue</div>
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Vie</div>
              <div className="py-2 text-center font-semibold text-sm bg-gray-100 dark:bg-gray-800">Sáb</div>
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">{renderCalendarDays()}</div>
          </>
        ) : (
          renderWeekView()
        )}
      </div>

      {/* Modal de detalles del evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Detalles del Evento</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(selectedEvent.type, selectedEvent.status)}`}
              >
                {selectedEvent.type === "flight"
                  ? selectedEvent.status === "completed"
                    ? "Vuelo Completado"
                    : "Vuelo Programado"
                  : selectedEvent.type === "maintenance"
                    ? "Mantenimiento"
                    : "Servicio"}
              </span>
            </div>

            <h4 className="text-lg font-semibold mb-4">{selectedEvent.title}</h4>

            <div className="space-y-3">
              <div className="flex items-start">
                <CalendarIcon size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  {selectedEvent.date.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {selectedEvent.type === "flight" && (
                <>
                  <div className="flex items-start">
                    <User size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>Piloto: {selectedEvent.details.pilot}</span>
                  </div>

                  <div className="flex items-start">
                    <Plane size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>Helicóptero: {selectedEvent.details.helicopter}</span>
                  </div>

                  <div className="flex items-start">
                    <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Ruta: {selectedEvent.details.origin} → {selectedEvent.details.destination}
                    </span>
                  </div>

                  <div className="flex items-start">
                    <Clock size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>Horario: {selectedEvent.details.time}</span>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>Duración: {selectedEvent.details.duration}</span>
                  </div>
                </>
              )}

              {(selectedEvent.type === "maintenance" || selectedEvent.type === "service") && (
                <>
                  <div className="flex items-start">
                    <Plane size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>Helicóptero: {selectedEvent.details.helicopter}</span>
                  </div>

                  <div className="flex items-start">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>Tipo: {selectedEvent.details.maintenanceType}</span>
                  </div>

                  <div className="flex items-start">
                    <User size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                    <span>Técnico: {selectedEvent.details.technician}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
