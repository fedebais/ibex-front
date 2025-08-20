"use client"

import Modal from "../ui/Modal"
import type { FlightLog } from "../../types/api"
import { useState } from "react"
import { formatDate } from "../../utils/dateUtils"
import EditFlightLogModal from "./EditFlightLogModal"

interface FlightDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  flightLog: FlightLog | null
  darkMode?: boolean
  onUpdateFlight?: () => void
}

const FlightDetailsModal = ({
  isOpen,
  onClose,
  flightLog,
  darkMode = false,
  onUpdateFlight,
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
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Capacidad</p>
                <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {flightLog.helicopter.capacity || "N/A"} pasajeros
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
                {flightLog.startTime
                  ? new Date(flightLog.startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                  : "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Hora de Aterrizaje</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.landingTime
                  ? new Date(flightLog.landingTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
                  : "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Duración</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.duration ? `${flightLog.duration} min` : "N/A"}
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
              <p className={`text-xs text-center mt-2 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Haz clic en la imagen para verla en tamaño completo
              </p>
            </div>
          )}
        </div>

        {/* Pasajeros y estado de pago */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Pasajeros</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>{flightLog.passengers || 0}</p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Estado de Pago</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.paymentStatus === "PAID"
                  ? "Pagado"
                  : flightLog.paymentStatus === "PENDING_INVOICE"
                    ? "Factura Pendiente"
                    : flightLog.paymentStatus === "PENDING_PAYMENT"
                      ? "Pago Pendiente"
                      : "N/A"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Gacho Usado</p>
              <p className={`text-base ${darkMode ? "text-white" : "text-gray-900"}`}>
                {flightLog.hookUsed ? "Sí" : "No"}
              </p>
            </div>
          </div>
        </div>

        {/* Notas y observaciones */}
        <div>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Notas</p>
          <p
            className={`text-base ${darkMode ? "bg-gray-700" : "bg-gray-50"} p-3 rounded-md mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}
          >
            {flightLog.notes || "Sin notas adicionales"}
          </p>
        </div>

        {/* Observaciones técnicas */}
        {flightLog.remarks && (
          <div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Observaciones Técnicas</p>
            <p
              className={`text-base ${darkMode ? "bg-gray-700" : "bg-gray-50"} p-3 rounded-md mt-1 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
              {flightLog.remarks}
            </p>
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
            Descargar PDF
          </button>
          {flightLog.status === "SCHEDULED" && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Editar Vuelo
            </button>
          )}
        </div>
      </div>

      {/* Modal de imagen completa */}
      {isImageModalOpen && flightLog.odometerPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setIsImageModalOpen(false)}
          />
          
          {/* Modal centrado */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl max-h-screen mx-4 overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Foto del Odómetro Final
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-md p-1"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-4 max-h-96 overflow-auto">
              <img
                src={flightLog.odometerPhotoUrl}
                alt="Odómetro final del vuelo - Tamaño completo"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0EzQUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkVycm9yIGFsIGNhcmdhciBpbWFnZW48L3RleHQ+Cjwvc3ZnPg==';
                }}
              />
            </div>
            
            {/* Footer del modal */}
            <div className="flex justify-end space-x-3 px-4 py-3 bg-gray-50">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                onClick={() => setIsImageModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      <EditFlightLogModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        flightLog={flightLog}
        onFlightUpdated={handleFlightUpdated}
        darkMode={darkMode}
      />
    </Modal>
  )
}

export default FlightDetailsModal
