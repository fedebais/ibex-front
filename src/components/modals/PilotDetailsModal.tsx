import Modal from "../ui/Modal"
import { mockUsers, mockFlights, getHelicopterInfo, getLocationName } from "../../data/mockData"

interface PilotDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  pilotId: string | null
  darkMode?: boolean
}

const PilotDetailsModal = ({ isOpen, onClose, pilotId, darkMode = false }: PilotDetailsModalProps) => {
  if (!pilotId) return null

  const pilot = mockUsers.find((u) => u.id === pilotId && u.role === "pilot")
  if (!pilot) return null

  // Filtrar vuelos del piloto
  const pilotFlights = mockFlights.filter((flight) => flight.pilotId === pilot.id)

  // Calcular estadísticas
  const totalFlights = pilotFlights.length
  const completedFlights = pilotFlights.filter((f) => f.status === "completed").length
  const scheduledFlights = pilotFlights.filter((f) => f.status === "scheduled").length
  const totalFlightHours = pilotFlights
    .reduce((total, flight) => {
      if (flight.status === "completed") {
        const [hours, minutes] = flight.flightHours.split(":").map(Number)
        return total + hours + minutes / 60
      }
      return total
    }, 0)
    .toFixed(1)

  // Datos ficticios para el perfil del piloto
  const pilotData = {
    licenseNumber: pilot.licenseNumber || "PL-12345",
    licenseExpiry: "2024-12-31",
    medicalExpiry: "2024-06-30",
    flightHours: pilot.flightHours || 0,
    lastTraining: "2023-09-15",
    certifications: ["VFR", "IFR", "Night Flying", "Mountain Operations"],
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Piloto" maxWidth="max-w-4xl" darkMode={darkMode}>
      <div className="space-y-6">
        {/* Información básica del piloto */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-1/4 flex justify-center">
            {pilot.avatar ? (
              <img
                src={pilot.avatar || "/placeholder.svg"}
                alt={pilot.name}
                className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover"
              />
            ) : (
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-orange-500 flex items-center justify-center text-white text-4xl">
                {pilot.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="w-full sm:w-3/4 space-y-2 sm:space-y-4">
            <div>
              <h3 className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{pilot.name}</h3>
              <p className={`text-sm sm:text-base ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{pilot.email}</p>
              <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Piloto</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Número de Licencia
                </p>
                <p className={`text-sm sm:text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {pilotData.licenseNumber}
                </p>
              </div>
              <div>
                <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas de Vuelo</p>
                <p className={`text-sm sm:text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                  {pilotData.flightHours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de licencia y certificaciones */}
        <div className={`${darkMode ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg`}>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Información de Licencia
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Número de Licencia</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {pilot.licenseNumber || "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Vencimiento Médico</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {pilot.medicalExpiry ? new Date(pilot.medicalExpiry).toLocaleDateString("es-ES") : "No registrado"}
              </p>
            </div>
            <div>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Último Entrenamiento</p>
              <p className={`text-base font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                {pilot.lastTraining ? new Date(pilot.lastTraining).toLocaleDateString("es-ES") : "No registrado"}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Certificaciones</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {pilot.certifications &&
                pilot.certifications.map((cert, index) => (
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

          {/* Certificaciones por Aeronave */}
          <div className="mt-4">
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"} mb-2`}>
              Certificaciones por Aeronave
            </p>
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
            >
              <table className={`w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      scope="col"
                      className={`px-4 py-2 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Modelo
                    </th>
                    <th
                      scope="col"
                      className={`px-4 py-2 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                    >
                      Fecha de Certificación
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
                >
                  {pilot.aircraftCertifications ? (
                    pilot.aircraftCertifications.map((cert, index) => (
                      <tr key={index}>
                        <td
                          className={`px-4 py-2 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {cert.model}
                        </td>
                        <td
                          className={`px-4 py-2 whitespace-nowrap text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {new Date(cert.date).toLocaleDateString("es-ES")}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className={`px-4 py-2 text-center text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        No hay certificaciones registradas
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Estadísticas de vuelo */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
            Estadísticas de Vuelo
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
            >
              <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Total Vuelos</p>
              <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {totalFlights}
              </p>
            </div>
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
            >
              <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Completados</p>
              <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {completedFlights}
              </p>
            </div>
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
            >
              <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Programados</p>
              <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {scheduledFlights}
              </p>
            </div>
            <div
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} p-3 sm:p-4 rounded-lg border`}
            >
              <p className={`text-xs sm:text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Horas Vuelo</p>
              <p className={`text-lg sm:text-xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                {totalFlightHours}
              </p>
            </div>
          </div>
        </div>

        {/* Últimos vuelos */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Últimos Vuelos</h4>

          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-x-auto`}
          >
            <table className={`w-full divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                <tr>
                  <th
                    scope="col"
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                  >
                    Fecha
                  </th>
                  <th
                    scope="col"
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                  >
                    Ruta
                  </th>
                  <th
                    scope="col"
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                  >
                    Helicóptero
                  </th>
                  <th
                    scope="col"
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                  >
                    Duración
                  </th>
                  <th
                    scope="col"
                    className={`px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium ${darkMode ? "text-gray-300" : "text-gray-500"} uppercase tracking-wider`}
                  >
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody
                className={`${darkMode ? "bg-gray-800 divide-y divide-gray-700" : "bg-white divide-y divide-gray-200"}`}
              >
                {pilotFlights.slice(0, 3).map((flight) => (
                  <tr key={flight.id}>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {new Date(flight.date).toLocaleDateString("es-ES")}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {getLocationName(flight.originId).split(" ")[0]} →{" "}
                      {getLocationName(flight.destinationId).split(" ")[0]}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {getHelicopterInfo(flight.helicopterId)}
                    </td>
                    <td
                      className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {flight.flightHours}
                    </td>
                    <td className={`px-3 sm:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm`}>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          flight.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {flight.status === "completed" ? "Completado" : "Programado"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Documentos */}
        <div>
          <h4 className={`text-base font-medium mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>Documentos</h4>

          <div
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border rounded-lg overflow-hidden`}
          >
            <ul className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
              <li className="px-4 py-3 flex justify-between items-center">
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
                  <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Licencia de Piloto
                  </span>
                </div>
                <button
                  className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
                >
                  Ver
                </button>
              </li>
              <li className="px-4 py-3 flex justify-between items-center">
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
                  <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Certificado Médico
                  </span>
                </div>
                <button
                  className={`text-sm ${darkMode ? "text-orange-400 hover:text-orange-300" : "text-orange-600 hover:text-orange-500"}`}
                >
                  Ver
                </button>
              </li>
              <li className="px-4 py-3 flex justify-between items-center">
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
                  <span className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Certificado de Entrenamiento
                  </span>
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

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            className={`px-4 py-2 border rounded-md text-sm font-medium ${
              darkMode
                ? "border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
          >
            Descargar Informe
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Editar Piloto
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default PilotDetailsModal
