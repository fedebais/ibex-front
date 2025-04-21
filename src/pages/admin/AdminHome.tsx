import { getStatistics } from "../../data/mockData"
import BarChart from "../../components/charts/BarChart"
import DoughnutChart from "../../components/charts/DoughnutChart"
import LineChart from "../../components/charts/LineChart"
import { FileText, Clock, Users, Plane, Plus, FileBarChart, Building2 } from "lucide-react"

interface AdminHomeProps {
  darkMode: boolean
}

const AdminHome = ({ darkMode }: AdminHomeProps) => {
  const stats = getStatistics()

  // Datos para gráficos
  const monthlyFlightsData = [3, 5, 8, 12, 15, 10]
  const monthlyFlightsLabels = ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  const helicopterModelsData = [1, 1, 1, 1]
  const helicopterModelsLabels = ["Bell 407", "Airbus H125", "Robinson R44", "Sikorsky S-76"]

  const flightHoursData = [12, 18, 24, 30, 25, 20]
  const flightHoursLabels = ["Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  // Colores en tonalidades naranjas
  const orangeColors = ["#f97316", "#fb923c", "#fdba74", "#fed7aa"]

  // Clases condicionales para tarjetas
  const cardClass = darkMode
    ? "bg-gray-800 text-white border border-gray-700"
    : "bg-white text-gray-900 border border-gray-200"

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-cente">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${cardClass} rounded-lg shadow p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <FileText className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Total de Vuelos
                </dt>
                <dd className="text-lg font-semibold">{stats.totalFlights}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <Clock className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Horas de Vuelo
                </dt>
                <dd className="text-lg font-semibold">{stats.totalFlightHours}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <Users className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Pilotos
                </dt>
                <dd className="text-lg font-semibold">{stats.totalPilots}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <Plane className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Helicópteros
                </dt>
                <dd className="text-lg font-semibold">{stats.totalHelicopters}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-lg shadow p-5 transition-all hover:shadow-md`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${darkMode ? "bg-orange-900/30" : "bg-orange-100"} rounded-md p-3`}>
              <Building2 className={`h-6 w-6 ${darkMode ? "text-orange-400" : "text-orange-600"}`} />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"} truncate`}>
                  Clientes
                </dt>
                <dd className="text-lg font-semibold">{stats.totalClients}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${cardClass} shadow rounded-lg overflow-hidden transition-all hover:shadow-md`}>
          <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
            <h3 className="text-lg font-medium leading-6">Estado de la Flota</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
              <DoughnutChart
                data={[stats.activeHelicopters, stats.totalHelicopters - stats.activeHelicopters]}
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
                data={monthlyFlightsData}
                labels={monthlyFlightsLabels}
                title="Vuelos por Mes"
                color="#f97316"
                darkMode={darkMode}
              />
            </div>
            <div className="h-64">
              <LineChart
                data={flightHoursData}
                labels={flightHoursLabels}
                title="Horas de Vuelo por Mes"
                fill={true}
                color="#f97316"
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className={`${cardClass} shadow rounded-lg overflow-hidden transition-all hover:shadow-md`}>
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Acciones Rápidas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              className={`flex flex-col items-center justify-center p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg transition-colors`}
            >
              <Plus className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Nuevo Vuelo</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg transition-colors`}
            >
              <Users className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Añadir Piloto</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg transition-colors`}
            >
              <Building2 className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Añadir Cliente</span>
            </button>
            <button
              className={`flex flex-col items-center justify-center p-4 border ${darkMode ? "border-gray-700 hover:bg-gray-700" : "border-gray-300 hover:bg-gray-50"} rounded-lg transition-colors`}
            >
              <FileBarChart className="h-8 w-8 text-orange-500 mb-2" />
              <span className="text-sm font-medium">Generar Informe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHome
