import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  FileText,
  Eye,
} from "lucide-react";

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

const PilotLibrary = ({ darkMode }: LibraryProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<{category: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/library`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
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

  useEffect(() => {
    fetchDocuments();
    fetchCategories();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || doc.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Tamaño desconocido";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FileText className="h-8 w-8 text-red-500" />;
    } else if (fileType.includes("image")) {
      return <FileText className="h-8 w-8 text-green-500" />;
    } else if (fileType.includes("word")) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else {
      return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className={`mt-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
            Cargando documentos...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>
              Biblioteca
            </h1>
            <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
              Accede a manuales, procedimientos y documentación oficial
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Documentos</h3>
              <p className="text-2xl font-bold text-blue-600">{documents.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Filter className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Categorías</h3>
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Search className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Resultados</h3>
              <p className="text-2xl font-bold text-yellow-600">{filteredDocuments.length}</p>
            </div>
          </div>
        </div>

        <div className={`${darkMode ? "bg-gray-800" : "bg-white"} p-6 rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <Download className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Disponibles</h3>
              <p className="text-2xl font-bold text-purple-600">
                {documents.filter(d => d.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-lg shadow p-4`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              className={`pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`${
              darkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg shadow-sm p-6 border-l-4 border-orange-500 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getFileIcon(doc.fileType)}
                <div className="ml-3">
                  <h3 className="font-semibold text-lg mb-1">{doc.name}</h3>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {doc.category}
                  </p>
                </div>
              </div>
            </div>

            {doc.description && (
              <p className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {doc.description}
              </p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Tamaño:</span>
                <span>{formatFileSize(doc.fileSize)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Subido por:</span>
                <span>{doc.uploader.firstName} {doc.uploader.lastName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Fecha:</span>
                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <a
                href={doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </a>
              <a
                href={doc.fileUrl}
                download
                className={`flex items-center justify-center px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  darkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className={`mx-auto h-12 w-12 ${darkMode ? "text-gray-400" : "text-gray-300"}`} />
          <h3 className={`mt-2 text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
            No se encontraron documentos
          </h3>
          <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {searchTerm || selectedCategory !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "No hay documentos disponibles en este momento"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PilotLibrary;