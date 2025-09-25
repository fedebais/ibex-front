import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const GroundSupportSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    // Aquí se cargarían las tareas programadas desde el backend
    // Por ahora usamos datos de ejemplo
    const exampleSchedule = [
      {
        id: 1,
        date: selectedDate,
        time: "06:00",
        task: "Apertura de helipuerto",
        description: "Preparación de instalaciones y verificación de seguridad",
        status: "pending",
        priority: "high",
      },
      {
        id: 2,
        date: selectedDate,
        time: "08:00",
        task: "Inspección de equipo de tierra",
        description: "Revisar estado de extintores, conos, y señalización",
        status: "pending",
        priority: "medium",
      },
      {
        id: 3,
        date: selectedDate,
        time: "10:00",
        task: "Asistencia en vuelo programado",
        description: "Ayudar con el embarque de pasajeros y carga",
        status: "pending",
        priority: "high",
      },
      {
        id: 4,
        date: selectedDate,
        time: "14:00",
        task: "Reabastecimiento de combustible",
        description: "Coordinar y supervisar el proceso de reabastecimiento",
        status: "pending",
        priority: "high",
      },
      {
        id: 5,
        date: selectedDate,
        time: "16:00",
        task: "Limpieza de área de operaciones",
        description: "Mantener el área de operaciones limpia y ordenada",
        status: "pending",
        priority: "low",
      },
      {
        id: 6,
        date: selectedDate,
        time: "18:00",
        task: "Cierre de helipuerto",
        description: "Asegurar instalaciones y equipos",
        status: "pending",
        priority: "high",
      },
    ];

    setSchedule(exampleSchedule);
  }, [selectedDate]);

  const updateTaskStatus = (taskId: number, newStatus: string) => {
    setSchedule((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Mi Horario</h1>
        <p className="text-gray-600">Gestiona tus tareas y actividades diarias</p>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-600" />
            Seleccionar Fecha
          </h2>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-800">{schedule.length}</p>
            <p className="text-sm text-gray-600">Total Tareas</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">
              {schedule.filter((t) => t.status === "completed").length}
            </p>
            <p className="text-sm text-gray-600">Completadas</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {schedule.filter((t) => t.status === "pending").length}
            </p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </div>
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-gray-600" />
            Tareas del Día
          </h2>
        </div>
        <div className="divide-y">
          {schedule.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(task.status)}
                    <h3 className="text-lg font-medium text-gray-800">{task.task}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority === "high"
                        ? "Alta"
                        : task.priority === "medium"
                        ? "Media"
                        : "Baja"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{task.time}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {task.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateTaskStatus(task.id, "completed")}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, "cancelled")}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {task.status === "completed" && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                      Completada
                    </span>
                  )}
                  {task.status === "cancelled" && (
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-md">
                      Cancelada
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {schedule.length === 0 && (
            <div className="p-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay tareas programadas para esta fecha</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroundSupportSchedule;