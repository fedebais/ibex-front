import type React from "react"

import { useState } from "react"
import { getSettings, updateSettings } from "../../data/mockData"

interface AdminSettingsProps {
  darkMode: boolean
}

const AdminSettings = ({ darkMode = false }: AdminSettingsProps) => {
  const settings = getSettings()
  const [hourlyRate, setHourlyRate] = useState<string>(settings.hourlyRate.toString())
  const [nightHourlyRate, setNightHourlyRate] = useState<string>(settings.nightHourlyRate.toString())
  const [weekendHourlyRate, setWeekendHourlyRate] = useState<string>(settings.weekendHourlyRate.toString())
  const [holidayHourlyRate, setHolidayHourlyRate] = useState<string>(settings.holidayHourlyRate.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulación de envío de datos
    setTimeout(() => {
      const updatedSettings = {
        hourlyRate: Number.parseFloat(hourlyRate),
        nightHourlyRate: Number.parseFloat(nightHourlyRate),
        weekendHourlyRate: Number.parseFloat(weekendHourlyRate),
        holidayHourlyRate: Number.parseFloat(holidayHourlyRate),
      }

      updateSettings(updatedSettings)
      setIsSubmitting(false)
      setShowSuccess(true)

      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-2xl font-semibold">Configuración del Sistema</h1>
      </div>

      {showSuccess && (
        <div
          className={`mb-6 border-l-4 border-green-500 p-4 rounded ${
            darkMode ? "bg-green-900/20 text-green-300" : "bg-green-50 text-green-800"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Configuración actualizada correctamente</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Tarifas de Vuelo</h3>
          <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Configura las tarifas por hora de vuelo para los pilotos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tarifa estándar */}
            <div className="col-span-1">
              <label
                htmlFor="hourlyRate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Tarifa Estándar por Hora (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-gray-500 sm:text-sm`}>$</span>
                </div>
                <input
                  type="number"
                  id="hourlyRate"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className={`pl-7 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Tarifa base para horas de vuelo en días laborables.
              </p>
            </div>

            {/* Tarifa nocturna */}
            <div className="col-span-1">
              <label
                htmlFor="nightHourlyRate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Tarifa Nocturna por Hora (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-gray-500 sm:text-sm`}>$</span>
                </div>
                <input
                  type="number"
                  id="nightHourlyRate"
                  value={nightHourlyRate}
                  onChange={(e) => setNightHourlyRate(e.target.value)}
                  className={`pl-7 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Tarifa para horas de vuelo nocturnas (20:00 - 06:00).
              </p>
            </div>

            {/* Tarifa fin de semana */}
            <div className="col-span-1">
              <label
                htmlFor="weekendHourlyRate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Tarifa Fin de Semana por Hora (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-gray-500 sm:text-sm`}>$</span>
                </div>
                <input
                  type="number"
                  id="weekendHourlyRate"
                  value={weekendHourlyRate}
                  onChange={(e) => setWeekendHourlyRate(e.target.value)}
                  className={`pl-7 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Tarifa para horas de vuelo en fines de semana (sábado y domingo).
              </p>
            </div>

            {/* Tarifa días festivos */}
            <div className="col-span-1">
              <label
                htmlFor="holidayHourlyRate"
                className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"} mb-1`}
              >
                Tarifa Días Festivos por Hora (USD)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-gray-500 sm:text-sm`}>$</span>
                </div>
                <input
                  type="number"
                  id="holidayHourlyRate"
                  value={holidayHourlyRate}
                  onChange={(e) => setHolidayHourlyRate(e.target.value)}
                  className={`pl-7 block w-full rounded-md shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base py-2 px-3 border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                Tarifa para horas de vuelo en días festivos y feriados.
              </p>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full md:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                darkMode ? "focus:ring-offset-gray-800" : ""
              }`}
            >
              {isSubmitting ? "Guardando..." : "Guardar Configuración"}
            </button>
          </div>
        </form>
      </div>

      {/* Otras configuraciones */}
      <div
        className={`${darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-200"} shadow rounded-lg overflow-hidden`}
      >
        <div className={`px-4 py-5 sm:px-6 border-b ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
          <h3 className="text-lg font-medium leading-6">Configuración Adicional</h3>
          <p className={`mt-1 max-w-2xl text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Otras configuraciones del sistema.
          </p>
        </div>

        <div className="p-6">
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Próximamente se añadirán más opciones de configuración.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
