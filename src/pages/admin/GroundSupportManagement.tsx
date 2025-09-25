import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Car,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

interface GroundSupportManagementProps {
  darkMode?: boolean;
}

const GroundSupportManagement = ({ darkMode }: GroundSupportManagementProps) => {
  const [groundSupportList, setGroundSupportList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroundSupport, setSelectedGroundSupport] = useState<any>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    functions: "",
    hasDriverLicense: false,
    driverLicenseNumber: "",
    driverLicenseExpiry: "",
    emergencyContact: "",
    emergencyContactPhone: "",
    active: true,
  });

  useEffect(() => {
    fetchGroundSupport();
  }, []);

  const fetchGroundSupport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ground-support`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroundSupportList(data);
      }
    } catch (error) {
      console.error("Error fetching ground support:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = showEditModal
        ? `${import.meta.env.VITE_API_URL}/ground-support/${selectedGroundSupport.id}`
        : `${import.meta.env.VITE_API_URL}/ground-support`;

      const response = await fetch(url, {
        method: showEditModal ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchGroundSupport();
        closeModal();
        alert(
          showEditModal
            ? "Personal actualizado exitosamente"
            : "Personal creado exitosamente"
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
    if (!confirm("¿Estás seguro de que deseas eliminar este personal de soporte?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ground-support/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchGroundSupport();
        alert("Personal eliminado exitosamente");
      }
    } catch (error) {
      console.error("Error deleting ground support:", error);
      alert("Error al eliminar el personal");
    }
  };

  const openAddModal = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      functions: "",
      hasDriverLicense: false,
      driverLicenseNumber: "",
      driverLicenseExpiry: "",
      emergencyContact: "",
      emergencyContactPhone: "",
      active: true,
    });
    setShowAddModal(true);
  };

  const openEditModal = (groundSupport: any) => {
    setSelectedGroundSupport(groundSupport);
    setFormData({
      firstName: groundSupport.user.firstName,
      lastName: groundSupport.user.lastName,
      email: groundSupport.user.email,
      phone: groundSupport.user.phone,
      password: "",
      functions: groundSupport.functions || "",
      hasDriverLicense: groundSupport.hasDriverLicense,
      driverLicenseNumber: groundSupport.driverLicenseNumber || "",
      driverLicenseExpiry: groundSupport.driverLicenseExpiry
        ? new Date(groundSupport.driverLicenseExpiry).toISOString().split("T")[0]
        : "",
      emergencyContact: groundSupport.emergencyContact || "",
      emergencyContactPhone: groundSupport.emergencyContactPhone || "",
      active: groundSupport.active,
    });
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedGroundSupport(null);
  };

  const filteredGroundSupport = groundSupportList.filter(
    (gs) =>
      gs.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gs.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gs.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gs.functions?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Personal de Soporte en Tierra</h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Gestión del personal de apoyo terrestre</p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Personal</span>
          </button>
        </div>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className={`lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar por nombre, email o funciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{groundSupportList.length}</p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Personal</p>
            </div>
          </div>
        </div>
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
          <div className="flex items-center justify-between">
            <Car className="h-8 w-8 text-green-500" />
            <div className="text-right">
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {groundSupportList.filter((gs) => gs.hasDriverLicense).length}
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Con Licencia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ground Support List */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Personal
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Contacto
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Funciones
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Licencia
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Estado
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : filteredGroundSupport.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No se encontró personal de soporte
                  </td>
                </tr>
              ) : (
                filteredGroundSupport.map((gs) => (
                  <tr key={gs.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {gs.user.firstName} {gs.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{gs.user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-1 text-gray-400" />
                        {gs.user.phone}
                      </div>
                      {gs.emergencyContact && (
                        <div className="text-xs text-gray-500 mt-1">
                          <AlertCircle className="h-3 w-3 inline mr-1" />
                          {gs.emergencyContact}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">
                        {gs.functions || "No especificadas"}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {gs.hasDriverLicense ? (
                        <div className="flex items-center text-green-600">
                          <Car className="h-4 w-4 mr-1" />
                          <span className="text-sm">{gs.driverLicenseNumber || "Sí"}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          gs.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {gs.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(gs)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(gs.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                  {showEditModal ? "Editar Personal de Soporte" : "Agregar Personal de Soporte"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
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
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
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
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
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

              {showAddModal && (
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={showAddModal}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              )}

              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Funciones y Responsabilidades
                </label>
                <textarea
                  name="functions"
                  value={formData.functions}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  placeholder="Describe las funciones del personal..."
                />
              </div>

              <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hasDriverLicense"
                    name="hasDriverLicense"
                    checked={formData.hasDriverLicense}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="hasDriverLicense" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tiene licencia de conducir
                  </label>
                </div>

                {formData.hasDriverLicense && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Número de Licencia
                      </label>
                      <input
                        type="text"
                        name="driverLicenseNumber"
                        value={formData.driverLicenseNumber}
                        onChange={handleInputChange}
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
                        name="driverLicenseExpiry"
                        value={formData.driverLicenseExpiry}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t pt-4`}>
                <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Contacto de Emergencia</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Nombre del contacto"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      onChange={handleInputChange}
                      placeholder="Teléfono de emergencia"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
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
                  Personal activo
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
    </div>
  );
};

export default GroundSupportManagement;