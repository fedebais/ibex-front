"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon, User, Plane, Wrench, X, Clock } from "lucide-react"
import { api } from "../../services/api"
import type { CalendarEvent } from "../../types/api"
import { useUser } from "../../context/UserContext"
import { useTheme } from "../../context/ThemeContext"
import { 
  formatDateLong, 
  formatTime,
  getMonthName, 
  isSameDay
} from "../../utils/dateUtils"

type CalendarProps = Record<string, never>
type ViewType = "month" | "week" | "day"

const Calendar: React.FC<CalendarProps> = () => {
  const { accessToken } = useUser()
  const { darkMode } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewType, setViewType] = useState<ViewType>("month")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  // Nombres de los días de la semana
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
  const weekDaysLong = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

  // Obtener token con fallback a localStorage
  const getToken = () => {
    return accessToken || localStorage.getItem("accessToken")
  }

  // Cargar eventos del mes actual
  const loadEvents = async () => {
    const token = getToken()

    if (!token) {
      setError("No hay token de autenticación")
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Formatear el mes como YYYY-MM
      const year = currentDate.getFullYear()
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0")
      const monthString = `${year}-${month}`

      console.log("=== Cargando eventos para:", monthString)

      const eventsData = await api.getScheduleByMonth(monthString, token)
      console.log("=== Eventos recibidos:", eventsData)

      setEvents(eventsData)
    } catch (error) {
      console.error("Error cargando eventos:", error)
      setError("Error al cargar los eventos del calendario")
    } finally {
      setLoading(false)
    }
  }

  // Cargar eventos cuando cambia el mes
  useEffect(() => {
    loadEvents()
  }, [currentDate])

  // Navegación
  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)

    if (viewType === "month") {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (viewType === "week") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7))
    } else if (viewType === "day") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1))
    }

    setCurrentDate(newDate)
  }

  // Ir a hoy
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Obtener eventos para un día específico
  const getEventsForDay = (day: number, month?: number, year?: number) => {
    const targetMonth = month !== undefined ? month : currentDate.getMonth()
    const targetYear = year !== undefined ? year : currentDate.getFullYear()
    const date = new Date(targetYear, targetMonth, day)

    return events.filter((event) => {
      return isSameDay(event.date, date.toISOString())
    })
  }

  // Obtener eventos para una fecha específica
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      return isSameDay(event.date, date.toISOString())
    })
  }

  // Obtener el color de fondo según el tipo de evento
  const getEventColor = (event: CalendarEvent) => {
    if (event.type === "flight") {
      switch (event.flightStatus) {
        case "COMPLETED":
          return darkMode
            ? "bg-blue-900/40 text-blue-200 border border-blue-700/50"
            : "bg-blue-100 text-blue-800 border border-blue-200"
        case "SCHEDULED":
          return darkMode
            ? "bg-yellow-900/40 text-yellow-200 border border-yellow-700/50"
            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
        case "CANCELLED":
          return darkMode
            ? "bg-red-900/40 text-red-200 border border-red-700/50"
            : "bg-red-100 text-red-800 border border-red-200"
        default:
          return darkMode
            ? "bg-gray-700/50 text-gray-300 border border-gray-600/50"
            : "bg-gray-100 text-gray-800 border border-gray-200"
      }
    } else if (event.type === "maintenance") {
      return darkMode
        ? "bg-orange-900/40 text-orange-200 border border-orange-700/50"
        : "bg-orange-100 text-orange-800 border border-orange-200"
    }
    return darkMode
      ? "bg-gray-700/50 text-gray-300 border border-gray-600/50"
      : "bg-gray-100 text-gray-800 border border-gray-200"
  }

  // Obtener icono según el tipo de evento
  const getEventIcon = (event: CalendarEvent) => {
    if (event.type === "flight") {
      return <Plane size={12} className="mr-1 flex-shrink-0" />
    } else if (event.type === "maintenance") {
      return <Wrench size={12} className="mr-1 flex-shrink-0" />
    }
    return null
  }

  // Manejar clic en evento
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowEventModal(true)
  }



  // Obtener título de la vista actual
  const getViewTitle = () => {
    if (viewType === "month") {
      return `${getMonthName(currentDate.getMonth() + 1)} ${currentDate.getFullYear()}`
    } else if (viewType === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
        return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${getMonthName(startOfWeek.getMonth() + 1)} ${startOfWeek.getFullYear()}`
      } else {
        return `${startOfWeek.getDate()} ${getMonthName(startOfWeek.getMonth() + 1)} - ${endOfWeek.getDate()} ${getMonthName(endOfWeek.getMonth() + 1)} ${startOfWeek.getFullYear()}`
      }
    } else {
      return `${currentDate.getDate()} ${getMonthName(currentDate.getMonth() + 1)} ${currentDate.getFullYear()}`
    }
  }

  // Renderizar vista mensual
  const renderMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const firstDayOfWeek = firstDayOfMonth.getDay()
    const daysInMonth = lastDayOfMonth.getDate()
    const numRows = Math.ceil((firstDayOfWeek + daysInMonth) / 7)

    return (
      <div
        className={`rounded-lg overflow-hidden border ${darkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-300 bg-gray-50"}`}
      >
        {/* Días de la semana */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center py-4 font-semibold text-sm border-b ${
                darkMode ? "text-gray-300 bg-gray-800 border-gray-600" : "text-gray-700 bg-gray-100 border-gray-300"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {Array.from({ length: numRows * 7 }).map((_, index) => {
            const dayOffset = index - firstDayOfWeek
            const day = dayOffset + 1
            const isCurrentMonth = day > 0 && day <= daysInMonth
            const isToday =
              isCurrentMonth &&
              currentDate.getFullYear() === new Date().getFullYear() &&
              currentDate.getMonth() === new Date().getMonth() &&
              day === new Date().getDate()

            const dayEvents = isCurrentMonth ? getEventsForDay(day) : []

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b p-3 transition-colors ${
                  isCurrentMonth
                    ? darkMode
                      ? "bg-gray-800 border-gray-600 hover:bg-gray-750"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                    : darkMode
                      ? "bg-gray-900/50 border-gray-700 opacity-40"
                      : "bg-gray-100 border-gray-300 opacity-60"
                } ${isToday ? "ring-2 ring-orange-500 ring-inset" : ""}`}
              >
                {isCurrentMonth && (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold cursor-pointer ${
                          isToday
                            ? "bg-orange-500 text-white shadow-lg"
                            : darkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => {
                          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                          setViewType("day")
                        }}
                      >
                        {day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            darkMode
                              ? "bg-gray-700 text-gray-300 border border-gray-600"
                              : "bg-gray-200 text-gray-600 border border-gray-300"
                          }`}
                        >
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 overflow-y-auto max-h-20">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-2 rounded-md cursor-pointer hover:opacity-80 transition-all duration-200 ${getEventColor(event)}`}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-start">
                            {getEventIcon(event)}
                            <span className="truncate flex-1 leading-tight font-medium">{event.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar vista semanal
  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    const weekDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })

    return (
      <div
        className={`rounded-lg overflow-hidden border ${darkMode ? "border-gray-600 bg-gray-700/30" : "border-gray-300 bg-gray-50"}`}
      >
        {/* Encabezados de días */}
        <div className="grid grid-cols-7">
          {weekDates.map((date, index) => {
            const isToday =
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`text-center py-4 border-b cursor-pointer transition-colors ${
                  darkMode ? "border-gray-600 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-100"
                } ${isToday ? "bg-orange-500/10" : ""}`}
                onClick={() => {
                  setCurrentDate(date)
                  setViewType("day")
                }}
              >
                <div className={`font-semibold text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  {weekDaysLong[index]}
                </div>
                <div
                  className={`text-2xl font-bold mt-1 ${
                    isToday ? "text-orange-500" : darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            )
          })}
        </div>

        {/* Eventos de la semana */}
        <div className="grid grid-cols-7 min-h-[400px]">
          {weekDates.map((date, index) => {
            const dayEvents = getEventsForDate(date)

            return (
              <div
                key={index}
                className={`border-r p-3 ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"}`}
              >
                <div className="space-y-2">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-2 rounded-md cursor-pointer hover:opacity-80 transition-all duration-200 ${getEventColor(event)}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start mb-1">
                        {getEventIcon(event)}
                        <span className="font-medium">{formatTime(event.date)}</span>
                      </div>
                      <div className="font-medium leading-tight">{event.title}</div>
                      {event.pilot && (
                        <div className="flex items-center mt-1 opacity-75">
                          <User size={10} className="mr-1" />
                          <span className="truncate">{event.pilot}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Renderizar vista diaria
  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate)
    const isToday =
      currentDate.getDate() === new Date().getDate() &&
      currentDate.getMonth() === new Date().getMonth() &&
      currentDate.getFullYear() === new Date().getFullYear()

    return (
      <div className={`rounded-lg border p-6 ${darkMode ? "border-gray-600 bg-gray-800" : "border-gray-300 bg-white"}`}>
        {/* Encabezado del día */}
        <div className="text-center mb-6">
          <div className={`text-lg font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {weekDaysLong[currentDate.getDay()]}
          </div>
          <div
            className={`text-4xl font-bold ${isToday ? "text-orange-500" : darkMode ? "text-white" : "text-gray-900"}`}
          >
            {currentDate.getDate()}
          </div>
          <div className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            {getMonthName(currentDate.getMonth() + 1)} {currentDate.getFullYear()}
          </div>
        </div>

        {/* Eventos del día */}
        {dayEvents.length > 0 ? (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Eventos del día ({dayEvents.length})
            </h3>
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 ${getEventColor(event)}`}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      {getEventIcon(event)}
                      <div>
                        <div className="font-semibold text-base">{event.title}</div>
                        <div className="text-sm opacity-75 mt-1">{formatTime(event.date)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {event.pilot && (
                        <div className="flex items-center text-sm opacity-75">
                          <User size={14} className="mr-1" />
                          <span>{event.pilot}</span>
                        </div>
                      )}
                      {event.technicianName && (
                        <div className="flex items-center text-sm opacity-75">
                          <User size={14} className="mr-1" />
                          <span>{event.technicianName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No hay eventos programados</p>
            <p className="text-sm">para este día</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div
        className={`rounded-xl shadow-lg p-6 ${darkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h1 className={`text-2xl font-bold flex items-center ${darkMode ? "text-white" : "text-gray-900"}`}>
            <CalendarIcon className="mr-3" size={28} />
            Calendario de Operaciones
          </h1>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Selector de vista */}
            <div
              className={`flex rounded-lg border ${darkMode ? "border-gray-600 bg-gray-700" : "border-gray-300 bg-gray-100"}`}
            >
              {(["month", "week", "day"] as ViewType[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setViewType(view)}
                  className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    viewType === view
                      ? "bg-orange-500 text-white shadow-sm"
                      : darkMode
                        ? "text-gray-300 hover:text-white hover:bg-gray-600"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                  } ${view === "month" ? "rounded-l-md" : view === "day" ? "rounded-r-md" : ""}`}
                >
                  {view === "month" ? "Mes" : view === "week" ? "Semana" : "Día"}
                </button>
              ))}
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("prev")}
                disabled={loading}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 border border-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
                }`}
              >
                <ChevronLeft size={20} />
              </button>

              <div
                className={`px-4 py-2 rounded-lg font-semibold min-w-[200px] text-center ${
                  darkMode
                    ? "bg-gray-700 text-white border border-gray-600"
                    : "bg-gray-50 text-gray-900 border border-gray-300"
                }`}
              >
                {getViewTitle()}
              </div>

              <button
                onClick={() => navigate("next")}
                disabled={loading}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  darkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 border border-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 border border-gray-300"
                }`}
              >
                <ChevronRight size={20} />
              </button>

              <button
                onClick={goToToday}
                disabled={loading}
                className="px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 border border-orange-500"
              >
                Hoy
              </button>
            </div>
          </div>
        </div>

        {/* Leyenda - solo en vista mensual */}
        {viewType === "month" && (
          <div
            className={`flex flex-wrap gap-6 mb-6 p-4 rounded-lg ${
              darkMode ? "bg-gray-700/50 border border-gray-600/50" : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-center">
              <Plane size={16} className={`mr-2 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Completado</span>
            </div>
            <div className="flex items-center">
              <Plane size={16} className={`mr-2 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Programado</span>
            </div>
            <div className="flex items-center">
              <Plane size={16} className={`mr-2 ${darkMode ? "text-red-400" : "text-red-600"}`} />
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Cancelado</span>
            </div>
            <div className="flex items-center">
              <Wrench size={16} className={`mr-2 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Mantenimiento
              </span>
            </div>
          </div>
        )}

        {/* Estado de carga */}
        {loading && (
          <div className={`text-center py-6 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
            <span className="font-medium">Cargando eventos...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className={`text-center py-4 px-6 rounded-lg mb-6 ${
              darkMode
                ? "bg-red-900/30 text-red-300 border border-red-700/50"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <p className="font-medium">{error}</p>
            <button
              onClick={loadEvents}
              className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-red-800/50 hover:bg-red-700/50 text-red-200 border border-red-600/50"
                  : "bg-red-100 hover:bg-red-200 text-red-800 border border-red-300"
              }`}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Renderizar vista según el tipo seleccionado */}
        {!loading && !error && (
          <>
            {viewType === "month" && renderMonthView()}
            {viewType === "week" && renderWeekView()}
            {viewType === "day" && renderDayView()}
          </>
        )}

        {/* Resumen de eventos del mes - solo en vista mensual */}
        {!loading && events.length > 0 && viewType === "month" && (
          <div
            className={`mt-6 p-6 rounded-lg ${
              darkMode ? "bg-gray-700/50 border border-gray-600/50" : "bg-gray-50 border border-gray-200"
            }`}
          >
            <h3 className={`font-semibold mb-4 text-lg ${darkMode ? "text-white" : "text-gray-900"}`}>
              Resumen del mes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="font-bold text-2xl text-blue-500 mb-1">
                  {events.filter((e) => e.type === "flight").length}
                </div>
                <div className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Total Vuelos
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-orange-500 mb-1">
                  {events.filter((e) => e.type === "maintenance").length}
                </div>
                <div className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  Mantenimientos
                </div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-green-500 mb-1">
                  {events.filter((e) => e.type === "flight" && e.flightStatus === "COMPLETED").length}
                </div>
                <div className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Completados</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-yellow-500 mb-1">
                  {events.filter((e) => e.type === "flight" && e.flightStatus === "SCHEDULED").length}
                </div>
                <div className={`text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Programados</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles del evento */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div
              className={`fixed inset-0 transition-opacity ${
                darkMode ? "bg-black bg-opacity-60" : "bg-gray-500 bg-opacity-75"
              }`}
              onClick={() => setShowEventModal(false)}
              aria-hidden="true"
            />

            {/* Modal */}
            <div
              className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-lg ${
                darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
              }`}
            >
              {/* Header */}
              <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getEventIcon(selectedEvent)}
                    <h3 className={`text-lg font-semibold ml-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Detalles del {selectedEvent.type === "flight" ? "Vuelo" : "Mantenimiento"}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className={`rounded-md p-2 transition-colors ${
                      darkMode
                        ? "text-gray-400 hover:text-white hover:bg-gray-800"
                        : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={`px-6 py-4 ${darkMode ? "bg-gray-900" : "bg-white"}`}>
                <div className="space-y-4">
                  {/* Título */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      Título
                    </label>
                    <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{selectedEvent.title}</p>
                  </div>

                  {/* Fecha y hora */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      <Clock size={16} className="inline mr-1" />
                      Fecha y Hora
                    </label>
                    <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                      {formatDateLong(selectedEvent.date)} a las {formatTime(selectedEvent.date)}
                    </p>
                  </div>

                  {/* Información específica del vuelo */}
                  {selectedEvent.type === "flight" && (
                    <>
                      {selectedEvent.pilot && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <User size={16} className="inline mr-1" />
                            Piloto
                          </label>
                          <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedEvent.pilot}
                          </p>
                        </div>
                      )}

                      {selectedEvent.duration && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <Clock size={16} className="inline mr-1" />
                            Duración
                          </label>
                          <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedEvent.duration} minutos
                          </p>
                        </div>
                      )}

                      {selectedEvent.flightStatus && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            Estado
                          </label>
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              selectedEvent.flightStatus === "COMPLETED"
                                ? "bg-blue-100 text-blue-800"
                                : selectedEvent.flightStatus === "SCHEDULED"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {selectedEvent.flightStatus === "COMPLETED"
                              ? "Completado"
                              : selectedEvent.flightStatus === "SCHEDULED"
                                ? "Programado"
                                : "Cancelado"}
                          </span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Información específica del mantenimiento */}
                  {selectedEvent.type === "maintenance" && (
                    <>
                      {selectedEvent.technicianName && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <User size={16} className="inline mr-1" />
                            Técnico
                          </label>
                          <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedEvent.technicianName}
                          </p>
                        </div>
                      )}

                      {selectedEvent.maintenanceType && (
                        <div>
                          <label
                            className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                          >
                            <Wrench size={16} className="inline mr-1" />
                            Tipo de Mantenimiento
                          </label>
                          <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {selectedEvent.maintenanceType}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* ID del recurso */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      ID del Recurso
                    </label>
                    <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                      #{selectedEvent.resourceId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className={`px-6 py-4 border-t ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-gray-50"}`}
              >
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
