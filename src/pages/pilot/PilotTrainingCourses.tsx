"use client"

import { useState, useEffect } from "react"
import { Search, Calendar, Clock, User, BookOpen, Plus, Upload, FileText } from "lucide-react"
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

interface PilotTrainingCoursesProps {
  darkMode: boolean
}

const PilotTrainingCourses = ({ darkMode }: PilotTrainingCoursesProps) => {
  const [courses, setCourses] = useState<TrainingCourse[]>([])
  const [filteredCourses, setFilteredCourses] = useState<TrainingCourse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    instructor: "",
    startDate: "",
    endDate: "",
    duration: 0,
    category: "",
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
  }, [])

  useEffect(() => {
    let filtered = courses.filter(course =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.courseType.toLowerCase().includes(searchTerm.toLowerCase())
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
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/training-courses?pilotId=${user.pilot?.id}`, {
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
      const userStr = localStorage.getItem("ibex_user")
      if (!userStr) return

      const user = JSON.parse(userStr)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/training-courses`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          pilotId: user.pilot?.id,
          courseType: formData.category,
          courseName: formData.name,
          provider: formData.description,
          completionDate: formData.startDate,
          expiryDate: formData.endDate,
          certificateNumber: "",
          instructor: formData.instructor,
          duration: formData.duration,
          documentUrl,
          score: null
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

  const openModal = () => {
    setFormData({
      name: "",
      description: "",
      instructor: "",
      startDate: "",
      endDate: "",
      duration: 0,
      category: "",
      documentUrl: ""
    })
    setSelectedFile(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedFile(null)
  }

  const validCourses = courses.filter(c => new Date(c.expiryDate) > new Date())
  const expiredCourses = courses.filter(c => new Date(c.expiryDate) <= new Date())
  const expiringSoonCourses = courses.filter(c => {
    const expiryDate = new Date(c.expiryDate)
    const now = new Date()
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return expiryDate <= thirtyDaysFromNow && expiryDate > now
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Mis Cursos de Capacitación</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Consulta tu historial de cursos y capacitaciones</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Curso
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <h3 className="text-lg font-semibold">Por Vencer</h3>
              <p className="text-2xl font-bold text-yellow-600">{expiringSoonCourses.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Vencidos</h3>
              <p className="text-2xl font-bold text-red-600">{expiredCourses.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <User className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Vigentes</h3>
              <p className="text-2xl font-bold text-green-600">{validCourses.length}</p>
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
              placeholder="Buscar cursos..."
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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isExpired = new Date(course.expiryDate) < new Date()
          const isExpiringSoon = new Date(course.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && !isExpired

          return (
          <div key={course.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 border-l-4 ${
            isExpired ? 'border-red-500' :
            isExpiringSoon ? 'border-yellow-500' : 'border-green-500'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">{course.courseName}</h3>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {categories.find(cat => cat.value === course.courseType)?.label || course.courseType}
                </p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
                isExpired ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                isExpiringSoon ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {isExpired ? 'Vencido' : isExpiringSoon ? 'Por vencer' : 'Vigente'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Instructor: {course.instructor}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Completado: {new Date(course.completionDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} ${
                  isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-yellow-600 font-semibold' : ''
                }`}>
                  Vence: {new Date(course.expiryDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  Duración: {course.duration} horas
                </span>
              </div>

              {course.score && (
                <div className="text-sm">
                  <span className={`font-medium ${
                    course.score >= 80 ? 'text-green-600' :
                    course.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    Calificación: {course.score}%
                  </span>
                </div>
              )}

              <div className="text-sm">
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Proveedor: {course.provider}
                </p>
              </div>
            </div>

            {course.documentUrl && (
              <div className="mt-4">
                <a
                  href={course.documentUrl}
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
        )})}
      </div>

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
          <h3 className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            No se encontraron cursos
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || selectedCategory !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no tienes cursos registrados"
            }
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto`}>
            <h2 className="text-2xl font-bold mb-4">Nuevo Curso</h2>

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

                <div>
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
                <label className="block text-sm font-medium mb-2">Proveedor/Descripción</label>
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

export default PilotTrainingCourses