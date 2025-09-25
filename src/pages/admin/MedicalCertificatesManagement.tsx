import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  FileText,
  Clock,
  User,
  X,
  Upload,
  Download,
  ExternalLink,
  Eye
} from "lucide-react";
import { uploadFile } from "../../firebase/storage";

interface MedicalCertificate {
  id: number;
  certificateNumber: string;
  issueDate: string;
  expiryDate: string;
  medicalClass: string;
  examiner: string;
  documentUrl?: string;
  restrictions?: string;
  active: boolean;
  pilot: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface MedicalCertificatesManagementProps {
  darkMode?: boolean;
}

const MedicalCertificatesManagement = ({ darkMode }: MedicalCertificatesManagementProps) => {
  const [certificates, setCertificates] = useState<MedicalCertificate[]>([]);
  const [pilots, setPilots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<MedicalCertificate | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    pilotId: "",
    certificateNumber: "",
    issueDate: "",
    expiryDate: "",
    medicalClass: "",
    examiner: "",
    documentUrl: "",
    restrictions: "",
    active: true,
  });

  useEffect(() => {
    fetchCertificates();
    fetchPilots();
  }, []);

  const fetchCertificates = async () => {
    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/medical-certificates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
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
    const fileName = `medical-certificates/${timestamp}_${file.name}`;
    return await uploadFile(file, fileName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let documentUrl = formData.documentUrl;

      // Upload file if selected
      if (selectedFile) {
        documentUrl = await uploadFileToFirebase(selectedFile);
      }

      const token = localStorage.getItem("ibex_access_token");
      const url = showEditModal
        ? `${import.meta.env.VITE_API_URL}/medical-certificates/${selectedCertificate?.id}`
        : `${import.meta.env.VITE_API_URL}/medical-certificates`;

      const response = await fetch(url, {
        method: showEditModal ? "PUT" : "POST",
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
        fetchCertificates();
        closeModal();
        alert(
          showEditModal
            ? "Certificado médico actualizado exitosamente"
            : "Certificado médico creado exitosamente"
        );
      } else {
        const error = await response.json();
        alert(error.message || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al procesar la solicitud");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este certificado médico?")) return;

    try {
      const token = localStorage.getItem("ibex_access_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/medical-certificates/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchCertificates();
        alert("Certificado médico eliminado exitosamente");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Error al eliminar el certificado");
    }
  };

  const openAddModal = () => {
    setFormData({
      pilotId: "",
      certificateNumber: "",
      issueDate: "",
      expiryDate: "",
      medicalClass: "",
      examiner: "",
      documentUrl: "",
      restrictions: "",
      active: true,
    });
    setSelectedFile(null);
    setShowAddModal(true);
  };

  const openEditModal = (certificate: MedicalCertificate) => {
    setSelectedCertificate(certificate);
    setFormData({
      pilotId: certificate.pilot.id.toString(),
      certificateNumber: certificate.certificateNumber,
      issueDate: new Date(certificate.issueDate).toISOString().split("T")[0],
      expiryDate: new Date(certificate.expiryDate).toISOString().split("T")[0],
      medicalClass: certificate.medicalClass,
      examiner: certificate.examiner,
      documentUrl: certificate.documentUrl || "",
      restrictions: certificate.restrictions || "",
      active: certificate.active,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDetailModal(false);
    setSelectedCertificate(null);
    setSelectedFile(null);
  };

  const openDetailModal = (certificate: MedicalCertificate) => {
    setSelectedCertificate(certificate);
    setShowDetailModal(true);
  };

  const isExpiring = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${cert.pilot.user.firstName} ${cert.pilot.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.examiner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const expiringCertificates = certificates.filter((cert) => isExpiring(cert.expiryDate) && !isExpired(cert.expiryDate));
  const expiredCertificates = certificates.filter((cert) => isExpired(cert.expiryDate));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Certificados Médicos (Psicofísicos)</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gestión de certificados médicos de pilotos</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Certificado</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{certificates.length}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Certificados</p>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{expiringCertificates.length}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Por Vencer (30 días)</p>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{expiredCertificates.length}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Vencidos</p>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <User className="h-8 w-8 text-green-500" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{pilots.length}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pilotos Totales</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de certificado, piloto o examinador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Certificates Table */}
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
                  Certificado
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Clase Médica
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Examinador
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Vencimiento
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                  darkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'}`}>
              {loading ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-12 text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Cargando...
                  </td>
                </tr>
              ) : filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className={`px-6 py-12 text-center ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No se encontraron certificados médicos
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className={`${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cert.pilot.user.firstName} {cert.pilot.user.lastName}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{cert.pilot.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.certificateNumber}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Emitido: {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.medicalClass}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{cert.examiner}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(cert.expiryDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          isExpired(cert.expiryDate)
                            ? "bg-red-100 text-red-800"
                            : isExpiring(cert.expiryDate)
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isExpired(cert.expiryDate)
                          ? "Vencido"
                          : isExpiring(cert.expiryDate)
                          ? "Por vencer"
                          : "Vigente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          onClick={() => openDetailModal(cert)}
                          className="text-green-600 hover:text-green-900"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {cert.documentUrl && (
                          <a
                            href={cert.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver documento"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(cert)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {showEditModal ? "Editar Psicofísico" : "Agregar Psicofísico"}
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
                  Piloto
                </label>
                <select
                  name="pilotId"
                  value={formData.pilotId}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Seleccionar piloto</option>
                  {pilots.map((pilot) => (
                    <option key={pilot.id} value={pilot.id}>
                      {pilot.user.firstName} {pilot.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Número de Certificado
                  </label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
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
                    Clase Médica
                  </label>
                  <select
                    name="medicalClass"
                    value={formData.medicalClass}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Seleccionar clase</option>
                    <option value="Clase 1">Clase 1</option>
                    <option value="Clase 2">Clase 2</option>
                    <option value="Clase 3">Clase 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Fecha de Emisión
                  </label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
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
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Médico Examinador
                </label>
                <input
                  type="text"
                  name="examiner"
                  value={formData.examiner}
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
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
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
                    id="medical-doc-upload"
                  />
                  <label
                    htmlFor="medical-doc-upload"
                    className="cursor-pointer"
                  >
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>{selectedFile.name}</span>
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

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Restricciones o Limitaciones
                </label>
                <textarea
                  name="restrictions"
                  value={formData.restrictions}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Cualquier restricción médica o limitación..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Certificado activo
                </label>
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {showEditModal ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Detalle del Certificado Médico
                </h2>
                <button
                  onClick={closeModal}
                  className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Pilot Information */}
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                  Información del Piloto
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Nombre
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCertificate.pilot.user.firstName} {selectedCertificate.pilot.user.lastName}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Email
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCertificate.pilot.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Certificate Information */}
              <div>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-3`}>
                  Información del Certificado
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Número
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCertificate.certificateNumber}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Clase Médica
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCertificate.medicalClass}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Fecha de Emisión
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedCertificate.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Fecha de Vencimiento
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedCertificate.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Médico Examinador
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedCertificate.examiner}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Estado
                    </label>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        isExpired(selectedCertificate.expiryDate)
                          ? "bg-red-100 text-red-800"
                          : isExpiring(selectedCertificate.expiryDate)
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {isExpired(selectedCertificate.expiryDate)
                        ? "Vencido"
                        : isExpiring(selectedCertificate.expiryDate)
                        ? "Por vencer"
                        : "Vigente"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Restrictions */}
              {selectedCertificate.restrictions && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                    Restricciones
                  </label>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} bg-gray-50 dark:bg-gray-700 p-3 rounded-md`}>
                    {selectedCertificate.restrictions}
                  </p>
                </div>
              )}

              {/* Document */}
              {selectedCertificate.documentUrl && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'} mb-2`}>
                    Documento
                  </label>
                  <div className="flex space-x-2">
                    <a
                      href={selectedCertificate.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Documento
                    </a>
                    <a
                      href={selectedCertificate.documentUrl}
                      download
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </a>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    darkMode
                      ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalCertificatesManagement;