"use client"

import Modal from "../ui/Modal"
import type { FlightLog } from "../../types/api"
import { useState } from "react"
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
                {new Date(flightLog.date).toLocaleDateString("es-ES", {
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
