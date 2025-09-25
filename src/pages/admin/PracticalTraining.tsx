"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Calendar, Clock, User, Plane, Upload, X, FileText, ExternalLink } from "lucide-react"
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

interface PracticalTrainingProps {
  darkMode: boolean
}

const PracticalTraining = ({ darkMode }: PracticalTrainingProps) => {
  const [trainings, setTrainings] = useState<PracticalTraining[]>([])
  const [filteredTrainings, setFilteredTrainings] = useState<PracticalTraining[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<PracticalTraining | null>(null)
  const [editingTraining, setEditingTraining] = useState<PracticalTraining | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [pilots, setPilots] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    pilotId: "",
    discipline: "",
    trainingDate: "",
    instructor: "",
    duration: 0,
    remarks: "",
    documentUrl: ""
  })

  const trainingDisciplines = [
    { value: "CARGA_EXTERNA", label: "Carga Externa" },
    { value: "EMERGENCIAS", label: "Emergencias" },
    { value: "INCENDIOS", label: "Incendios" },
    { value: "CFIT", label: "CFIT" },
    { value: "VUELO_ZONA_HOSTIL", label: "Vuelo en Zona Hostil" },
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

  const fetchPilots = async () => {
    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pilots`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPilots(data);
      }
    } catch (error) {
      console.error("Error fetching pilots:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (50MB max)
      const maxSize = 50 * 1024 * 1024; // 50MB in bytes
      if (file.size > maxSize) {
        alert('El archivo excede el tamaño máximo permitido de 50MB');
        event.target.value = ''; // Clear the input
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

  const openDetailModal = (training: PracticalTraining) => {
    setSelectedTraining(training);
    setShowDetailModal(true);
  };

  const getFileIcon = (url?: string) => {
    if (!url) return <FileText className="h-5 w-5 text-gray-400" />;

    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  useEffect(() => {
    fetchTrainings()
    fetchPilots()
  }, [])

  useEffect(() => {
    let filtered = trainings.filter(training =>
      `${training.pilot.user.firstName} ${training.pilot.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.discipline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      training.helicopter?.model?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    setFilteredTrainings(filtered)
  }, [trainings, searchTerm])

  const fetchTrainings = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("ibex_access_token")
      const response = await fetch("http://localhost:8080/practical-trainings", {
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
      const token = localStorage.getItem("ibex_access_token")
      const url = editingTraining
        ? `http://localhost:8080/practical-trainings/${editingTraining.id}`
        : "http://localhost:8080/practical-trainings"

      const method = editingTraining ? "PUT" : "POST"

      let documentUrl = formData.documentUrl;

      // Upload file if selected
      if (selectedFile) {
        documentUrl = await uploadFileToFirebase(selectedFile);
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pilotId: parseInt(formData.pilotId),
          discipline: formData.discipline,
          trainingDate: formData.trainingDate,
          helicopterId: null, // Como quitamos el selector, enviamos null
          instructor: formData.instructor,
          duration: formData.duration,
          location: "", // Campo vacío
          weatherConditions: "", // Campo vacío
          performance: "", // Campo vacío
          remarks: formData.remarks || "",
          documentUrl
        })
      })

      if (response.ok) {
        await fetchTrainings()
        closeModal()
      } else {
        console.error("Error saving training:", response.statusText)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este entrenamiento?")) {
      try {
        const token = localStorage.getItem("ibex_access_token")
        const response = await fetch(`http://localhost:8080/practical-trainings/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          await fetchTrainings()
        } else {
          console.error("Error deleting training:", response.statusText)
        }
      } catch (error) {
        console.error("Error:", error)
      }
    }
  }

  const openModal = (training?: PracticalTraining) => {
    if (training) {
      setEditingTraining(training)
      setFormData({
        pilotId: training.pilotId.toString(),
        discipline: training.discipline || "",
        trainingDate: training.trainingDate.split('T')[0],
        instructor: training.instructor,
        duration: training.duration,
        remarks: training.remarks || "",
        documentUrl: training.documentUrl || ""
      })
    } else {
      setEditingTraining(null)
      setFormData({
        pilotId: "",
        discipline: "",
        trainingDate: "",
        instructor: "",
        duration: 0,
        remarks: "",
        documentUrl: ""
      })
    }
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTraining(null)
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Entrenamiento Práctico</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestiona las sesiones de entrenamiento práctico de vuelo
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              <h3 className="text-lg font-semibold">Por Vencer</h3>
              <p className="text-2xl font-bold text-yellow-600">
                {trainings.filter(t => new Date(t.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && new Date(t.nextDueDate) >= new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Vencidos</h3>
              <p className="text-2xl font-bold text-red-600">
                {trainings.filter(t => new Date(t.nextDueDate) < new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Vigentes</h3>
              <p className="text-2xl font-bold text-green-600">
                {trainings.filter(t => new Date(t.nextDueDate) > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar entrenamientos..."
            className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>


        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Entrenamiento
        </button>
      </div>

      {/* Trainings Table */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Piloto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Instructor
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Disciplina
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Fechas
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Observaciones
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredTrainings.map((training) => (
                <tr
                  key={training.id}
                  className={`cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  onClick={() => openDetailModal(training)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">
                        {training.pilot.user.firstName} {training.pilot.user.lastName}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Licencia: {training.pilot.licenseNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {training.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="font-medium">{training.discipline}</div>
                      {training.helicopter && (
                        <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                          {training.helicopter.registration} - {training.helicopter.model.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div>Realizado: {new Date(training.trainingDate).toLocaleDateString()}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Próximo: {new Date(training.nextDueDate).toLocaleDateString()}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {training.duration}h de vuelo
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        new Date(training.nextDueDate) < new Date()
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : new Date(training.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {
                          new Date(training.nextDueDate) < new Date()
                            ? 'Vencido'
                            : new Date(training.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                              ? 'Por vencer'
                              : 'Vigente'
                        }
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {training.remarks ? (
                      <div className="max-w-xs truncate" title={training.remarks}>
                        {training.remarks}
                      </div>
                    ) : (
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                        Sin observaciones
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(training)}
                        className="text-orange-600 hover:text-orange-900 dark:hover:text-orange-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(training.id.toString())}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">
              {editingTraining ? "Editar Entrenamiento" : "Nuevo Entrenamiento"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Piloto</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.pilotId}
                    onChange={(e) => setFormData({ ...formData, pilotId: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar piloto</option>
                    {pilots.map((pilot) => (
                      <option key={pilot.id} value={pilot.id}>
                        {pilot.user.firstName} {pilot.user.lastName} - {pilot.licenseNumber}
                      </option>
                    ))}
                  </select>
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
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Nombre del instructor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Disciplina de Entrenamiento</label>
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
                    {trainingDisciplines.map(discipline => (
                      <option key={discipline.value} value={discipline.value}>{discipline.label}</option>
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
                    onChange={(e) => setFormData({ ...formData, duration: parseFloat(e.target.value) })}
                    min="0.5"
                    step="0.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Entrenamiento</label>
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


              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Observaciones</label>
                  <textarea
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows={3}
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Observaciones adicionales sobre el entrenamiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Documento (PDF, Word, JPG, PNG - máx 50MB)</label>
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    darkMode ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="training-doc-upload"
                    />
                    <label
                      htmlFor="training-doc-upload"
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
                            PDF, Word, JPG, PNG
                          </p>
                        </>
                      )}
                    </label>
                    {formData.documentUrl && !selectedFile && (
                      <div className="mt-4 flex items-center justify-center space-x-2">
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Documento actual:
                        </span>
                        <a
                          href={formData.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 hover:text-orange-700 text-sm flex items-center space-x-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Ver documento</span>
                        </a>
                      </div>
                    )}
                  </div>
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
                  {loading ? "Guardando..." : (editingTraining ? "Actualizar" : "Crear")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTraining && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Detalle del Entrenamiento Práctico</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`text-gray-400 hover:text-gray-600 ${darkMode ? 'hover:text-gray-200' : ''}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Piloto</h3>
                  <p className="mt-1">
                    {selectedTraining.pilot.user.firstName} {selectedTraining.pilot.user.lastName}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Licencia: {selectedTraining.pilot.licenseNumber}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Disciplina</h3>
                  <p className="mt-1 font-semibold">
                    {trainingDisciplines.find(d => d.value === selectedTraining.discipline)?.label || selectedTraining.discipline}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor</h3>
                  <p className="mt-1">{selectedTraining.instructor}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duración</h3>
                  <p className="mt-1">{selectedTraining.duration} horas</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Entrenamiento</h3>
                  <p className="mt-1">{new Date(selectedTraining.trainingDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Próxima Fecha Requerida</h3>
                  <p className={`mt-1 ${
                    new Date(selectedTraining.nextDueDate) < new Date()
                      ? 'text-red-600 font-semibold'
                      : new Date(selectedTraining.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'text-yellow-600 font-semibold'
                        : 'text-green-600'
                  }`}>
                    {new Date(selectedTraining.nextDueDate).toLocaleDateString()}
                    {new Date(selectedTraining.nextDueDate) < new Date() && ' (VENCIDO)'}
                    {new Date(selectedTraining.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) &&
                     new Date(selectedTraining.nextDueDate) >= new Date() && ' (PRÓXIMO A VENCER)'}
                  </p>
                </div>

                {selectedTraining.helicopter && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Helicóptero</h3>
                    <p className="mt-1">
                      {selectedTraining.helicopter.registration} - {selectedTraining.helicopter.model.name}
                    </p>
                  </div>
                )}
              </div>

              {selectedTraining.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Ubicación</h3>
                  <p className="mt-1">{selectedTraining.location}</p>
                </div>
              )}

              {selectedTraining.weatherConditions && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Condiciones Climáticas</h3>
                  <p className="mt-1">{selectedTraining.weatherConditions}</p>
                </div>
              )}

              {selectedTraining.performance && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Rendimiento</h3>
                  <p className="mt-1">{selectedTraining.performance}</p>
                </div>
              )}

              {selectedTraining.remarks && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Observaciones</h3>
                  <p className="mt-1">{selectedTraining.remarks}</p>
                </div>
              )}

              {selectedTraining.documentUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Documento</h3>
                  <a
                    href={selectedTraining.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-700"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Ver documento</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  new Date(selectedTraining.nextDueDate) < new Date()
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : new Date(selectedTraining.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {
                    new Date(selectedTraining.nextDueDate) < new Date()
                      ? 'Vencido'
                      : new Date(selectedTraining.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'Próximo a vencer'
                        : 'Vigente'
                  }
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  setShowDetailModal(false)
                  openModal(selectedTraining)
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Editar
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  darkMode
                    ? 'border-gray-600 text-gray-300'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticalTraining