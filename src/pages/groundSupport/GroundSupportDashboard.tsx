import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import {
  Home,
  User,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  Car,
  Phone,
  AlertCircle
} from "lucide-react";
import GroundSupportHome from "./GroundSupportHome";
import GroundSupportProfile from "./GroundSupportProfile";
import GroundSupportSchedule from "./GroundSupportSchedule";
import GroundSupportDocuments from "./GroundSupportDocuments";

const GroundSupportDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [groundSupportData, setGroundSupportData] = useState<any>(null);

  useEffect(() => {
    fetchGroundSupportData();
  }, [user]);

  const fetchGroundSupportData = async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/ground-support/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGroundSupportData(data);
      }
    } catch (error) {
      console.error("Error fetching ground support data:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { path: "/ground-support", icon: Home, label: "Inicio" },
    { path: "/ground-support/profile", icon: User, label: "Mi Perfil" },
    { path: "/ground-support/schedule", icon: Calendar, label: "Mi Horario" },
    { path: "/ground-support/documents", icon: FileText, label: "Documentos" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar móvil overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static lg:translate-x-0 z-50 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">IBEX</h1>
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-gray-600 hover:text-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-2">Soporte en Tierra</p>
          </div>

          {/* User Info */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user?.firstName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>

            {/* License Status Badge */}
            {groundSupportData && (
              <div className="mt-3">
                {groundSupportData.hasDriverLicense ? (
                  <div className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-md">
                    <Car className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Con Licencia</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-md">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span className="text-xs font-medium">Sin Licencia</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map(({ path, icon: Icon, label }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Emergency Contact */}
          {groundSupportData?.emergencyContact && (
            <div className="p-4 border-t">
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xs font-medium text-red-800 mb-1">
                  Contacto de Emergencia
                </p>
                <p className="text-sm text-red-700">
                  {groundSupportData.emergencyContact}
                </p>
                {groundSupportData.emergencyContactPhone && (
                  <div className="flex items-center mt-1">
                    <Phone className="h-3 w-3 mr-1" />
                    <p className="text-xs text-red-600">
                      {groundSupportData.emergencyContactPhone}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white hover:bg-red-600 rounded-lg px-4 py-2 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="text-gray-600 hover:text-gray-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">IBEX</h1>
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<GroundSupportHome groundSupportData={groundSupportData} />} />
            <Route path="/profile" element={<GroundSupportProfile groundSupportData={groundSupportData} onUpdate={fetchGroundSupportData} />} />
            <Route path="/schedule" element={<GroundSupportSchedule />} />
            <Route path="/documents" element={<GroundSupportDocuments groundSupportData={groundSupportData} onUpdate={fetchGroundSupportData} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default GroundSupportDashboard;