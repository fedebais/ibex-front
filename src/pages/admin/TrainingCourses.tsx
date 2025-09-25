"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, Calendar, Clock, User, BookOpen, Upload, X, FileText, ExternalLink } from "lucide-react"
import { uploadFile } from "../../firebase/storage"

interface TrainingCourse {
  id: number
  pilotId: number
  courseType: string
  courseName: string
  provider: string
  completionDate: string
  expiryDate: string
  certificateNumber?: string
  instructor: string
  duration: number
  documentUrl?: string
  score?: number
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
}

interface TrainingCoursesProps {
  darkMode: boolean
}

const TrainingCourses = ({ darkMode }: TrainingCoursesProps) => {
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<TrainingCourse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null)
  const [editingCourse, setEditingCourse] = useState<TrainingCourse | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [pilots, setPilots] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructor: "",
    startDate: "",
    endDate: "",
    duration: 0,
    category: "",
    pilotId: "",
    documentUrl: ""
  })

  const categories = [
    { value: "CRM", label: "CRM (Anual)" },
    { value: "AVSEC", label: "AVSEC (Bienal)" },
    { value: "MERCANCIAS_PELIGROSAS", label: "Mercancías Peligrosas (Bienal)" },
    { value: "MOE", label: "MOE (Anual)" },
    { value: "PSICOFISICO_CLASE_1", label: "Psicofísico Clase 1 (CMA)" },
    { value: "PSICOFISICO_CLASE_2", label: "Psicofísico Clase 2 (CMA)" },
    { value: "PSICOFISICO_CLASE_3", label: "Psicofísico Clase 3 (CMA)" },
    { value: "PSICOFISICO_CLASE_4", label: "Psicofísico Clase 4 (CMA)" }
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
    const fileName = `training-courses/${timestamp}_${file.name}`;
    return await uploadFile(file, fileName);
  };

  useEffect(() => {
    fetchCourses()
    fetchPilots()
  }, [])

  useEffect(() => {
    let filtered = courses.filter(course =>
      (course.courseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.instructor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.courseType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.pilot?.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.pilot?.user?.lastName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.courseType === selectedCategory)
    }

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedCategory])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("ibex_access_token")
      const response = await fetch(`${import.meta.env.VITE_API_URL}/training-courses`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      } else {
        console.error("Error fetching training courses:", response.statusText)
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
      const url = editingCourse
        ? `${import.meta.env.VITE_API_URL}/training-courses/${editingCourse.id}`
        : `${import.meta.env.VITE_API_URL}/training-courses`

      const method = editingCourse ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pilotId: parseInt(formData.pilotId),
          courseType: formData.category,
          courseName: formData.name,
          provider: formData.instructor, // Usamos instructor como provider por ahora
          completionDate: formData.startDate,
          expiryDate: formData.endDate,
          certificateNumber: "", // Campo vacío por ahora
          instructor: formData.instructor,
          duration: formData.duration,
          documentUrl,
          score: null // Campo opcional
        })
      })

      if (response.ok) {
        await fetchCourses()
        closeModal()
      } else {
        const errorData = await response.json().catch(() => ({ message: response.statusText }))
        console.error("Error saving course:", errorData)
        alert(`Error al guardar el curso: ${errorData.message || response.statusText}`)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este curso?")) {
      try {
        const token = localStorage.getItem("ibex_access_token")
        const response = await fetch(`${import.meta.env.VITE_API_URL}/training-courses/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if (response.ok) {
          await fetchCourses()
        } else {
          console.error("Error deleting course:", response.statusText)
        }
      } catch (error) {
        console.error("Error:", error)
      }
    }
  }

  const openModal = (course?: TrainingCourse) => {
    if (course) {
      setEditingCourse(course)
      setFormData({
        name: course.courseName,
        description: course.provider, // Usamos provider como descripción
        instructor: course.instructor,
        startDate: course.completionDate.split('T')[0],
        endDate: course.expiryDate.split('T')[0],
        duration: course.duration,
        category: course.courseType,
        pilotId: course.pilotId.toString(),
        documentUrl: course.documentUrl || ""
      })
    } else {
      setEditingCourse(null)
      setFormData({
        name: "",
        description: "",
        instructor: "",
        startDate: "",
        endDate: "",
        duration: 0,
        category: "",
        pilotId: "",
        documentUrl: ""
      })
    }
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const openDetailModal = (course: TrainingCourse) => {
    setSelectedCourse(course)
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedCourse(null)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
    setSelectedFile(null)
  }

  const getProgressPercentage = (current: number, max: number) => {
    return max > 0 ? (current / max) * 100 : 0
  }

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cursos de Capacitación</h1>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Gestiona los cursos de capacitación y entrenamiento del personal
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Cursos</h3>
              <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">En Progreso</h3>
              <p className="text-2xl font-bold text-yellow-600">
                0
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Programados</h3>
              <p className="text-2xl font-bold text-blue-600">
                0
              </p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Completados</h3>
              <p className="text-2xl font-bold text-green-600">
                {courses.length}
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
            placeholder="Buscar cursos..."
            className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              darkMode
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
            darkMode
              ? 'bg-gray-800 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>{category.label}</option>
          ))}
        </select>

        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Curso
        </button>
      </div>

      {/* Courses Table */}
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
                  Curso
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Instructor
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
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`${darkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {filteredCourses.map((course) => {
                const isExpired = new Date(course.expiryDate) < new Date();
                const isExpiringSoon = new Date(course.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                <tr
                  key={course.id}
                  className={`cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
                  onClick={() => openDetailModal(course)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">
                        {course.pilot.user.firstName} {course.pilot.user.lastName}
                      </div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        Licencia: {course.pilot.licenseNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">{course.courseName}</div>
                      <div className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {categories.find(cat => cat.value === course.courseType)?.label || course.courseType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div>Completado: {new Date(course.completionDate).toLocaleDateString()}</div>
                      <div className={`text-xs flex items-center space-x-1 ${
                        isExpired
                          ? 'text-red-600'
                          : isExpiringSoon
                            ? 'text-yellow-600'
                            : darkMode
                              ? 'text-gray-300'
                              : 'text-gray-500'
                      }`}>
                        <span>Vence: {new Date(course.expiryDate).toLocaleDateString()}</span>
                        {isExpired && <span className="text-red-600 font-semibold">(VENCIDO)</span>}
                        {isExpiringSoon && !isExpired && <span className="text-yellow-600 font-semibold">(PRÓXIMO A VENCER)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isExpired
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : isExpiringSoon
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {isExpired ? 'Vencido' : isExpiringSoon ? 'Por vencer' : 'Vigente'}
                      </span>
                      {course.score && (
                        <span className={`text-xs font-medium ${
                          course.score >= 80 ? 'text-green-600' :
                          course.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {course.score}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(course)}
                        className="text-orange-600 hover:text-orange-900 dark:hover:text-orange-400"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id.toString())}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">
              {editingCourse ? "Editar Curso" : "Nuevo Curso"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Curso</label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

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
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Vencimiento</label>
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
                    min="1"
                    required
                  />
                </div>


                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Categoría</label>
                  <select
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium mb-2">Documento (PDF, Word, JPG, PNG - máx 50MB)</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  darkMode ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <input
                    type="file"
                    accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,.jpg,.jpeg,image/png,.png,image/gif,.gif,image/webp,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="course-doc-upload"
                  />
                  <label
                    htmlFor="course-doc-upload"
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
                  {loading ? "Guardando..." : (editingCourse ? "Actualizar" : "Crear")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Detalle del Curso</h2>
              <button
                onClick={closeDetailModal}
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
                    {selectedCourse.pilot.user.firstName} {selectedCourse.pilot.user.lastName}
                  </p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Licencia: {selectedCourse.pilot.licenseNumber}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Curso</h3>
                  <p className="mt-1 font-semibold">{selectedCourse.courseName}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {categories.find(cat => cat.value === selectedCourse.courseType)?.label || selectedCourse.courseType}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructor</h3>
                  <p className="mt-1">{selectedCourse.instructor}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Proveedor</h3>
                  <p className="mt-1">{selectedCourse.provider}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Completación</h3>
                  <p className="mt-1">{new Date(selectedCourse.completionDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Vencimiento</h3>
                  <p className="mt-1">{new Date(selectedCourse.expiryDate).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Duración</h3>
                  <p className="mt-1">{selectedCourse.duration} horas</p>
                </div>

                {selectedCourse.certificateNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Número de Certificado</h3>
                    <p className="mt-1">{selectedCourse.certificateNumber}</p>
                  </div>
                )}

                {selectedCourse.score && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Calificación</h3>
                    <p className={`mt-1 font-semibold ${
                      selectedCourse.score >= 80 ? 'text-green-600' :
                      selectedCourse.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {selectedCourse.score}%
                    </p>
                  </div>
                )}
              </div>

              {selectedCourse.documentUrl && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Documento</h3>
                  <a
                    href={selectedCourse.documentUrl}
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
                  new Date(selectedCourse.expiryDate) < new Date()
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : new Date(selectedCourse.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {
                    new Date(selectedCourse.expiryDate) < new Date()
                      ? 'Vencido'
                      : new Date(selectedCourse.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        ? 'Próximo a vencer'
                        : 'Vigente'
                  }
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                onClick={() => {
                  closeDetailModal()
                  openModal(selectedCourse)
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Editar
              </button>
              <button
                onClick={closeDetailModal}
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

export default TrainingCourses