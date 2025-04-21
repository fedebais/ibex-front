"use client"

import Modal from "../ui/Modal"
import { mockHelicopters } from "../../data/mockData"

interface HelicopterDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  helicopterId: string | null
  darkMode?: boolean
}

const HelicopterDetailsModal = ({ isOpen, onClose, helicopterId, darkMode = false }: HelicopterDetailsModalProps) => {
  if (!helicopterId) return null

  const helicopter = mockHelicopters.find((h) => h.id === helicopterId)
  if (!helicopter) return null

  // Calcular días desde el último mantenimiento
  const lastMaintenanceDate = new Date(helicopter.lastMaintenance)
  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastMaintenanceDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Determinar si el mantenimiento está próximo (menos de 30 días)
  const maintenanceStatus = diffDays > 90 ? "warning" : diffDays > 180 ? "danger" : "good"

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Helicóptero" maxWidth="max-w-4xl" darkMode={darkMode}>
      <div className="space-y-6">
        {/* Imagen y detalles básicos */}
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/2">
            <div className="rounded-lg overflow-hidden h-64">
              <img
                src={helicopter.image || "/placeholder.svg?height=300&width=400"}
                alt={helicopter.model}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-1/2 space-y-4">
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{helicopter.model}</h3>
              <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{helicopter.registration}</p>
            </div>

            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                helicopter.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {helicopter.status === "active" ? "Activo" : "En Mantenimiento"}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Año de Fabricación</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.yearManufactured}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas de Vuelo</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.totalFlightHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de mantenimiento */}
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Información de Mantenimiento
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Último Mantenimiento</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {new Date(helicopter.lastMaintenance).toLocaleDateString("es-ES")}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Días desde último mantenimiento
              </p>
              <p
                className={`text-base font-medium ${
                  maintenanceStatus === "danger"
                    ? "text-red-500"
                    : maintenanceStatus === "warning"
                      ? "text-yellow-500"
                      : darkMode
                        ? "text-green-400"
                        : "text-green-600"
                }`}
              >
                {diffDays} días
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Próximo Mantenimiento</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {new Date(lastMaintenanceDate.setDate(lastMaintenanceDate.getDate() + 180)).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
        </div>

        {/* Especificaciones técnicas */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Especificaciones Técnicas
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Capacidad</p>
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {helicopter.model === "Bell 407"
                  ? "6"
                  : helicopter.model === "Airbus H125"
                    ? "5"
                    : helicopter.model === "Robinson R44"
                      ? "3"
                      : helicopter.model === "Sikorsky S-76"
                        ? "12"
                        : "N/A"}{" "}
                pasajeros
              </p>
            </div>
            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Velocidad</p>
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {helicopter.model === "Bell 407"
                  ? "259"
                  : helicopter.model === "Airbus H125"
                    ? "287"
                    : helicopter.model === "Robinson R44"
                      ? "240"
                      : helicopter.model === "Sikorsky S-76"
                        ? "287"
                        : "N/A"}{" "}
                km/h
              </p>
            </div>
            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Alcance</p>
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {helicopter.model === "Bell 407"
                  ? "670"
                  : helicopter.model === "Airbus H125"
                    ? "666"
                    : helicopter.model === "Robinson R44"
                      ? "560"
                      : helicopter.model === "Sikorsky S-76"
                        ? "760"
                        : "N/A"}{" "}
                km
              </p>
            </div>
            <div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Techo</p>
              <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {helicopter.model === "Bell 407"
                  ? "5,698"
                  : helicopter.model === "Airbus H125"
                    ? "7,010"
                    : helicopter.model === "Robinson R44"
                      ? "4,300"
                      : helicopter.model === "Sikorsky S-76"
                        ? "5,180"
                        : "N/A"}{" "}
                m
              </p>
            </div>
          </div>
        </div>

        {/* Historial de mantenimiento */}
        <div
          className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-x-auto`}
        >
          <table className={`w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
              <tr>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Fecha
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Tipo
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Descripción
                </th>
                <th
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                >
                  Técnico
                </th>
              </tr>
            </thead>
            <tbody
              className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
            >
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {new Date(helicopter.lastMaintenance).toLocaleDateString("es-ES")}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Mantenimiento Programado
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Revisión de 100 horas
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Juan Pérez
                </td>
              </tr>
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {new Date(
                    new Date(helicopter.lastMaintenance).setMonth(new Date(helicopter.lastMaintenance).getMonth() - 3),
                  ).toLocaleDateString("es-ES")}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Inspección
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Inspección de rutina
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  María López
                </td>
              </tr>
              <tr>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {new Date(
                    new Date(helicopter.lastMaintenance).setMonth(new Date(helicopter.lastMaintenance).getMonth() - 6),
                  ).toLocaleDateString("es-ES")}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Mantenimiento Programado
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Revisión de 500 horas
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  Carlos Rodríguez
                </td>
              </tr>
            </tbody>
          </table>
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
            Descargar Informe
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Editar Helicóptero
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default HelicopterDetailsModal
