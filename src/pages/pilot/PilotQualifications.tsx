"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, BookOpen, AlertTriangle, CheckCircle, Plus, Trash2 } from "lucide-react"

interface Qualification {
  id: number
  pilotId: number
  type: string
  issueDate: string
  expiryDate: string
  issuingAuthority: string
  certificateNumber: string
  documentUrl?: string
  description?: string
  active: boolean
  createdAt: string
  status?: 'active' | 'expired' | 'expiring_soon'
  pilot: {
    id: number
    user: {
      firstName: string
      lastName: string
      email: string
    }
    licenseNumber: string
  }
}

interface PilotQualificationsProps {
  darkMode: boolean
}

const PilotQualifications = ({ darkMode }: PilotQualificationsProps) => {
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [filteredQualifications, setFilteredQualifications] = useState<Qualification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    type: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    certificateNumber: "",
    description: "",
    documentUrl: ""
  })
  const [selectedType, setSelectedType] = useState("all")

  const qualificationTypes = [
    "Licencia de Piloto",
    "Habilitación de Tipo",
    "Certificado Médico",
    "Entrenamiento de Seguridad",
    "Radiooperador",
    "Inglés Aeronáutico"
  ]

  const statusColors = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    expiring_soon: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
  }

  const statusLabels = {
    active: "Activa",
    expired: "Vencida",
    expiring_soon: "Por Vencer"
  }

  const statusIcons = {
    active: <CheckCircle className="w-4 h-4" />,
    expired: <AlertTriangle className="w-4 h-4" />,
    expiring_soon: <Clock className="w-4 h-4" />
  }

  useEffect(() => {
    fetchQualifications()
  }, [])

  useEffect(() => {
    let filtered = qualifications.filter(qualification =>
      qualification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qualification.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase()) ||
      qualification.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedType !== "all") {
      filtered = filtered.filter(qualification => qualification.type === selectedType)
    }

    setFilteredQualifications(filtered)
  }, [qualifications, searchTerm, selectedType])

  const fetchQualifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) {
        console.error("No user data found in localStorage")
        return
      }

      const user = JSON.parse(userStr)

      if (!user.pilot?.id) {
        console.error("User does not have a pilot ID")
        return
      }

      const url = `${import.meta.env.VITE_API_URL}/qualifications?pilotId=${user.pilot.id}`
      console.log("Fetching qualifications from:", url)

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Qualifications received:", data)
        // Process qualifications to determine status
        const processedData = data.map((qual: any) => ({
          ...qual,
          status: getQualificationStatus(qual.expiryDate)
        }))
        setQualifications(processedData)
      } else {
        console.error("Error fetching qualifications:", response.statusText)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getQualificationStatus = (expiryDate: string): 'active' | 'expired' | 'expiring_soon' => {
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

  const activeQualifications = qualifications.filter(q => q.status === 'active')
  const expiredQualifications = qualifications.filter(q => q.status === 'expired')
  const expiringQualifications = qualifications.filter(q => q.status === 'expiring_soon')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)
      let documentUrl = formData.documentUrl

      // Upload file if selected
      if (selectedFile) {
        const formDataUpload = new FormData()
        formDataUpload.append('file', selectedFile)

        const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL}/upload/qualifications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        })

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          documentUrl = uploadData.fileUrl
        }
      }

      // Create qualification
      const response = await fetch(`${import.meta.env.VITE_API_URL}/qualifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pilotId: user.pilot?.id,
          type: formData.type,
          issueDate: formData.issueDate,
          expiryDate: formData.expiryDate,
          issuingAuthority: formData.issuingAuthority,
          certificateNumber: formData.certificateNumber,
          description: formData.description,
          documentUrl: documentUrl
        })
      })

      if (response.ok) {
        // Reset form and close modal
        setFormData({
          type: "",
          issueDate: "",
          expiryDate: "",
          issuingAuthority: "",
          certificateNumber: "",
          description: "",
          documentUrl: ""
        })
        setSelectedFile(null)
        setIsModalOpen(false)
        // Refresh qualifications list
        fetchQualifications()
      } else {
        console.error('Error creating qualification:', response.statusText)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDelete = async (qualificationId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta habilitación?')) {
      return
    }

    try {
      const token = localStorage.getItem("ibex_access_token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/qualifications/${qualificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Refresh qualifications list
        fetchQualifications()
      } else {
        console.error('Error deleting qualification:', response.statusText)
        alert('Error al eliminar la habilitación')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar la habilitación')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mis Habilitaciones</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consulta tus certificaciones y habilitaciones vigentes</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Habilitación
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total</h3>
              <p className="text-2xl font-bold text-blue-600">{qualifications.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Activas</h3>
              <p className="text-2xl font-bold text-green-600">{activeQualifications.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Por Vencer</h3>
              <p className="text-2xl font-bold text-yellow-600">{expiringQualifications.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Vencidas</h3>
              <p className="text-2xl font-bold text-red-600">{expiredQualifications.length}</p>
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
              placeholder="Buscar habilitaciones..."
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            {qualificationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Qualifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQualifications.map((qualification) => (
          <div key={qualification.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 border-l-4 ${
            qualification.status === 'active' ? 'border-green-500' :
            qualification.status === 'expired' ? 'border-red-500' : 'border-yellow-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{qualification.type}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {qualification.issuingAuthority}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusColors[qualification.status || 'active']}`}>
                  {statusIcons[qualification.status || 'active']}
                  <span className="ml-1">{statusLabels[qualification.status || 'active']}</span>
                </span>
                <button
                  onClick={() => handleDelete(qualification.id)}
                  className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Eliminar habilitación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {qualification.issuingAuthority}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Emitida: {new Date(qualification.issueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className={`${
                  isExpired(qualification.expiryDate) ? 'text-red-600' :
                  isExpiringSoon(qualification.expiryDate) ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  Vence: {new Date(qualification.expiryDate).toLocaleDateString()}
                </span>
              </div>

              {qualification.certificateNumber && (
                <div className="text-sm">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    N° Certificado: {qualification.certificateNumber}
                  </span>
                </div>
              )}

              {qualification.description && (
                <div className="text-sm">
                  <p className={`italic ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {qualification.description}
                  </p>
                </div>
              )}
            </div>

            {qualification.documentUrl && (
              <div className="mt-4">
                <a
                  href={qualification.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <BookOpen className="w-4 h-4 mr-1" />
                  Ver documento
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQualifications.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No se encontraron habilitaciones
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || selectedType !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no tienes habilitaciones registradas"
            }
          </p>
        </div>
      )}

      {/* Modal para nueva habilitación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Nueva Habilitación
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Habilitación *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Seleccionar tipo</option>
                  {qualificationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  required
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Autoridad Emisora *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Número de Certificado
                </label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Documento
                </label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                {selectedFile && (
                  <p className={`text-sm mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PilotQualifications