"use client"

import { useUser } from "../../context/UserContext"
import { mockFlights, getHelicopterInfo, getLocationName } from "../../data/mockData"

interface PilotHomeProps {
  darkMode: boolean
  selectedMonth: number
}

const PilotHome = ({ darkMode = false, selectedMonth = 0 }: PilotHomeProps) => {
  const { user } = useUser()

  // Filtrar vuelos del piloto actual
  const pilotFlights = mockFlights.filter(() => 1 === 1)

  // Filtrar por mes si se ha seleccionado un mes específico (0 = todos los meses)
  const filteredFlights =
    selectedMonth === 0
      ? pilotFlights
      : pilotFlights.filter((flight) => {
          const flightDate = new Date(flight.date)
          return flightDate.getMonth() === selectedMonth - 1 // Restamos 1 porque en el selector 0 es "Todos"
        })

  // Obtener próximos vuelos (programados)
  const upcomingFlights = filteredFlights.filter((flight) => flight.status === "scheduled")

  // Obtener vuelos recientes (completados)
  const recentFlights = filteredFlights
    .filter((flight) => flight.status === "completed")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  // Calcular estadísticas
  const totalFlights = filteredFlights.length
  const totalFlightHours = filteredFlights
    .reduce((total, flight) => {
      const [hours, minutes] = flight.flightHours.split(":").map(Number)
      return total + hours + minutes / 60
    }, 0)
    .toFixed(1)

  // Clases condicionales para tarjetas
  const cardClass = darkMode
    ? "bg-gray-800 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-200"

  // Obtener el nombre del mes para mostrar en los títulos
  const months = [
    "todos los meses",
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]
  const monthName = months[selectedMonth]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Bienvenido, {user?.firstName}</h1>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Total de Vuelos
                </dt>
                <dd className="text-lg font-semibold">{totalFlights}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Horas de Vuelo
                </dt>
                <dd className="text-lg font-semibold">{totalFlightHours}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Próximos Vuelos
                </dt>
                <dd className="text-lg font-semibold">{upcomingFlights.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <svg
                className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Vuelos Completados
                </dt>
                <dd className="text-lg font-semibold">
                  {filteredFlights.filter((f) => f.status === "completed").length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos vuelos */}
      <div className={`${cardClass} shadow rounded-lg overflow-hidden`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Próximos Vuelos {selectedMonth !== 0 && `(${monthName})`}</h3>
        </div>
        <div className={cardClass}>
          {upcomingFlights.length > 0 ? (
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {upcomingFlights.map((flight) => (
                <li key={flight.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <p className={`text-sm font-medium ${darkMode ? "text-orange-400" : "text-orange-600"} md:w-24`}>
                        {new Date(flight.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                      </p>
                      <div className="mt-2 md:mt-0 md:ml-4">
                        <p className="text-sm font-medium">
                          {getLocationName(flight.originId)} → {getLocationName(flight.destinationId)}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {getHelicopterInfo(flight.helicopterId)} | {flight.departureTime} - {flight.arrivalTime}
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Programado
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`px-4 py-5 sm:px-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No tienes vuelos programados {selectedMonth !== 0 && `para ${monthName}`}.
            </div>
          )}
        </div>
      </div>

      {/* Vuelos recientes */}
      <div className={`${cardClass} shadow rounded-lg overflow-hidden`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Vuelos Recientes {selectedMonth !== 0 && `(${monthName})`}</h3>
        </div>
        <div className={cardClass}>
          {recentFlights.length > 0 ? (
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              {recentFlights.map((flight) => (
                <li key={flight.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col md:flex-row md:items-center">
                      <p className={`text-sm font-medium ${darkMode ? "text-orange-400" : "text-orange-600"} md:w-24`}>
                        {new Date(flight.date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                      </p>
                      <div className="mt-2 md:mt-0 md:ml-4">
                        <p className="text-sm font-medium">
                          {getLocationName(flight.originId)} → {getLocationName(flight.destinationId)}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {getHelicopterInfo(flight.helicopterId)} | {flight.flightHours} horas
                        </p>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        Completado
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={`px-4 py-5 sm:px-6 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              No tienes vuelos recientes {selectedMonth !== 0 && `en ${monthName}`}.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PilotHome
