"use client"

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Search } from "lucide-react"
import { DateTime } from "luxon"
import { useUser } from "../../context/UserContext"
import { getFlightLogs, getHelicopters } from "../../services/api"
import type { FlightLog, Helicopter } from "../../types/api"

const ARGENTINA_ZONE = "America/Argentina/Buenos_Aires"

interface RTVListProps {
  darkMode: boolean
}

interface RTVRow {
  helicopterId: number
  date: string // YYYY-MM-DD (AR)
  registration: string
  model: string
  flightCount: number
  pilots: string[]
  formNumber: number
}

const toArDate = (isoUtc: string): string => {
  const dt = DateTime.fromISO(isoUtc, { zone: "utc" }).setZone(ARGENTINA_ZONE)
  return dt.isValid ? dt.toFormat("yyyy-MM-dd") : ""
}

const formatDateDisplay = (arDate: string): string => {
  const dt = DateTime.fromISO(arDate, { zone: ARGENTINA_ZONE })
  return dt.isValid ? dt.toFormat("dd/MM/yyyy") : arDate
}

const RTVList = ({ darkMode }: RTVListProps) => {
  const navigate = useNavigate()
  const { accessToken } = useUser()
  const [flights, setFlights] = useState<FlightLog[]>([])
  const [helicopters, setHelicopters] = useState<Helicopter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [helicopterFilter, setHelicopterFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const [f, h] = await Promise.all([
          getFlightLogs(accessToken),
          getHelicopters(accessToken),
        ])
        if (!cancelled) {
          setFlights(f)
          setHelicopters(h)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error cargando RTVs")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [accessToken])

  const rows = useMemo<RTVRow[]>(() => {
    // Agrupar por (helicopterId, arDate)
    const groups = new Map<string, {
      helicopterId: number
      date: string
      registration: string
      model: string
      flights: FlightLog[]
      pilotSet: Set<string>
    }>()

    for (const f of flights) {
      const arDate = toArDate(f.date)
      if (!arDate) continue
      const key = `${f.helicopterId}|${arDate}`
      let g = groups.get(key)
      if (!g) {
        g = {
          helicopterId: f.helicopterId,
          date: arDate,
          registration: f.helicopter?.registration || "",
          model: f.helicopter?.model?.name || "",
          flights: [],
          pilotSet: new Set(),
        }
        groups.set(key, g)
      }
      g.flights.push(f)
      const pn = f.pilot?.user ? `${f.pilot.user.firstName} ${f.pilot.user.lastName}` : ""
      if (pn) g.pilotSet.add(pn)
    }

    // Calcular formNumber por aeronave: ordenar fechas asc y numerar
    const datesByHeli = new Map<number, string[]>()
    for (const g of groups.values()) {
      const arr = datesByHeli.get(g.helicopterId) || []
      arr.push(g.date)
      datesByHeli.set(g.helicopterId, arr)
    }
    const rankByKey = new Map<string, number>()
    for (const [heliId, dates] of datesByHeli.entries()) {
      const sorted = [...dates].sort()
      sorted.forEach((d, i) => rankByKey.set(`${heliId}|${d}`, i + 1))
    }

    const out: RTVRow[] = []
    for (const g of groups.values()) {
      out.push({
        helicopterId: g.helicopterId,
        date: g.date,
        registration: g.registration,
        model: g.model,
        flightCount: g.flights.length,
        pilots: Array.from(g.pilotSet).sort(),
        formNumber: rankByKey.get(`${g.helicopterId}|${g.date}`) || 0,
      })
    }
    // Ordenar por fecha desc, luego matrícula
    out.sort((a, b) => (a.date === b.date ? a.registration.localeCompare(b.registration) : b.date.localeCompare(a.date)))
    return out
  }, [flights])

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (helicopterFilter !== "all" && String(r.helicopterId) !== helicopterFilter) return false
      if (dateFrom && r.date < dateFrom) return false
      if (dateTo && r.date > dateTo) return false
      if (search) {
        const s = search.toLowerCase()
        const inReg = r.registration.toLowerCase().includes(s)
        const inModel = r.model.toLowerCase().includes(s)
        const inPilot = r.pilots.some((p) => p.toLowerCase().includes(s))
        if (!inReg && !inModel && !inPilot) return false
      }
      return true
    })
  }, [rows, helicopterFilter, dateFrom, dateTo, search])

  const openRTV = (helicopterId: number, date: string) => {
    navigate(`/bitacora/${helicopterId}/${date}`)
  }

  return (
    <div className={darkMode ? "text-white" : "text-gray-900"}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">RTVs (Registro Técnico de Vuelo)</h1>
        <p className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Una RTV por día y aeronave. Cada RTV agrupa todos los vuelos del día.
        </p>
      </div>

      <div className={`rounded-lg shadow p-4 mb-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar matrícula, modelo o piloto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 rounded-md border text-sm ${
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
              }`}
            />
          </div>
          <select
            value={helicopterFilter}
            onChange={(e) => setHelicopterFilter(e.target.value)}
            className={`px-3 py-2 rounded-md border text-sm ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
            }`}
          >
            <option value="all">Todas las aeronaves</option>
            {helicopters.map((h) => (
              <option key={h.id} value={h.id}>
                {h.registration} — {h.model?.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`px-3 py-2 rounded-md border text-sm ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
            }`}
            placeholder="Desde"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={`px-3 py-2 rounded-md border text-sm ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300"
            }`}
            placeholder="Hasta"
          />
        </div>
      </div>

      <div className={`rounded-lg shadow overflow-hidden ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {loading && (
          <div className="p-8 text-center text-sm text-gray-500">Cargando RTVs...</div>
        )}
        {error && (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? "bg-gray-900" : "bg-gray-50"}>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Fecha</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Aeronave</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Modelo</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider"># Vuelos</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">Piloto(s)</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">N° RTV</th>
                  <th className="px-4 py-2 text-center text-xs font-medium uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-200"}`}>
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No hay RTVs para los filtros seleccionados.
                    </td>
                  </tr>
                )}
                {filteredRows.map((r) => (
                  <tr key={`${r.helicopterId}-${r.date}`} className={darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}>
                    <td className="px-4 py-2 text-sm whitespace-nowrap">{formatDateDisplay(r.date)}</td>
                    <td className="px-4 py-2 text-sm font-medium whitespace-nowrap">{r.registration}</td>
                    <td className="px-4 py-2 text-sm">{r.model}</td>
                    <td className="px-4 py-2 text-sm text-center">{r.flightCount}</td>
                    <td className="px-4 py-2 text-sm">{r.pilots.join(", ")}</td>
                    <td className="px-4 py-2 text-sm text-center font-mono">{String(r.formNumber).padStart(5, "0")}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      <button
                        onClick={() => openRTV(r.helicopterId, r.date)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-orange-600 text-white hover:bg-orange-700 text-xs"
                      >
                        <FileText size={14} /> Ver RTV
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <div className={`mt-3 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          {filteredRows.length} RTV{filteredRows.length === 1 ? "" : "s"}
        </div>
      )}
    </div>
  )
}

export default RTVList
