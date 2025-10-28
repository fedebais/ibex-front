"use client"

import { useState, useEffect } from "react"
import { api } from "../../services/api"
import BarChart from "../../components/charts/BarChart"
import DoughnutChart from "../../components/charts/DoughnutChart"
import LineChart from "../../components/charts/LineChart"
import { FileText, Clock, Users, Plane, Calendar, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"
import type { AdminDashboardData } from "../../types/api"

interface AdminHomeProps {
  darkMode: boolean
  selectedMonth?: number
  selectedYear?: number
  onMonthChange?: (month: number) => void
}

export default function AdminHome({
  darkMode,
  selectedMonth = new Date().getMonth(),
  selectedYear = new Date().getFullYear(),
  onMonthChange,
}: AdminHomeProps) {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Nombres de los meses en español
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Función para cargar los datos del dashboard
  const loadDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Obtener el token de localStorage
      const token = localStorage.getItem("ibex_access_token")

      if (!token) {
        throw new Error("No se encontró el token de autenticación")
      }

      // Formatear el mes y año para la API
      const monthStr = String(selectedMonth + 1).padStart(2, "0")
      const monthParam = `${selectedYear}-${monthStr}`

      console.log("Llamando a API con parámetros:", { month: monthParam }, "Token:", token)

      // Llamar a la API para obtener los datos usando la instancia
      const data = await api.getStats({ month: monthParam }, token)

      console.log("Datos obtenidos de la API:", data)
      setDashboardData(data as unknown as AdminDashboardData)
    } catch (err) {
      console.error("Error al cargar los datos del dashboard:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos cuando cambie el mes o año seleccionado
  useEffect(() => {
    loadDashboardData()
  }, [selectedMonth, selectedYear])

  // Función para manejar el refresco manual de datos
  const handleRefresh = () => {
    loadDashboardData()
  }

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="pt-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Cargando datos del dashboard...</p>
      </div>
    )
  }

  // Si hay un error, mostrar mensaje
  if (error) {
    return (
      <div className="pt-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-lg">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={handleRefresh}
            className="mt-4 flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Si no hay datos, mostrar mensaje
  if (!dashboardData) {
    return (
      <div className="pt-6 flex flex-col items-center justify-center min-h-[60vh]">
        <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-700"}`}>No hay datos disponibles</p>
        <button
          onClick={handleRefresh}
          className="mt-4 flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Cargar datos
        </button>
      </div>
    )
  }

  // Preparar datos para los gráficos
  const flightsPerMonthLabels = dashboardData.flightActivity.flightsPerMonth.map((item) => item.month)
  const hoursPerMonthLabels = dashboardData.flightActivity.hoursPerMonth.map((item) => item.month)

  // Preparar datasets para el LineChart con múltiples líneas (horas de vuelo)
  const hoursDatasets = [
    {
      label: "Horas Facturables",
      data: dashboardData.flightActivity.hoursPerMonth.map((item) => item.hoursWithoutRotorwayAndIbex),
      color: "#10b981", // Verde
      fill: true,
    },
    {
      label: "Solo Rotorway",
      data: dashboardData.flightActivity.hoursPerMonth.map((item) => item.hoursRotorwayAndIbexHeliski),
      color: "#06b6d4", // Cyan
      fill: true,
    },
    {
      label: "Solo SMNF",
      data: dashboardData.flightActivity.hoursPerMonth.map((item) => item.hoursSMNF),
      color: "#8b5cf6", // Purple
      fill: true,
    },
  ]

  // Preparar datasets para el BarChart con múltiples series (número de vuelos)
  const flightsDatasets = [
    {
      label: "Horas Facturables",
      data: dashboardData.flightActivity.flightsPerMonth.map((item) => item.countWithoutRotorwayAndIbex),
      color: "#10b981", // Verde
    },
    {
      label: "Solo Rotorway",
      data: dashboardData.flightActivity.flightsPerMonth.map((item) => item.countRotorwayAndIbexHeliski),
      color: "#06b6d4", // Cyan
    },
    {
      label: "Solo SMNF",
      data: dashboardData.flightActivity.flightsPerMonth.map((item) => item.countSMNF),
      color: "#8b5cf6", // Purple
    },
  ]

  // Preparar datos para el gráfico de modelos de helicópteros
  const helicopterModelsData = Object.values(dashboardData.fleetStatus.byModel)
  const helicopterModelsLabels = Object.keys(dashboardData.fleetStatus.byModel)

  // Colores en tonalidades naranjas
  const orangeColors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5", "#fff7ed"]

  // Clases condicionales para tarjetas
  const cardClass = darkMode
    ? "bg-gray-800 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-200"

  return (
    <div className="pt-6">
      {/* Encabezado con título y selector de mes */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Administrativo</h1>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 p-2 rounded-md ${darkMode ? "bg-gray-800" : "bg-white"} shadow-md`}>
            <Calendar className={`h-5 w-5 ${darkMode ? "text-orange-400" : "text-orange-500"}`} />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange && onMonthChange(Number.parseInt(e.target.value))}
              className={`rounded-md border-gray-300 py-1 px-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-gray-900 border-gray-200"
              }`}
              aria-label="Seleccionar mes"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month} {selectedYear}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            aria-label="Refrescar datos"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Primera fila de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {/* Tarjeta de Vuelos Completados */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Vuelos Completados
              </p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.summary.flightsByStatus?.COMPLETED || 0}</h3>
            </div>
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-green-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {dashboardData.summary.flightsByStatus?.SCHEDULED || 0} programados
              </span>
            </div>
            <div className="flex items-center text-blue-500 ml-4">
              <Clock className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{dashboardData.summary.monthlyFlights} este mes</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Horas de Vuelo */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas de Vuelo</p>
              <h3 className="text-3xl font-bold mt-1">{Number(dashboardData.summary.flightHours).toFixed(2)}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{Number(dashboardData.summary.monthlyHours).toFixed(2)} horas este mes</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Pilotos */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Pilotos</p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.summary.totalPilots}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-gray-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{dashboardData.summary.activePilots} activos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Tarjeta de Horas sin Rotorway e IBEX Heliski */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas Facturables</p>
              <h3 className="text-3xl font-bold mt-1">{Number(dashboardData.summary.flightHoursWithoutRotorwayAndIbex).toFixed(2)}</h3>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{Number(dashboardData.summary.monthlyHoursWithoutRotorwayAndIbex).toFixed(2)} horas este mes</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Horas Rotorway e IBEX Heliski */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Solo Rotorway</p>
              <h3 className="text-3xl font-bold mt-1">{Number(dashboardData.summary.flightHoursRotorwayAndIbexHeliski).toFixed(2)}</h3>
            </div>
            <div className="p-3 rounded-full bg-cyan-100 text-cyan-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{Number(dashboardData.summary.monthlyHoursRotorwayAndIbexHeliski).toFixed(2)} horas este mes</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Horas SMNF */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Solo SMNF</p>
              <h3 className="text-3xl font-bold mt-1">{Number(dashboardData.summary.flightHoursSMNF).toFixed(2)}</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{Number(dashboardData.summary.monthlyHoursSMNF).toFixed(2)} horas este mes</span>
            </div>
          </div>
        </div>

        {/* Tarjeta de Helicópteros */}
        <div className={`p-6 rounded-lg shadow-md ${darkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Helicópteros</p>
              <h3 className="text-3xl font-bold mt-1">{dashboardData.summary.totalHelicopters}</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Plane className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <div className="flex items-center text-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{dashboardData.summary.activeHelicopters} activos</span>
            </div>
            <div className="flex items-center text-yellow-500 ml-4">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">
                {dashboardData.summary.maintenanceHelicopters} en mantenimiento
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {/* Gráficos y estadísticas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`${cardClass} shadow rounded-lg overflow-hidden transition-all hover:shadow-md`}>
            <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className="text-lg font-medium leading-6">Estado de la Flota</h3>
            </div>
            <div className="p-6">
              <div className="h-64">
                <DoughnutChart
                  data={[dashboardData.summary.activeHelicopters, dashboardData.summary.maintenanceHelicopters]}
                  labels={["Activos", "En Mantenimiento"]}
                  title="Distribución de Helicópteros"
                  colors={["#10b981", "#f97316"]}
                  darkMode={darkMode}
                />
              </div>
              <div className="mt-6">
                <h4 className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} mb-4`}>
                  Distribución por Modelo
                </h4>
                <div className="h-64">
                  <DoughnutChart
                    data={helicopterModelsData}
                    labels={helicopterModelsLabels}
                    colors={orangeColors}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={`${cardClass} shadow rounded-lg overflow-hidden transition-all hover:shadow-md`}>
            <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className="text-lg font-medium leading-6">Actividad de Vuelos</h3>
            </div>
            <div className="p-6">
              <div className="h-64 mb-6">
                <BarChart
                  datasets={flightsDatasets}
                  labels={flightsPerMonthLabels}
                  darkMode={darkMode}
                />
              </div>
              <div className="h-64">
                <LineChart
                  datasets={hoursDatasets}
                  labels={hoursPerMonthLabels}
                  darkMode={darkMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
