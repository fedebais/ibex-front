import { useState, useEffect } from "react";
import { Plus, Search, Upload, X, FileText, Eye, Download, ExternalLink, Calendar, User, Shield } from "lucide-react";
import { uploadFile } from "../../firebase/storage";

interface QualificationsProps {
  darkMode?: boolean;
}

interface Qualification {
  id: number;
  pilotId: number;
  type: string;
  certificateNumber?: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  issuingAuthority: string;
  documentUrl?: string;
  active: boolean;
  createdAt: string;
  pilot: {
    id: number;
    licenseNumber: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

const QUALIFICATION_TYPES = [
  { value: "COMPETENCIA_LINGUISTICA", label: "Competencia Lingüística" },
  { value: "RADIOTELEFONISTA_RESTRINGIDO", label: "Radiotelefonista Restringido" },
  { value: "CONDUCTOR_B2", label: "Conductor B2" },
  { value: "CONDUCTOR_PROFESIONAL", label: "Conductor Profesional" },
];

const Qualifications = ({ darkMode }: QualificationsProps) => {
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [filteredQualifications, setFilteredQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<Qualification | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pilots, setPilots] = useState<any[]>([]);
  const [filterPilot, setFilterPilot] = useState("");
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    pilotId: "",
    type: "",
    certificateNumber: "",
    description: "",
    issueDate: "",
    expiryDate: "",
    issuingAuthority: "",
    documentUrl: "",
  });

  const fetchQualifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/qualifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQualifications(data);
        setFilteredQualifications(data);
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    } finally {
      setLoading(false);
    }
  };

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
    const fileName = `qualifications/${timestamp}_${file.name}`;
    return await uploadFile(file, fileName);
  };

  const handleSubmit = async () => {
    try {
      let documentUrl = formData.documentUrl;

      // Upload file if selected
      if (selectedFile) {
        documentUrl = await uploadFileToFirebase(selectedFile);
      }

      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/qualifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pilotId: parseInt(formData.pilotId),
          documentUrl,
        }),
      });

      if (response.ok) {
        setShowAddModal(false);
        setFormData({
          pilotId: "",
          type: "",
          certificateNumber: "",
          description: "",
          issueDate: "",
          expiryDate: "",
          issuingAuthority: "",
          documentUrl: "",
        });
        setSelectedFile(null);
        fetchQualifications();
      } else {
        alert("Error al crear la habilitación");
      }
    } catch (error) {
      console.error("Error creating qualification:", error);
      alert("Error al crear la habilitación");
    }
  };

  // Filter function
  const applyFilters = () => {
    let filtered = qualifications;

    if (filterPilot) {
      filtered = filtered.filter(q => q.pilotId.toString() === filterPilot);
    }

    if (filterType) {
      filtered = filtered.filter(q => q.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(q =>
        q.pilot.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.pilot.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (q.certificateNumber && q.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredQualifications(filtered);
  };

  const openDetailModal = (qualification: Qualification) => {
    setSelectedQualification(qualification);
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

  const getQualificationTypeLabel = (type: string) => {
    const qualType = QUALIFICATION_TYPES.find(qt => qt.value === type);
    return qualType ? qualType.label : type;
  };

  useEffect(() => {
    fetchQualifications();
    fetchPilots();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterPilot, filterType, searchTerm, qualifications]);

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} min-h-screen`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Habilitaciones
          </h1>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Gestión de habilitaciones y certificaciones de pilotos
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Plus className="h-5 w-5" />
          Agregar Habilitación
        </button>
      </div>

      {/* Filters */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4 mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por piloto, tipo, autoridad..."
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filtrar por Piloto
            </label>
            <select
              value={filterPilot}
              onChange={(e) => setFilterPilot(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Todos los pilotos</option>
              {pilots.map((pilot) => (
                <option key={pilot.id} value={pilot.id}>
                  {pilot.user.firstName} {pilot.user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Filtrar por Tipo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Todos los tipos</option>
              {QUALIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterPilot("");
                setFilterType("");
                setSearchTerm("");
              }}
              className={`px-4 py-2 rounded-lg ${
                darkMode
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Piloto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Tipo de Habilitación
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Autoridad Emisora
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Fecha Emisión
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Cargando habilitaciones...
                  </td>
                </tr>
              ) : filteredQualifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No se encontraron habilitaciones
                  </td>
                </tr>
              ) : (
                filteredQualifications.map((qualification) => (
                  <tr key={qualification.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {qualification.pilot.user.firstName} {qualification.pilot.user.lastName}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {qualification.pilot.licenseNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {getQualificationTypeLabel(qualification.type)}
                        </p>
                        {qualification.certificateNumber && (
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            #{qualification.certificateNumber}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {qualification.issuingAuthority}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(qualification.issueDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openDetailModal(qualification)}
                          className={`p-2 rounded-lg ${
                            darkMode ? 'hover:bg-gray-700 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                          }`}
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {qualification.documentUrl && (
                          <a
                            href={qualification.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-lg ${
                              darkMode ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-gray-100 text-green-600'
                            }`}
                            title="Descargar documento"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Agregar Nueva Habilitación
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-lg hover:bg-opacity-20 ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Piloto *
                </label>
                <select
                  value={formData.pilotId}
                  onChange={(e) => setFormData({ ...formData, pilotId: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tipo de Habilitación *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {QUALIFICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Número de Certificado
                </label>
                <input
                  type="text"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Autoridad Emisora *
                </label>
                <input
                  type="text"
                  value={formData.issuingAuthority}
                  onChange={(e) => setFormData({ ...formData, issuingAuthority: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de Emisión *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
            </div>

            <div className={`flex justify-end gap-4 p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowAddModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Guardar Habilitación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedQualification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`flex justify-between items-center p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-500" />
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Detalle de Habilitación
                </h2>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`p-2 rounded-lg hover:bg-opacity-20 ${
                  darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Pilot Info */}
              <div className={`bg-opacity-50 rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <User className="h-5 w-5 text-blue-500" />
                  <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Información del Piloto
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Nombre Completo
                    </p>
                    <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedQualification.pilot.user.firstName} {selectedQualification.pilot.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Número de Licencia
                    </p>
                    <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedQualification.pilot.licenseNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Qualification Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tipo de Habilitación
                  </h4>
                  <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getQualificationTypeLabel(selectedQualification.type)}
                  </p>
                </div>

                {selectedQualification.certificateNumber && (
                  <div>
                    <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Número de Certificado
                    </h4>
                    <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedQualification.certificateNumber}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Autoridad Emisora
                  </h4>
                  <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQualification.issuingAuthority}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-500" />
                  <div>
                    <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Fecha de Emisión
                    </h4>
                    <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatDate(selectedQualification.issueDate)}
                    </p>
                  </div>
                </div>

                {selectedQualification.expiryDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <div>
                      <h4 className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Fecha de Vencimiento
                      </h4>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(selectedQualification.expiryDate)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedQualification.description && (
                <div>
                  <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Descripción
                  </h4>
                  <p className={`text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedQualification.description}
                  </p>
                </div>
              )}

              {/* Document */}
              {selectedQualification.documentUrl && (
                <div className={`bg-opacity-50 rounded-lg p-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedQualification.documentUrl)}
                      <div>
                        <h4 className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                          Documento Adjunto
                        </h4>
                        <p className={`text-xs ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                          Haz clic para ver o descargar
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={selectedQualification.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir
                      </a>
                      <a
                        href={selectedQualification.documentUrl}
                        download
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                          darkMode
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end gap-4 p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowDetailModal(false)}
                className={`px-4 py-2 rounded-lg ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Qualifications;