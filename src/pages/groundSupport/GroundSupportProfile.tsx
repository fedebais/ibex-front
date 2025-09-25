import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { User, Phone, Mail, Car, AlertCircle, Save, Edit2 } from "lucide-react";

interface GroundSupportProfileProps {
  groundSupportData: any;
  onUpdate: () => void;
}

const GroundSupportProfile = ({ groundSupportData, onUpdate }: GroundSupportProfileProps) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    functions: groundSupportData?.functions || "",
    hasDriverLicense: groundSupportData?.hasDriverLicense || false,
    driverLicenseNumber: groundSupportData?.driverLicenseNumber || "",
    driverLicenseExpiry: groundSupportData?.driverLicenseExpiry
      ? new Date(groundSupportData.driverLicenseExpiry).toISOString().split("T")[0]
      : "",
    emergencyContact: groundSupportData?.emergencyContact || "",
    emergencyContactPhone: groundSupportData?.emergencyContactPhone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ground-support/${groundSupportData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
        alert("Perfil actualizado exitosamente");
      } else {
        throw new Error("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Editar</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Guardando..." : "Guardar"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 text-gray-600" />
            Información Personal
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Funciones y Responsabilidades
              </label>
              <textarea
                name="functions"
                value={formData.functions}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Describe tus funciones principales..."
              />
            </div>
          </div>
        </div>

        {/* License and Emergency Information */}
        <div className="space-y-6">
          {/* Driver's License */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2 text-gray-600" />
              Licencia de Conducir
            </h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasDriverLicense"
                  name="hasDriverLicense"
                  checked={formData.hasDriverLicense}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50"
                />
                <label
                  htmlFor="hasDriverLicense"
                  className="ml-2 text-sm font-medium text-gray-700"
                >
                  Tengo licencia de conducir
                </label>
              </div>

              {formData.hasDriverLicense && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Licencia
                    </label>
                    <input
                      type="text"
                      name="driverLicenseNumber"
                      value={formData.driverLicenseNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      name="driverLicenseExpiry"
                      value={formData.driverLicenseExpiry}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
              Contacto de Emergencia
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Nombre completo del contacto de emergencia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de Emergencia
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  placeholder="Número de teléfono del contacto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundSupportProfile;