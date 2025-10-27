"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, Plane, Plus, Upload, FileText, BookOpen, Trash2 } from "lucide-react"
import { uploadFile } from "../../firebase/storage"

interface PracticalTraining {
  id: number
  pilotId: number
  discipline: string
  trainingDate: string
  nextDueDate: string
  helicopterId?: number
  instructor: string
  duration: number
  location?: string
  weatherConditions?: string
  performance?: string
  remarks?: string
  documentUrl?: string
  active: boolean
  createdAt: string
  pilot: {
    id: number
    user: {
      firstName: string
      lastName: string
      email: string
    }
    licenseNumber: string
  }
  helicopter?: {
    id: number
    registration: string
    model: {
      name: string
    }
  }
}

interface PilotPracticalTrainingProps {
  darkMode: boolean
}

const PilotPracticalTraining = ({ darkMode }: PilotPracticalTrainingProps) => {
  const [trainings, setTrainings] = useState<PracticalTraining[]>([])
  const [filteredTrainings, setFilteredTrainings] = useState<PracticalTraining[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [helicopters, setHelicopters] = useState<any[]>([])
  const [selectedDiscipline, setSelectedDiscipline] = useState("all")

  const [formData, setFormData] = useState({
    discipline: "",
    trainingDate: "",
    helicopterId: "",
    instructor: "",
    duration: 0,
    location: "",
    weatherConditions: "",
    performance: "",
    remarks: "",
    documentUrl: ""
  })

  const trainingDisciplines = [
    { value: "CARGA_EXTERNA", label: "Carga Externa" },
    { value: "EMERGENCIAS", label: "Emergencias" },
    { value: "INCENDIOS", label: "Incendios" },
    { value: "CFIT", label: "CFIT" },
    { value: "VUELO_ZONA_HOSTIL", label: "Vuelo en Zona Hostil" }
  ]

  const getDisciplineLabel = (discipline: string) => {
    const disc = trainingDisciplines.find(d => d.value === discipline)
    return disc ? disc.label : discipline
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
    fetchHelicopters()
  }, [])

  useEffect(() => {
    let filtered = trainings.filter(training =>
      training.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (training.helicopter?.model.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (training.location || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedDiscipline !== "all") {
      filtered = filtered.filter(training => training.discipline === selectedDiscipline)
    }

    setFilteredTrainings(filtered)
  }, [trainings, searchTerm, selectedDiscipline])

  const fetchHelicopters = async () => {
    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/helicopters`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHelicopters(data);
      }
    } catch (error) {
      console.error("Error fetching helicopters:", error);
    }
  };

  const fetchTrainings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("ibex_access_token")
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) {
        console.error("No user data found in localStorage")
        return
      }

      const user = JSON.parse(userStr)
      console.log("User data:", user)
      console.log("Pilot ID:", user.pilot?.id)

      if (!user.pilot?.id) {
        console.error("User does not have a pilot ID")
        return
      }

      const url = `${import.meta.env.VITE_API_URL}/practical-trainings?pilotId=${user.pilot.id}`
      console.log("Fetching trainings from:", url)

      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("Trainings received:", data)
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
      let documentUrl = formData.documentUrl;

      // Upload file if selected
      if (selectedFile) {
        documentUrl = await uploadFileToFirebase(selectedFile);
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
          discipline: formData.discipline,
          trainingDate: formData.trainingDate,
          helicopterId: formData.helicopterId ? parseInt(formData.helicopterId) : undefined,
          instructor: formData.instructor,
          duration: formData.duration,
          location: formData.location,
          weatherConditions: formData.weatherConditions,
          performance: formData.performance,
          remarks: formData.remarks,
          documentUrl
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
      discipline: "",
      trainingDate: "",
      helicopterId: "",
      instructor: "",
      duration: 0,
      location: "",
      weatherConditions: "",
      performance: "",
      remarks: "",
      documentUrl: ""
    })
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
  }

  const handleDelete = async (trainingId: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este entrenamiento práctico?')) {
      return
    }

    try {
      const token = localStorage.getItem("ibex_access_token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/practical-trainings/${trainingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Refresh trainings list
        fetchTrainings()
      } else {
        console.error('Error deleting training:', response.statusText)
        alert('Error al eliminar el entrenamiento práctico')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al eliminar el entrenamiento práctico')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mi Entrenamiento Práctico</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consulta tu historial de entrenamientos prácticos</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Entrenamientos</h3>
              <p className="text-2xl font-bold text-blue-600">{trainings.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Horas Totales</h3>
              <p className="text-2xl font-bold text-green-600">
                {trainings.reduce((sum, t) => sum + t.duration, 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Plane className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Disciplinas</h3>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(trainings.map(t => t.discipline)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
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
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
          >
            <option value="all">Todas las disciplinas</option>
            {trainingDisciplines.map(disc => (
              <option key={disc.value} value={disc.value}>{disc.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <div key={training.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 border-l-4 border-blue-500`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{getDisciplineLabel(training.discipline)}</h3>
                {training.helicopter && (
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {training.helicopter.model.name} - {training.helicopter.registration}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(training.id)}
                className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="Eliminar entrenamiento"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Instructor: {training.instructor}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Fecha: {new Date(training.trainingDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Próxima: {new Date(training.nextDueDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Duración: {training.duration} horas
                </span>
              </div>

              {training.location && (
                <div className="flex items-center text-sm">
                  <Plane className="w-4 h-4 mr-2 text-gray-400" />
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Ubicación: {training.location}
                  </span>
                </div>
              )}

              {training.performance && (
                <div className="text-sm">
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Desempeño:
                  </p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                    {training.performance}
                  </p>
                </div>
              )}

              {training.remarks && (
                <div className="text-sm">
                  <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Observaciones:
                  </p>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                    {training.remarks}
                  </p>
                </div>
              )}
            </div>

            {training.documentUrl && (
              <div className="mt-4">
                <a
                  href={training.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Ver documento
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTrainings.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No se encontraron entrenamientos
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || selectedDiscipline !== "all"
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
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Nuevo Entrenamiento Práctico</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Disciplina *
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar disciplina</option>
                    {trainingDisciplines.map(disc => (
                      <option key={disc.value} value={disc.value}>{disc.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fecha de Entrenamiento *
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.trainingDate}
                    onChange={(e) => setFormData({ ...formData, trainingDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Instructor *
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Duración (horas) *
                  </label>
                  <input
                    type="number"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Helicóptero (opcional)
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.helicopterId}
                    onChange={(e) => setFormData({ ...formData, helicopterId: e.target.value })}
                  >
                    <option value="">Seleccionar helicóptero</option>
                    {helicopters.map(heli => (
                      <option key={heli.id} value={heli.id}>
                        {heli.registration} - {heli.model?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ubicación
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Condiciones Climáticas
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  value={formData.weatherConditions}
                  onChange={(e) => setFormData({ ...formData, weatherConditions: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Desempeño
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  value={formData.performance}
                  onChange={(e) => setFormData({ ...formData, performance: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observaciones
                </label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Documento (PDF, Word, JPG, PNG - máx 50MB)
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,.jpg,.jpeg,image/png,.png,image/gif,.gif,image/webp,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="doc-upload"
                  />
                  <label
                    htmlFor="doc-upload"
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
                  {loading ? "Guardando..." : "Guardar"}
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
