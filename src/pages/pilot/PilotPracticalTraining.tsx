"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, Plane, Plus, Upload, FileText } from "lucide-react"
import { uploadFile } from "../../firebase/storage"

interface PracticalTraining {
  id: string
  helicopterModel: string
  instructorName: string
  trainingType: string
  startDate: string
  endDate: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  objectives: string
  notes: string
  score?: number
  completionDate?: string
  certificateUrl?: string
  createdAt: string
}

interface PilotPracticalTrainingProps {
  darkMode: boolean
}

const PilotPracticalTraining = ({ darkMode }: PilotPracticalTrainingProps) => {
  const [trainings, setTrainings] = useState<PracticalTraining[]>([])
  const [filteredTrainings, setFilteredTrainings] = useState<PracticalTraining[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    helicopterModel: "",
    instructorName: "",
    trainingType: "",
    startDate: "",
    endDate: "",
    duration: 0,
    objectives: "",
    notes: "",
    certificateUrl: ""
  })

  const trainingTypes = [
    "Vuelo Básico",
    "Maniobras Avanzadas",
    "Vuelo Nocturno",
    "Vuelo IFR",
    "Emergencias",
    "Transporte de Carga",
    "Rescate",
    "Certificación"
  ]

  const statusColors = {
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
  }

  const statusLabels = {
    scheduled: "Programado",
    in_progress: "En Progreso",
    completed: "Completado",
    cancelled: "Cancelado"
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
    const fileName = `practical-training/${timestamp}_${file.name}`;
    return await uploadFile(file, fileName);
  };

  useEffect(() => {
    fetchTrainings()
  }, [])

  useEffect(() => {
    let filtered = trainings.filter(training =>
      training.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.trainingType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.helicopterModel.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedStatus !== "all") {
      filtered = filtered.filter(training => training.status === selectedStatus)
    }

    setFilteredTrainings(filtered)
  }, [trainings, searchTerm, selectedStatus])

  const fetchTrainings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/practical-training?pilotId=${user.pilot?.id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTrainings(data)
      } else {
        console.error("Error fetching practical trainings:", response.statusText)
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
      let certificateUrl = formData.certificateUrl;

      // Upload file if selected
      if (selectedFile) {
        certificateUrl = await uploadFileToFirebase(selectedFile);
      }

      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/practical-training`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pilotId: user.pilot?.id,
          helicopterModel: formData.helicopterModel,
          instructorName: formData.instructorName,
          trainingType: formData.trainingType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          duration: formData.duration,
          objectives: formData.objectives,
          notes: formData.notes,
          certificateUrl,
          status: "completed"
        })
      })

      if (response.ok) {
        await fetchTrainings()
        closeModal()
      } else {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        console.error("Error saving training:", errorData)
        alert(`Error al guardar el entrenamiento: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = () => {
    setFormData({
      helicopterModel: "",
      instructorName: "",
      trainingType: "",
      startDate: "",
      endDate: "",
      duration: 0,
      objectives: "",
      notes: "",
      certificateUrl: ""
    })
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
  }

  const completedTrainings = trainings.filter(t => t.status === 'completed')
  const inProgressTrainings = trainings.filter(t => t.status === 'in_progress')
  const scheduledTrainings = trainings.filter(t => t.status === 'scheduled')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mi Entrenamiento Práctico</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consulta tu historial de entrenamientos de vuelo</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Entrenamiento
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Plane className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Entrenamientos</h3>
              <p className="text-2xl font-bold text-blue-600">{trainings.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">En Progreso</h3>
              <p className="text-2xl font-bold text-yellow-600">{inProgressTrainings.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Programados</h3>
              <p className="text-2xl font-bold text-blue-600">{scheduledTrainings.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Completados</h3>
              <p className="text-2xl font-bold text-green-600">{completedTrainings.length}</p>
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
              placeholder="Buscar entrenamientos..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="scheduled">Programado</option>
            <option value="in_progress">En Progreso</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <div key={training.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 border-l-4 ${
            training.status === 'completed' ? 'border-green-500' :
            training.status === 'in_progress' ? 'border-yellow-500' :
            training.status === 'scheduled' ? 'border-blue-500' : 'border-red-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{training.trainingType}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {training.helicopterModel}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${statusColors[training.status]}`}>
                {statusLabels[training.status]}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Instructor: {training.instructorName}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {new Date(training.startDate).toLocaleDateString()}
                  {training.endDate && ` - ${new Date(training.endDate).toLocaleDateString()}`}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Duración: {training.duration} horas de vuelo
                </span>
              </div>

              {training.score && training.status === 'completed' && (
                <div className="text-sm">
                  <span className={`font-medium ${
                    training.score >= 80 ? 'text-green-600' :
                    training.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Calificación: {training.score}/100
                  </span>
                </div>
              )}

              <div className="text-sm">
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Objetivos:
                </p>
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                  {training.objectives}
                </p>
              </div>

              {training.notes && (
                <div className="text-sm">
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Notas:
                  </p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                    {training.notes}
                  </p>
                </div>
              )}
            </div>

            {training.certificateUrl && training.status === 'completed' && (
              <div className="mt-4">
                <a
                  href={training.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <Plane className="w-4 h-4 mr-1" />
                  Ver certificado
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTrainings.length === 0 && !loading && (
        <div className="text-center py-12">
          <Plane className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No se encontraron entrenamientos
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || selectedStatus !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no tienes entrenamientos registrados"
            }
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">Nuevo Entrenamiento Práctico</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Modelo de Helicóptero</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.helicopterModel}
                    onChange={(e) => setFormData({ ...formData, helicopterModel: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructor</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.instructorName}
                    onChange={(e) => setFormData({ ...formData, instructorName: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Entrenamiento</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.trainingType}
                    onChange={(e) => setFormData({ ...formData, trainingType: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    {trainingTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duración (horas)</label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Inicio</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Finalización</label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Objetivos</label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  value={formData.objectives}
                  onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas (opcional)</label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

export default PilotPracticalTraining