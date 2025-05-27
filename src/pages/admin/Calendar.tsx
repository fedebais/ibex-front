"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"

interface CalendarProps {
  darkMode?: boolean
}

const Calendar: React.FC<CalendarProps> = ({ darkMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Nombres de los meses
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

  // Nombres de los días de la semana
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  // Obtener el primer día del mes actual
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // Obtener el último día del mes actual
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Obtener el día de la semana del primer día del mes (0-6)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Número total de días en el mes actual
  const daysInMonth = lastDayOfMonth.getDate()

  // Calcular el número de filas necesarias para el calendario
  const numRows = Math.ceil((firstDayOfWeek + daysInMonth) / 7)

  // Función para ir al mes anterior
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Función para ir al mes siguiente
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Datos de ejemplo para eventos
  const events = [
    { date: 5, type: "flight", title: "Vuelo a Ciudad de México", time: "09:00 - 11:30" },
    { date: 12, type: "maintenance", title: "Mantenimiento programado", time: "14:00 - 18:00" },
    { date: 15, type: "flight", title: "Vuelo a Monterrey", time: "10:30 - 12:00" },
    { date: 20, type: "flight", title: "Vuelo a Guadalajara", time: "15:00 - 16:30" },
    { date: 25, type: "maintenance", title: "Revisión de motor", time: "09:00 - 13:00" },
  ]

  // Función para obtener eventos para un día específico
  const getEventsForDay = (day: number) => {
    return events.filter((event) => event.date === day)
  }

  return (
    <div className="pt-6">
      <div className={`rounded-lg shadow-md p-6 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
            <CalendarIcon className="inline mr-2" size={24} />
            Calendario de Operaciones
          </h1>
          <div className="flex items-center">
            <button
              onClick={prevMonth}
              className={`p-2 rounded-md ${
                darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <span className={`mx-4 font-medium ${darkMode ? "text-white" : "text-gray-800"}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={nextMonth}
              className={`p-2 rounded-md ${
                darkMode ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {/* Días de la semana */}
          {weekDays.map((day, index) => (
            <div key={index} className={`text-center py-2 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
              {day}
            </div>
          ))}

          {/* Días del mes */}
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
                className={`min-h-[100px] border ${
                  isCurrentMonth
                    ? darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-200"
                    : darkMode
                      ? "bg-gray-800 border-gray-700 opacity-50"
                      : "bg-gray-100 border-gray-200 opacity-50"
                } ${
                  isToday ? (darkMode ? "ring-2 ring-orange-500" : "ring-2 ring-orange-500") : ""
                } p-1 overflow-hidden`}
              >
                {isCurrentMonth && (
                  <>
                    <div className="text-right">
                      <span
                        className={`inline-block w-6 h-6 rounded-full text-center leading-6 ${
                          isToday ? "bg-orange-500 text-white" : darkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`text-xs p-1 rounded truncate ${
                            event.type === "flight" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {event.title}
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
    </div>
  )
}

export default Calendar
