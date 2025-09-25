import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { Calendar, Clock, Car, AlertTriangle, CheckCircle, Users, FileText } from "lucide-react";

interface GroundSupportHomeProps {
  groundSupportData: any;
}

const GroundSupportHome = ({ groundSupportData }: GroundSupportHomeProps) => {
  const { user } = useUser();
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);

  useEffect(() => {
    // Aquí se podrían cargar las tareas del día
    // Por ahora usamos datos de ejemplo
    setTodaySchedule([
      { id: 1, time: "08:00", task: "Preparación de helipuerto", status: "completed" },
      { id: 2, time: "10:00", task: "Asistencia en reabastecimiento", status: "pending" },
      { id: 3, time: "14:00", task: "Inspección de seguridad", status: "pending" },
    ]);

    setUpcomingTasks([
      { id: 1, date: "2025-09-23", task: "Mantenimiento de equipo de tierra" },
      { id: 2, date: "2025-09-24", task: "Capacitación de seguridad" },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Bienvenido, {user?.firstName}
        </h1>
        <p className="text-gray-600">
          Panel de control - Personal de Soporte en Tierra
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* License Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Car className="h-8 w-8 text-blue-500" />
            <span className={`px-2 py-1 text-xs rounded-full ${
              groundSupportData?.hasDriverLicense
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
              {groundSupportData?.hasDriverLicense ? "Activa" : "No registrada"}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Licencia de Conducir</h3>
          {groundSupportData?.driverLicenseNumber && (
            <p className="text-sm text-gray-600 mt-1">
              N°: {groundSupportData.driverLicenseNumber}
            </p>
          )}
          {groundSupportData?.driverLicenseExpiry && (
            <p className="text-xs text-gray-500 mt-1">
              Vence: {new Date(groundSupportData.driverLicenseExpiry).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Today's Tasks Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-8 w-8 text-green-500" />
            <span className="text-2xl font-bold text-gray-800">
              {todaySchedule.length}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Tareas de Hoy</h3>
          <p className="text-sm text-gray-600 mt-1">
            {todaySchedule.filter(t => t.status === 'completed').length} completadas
          </p>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Contacto de Emergencia</h3>
          <p className="text-sm text-gray-600 mt-1">
            {groundSupportData?.emergencyContact || "No registrado"}
          </p>
          {groundSupportData?.emergencyContactPhone && (
            <p className="text-xs text-gray-500 mt-1">
              Tel: {groundSupportData.emergencyContactPhone}
            </p>
          )}
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-8 w-8 text-purple-500" />
            <span className={`px-2 py-1 text-xs rounded-full ${
              groundSupportData?.active
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}>
              {groundSupportData?.active ? "Activo" : "Inactivo"}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Estado</h3>
          <p className="text-sm text-gray-600 mt-1">
            {groundSupportData?.active ? "En servicio" : "Fuera de servicio"}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Horario del Día</h2>
            <Clock className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {todaySchedule.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-600">{item.time}</span>
                  <span className="text-sm text-gray-800">{item.task}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.status === 'completed'
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {item.status === 'completed' ? "Completado" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Functions & Responsibilities */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Funciones Asignadas</h2>
            <Users className="h-5 w-5 text-gray-500" />
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {groundSupportData?.functions || "No se han asignado funciones específicas"}
            </p>
          </div>

          {/* Upcoming Tasks */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Próximas Tareas</h3>
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-sm text-gray-700">{task.task}</span>
                  <span className="text-xs text-gray-500">{task.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <FileText className="h-8 w-8 text-blue-600 mb-2" />
            <span className="text-sm text-gray-700">Reportar Incidente</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <span className="text-sm text-gray-700">Marcar Tarea</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
            <Car className="h-8 w-8 text-yellow-600 mb-2" />
            <span className="text-sm text-gray-700">Actualizar Licencia</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Calendar className="h-8 w-8 text-purple-600 mb-2" />
            <span className="text-sm text-gray-700">Ver Calendario</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroundSupportHome;