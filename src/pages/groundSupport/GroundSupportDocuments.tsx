import { useState, useRef } from "react";
import { Upload, FileText, Download, Trash2, Eye, Car, AlertCircle, Check, X } from "lucide-react";
import { storage } from "../../firebase/config";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

interface GroundSupportDocumentsProps {
  groundSupportData: any;
  onUpdate: () => void;
}

const GroundSupportDocuments = ({ groundSupportData, onUpdate }: GroundSupportDocumentsProps) => {
  const [uploading, setUploading] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo no puede superar los 5MB");
        return;
      }
      setLicenseFile(file);
    }
  };

  const handleUploadLicense = async () => {
    if (!licenseFile || !groundSupportData) return;

    setUploading(true);
    try {
      // Subir archivo a Firebase Storage
      const fileName = `licenses/ground-support/${groundSupportData.userId}_${Date.now()}_${licenseFile.name}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, licenseFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Actualizar en el backend
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ground-support/${groundSupportData.id}/license`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverLicenseUrl: downloadURL }),
        }
      );

      if (response.ok) {
        setLicenseFile(null);
        onUpdate();
        alert("Licencia subida exitosamente");
      } else {
        throw new Error("Error al actualizar la licencia");
      }
    } catch (error) {
      console.error("Error uploading license:", error);
      alert("Error al subir la licencia");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteLicense = async () => {
    if (!groundSupportData?.driverLicenseUrl) return;

    if (!confirm("¿Estás seguro de que deseas eliminar el documento de licencia?")) return;

    try {
      // Eliminar de Firebase Storage si es una URL de Firebase
      if (groundSupportData.driverLicenseUrl.includes("firebase")) {
        const storageRef = ref(storage, groundSupportData.driverLicenseUrl);
        await deleteObject(storageRef);
      }

      // Actualizar en el backend
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ground-support/${groundSupportData.id}/license`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ driverLicenseUrl: null }),
        }
      );

      if (response.ok) {
        onUpdate();
        alert("Licencia eliminada exitosamente");
      } else {
        throw new Error("Error al eliminar la licencia");
      }
    } catch (error) {
      console.error("Error deleting license:", error);
      alert("Error al eliminar la licencia");
    }
  };

  const handleViewDocument = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Documentos</h1>
        <p className="text-gray-600">Gestiona tus documentos y certificaciones</p>
      </div>

      {/* Driver's License Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Car className="h-5 w-5 mr-2 text-gray-600" />
            Licencia de Conducir
          </h2>
          {groundSupportData?.hasDriverLicense && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Registrada
            </span>
          )}
        </div>

        {groundSupportData?.hasDriverLicense ? (
          <div className="space-y-4">
            {/* License Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Número de Licencia</p>
                  <p className="font-medium text-gray-800">
                    {groundSupportData.driverLicenseNumber || "No registrado"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Fecha de Vencimiento</p>
                  <p className="font-medium text-gray-800">
                    {groundSupportData.driverLicenseExpiry
                      ? new Date(groundSupportData.driverLicenseExpiry).toLocaleDateString()
                      : "No registrada"}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Upload/View */}
            {groundSupportData.driverLicenseUrl ? (
              <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">Documento de Licencia</p>
                      <p className="text-sm text-gray-600">Documento cargado exitosamente</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(groundSupportData.driverLicenseUrl)}
                      className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      title="Ver documento"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleViewDocument(groundSupportData.driverLicenseUrl)}
                      className="p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      title="Descargar documento"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleDeleteLicense}
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Eliminar documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {licenseFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-800">{licenseFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(licenseFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setLicenseFile(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleUploadLicense}
                        disabled={uploading}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {uploading ? (
                          <>Subiendo...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Subir Documento
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setLicenseFile(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="text-center cursor-pointer"
                  >
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-1">
                      Haz clic para seleccionar el documento de tu licencia
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">No tienes licencia de conducir registrada</p>
              <p className="text-sm text-yellow-700 mt-1">
                Ve a tu perfil para actualizar esta información y luego podrás subir el documento.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Other Documents Section (Future expansion) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-gray-600" />
          Otros Documentos
        </h2>
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p>Próximamente podrás gestionar otros documentos aquí</p>
        </div>
      </div>
    </div>
  );
};

export default GroundSupportDocuments;