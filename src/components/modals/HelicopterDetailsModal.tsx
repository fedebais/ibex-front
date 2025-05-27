"use client"

import type React from "react"
import Modal from "../ui/Modal"
import { useState, useEffect } from "react"
import { useUser } from "../../context/UserContext"
import { getMaintenanceByHelicopterId, createMaintenance, updateHelicopter, deleteHelicopter } from "../../services/api"
import type { Helicopter, Maintenance , MaintenanceFormData , EditHelicopterFormData  } from "../../types/api"

interface HelicopterDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  helicopterId: number | null
  helicopter: Helicopter | null
  darkMode?: boolean
  onUpdateHelicopter?: (updatedHelicopter: Helicopter) => void
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
  const [showEditForm, setShowEditForm] = useState(false)
  const [maintenanceData, setMaintenanceData] = useState<MaintenanceFormData>({
    type: "Mantenimiento",
    name: "",
    date: new Date().toISOString().split("T")[0],
    details: "",
    technician: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
  })
  const [editHelicopterData, setEditHelicopterData] = useState<EditHelicopterFormData>({
    model: "",
    registration: "",
    manufactureYear: 0,
    totalFlightHours: 0,
    status: "",
    imageUrl: "",
  })
  const [formError, setFormError] = useState("")
  const [editFormError, setEditFormError] = useState("")
  const [maintenanceHistory, setMaintenanceHistory] = useState<Maintenance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    if (isOpen && helicopterId) {
      loadMaintenanceHistory()
    }
  }, [isOpen, helicopterId])

  useEffect(() => {
    if (helicopter) {
      setEditHelicopterData({
         model: helicopter.model.name,
  registration: helicopter.registration,
  manufactureYear: helicopter.manufactureYear ?? null,
  totalFlightHours: helicopter.totalFlightHours ?? null,
  status: helicopter.status ?? "ACTIVE",
  imageUrl: helicopter.imageUrl || "",
      })
    }
  }, [helicopter])

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

  if (!isOpen) return null
  if (!helicopterId || !helicopter) return null

const lastMaintenanceDate = helicopter.lastMaintenance
  ? new Date(helicopter.lastMaintenance)
  : new Date()

  const today = new Date()
  const diffTime = Math.abs(today.getTime() - lastMaintenanceDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const maintenanceStatus = diffDays > 90 ? "warning" : diffDays > 180 ? "danger" : "good"

  const canAddMaintenance = user?.role === "ADMIN" || user?.role === "TECNICO"
  const canEditHelicopter = user?.role === "ADMIN"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setMaintenanceData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditHelicopterData((prev) => ({
      ...prev,
      [name]: name === "manufactureYear" || name === "totalFlightHours" ? Number(value) : value,
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

  const handleSubmitEditHelicopter = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditFormError("")

    if (!editHelicopterData.model.trim()) {
      setEditFormError("El modelo es obligatorio")
      return
    }
    if (!editHelicopterData.registration.trim()) {
      setEditFormError("La matrícula es obligatoria")
      return
    }
    if (!editHelicopterData.manufactureYear || editHelicopterData.manufactureYear < 1950) {
      setEditFormError("El año de fabricación debe ser válido (posterior a 1950)")
      return
    }
    if (editHelicopterData.totalFlightHours === null || editHelicopterData.totalFlightHours < 0)
{
      setEditFormError("Las horas de vuelo no pueden ser negativas")
      return
    }

    if (!accessToken) {
      setEditFormError("No se pudo verificar la autenticación. Por favor, inicie sesión de nuevo.")
      return
    }

    try {
      setIsUpdating(true)

      const updatedHelicopter = {
        ...helicopter,
        model: editHelicopterData.model,
        registration: editHelicopterData.registration,
        manufactureYear: editHelicopterData.manufactureYear,
        totalFlightHours: editHelicopterData.totalFlightHours,
        status: editHelicopterData.status,
        imageUrl: editHelicopterData.imageUrl,
      }

      await updateHelicopter(helicopterId!, updatedHelicopter, accessToken)


      if (onUpdateHelicopter) {
        onUpdateHelicopter(updatedHelicopter)
      }

      setShowEditForm(false)
    } catch (err) {
      console.error("Error al actualizar el helicóptero:", err)
      setEditFormError("No se pudo actualizar el helicóptero. Por favor, intente de nuevo.")
    } finally {
      setIsUpdating(false)
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
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Helicóptero" maxWidth="max-w-4xl" darkMode={darkMode}>
      <div className="space-y-6">
        {showEditForm ? (
          <div className="space-y-4">
            <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Editar Helicóptero</h3>

            {editFormError && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
                {editFormError}
              </div>
            )}

            {deleteError && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm mb-4">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleSubmitEditHelicopter} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="model"
                    className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    Modelo
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={editHelicopterData.model}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="registration"
                    className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    Matrícula
                  </label>
                  <input
                    type="text"
                    id="registration"
                    name="registration"
                    value={editHelicopterData.registration}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="manufactureYear"
                    className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    Año de Fabricación
                  </label>
                  <input
  type="number"
  id="manufactureYear"
  name="manufactureYear"
  value={editHelicopterData.manufactureYear ?? ""}

  onChange={(e) =>
    setEditHelicopterData({
      ...editHelicopterData,
      manufactureYear: Number(e.target.value),
    })
  }
/>

                </div>

                <div>
                  <label
                    htmlFor="totalFlightHours"
                    className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    Horas de Vuelo
                  </label>
                  <input
                    type="number"
                    id="totalFlightHours"
                    name="totalFlightHours"
                    value={editHelicopterData.totalFlightHours}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    Estado
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editHelicopterData.status}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  >
                   <option value="ACTIVE">Activo</option>
<option value="MAINTENANCE">En Mantenimiento</option>
<option value="INACTIVE">Inactivo</option>

                  </select>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="imageUrl"
                    className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                  >
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={editHelicopterData.imageUrl}
                    onChange={handleEditInputChange}
                    className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    darkMode
                      ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
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
                    helicopter.status.toLowerCase() === "activo"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {helicopter.status}
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
                    {new Date(
                      new Date(helicopter.lastMaintenance).setDate(lastMaintenanceDate.getDate() + 180),
                    ).toLocaleDateString("es-ES")}
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
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-x-auto`}
            >
              <div className="flex justify-between items-center px-6 py-3">
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
                  className={`px-6 py-4 ${darkMode ? "bg-gray-700" : "bg-gray-50"} border-b ${darkMode ? "border-gray-600" : "border-gray-200"}`}
                >
                  <form onSubmit={handleSubmitMaintenance} className="space-y-4">
                    <h5 className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"} mb-2`}>
                      Nuevo Registro
                    </h5>

                    {formError && <div className="p-2 text-sm text-red-800 bg-red-100 rounded-md">{formError}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="type"
                          className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                        >
                          Tipo
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={maintenanceData.type}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
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
                          className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
                        >
                          Fecha
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={maintenanceData.date}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
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
                          maintenanceData.type === "Mantenimiento"
                            ? "Ej: Revisión de 100 horas"
                            : "Ej: Cambio de aceite"
                        }
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="details"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
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
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="technician"
                        className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
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
                        className={`w-full px-3 py-2 border ${darkMode ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"} rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500`}
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowMaintenanceForm(false)}
                        className={`px-4 py-2 border rounded-md text-sm font-medium ${
                          darkMode
                            ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
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
                  <p className={`text-sm ${darkMode ? "text-red-400" : "text-red-600"} mb-2`}>{error}</p>
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
                    {maintenanceHistory.length > 0 ? (
                      maintenanceHistory.map((maintenance) => (
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
                                  ? "bg-blue-100 text-blue-800"
                                  : maintenance.type === "Inspección"
                                    ? "bg-green-100 text-green-800"
                                    : maintenance.type === "Reparación"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
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
              </div>

              <div className="flex space-x-3">
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
                {canEditHelicopter && (
                  <button
                    type="button"
                    onClick={() => setShowEditForm(true)}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Editar Helicóptero
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default HelicopterDetailsModal
