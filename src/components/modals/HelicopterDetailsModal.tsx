"use client"

import type React from "react"
import Modal from "../ui/Modal"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { getMaintenanceByHelicopterId, createMaintenance, deleteHelicopter } from "../../services/api"
import type { Helicopter, Maintenance, MaintenanceFormData } from "../../types/api"
import EditHelicopterModal from "./EditHelicopterModal"

interface HelicopterDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  helicopterId: number | null
  helicopter: Helicopter | null
  darkMode?: boolean
  onUpdateHelicopter: (updated: Partial<Helicopter>) => void
  onDelete?: (helicopterId: number) => void
}

const HelicopterDetailsModal = ({
  isOpen,
  onClose,
  helicopterId,
  helicopter,
  darkMode = false,
  onUpdateHelicopter,
  onDelete,
}: HelicopterDetailsModalProps) => {
  const { accessToken, user } = useUser()
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceFormData>({
    type: "Mantenimiento",
    name: "",
    date: new Date().toISOString().split("T")[0],
    details: "",
    technician: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
  })
  const [formError, setFormError] = useState("")
  const [maintenanceHistory, setMaintenanceHistory] = useState<Maintenance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (isOpen && helicopterId) {
      loadMaintenanceHistory()
    }
  }, [isOpen, helicopterId])

  const loadMaintenanceHistory = async () => {
    if (!helicopterId || !accessToken) return

    setIsLoading(true)
    setError(null)

    try {
      const maintenanceData = await getMaintenanceByHelicopterId(helicopterId, accessToken)
      setMaintenanceHistory(maintenanceData)
    } catch (err) {
      console.error("Error al cargar el historial de mantenimiento:", err)
      setError("No se pudo cargar el historial de mantenimiento. Por favor, intente de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener el último mantenimiento
  const getLastMaintenance = (): Maintenance | null => {
    if (!maintenanceHistory || maintenanceHistory.length === 0) return null

    // Filtrar solo mantenimientos pasados y ordenar por fecha descendente
    const pastMaintenances = maintenanceHistory
      .filter((m) => new Date(m.date) <= new Date())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return pastMaintenances.length > 0 ? pastMaintenances[0] : null
  }

  // Función para obtener el próximo mantenimiento
  const getNextMaintenance = (): Maintenance | null => {
    if (!maintenanceHistory || maintenanceHistory.length === 0) return null

    // Filtrar solo mantenimientos futuros y ordenar por fecha ascendente
    const futureMaintenances = maintenanceHistory
      .filter((m) => new Date(m.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return futureMaintenances.length > 0 ? futureMaintenances[0] : null
  }

  // Función para calcular días desde el último mantenimiento
  const getDaysSinceLastMaintenance = (): number => {
    const lastMaintenance = getLastMaintenance()
    if (!lastMaintenance) return 0

    const today = new Date()
    const lastMaintenanceDate = new Date(lastMaintenance.date)
    const diffTime = Math.abs(today.getTime() - lastMaintenanceDate.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Función para obtener el estado del mantenimiento
  const getMaintenanceStatus = (): "good" | "warning" | "danger" => {
    const daysSince = getDaysSinceLastMaintenance()
    if (daysSince > 180) return "danger"
    if (daysSince > 90) return "warning"
    return "good"
  }

  if (!isOpen) return null
  if (!helicopterId || !helicopter) return null

  const lastMaintenance = getLastMaintenance()
  const nextMaintenance = getNextMaintenance()
  const daysSinceLastMaintenance = getDaysSinceLastMaintenance()
  const maintenanceStatus = getMaintenanceStatus()

  const canAddMaintenance = user?.role === "ADMIN" || user?.role === "TECNICO"
  const canEditHelicopter = user?.role === "ADMIN"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setMaintenanceData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmitMaintenance = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!maintenanceData.name.trim()) {
      setFormError("El nombre es obligatorio")
      return
    }
    if (!maintenanceData.date) {
      setFormError("La fecha es obligatoria")
      return
    }
    if (!maintenanceData.details.trim()) {
      setFormError("Los detalles son obligatorios")
      return
    }
    if (!maintenanceData.technician.trim()) {
      setFormError("El nombre del técnico es obligatorio")
      return
    }

    if (!accessToken) {
      setFormError("No se pudo verificar la autenticación. Por favor, inicie sesión de nuevo.")
      return
    }

    try {
      const newMaintenance = {
        helicopterId: helicopterId,
        type: maintenanceData.type,
        description: maintenanceData.details,
        technicianName: maintenanceData.technician,
        date: new Date(maintenanceData.date).toISOString(),
      }

      await createMaintenance(newMaintenance, accessToken)

      await loadMaintenanceHistory()

      setMaintenanceData({
        type: "Mantenimiento",
        name: "",
        date: new Date().toISOString().split("T")[0],
        details: "",
        technician: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
      })
      setShowMaintenanceForm(false)
    } catch (err) {
      console.error("Error al crear mantenimiento:", err)
      setFormError("No se pudo guardar el mantenimiento. Por favor, intente de nuevo.")
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
      return
    }

    const token = accessToken || localStorage.getItem("ibex_access_token")
    if (!token) {
      setDeleteError("No se pudo verificar la autenticación. Por favor, inicie sesión de nuevo.")
      return
    }

    if (!helicopterId) {
      setDeleteError("ID del helicóptero no válido")
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError("")

      console.log("Eliminando helicóptero:", helicopterId)
      await deleteHelicopter(helicopterId, token)

      console.log("Helicóptero eliminado exitosamente")

      if (onDelete) {
        onDelete(helicopterId)
      }

      onClose()
    } catch (err: any) {
      console.error("Error al eliminar helicóptero:", err)

      if (err.message?.includes("401")) {
        setDeleteError("Sesión expirada. Por favor, inicie sesión de nuevo.")
        localStorage.removeItem("ibex_access_token")
      } else if (err.message?.includes("403")) {
        setDeleteError("No tiene permisos para eliminar este helicóptero.")
      } else if (err.message?.includes("404")) {
        setDeleteError("El helicóptero no fue encontrado.")
      } else {
        setDeleteError("No se pudo eliminar el helicóptero. Por favor, intente de nuevo.")
      }
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Helicóptero" maxWidth="max-w-4xl">
        <div className="space-y-6">
          {/* Imagen y detalles básicos */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <div className="rounded-lg overflow-hidden h-64">
                <img
                  src={helicopter.imageUrl || "/placeholder.svg?height=300&width=400"}
                  alt={helicopter.model.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <div>
                <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.model.name}
                </h3>
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{helicopter.registration}</p>
              </div>

              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  (helicopter.status ?? "").toLowerCase() === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : (helicopter.status ?? "").toLowerCase() === "maintenance"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {helicopter.status === "ACTIVE"
                  ? "Activo"
                  : helicopter.status === "MAINTENANCE"
                    ? "Mantenimiento"
                    : helicopter.status === "INACTIVE"
                      ? "Inactivo"
                      : helicopter.status}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Año de Fabricación</p>
                  <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {helicopter.manufactureYear}
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
          <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-50"}`}>
            <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Información de Mantenimiento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Último Mantenimiento</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {lastMaintenance ? new Date(lastMaintenance.date).toLocaleDateString("es-ES") : "Sin registros"}
                </p>
                {lastMaintenance && (
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {lastMaintenance.type} - {lastMaintenance.description}
                  </p>
                )}
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
                  {lastMaintenance ? `${daysSinceLastMaintenance} días` : "N/A"}
                </p>
              </div>
              <div>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Próximo Mantenimiento</p>
                <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {nextMaintenance ? new Date(nextMaintenance.date).toLocaleDateString("es-ES") : "No programado"}
                </p>
                {nextMaintenance && (
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {nextMaintenance.type} - {nextMaintenance.description}
                  </p>
                )}
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
                  {helicopter.model.name === "Bell 407"
                    ? "6"
                    : helicopter.model.name === "Airbus H125"
                      ? "5"
                      : helicopter.model.name === "Robinson R44"
                        ? "3"
                        : helicopter.model.name === "Sikorsky S-76"
                          ? "12"
                          : "N/A"}{" "}
                  pasajeros
                </p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Velocidad</p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.model.name === "Bell 407"
                    ? "259"
                    : helicopter.model.name === "Airbus H125"
                      ? "287"
                      : helicopter.model.name === "Robinson R44"
                        ? "240"
                        : helicopter.model.name === "Sikorsky S-76"
                          ? "287"
                          : "N/A"}{" "}
                  km/h
                </p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Alcance</p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.model.name === "Bell 407"
                    ? "670"
                    : helicopter.model.name === "Airbus H125"
                      ? "666"
                      : helicopter.model.name === "Robinson R44"
                        ? "560"
                        : helicopter.model.name === "Sikorsky S-76"
                          ? "760"
                          : "N/A"}{" "}
                  km
                </p>
              </div>
              <div>
                <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Techo</p>
                <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {helicopter.model.name === "Bell 407"
                    ? "5,698"
                    : helicopter.model.name === "Airbus H125"
                      ? "7,010"
                      : helicopter.model.name === "Robinson R44"
                        ? "4,300"
                        : helicopter.model.name === "Sikorsky S-76"
                          ? "5,180"
                          : "N/A"}{" "}
                  m
                </p>
              </div>
            </div>
          </div>

          {/* Historial de mantenimiento */}
          <div
            className={`border rounded-lg overflow-x-auto ${
              darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className={`flex justify-between items-center px-6 py-3 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
              <h4 className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                Historial de Mantenimiento y Servicios
              </h4>
              {canAddMaintenance && !showMaintenanceForm && (
                <button
                  onClick={() => setShowMaintenanceForm(true)}
                  className="px-3 py-1 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Añadir Registro
                </button>
              )}
            </div>

            {showMaintenanceForm && canAddMaintenance && (
              <div
                className={`px-6 py-4 border-b ${
                  darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                }`}
              >
                <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                  <h5 className={`text-base font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Nuevo Registro
                  </h5>

                  {formError && (
                    <div
                      className={`p-2 text-sm rounded-md ${
                        darkMode
                          ? "bg-red-900 border border-red-700 text-red-200"
                          : "bg-red-100 border border-red-200 text-red-800"
                      }`}
                    >
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="type"
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Tipo
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={maintenanceData.type}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      >
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Inspección">Inspección</option>
                        <option value="Reparación">Reparación</option>
                        <option value="Servicio">Servicio</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="date"
                        className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                      >
                        Fecha
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={maintenanceData.date}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                          darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={maintenanceData.name}
                      onChange={handleInputChange}
                      placeholder={
                        maintenanceData.type === "Mantenimiento" ? "Ej: Revisión de 100 horas" : "Ej: Cambio de aceite"
                      }
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="details"
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Detalles
                    </label>
                    <textarea
                      id="details"
                      name="details"
                      value={maintenanceData.details}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={`Describa los detalles del ${maintenanceData.type}`}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="technician"
                      className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      Técnico Responsable
                    </label>
                    <input
                      type="text"
                      id="technician"
                      name="technician"
                      value={maintenanceData.technician}
                      onChange={handleInputChange}
                      placeholder="Nombre del técnico"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${
                        darkMode
                          ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }`}
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowMaintenanceForm(false)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                        darkMode
                          ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className={`text-sm mb-2 ${darkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
                <button
                  onClick={loadMaintenanceHistory}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <table className={`w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Fecha
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Tipo
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Descripción
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Técnico
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"}`}>
                  {maintenanceHistory.length > 0 ? (
                    maintenanceHistory
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((maintenance) => (
                        <tr key={maintenance.id}>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {new Date(maintenance.date).toLocaleDateString("es-ES")}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                maintenance.type === "Mantenimiento"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : maintenance.type === "Inspección"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                    : maintenance.type === "Reparación"
                                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {maintenance.type}
                            </span>
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {maintenance.description}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                          >
                            {maintenance.technicianName}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className={`px-6 py-4 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        No hay registros de mantenimiento disponibles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-2">
            <div>
              {canEditHelicopter && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 ${
                    showDeleteConfirm ? "bg-red-700 hover:bg-red-800" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isDeleting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Eliminando...
                    </div>
                  ) : showDeleteConfirm ? (
                    "¿Confirmar eliminación?"
                  ) : (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Eliminar
                    </div>
                  )}
                </button>
              )}
              {deleteError && (
                <p className={`text-sm mt-2 ${darkMode ? "text-red-400" : "text-red-600"}`}>{deleteError}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                className={`px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  darkMode
                    ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                Descargar Informe
              </button>
              {canEditHelicopter && (
                <button
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Editar Helicóptero
                </button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de edición separado */}
      <EditHelicopterModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        helicopter={helicopter}
        onUpdateHelicopter={onUpdateHelicopter}
        darkMode={darkMode}
      />
    </>
  )
}

export default HelicopterDetailsModal
