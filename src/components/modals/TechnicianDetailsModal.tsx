"use client"

import type React from "react"
import Modal from "../ui/Modal"
import type { Technician } from "../../types/api"
import { User, Calendar, Award, Clock, Phone, Mail, Wrench, FileText } from "lucide-react"

interface TechnicianDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  technician: Technician | null
  darkMode: boolean
}

const TechnicianDetailsModal: React.FC<TechnicianDetailsModalProps> = ({ isOpen, onClose, technician, darkMode }) => {
  if (!technician) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Técnico" maxWidth="max-w-4xl">
      <div className={`space-y-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
        {/* Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              Información Personal
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre Completo</label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {technician.user.firstName} {technician.user.lastName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{technician.user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{technician.user.phone}</p>
              </div>

              {technician.user.profileImage && (
                <div>
                  <label className="block text-sm font-medium mb-1">Foto de Perfil</label>
                  <img
                    src={technician.user.profileImage || "/placeholder.svg"}
                    alt="Perfil"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Información Técnica
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Especialización</label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{technician.specialty}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nivel de Certificación</label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {technician.certificationLevel}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Años de Experiencia
                </label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {technician.yearsOfExperience} años
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Última Certificación
                </label>
                <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {formatDate(technician.lastCertification)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificaciones */}
        {technician.certifications && technician.certifications.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Certificaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {technician.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className={`p-4 rounded-lg border ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <h4 className="font-medium mb-2">{cert.name}</h4>
                  <div className="space-y-1 text-sm">
                    <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                      <span className="font-medium">Emitida:</span> {formatDate(cert.issuedDate)}
                    </p>
                    {cert.expiryDate && (
                      <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        <span className="font-medium">Expira:</span> {formatDate(cert.expiryDate)}
                      </p>
                    )}
                    {cert.issuingAuthority && (
                      <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
                        <span className="font-medium">Autoridad:</span> {cert.issuingAuthority}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historial de Mantenimientos */}
        {technician.maintenanceRecords && technician.maintenanceRecords.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              Historial de Mantenimientos
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {technician.maintenanceRecords.map((maintenance) => (
                <div
                  key={maintenance.id}
                  className={`p-4 rounded-lg border ${
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{maintenance.type}</h4>
                    <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {formatDate(maintenance.date)}
                    </span>
                  </div>
                  {maintenance.helicopterId && (
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-1`}>
                      <span className="font-medium">Helicóptero:</span> {maintenance.helicopterId} (
                      {maintenance.helicopterId})
                    </p>
                  )}
                  {maintenance.description && (
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {maintenance.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fechas de registro */}
        {(technician.createdAt || technician.updatedAt) && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {technician.createdAt && (
                <div>
                  <span className="font-medium">Registrado:</span>
                  <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {formatDate(technician.createdAt)}
                  </span>
                </div>
              )}
              {technician.updatedAt && (
                <div>
                  <span className="font-medium">Última actualización:</span>
                  <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {formatDate(technician.updatedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estado */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Estado:</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                technician.user.active
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {technician.user.active ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              darkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TechnicianDetailsModal
