"use client"

import { useState, useMemo } from "react"
import { mockFlights, mockHelicopters, getPilotName } from "../../data/mockData"

interface HoursAnalysisProps {
  darkMode: boolean
  selectedMonth: number
  selectedYear: number
}

// Actualicemos el componente HoursAnalysis para que acepte los props de mes y año
const HoursAnalysis = ({ darkMode = false, selectedMonth, selectedYear }: HoursAnalysisProps) => {
  // Usar los props selectedMonth y selectedYear para filtrar los datos
  // Resto del componente se mantiene igual

  // Si necesitas usar estos props, puedes implementar la lógica de filtrado aquí
  // Por ejemplo:
  // useEffect(() => {
  //   // Filtrar datos por mes y año seleccionados
  //   // ...
  // }, [selectedMonth, selectedYear]);

  const uniqueDates = useMemo(() => {
    const dates = [...new Set(mockFlights.map((flight) => flight.date))]
    return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  }, [])

  const [selectedDate, setSelectedDate] = useState<string>(uniqueDates.length > 0 ? uniqueDates[0] : "")
  const [selectedHelicopter, setSelectedHelicopter] = useState<string>("all")

  // Filtrar vuelos por fecha y helicóptero seleccionados
  const filteredFlights = useMemo(() => {
    return mockFlights.filter((flight) => {
      const matchesDate = flight.date === selectedDate
      const matchesHelicopter = selectedHelicopter === "all" || flight.helicopterId === selectedHelicopter
      return matchesDate && matchesHelicopter && flight.status === "completed"
    })
  }, [selectedDate, selectedHelicopter])

  // Agrupar vuelos por helicóptero
  const flightsByHelicopter = useMemo(() => {
    const helicopterMap = new Map<string, typeof mockFlights>()

    if (selectedHelicopter === "all") {
      // Si se seleccionaron todos los helicópteros, agrupar por helicóptero
      filteredFlights.forEach((flight) => {
        if (!helicopterMap.has(flight.helicopterId)) {
          helicopterMap.set(flight.helicopterId, [])
        }
        helicopterMap.get(flight.helicopterId)!.push(flight)
      })
    } else {
      // Si se seleccionó un helicóptero específico, agrupar por piloto
      const pilotMap = new Map<string, typeof mockFlights>()
      filteredFlights.forEach((flight) => {
        if (!pilotMap.has(flight.pilotId)) {
          pilotMap.set(flight.pilotId, [])
        }
        pilotMap.get(flight.pilotId)!.push(flight)
      })

      // Convertir el mapa de pilotos a un mapa de helicópteros con un solo elemento
      if (filteredFlights.length > 0) {
        helicopterMap.set(selectedHelicopter, filteredFlights)
      }

      return { helicopterMap, pilotMap }
    }

    return { helicopterMap, pilotMap: new Map() }
  }, [filteredFlights, selectedHelicopter])

  // Calcular horas totales por helicóptero y por piloto
  const calculateTotalHours = (flights: typeof mockFlights) => {
    return flights.reduce((total, flight) => {
      if (flight.flightTime) {
        return total + Number.parseFloat(flight.flightTime)
      } else if (flight.flightHours) {
        const [hours, minutes] = flight.flightHours.split(":").map(Number)
        return total + hours + minutes / 60
      }
      return total
    }, 0)
  }

  // Verificar si hay discrepancias en las horas
  const checkDiscrepancies = () => {
    const { helicopterMap, pilotMap } = flightsByHelicopter
    const discrepancies = []

    if (selectedHelicopter !== "all") {
      // Comparar horas totales del helicóptero con la suma de horas de los pilotos
      const helicopterFlights = helicopterMap.get(selectedHelicopter) || []
      const helicopterHours = calculateTotalHours(helicopterFlights)

      let totalPilotHours = 0
      pilotMap.forEach((flights) => {
        totalPilotHours += calculateTotalHours(flights)
      })

      if (Math.abs(helicopterHours - totalPilotHours) > 0.01) {
        discrepancies.push({
          type: "helicopter",
          id: selectedHelicopter,
          registeredHours: helicopterHours.toFixed(1),
          calculatedHours: totalPilotHours.toFixed(1),
          difference: (helicopterHours - totalPilotHours).toFixed(1),
        })
      }
    }

    return discrepancies
  }

  const discrepancies = checkDiscrepancies()

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Análisis de Horas de Vuelo</h1>
      </div>

      {/* Filtros */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4 rounded-lg shadow border`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <label
              htmlFor="date"
              className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
            >
              Fecha
            </label>
            <select
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              }`}
            >
              {uniqueDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-1/3">
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
              className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white focus:ring-orange-500 focus:border-orange-500"
                  : "border-gray-300 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
              }`}
            >
              <option value="all">Todos los helicópteros</option>
              {mockHelicopters.map((helicopter) => (
                <option key={helicopter.id} value={helicopter.id}>
                  {helicopter.model} ({helicopter.registration})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Resumen de horas */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4 rounded-lg shadow border`}
      >
        <h2 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Resumen de Horas de Vuelo
        </h2>

        {filteredFlights.length === 0 ? (
          <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            No hay vuelos registrados para la fecha y helicóptero seleccionados.
          </p>
        ) : (
          <div className="space-y-6">
            {/* Tabla de horas por helicóptero */}
            <div>
              <h3 className={`text-md font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Horas por Helicóptero
              </h3>
              <div className="overflow-x-auto">
                <table
                  className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"} border ${
                    darkMode ? "border-gray-700" : "border-gray-200"
                  } rounded-lg`}
                >
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Helicóptero
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Horas Registradas
                      </th>
                      <th
                        scope="col"
                        className={`px-6 py-3 text-left text-xs font-medium ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        } uppercase tracking-wider`}
                      >
                        Vuelos
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
                  >
                    {Array.from(flightsByHelicopter.helicopterMap.entries()).map(([helicopterId, flights]) => {
                      const helicopter = mockHelicopters.find((h) => h.id === helicopterId)
                      const totalHours = calculateTotalHours(flights)
                      return (
                        <tr key={helicopterId}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {helicopter
                              ? `${helicopter.model} (${helicopter.registration})`
                              : `Helicóptero ID: ${helicopterId}`}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {totalHours.toFixed(1)} horas
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              darkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {flights.length}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla de horas por piloto (solo si se seleccionó un helicóptero específico) */}
            {selectedHelicopter !== "all" && flightsByHelicopter.pilotMap.size > 0 && (
              <div>
                <h3 className={`text-md font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                  Horas por Piloto
                </h3>
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"} border ${
                      darkMode ? "border-gray-700" : "border-gray-200"
                    } rounded-lg`}
                  >
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-500"
                          } uppercase tracking-wider`}
                        >
                          Piloto
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-500"
                          } uppercase tracking-wider`}
                        >
                          Horas Registradas
                        </th>
                        <th
                          scope="col"
                          className={`px-6 py-3 text-left text-xs font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-500"
                          } uppercase tracking-wider`}
                        >
                          Vuelos
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
                    >
                      {Array.from(flightsByHelicopter.pilotMap.entries()).map(([pilotId, flights]) => {
                        const totalHours = calculateTotalHours(flights)
                        return (
                          <tr key={pilotId}>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {getPilotName(pilotId)}
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {totalHours.toFixed(1)} horas
                            </td>
                            <td
                              className={`px-6 py-4 whitespace-nowrap text-sm ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {flights.length}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discrepancias */}
            {discrepancies.length > 0 && (
              <div
                className={`mt-4 p-4 border-l-4 border-yellow-400 ${
                  darkMode ? "bg-yellow-900/20 text-yellow-300" : "bg-yellow-50 text-yellow-800"
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium">Se encontraron discrepancias en las horas registradas:</h3>
                    <div className="mt-2 text-sm">
                      <ul className="list-disc pl-5 space-y-1">
                        {discrepancies.map((d, index) => (
                          <li key={index}>
                            {d.type === "helicopter" && (
                              <>
                                El helicóptero tiene {d.registeredHours} horas registradas, pero la suma de horas de los
                                pilotos es {d.calculatedHours} horas. Diferencia: {d.difference} horas.
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detalle de vuelos */}
      <div
        className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-4 rounded-lg shadow border`}
      >
        <h2 className={`text-lg font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
          Detalle de Vuelos ({filteredFlights.length})
        </h2>

        {filteredFlights.length === 0 ? (
          <p className={`text-center py-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            No hay vuelos registrados para la fecha y helicóptero seleccionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={`min-w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"} border ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } rounded-lg`}
            >
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Piloto
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Helicóptero
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Hora Salida
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Hora Llegada
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Horas de Vuelo
                  </th>
                  <th
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-500"
                    } uppercase tracking-wider`}
                  >
                    Flight Time
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
              >
                {filteredFlights.map((flight) => {
                  const helicopter = mockHelicopters.find((h) => h.id === flight.helicopterId)
                  return (
                    <tr key={flight.id}>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {flight.id}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {getPilotName(flight.pilotId)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {helicopter
                          ? `${helicopter.model} (${helicopter.registration})`
                          : `Helicóptero ID: ${flight.helicopterId}`}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {flight.departureTime}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {flight.arrivalTime}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {flight.flightHours}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {flight.flightTime || "N/A"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default HoursAnalysis
