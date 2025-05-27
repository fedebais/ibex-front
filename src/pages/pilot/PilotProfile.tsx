import { useUser } from "../../context/UserContext"
import { mockFlights, getPilotMonthlyHours, getSettings } from "../../data/mockData"

interface PilotProfileProps {
  darkMode: boolean
}

const PilotProfile = ({ darkMode = false }: PilotProfileProps) => {
  const { user } = useUser()

  // Filtrar vuelos del piloto actual
  const pilotFlights = mockFlights.filter((flight) => flight.pilotId === user?.id)

  // Calcular estadísticas
  const totalFlights = pilotFlights.length
  const totalFlightHours = pilotFlights
    .reduce((total, flight) => {
      const [hours, minutes] = flight.flightHours.split(":").map(Number)
      return total + hours + minutes / 60
    }, 0)
    .toFixed(1)

  // Obtener el mes actual para mostrar las estadísticas del mes en curso
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth()

  // Obtener horas y valor monetario del mes actual
  const monthlyStats = user
    ? getPilotMonthlyHours(user.id, currentYear, currentMonth)
    : { totalHours: 0, totalValue: 0, flights: [] }

  // Obtener configuración de tarifas
  const settings = getSettings()

  // Datos ficticios para el perfil del piloto
  const pilotData = {
    licenseNumber: "PL-12345",
    medicalExpiry: "2024-06-30",
    flightHours: 2450,
    lastTraining: "2023-09-15",
    certifications: ["VFR", "IFR", "Night Flying", "Mountain Operations"],
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold">Mi Perfil</h1>
      </div>

      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden mb-6 border`}
      >
        <div
          className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"} flex flex-col md:flex-row md:items-center md:justify-between`}
        >
          <div className="flex items-center">
            {user?.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} className="h-16 w-16 rounded-full mr-4" alt={user.name} />
            ) : (
              <div className="h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center text-white text-2xl mr-4">
                {user?.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium leading-6">{user?.name}</h3>
              <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Piloto</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                darkMode
                  ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Editar Perfil
            </button>
          </div>
        </div>

        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                Información Personal
              </h4>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Email</dt>
                  <dd className="text-sm">{user?.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Número de Licencia
                  </dt>
                  <dd className="text-sm">{pilotData.licenseNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vencimiento Médico
                  </dt>
                  <dd className="text-sm">{new Date(pilotData.medicalExpiry).toLocaleDateString("es-ES")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Último Entrenamiento
                  </dt>
                  <dd className="text-sm">{new Date(pilotData.lastTraining).toLocaleDateString("es-ES")}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
                Estadísticas de Vuelo
              </h4>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Total Horas de Vuelo
                  </dt>
                  <dd className="text-sm">{pilotData.flightHours}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Horas en IBEX
                  </dt>
                  <dd className="text-sm">{totalFlightHours}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vuelos Completados
                  </dt>
                  <dd className="text-sm">{totalFlights}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={`text-sm font-medium ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    Vuelos Programados
                  </dt>
                  <dd className="text-sm">{pilotFlights.filter((f) => f.status === "scheduled").length}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Estadísticas del mes actual */}
          <div className="mt-8">
            <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
              Estadísticas del Mes Actual ({new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })})
            </h4>
            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas Voladas</p>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    {monthlyStats.totalHours} hrs
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Valor Acumulado</p>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    $
                    {monthlyStats.totalValue.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Tarifa Base</p>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    $
                    {settings.hourlyRate.toLocaleString("es-ES", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    /hr
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
              Certificaciones
            </h4>
            <div className="flex flex-wrap gap-2">
              {pilotData.certifications.map((cert, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                    darkMode ? "bg-orange-900/30 text-orange-300" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-8">
            <h4 className={`text-base font-medium mb-4 ${darkMode ? "text-gray-300" : "text-gray-900"}`}>
              Certificaciones por Aeronave
            </h4>
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg border overflow-hidden`}
            >
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Modelo
                    </th>
                    <th
                      scope="col"
                      className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Fecha de Certificación
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${darkMode ? "bg-gray-800" : "bg-white"} divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}
                >
                  {[
                    { model: "Bell 407", date: "2021-05-10" },
                    { model: "Airbus H125", date: "2022-03-15" },
                    { model: "Robinson R44", date: "2020-11-22" },
                    { model: "Sikorsky S-76", date: "2023-01-08" },
                  ].map((cert, index) => (
                    <tr key={index}>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {cert.model}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        {new Date(cert.date).toLocaleDateString("es-ES")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden border`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Documentos</h3>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
            <li className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Licencia de Piloto</span>
              </div>
              <button
                className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
              >
                Ver
              </button>
            </li>
            <li className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Certificado Médico</span>
              </div>
              <button
                className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
              >
                Ver
              </button>
            </li>
            <li className="py-4 flex justify-between items-center">
              <div className="flex items-center">
                <svg
                  className={`h-5 w-5 ${darkMode ? "text-gray-400" : "text-gray-400"} mr-3`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">Certificado de Entrenamiento</span>
              </div>
              <button
                className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
              >
                Ver
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default PilotProfile
