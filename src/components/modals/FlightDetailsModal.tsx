"use client"

import Modal from "../ui/Modal"
import type { FlightLog } from "../../types/api"
import { useState } from "react"
import { formatDate, formatTimeFromUTC } from "../../utils/dateUtils"
import EditFlightLogModal from "./EditFlightLogModal"
import { Trash2 } from "lucide-react"

interface FlightDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  flightLog: FlightLog | null
  darkMode?: boolean
  onUpdateFlight?: () => void
  onDeleteFlight?: (flight: FlightLog) => void
}

const FlightDetailsModal = ({
  isOpen,
  onClose,
  flightLog,
  darkMode = false,
  onUpdateFlight,
  onDeleteFlight,
}: FlightDetailsModalProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const handleFlightUpdated = () => {
    // Cerrar el modal de edición
    setIsEditModalOpen(false)
    // Si hay una función callback para actualizar, llamarla
    if (onUpdateFlight) {
      onUpdateFlight()
    }
  }

  if (!flightLog) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Vuelo" maxWidth="max-w-2xl" darkMode={darkMode}>
      <div className="space-y-6">
        {/* Información básica */}
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fecha</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {formatDate(flightLog.date)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Estado</p>
              <p
                className={`text-base font-medium ${
                  flightLog.status === "COMPLETED" ? "text-blue-600" : "text-green-600"
                }`}
              >
                {flightLog.status === "COMPLETED" ? "Completado" : "Programado"}
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
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.pilot?.user ? `${flightLog.pilot.user.firstName} ${flightLog.pilot.user.lastName}` : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Helicóptero</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.helicopter?.registration || "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Cliente</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.client?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Origen</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.origin?.name || "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Destino</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.destination?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Información del Piloto */}
        {flightLog.pilot && (
          <div>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Información del Piloto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Licencia</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.pilot.license || "N/A"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas de Vuelo</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.pilot.flightHours || 0} hrs
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.pilot.user?.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información del Helicóptero */}
        {flightLog.helicopter && (
          <div>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Información del Helicóptero
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Capacidad Máx.</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.helicopter.capacity || "N/A"} PAX
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Velocidad</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.helicopter.speedKmh || "N/A"} km/h
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas Totales</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.helicopter.totalFlightHours || 0} hrs
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Información del Cliente */}
        {flightLog.client && (
          <div>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Información del Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Contacto</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.client.contact || "N/A"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.client.email || "N/A"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Teléfono</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.client.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tiempos y horas */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Tiempos y Horas</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora de Inicio</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.startTime ? formatTimeFromUTC(flightLog.startTime) : "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora de Aterrizaje</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.landingTime ? formatTimeFromUTC(flightLog.landingTime) : "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Duración</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.duration ? `${flightLog.duration} min` : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tiempo de Bloque</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.blockTime != null ? `${flightLog.blockTime} hrs` : "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tiempo de Vuelo</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.flightTime != null ? `${flightLog.flightTime} hrs` : "No registrado"}
              </p>
            </div>
          </div>
        </div>

        {/* Datos Operativos */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Datos Operativos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Nro. de Vuelo</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.flightNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Pasajeros (PAX)</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.passengers != null ? flightLog.passengers : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Aterrizajes</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.landings != null ? flightLog.landings : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Lanzamientos</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.launches != null ? flightLog.launches : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tiempo de Gancho</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.hookTime != null ? `${flightLog.hookTime} hrs` : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Cantidad de Cargas</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.loadCount != null ? flightLog.loadCount : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>RIN</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.rin || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Odómetro y combustible */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Odómetro y Combustible
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Odómetro</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.odometer || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Odómetro Inicial</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.fuelStart || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Odómetro Final</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.fuelEnd || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Combustible Consumido</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {(() => {
                  // Extraer combustible consumido de los remarks
                  const remarks = flightLog.remarks || ""
                  const fuelMatch =
                    remarks.match(/FuelConsumed:\s*(\d+(?:\.\d+)?)/i) ||
                    remarks.match(/Combustible consumido:\s*(\d+(?:\.\d+)?)/i)
                  return fuelMatch ? `${fuelMatch[1]} L` : "No registrado"
                })()}
              </p>
            </div>
          </div>

          {/* Imagen del odómetro final */}
          {flightLog.odometerPhotoUrl && (
            <div className="mt-4">
              <h5 className={`text-sm font-medium mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                Foto del Odómetro Final
              </h5>
              <div className="flex justify-center">
                <div className={`border-2 ${darkMode ? "border-gray-600" : "border-gray-300"} rounded-lg overflow-hidden max-w-md cursor-pointer hover:border-orange-500 transition-colors`}>
                  <img
                    src={flightLog.odometerPhotoUrl}
                    alt="Odómetro final del vuelo"
                    className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const container = target.parentElement;
                      if (container) {
                        container.innerHTML = `
                          <div class="flex items-center justify-center h-32 ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}">
                            <div class="text-center">
                              <svg class="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <p class="text-sm">Error al cargar la imagen</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"} text-center mt-2`}>
                Haz clic para ver en pantalla completa
              </p>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-between">
          {onDeleteFlight && (
            <button
              onClick={() => onDeleteFlight(flightLog)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          )}
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white"
            >
              Editar Vuelo
            </button>
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                darkMode
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      <EditFlightLogModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        flightLog={flightLog}
        onFlightUpdated={handleFlightUpdated}
        darkMode={darkMode}
      />

      {/* Modal de imagen en pantalla completa */}
      {isImageModalOpen && flightLog.odometerPhotoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-2 right-2 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
            <img
              src={flightLog.odometerPhotoUrl}
              alt="Odómetro final del vuelo"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

export default FlightDetailsModal