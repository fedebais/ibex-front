import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  Filter,
  FileText,
  X,
  Upload,
} from "lucide-react";
import { uploadFile } from "../../firebase/storage";

interface LibraryProps {
  darkMode?: boolean;
}

interface Document {
  id: number;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  category: string;
  active: boolean;
  createdAt: string;
  uploader: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const Library = ({ darkMode }: LibraryProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<{category: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    fileUrl: "",
    fileType: "",
    fileSize: "",
    category: "",
  });

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ibex_access_token");
      const params = new URLSearchParams();

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/library?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error("Error fetching documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/library/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const token = localStorage.getItem("ibex_access_token");
      let fileUrl = formData.fileUrl;

      // If creating a new document and a file is selected, upload it first
      if (!showEditModal && selectedFile) {
        try {
          fileUrl = await uploadFileToFirebase(selectedFile);
        } catch (uploadError) {
          console.error("Error uploading file:", uploadError);
          alert("Error al subir el archivo. Por favor, intenta de nuevo.");
          setUploading(false);
          return;
        }
      }

      const documentData = {
        ...formData,
        fileUrl,
        fileSize: selectedFile ? selectedFile.size.toString() : formData.fileSize,
      };

      const url = showEditModal
        ? `${import.meta.env.VITE_API_URL}/library/${selectedDocument?.id}`
        : `${import.meta.env.VITE_API_URL}/library`;

      const response = await fetch(url, {
        method: showEditModal ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(documentData),
      });

      if (response.ok) {
        fetchDocuments();
        fetchCategories();
        closeModal();
        alert(
          showEditModal
            ? "Documento actualizado exitosamente"
            : "Documento subido exitosamente"
        );
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Error al procesar el documento");
      }
    } catch (error) {
      console.error("Error submitting document:", error);
      alert("Error al procesar el documento");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este documento?")) {
      try {
        const token = localStorage.getItem("ibex_access_token");
        const response = await fetch(`${import.meta.env.VITE_API_URL}/library/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchDocuments();
          fetchCategories();
          alert("Documento eliminado exitosamente");
        } else {
          alert("Error al eliminar el documento");
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Error al eliminar el documento");
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      name: "",
      description: "",
      fileUrl: "",
      fileType: "",
      fileSize: "",
      category: "",
    });
    setSelectedFile(null);
    setShowAddModal(true);
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
      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name.split('.')[0], // Auto-fill name if empty
        fileType: file.type,
        fileSize: file.size.toString()
      }));
    }
  };

  const uploadFileToFirebase = async (file: File): Promise<string> => {
    const timestamp = new Date().getTime();
    const fileName = `library/${timestamp}_${file.name}`;
    return await uploadFile(file, fileName);
  };

  const openEditModal = (document: Document) => {
    setSelectedDocument(document);
    setFormData({
      name: document.name,
      description: document.description || "",
      fileUrl: document.fileUrl,
      fileType: document.fileType,
      fileSize: document.fileSize?.toString() || "",
      category: document.category,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedDocument(null);
    setSelectedFile(null);
    setUploading(false);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Biblioteca de Documentos
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Gestión de documentos y archivos de la empresa
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Subir Documento</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Cards */}
      {loading ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Cargando documentos...
            </p>
          </div>
        </div>
      ) : documents.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-8`}>
          <div className="text-center">
            <FileText className={`h-16 w-16 mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-300'}`} />
            <p className={`mt-4 text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No se encontraron documentos
            </p>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Los documentos que agregues aparecerán aquí
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow hover:shadow-lg transition-shadow p-6`}>
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  {getFileIcon(doc.fileType)}
                  <div className="ml-3 flex-1">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} line-clamp-1`}>
                      {doc.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full mt-1 inline-block ${
                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {doc.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Content */}
              {doc.description && (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-3`}>
                  {doc.description}
                </p>
              )}

              {/* Card Meta */}
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-4 space-y-1`}>
                <div className="flex justify-between">
                  <span>Subido por:</span>
                  <span className="font-medium">{doc.uploader.firstName} {doc.uploader.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tamaño:</span>
                  <span>{formatFileSize(doc.fileSize)}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-md hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  title="Descargar"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Ver
                </button>
                <button
                  onClick={() => openEditModal(doc)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  title="Editar"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {showEditModal ? "Editar Documento" : "Subir Documento"}
                </h2>
                <button
                  onClick={closeModal}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Nombre del Documento
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Descripción del documento..."
                />
              </div>

              {/* File Upload Section - Only for new documents */}
              {!showEditModal && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Subir Archivo
                  </label>
                  <div className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
                    darkMode
                      ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                  } transition-colors`}>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,.jpg,.jpeg,image/png,.png,image/gif,.gif,image/webp,.webp,.txt,.xls,.xlsx,.ppt,.pptx"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedFile ? selectedFile.name : "Haz clic para seleccionar un archivo o arrastra aquí"}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      PDF, Word, Excel, PPT, JPG, PNG, GIF, WEBP (máx. 50MB)
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="Manuales de Vuelo">Manuales de Vuelo</option>
                  <option value="Procedimientos de Seguridad">Procedimientos de Seguridad</option>
                  <option value="Mantenimiento">Mantenimiento</option>
                  <option value="Regulaciones">Regulaciones</option>
                  <option value="Entrenamiento">Entrenamiento</option>
                  <option value="Formularios">Formularios</option>
                  <option value="Políticas">Políticas</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    darkMode
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className={`px-4 py-2 text-white rounded-md transition-colors flex items-center space-x-2 ${
                    uploading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {uploading && (
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>
                    {uploading
                      ? (selectedFile ? "Subiendo..." : "Guardando...")
                      : (showEditModal ? "Actualizar" : "Subir")
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;