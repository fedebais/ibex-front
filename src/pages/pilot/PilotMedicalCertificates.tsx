"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, Stethoscope, AlertTriangle, CheckCircle, Plus, Upload, FileText } from "lucide-react"
import { uploadFile } from "../../firebase/storage"

interface MedicalCertificate {
  id: string
  certificateNumber: string
  issueDate: string
  expiryDate: string
  medicalClass: string
  examiner: string
  documentUrl?: string
  restrictions?: string
  active: boolean
  status: 'active' | 'expired' | 'expiring_soon'
  createdAt: string
}

interface PilotMedicalCertificatesProps {
  darkMode: boolean
}

const PilotMedicalCertificates = ({ darkMode }: PilotMedicalCertificatesProps) => {
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<MedicalCertificate[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    certificateNumber: "",
    issueDate: "",
    expiryDate: "",
    medicalClass: "",
    examiner: "",
    restrictions: "",
    documentUrl: ""
  })

  const medicalClasses = [
    "Clase I",
    "Clase II",
    "Clase III"
  ]

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    expiring_soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }

  const statusLabels = {
    active: "Activo",
    expired: "Vencido",
    expiring_soon: "Por Vencer"
  }

  const statusIcons = {
    active: <CheckCircle className="w-4 h-4" />,
    expired: <AlertTriangle className="w-4 h-4" />,
    expiring_soon: <Clock className="w-4 h-4" />
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert('El archivo excede el tamaño máximo permitido de 50MB');
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFileToFirebase = async (file: File): Promise<string> => {
    const timestamp = new Date().getTime();
    const fileName = `medical-certificates/${timestamp}_${file.name}`;
    return await uploadFile(file, fileName);
  };

  useEffect(() => {
    fetchCertificates()
  }, [])

  useEffect(() => {
    let filtered = certificates.filter(certificate =>
      certificate.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.examiner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.medicalClass.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedClass !== "all") {
      filtered = filtered.filter(certificate => certificate.medicalClass === selectedClass)
    }

    setFilteredCertificates(filtered)
  }, [certificates, searchTerm, selectedClass])

  const fetchCertificates = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/medical-certificates?pilotId=${user.pilot?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Process certificates to determine status
        const processedData = data.map((cert: any) => ({
          ...cert,
          status: getCertificateStatus(cert.expiryDate)
        }))
        setCertificates(processedData)
      } else {
        console.error("Error fetching medical certificates:", response.statusText)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let documentUrl = formData.documentUrl;

      // Upload file if selected
      if (selectedFile) {
        documentUrl = await uploadFileToFirebase(selectedFile);
      }

      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/medical-certificates`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pilotId: user.pilot?.id,
          certificateNumber: formData.certificateNumber,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          medicalClass: formData.medicalClass,
          examiner: formData.examiner,
          restrictions: formData.restrictions,
          documentUrl,
          active: true
        })
      })

      if (response.ok) {
        await fetchCertificates()
        closeModal()
      } else {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        console.error("Error saving certificate:", errorData)
        alert(`Error al guardar el certificado: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setFormData({
      certificateNumber: "",
      issueDate: "",
      expiryDate: "",
      medicalClass: "",
      examiner: "",
      restrictions: "",
      documentUrl: ""
    })
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
  }

  const getCertificateStatus = (expiryDate: string): 'active' | 'expired' | 'expiring_soon' => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) {
      return 'expired'
    } else if (daysUntilExpiry <= 30) {
      return 'expiring_soon'
    }
    return 'active'
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30
  }

  const activeCertificates = certificates.filter(c => c.status === 'active')
  const expiredCertificates = certificates.filter(c => c.status === 'expired')
  const expiringCertificates = certificates.filter(c => c.status === 'expiring_soon')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mis Psicofísicos</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consulta tus certificados médicos vigentes</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Psicofísico
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Certificados</h3>
              <p className="text-2xl font-bold text-blue-600">{certificates.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Activos</h3>
              <p className="text-2xl font-bold text-green-600">{activeCertificates.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Por Vencer</h3>
              <p className="text-2xl font-bold text-yellow-600">{expiringCertificates.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Vencidos</h3>
              <p className="text-2xl font-bold text-red-600">{expiredCertificates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar certificados..."
              className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="all">Todas las clases</option>
            {medicalClasses.map(medicalClass => (
              <option key={medicalClass} value={medicalClass}>{medicalClass}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate) => (
          <div key={certificate.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 border-l-4 ${
            certificate.status === 'active' ? 'border-green-500' :
            certificate.status === 'expired' ? 'border-red-500' : 'border-yellow-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Certificado Médico</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {certificate.medicalClass}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusColors[certificate.status]}`}>
                {statusIcons[certificate.status]}
                <span className="ml-1">{statusLabels[certificate.status]}</span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Stethoscope className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  N° {certificate.certificateNumber}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Dr. {certificate.examiner}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Emitido: {new Date(certificate.issueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className={`${
                  isExpired(certificate.expiryDate) ? 'text-red-600' :
                  isExpiringSoon(certificate.expiryDate) ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Vence: {new Date(certificate.expiryDate).toLocaleDateString()}
                </span>
              </div>

              {certificate.restrictions && (
                <div className="text-sm">
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Restricciones:
                  </p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                    {certificate.restrictions}
                  </p>
                </div>
              )}
            </div>

            {certificate.documentUrl && (
              <div className="mt-4">
                <a
                  href={certificate.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <Stethoscope className="w-4 h-4 mr-1" />
                  Ver certificado
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCertificates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Stethoscope className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No se encontraron certificados
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || selectedClass !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no tienes certificados médicos registrados"
            }
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">Nuevo Psicofísico</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Número de Certificado</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.certificateNumber}
                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Clase Médica</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.medicalClass}
                    onChange={(e) => setFormData({ ...formData, medicalClass: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar clase</option>
                    {medicalClasses.map(medicalClass => (
                      <option key={medicalClass} value={medicalClass}>{medicalClass}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Médico Examinador</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.examiner}
                    onChange={(e) => setFormData({ ...formData, examiner: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Emisión</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Restricciones (opcional)</label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  placeholder="Ej: Lentes correctores requeridos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Certificado (PDF, Word, JPG, PNG - máx 50MB)</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,.jpg,.jpeg,image/png,.png,image/gif,.gif,image/webp,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="certificate-upload"
                  />
                  <label
                    htmlFor="certificate-upload"
                    className="cursor-pointer"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <span>{selectedFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                          Haz clic para seleccionar un archivo
                        </p>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          PDF, Word, JPG, PNG, GIF, WEBP
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    darkMode
                      ? 'border-gray-600 text-gray-300'
                      : 'border-gray-300 text-gray-700'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {loading ? "Guardando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PilotMedicalCertificates