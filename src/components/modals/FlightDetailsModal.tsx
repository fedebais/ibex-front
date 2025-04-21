"use client"

import Modal from "../ui/Modal"
import { mockFlights, getPilotName, getHelicopterInfo, getLocationName } from "../../data/mockData"

interface FlightDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  flightId: string | null
  darkMode?: boolean
}

const FlightDetailsModal = ({ isOpen, onClose, flightId, darkMode = false }: FlightDetailsModalProps) => {
  if (!flightId) return null

  const flight = mockFlights.find((f) => f.id === flightId)
  if (!flight) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Vuelo" maxWidth="max-w-2xl" darkMode={darkMode}>
      <div className="space-y-6">
        {/* Información básica */}
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fecha</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {new Date(flight.date).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Estado</p>
              <p
                className={`text-base font-medium ${
                  flight.status === "completed" ? "text-blue-600" : "text-green-600"
                }`}
              >
                {flight.status === "completed" ? "Completado" : "Programado"}
              </p>
            </div>
          </div>
        </div>

        {/* Detalles del vuelo */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Información del Vuelo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Piloto</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{getPilotName(flight.pilotId)}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Helicóptero</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {getHelicopterInfo(flight.helicopterId)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Origen</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {getLocationName(flight.originId)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Destino</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {getLocationName(flight.destinationId)}
              </p>
            </div>
          </div>
        </div>

        {/* Tiempos y horas */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Tiempos y Horas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Puesta en Marcha</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flight.startupTime || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Corte</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flight.shutdownTime || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Run Time (SNMF)</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.runTime}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora de Salida</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.departureTime}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora de Llegada</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.arrivalTime}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Duración</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.flightHours}</p>
            </div>
          </div>
        </div>

        {/* Odómetro y Flight Time */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Odómetro y Flight Time
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Odómetro Inicial</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flight.initialOdometer || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Odómetro Final</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flight.finalOdometer || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Flight Time</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.flightTime}</p>
            </div>
          </div>
        </div>

        {/* Contadores y Gacho */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Contadores y Gacho
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Starts</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.starts}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Aterrizajes (ATE)</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.landings}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Lanzamientos</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.launches}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>RIN</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.rin}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Gacho</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flight.gachoTime || "No registrado"}
              </p>
            </div>
          </div>
        </div>

        {/* Pasajeros y combustible */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Pasajeros</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.passengers}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Combustible Consumido</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flight.fuelConsumed} litros</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Notas</p>
          <p
            className={`text-base ${darkMode ? "bg-gray-700" : "bg-gray-50"} p-3 rounded-md mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {flight.notes || "Sin notas adicionales"}
          </p>
        </div>

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
            Descargar PDF
          </button>
          {flight.status === "scheduled" && (
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Editar Vuelo
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default FlightDetailsModal
