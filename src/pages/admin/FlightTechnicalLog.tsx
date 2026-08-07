import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Printer, ArrowLeft } from "lucide-react"
import { DateTime } from "luxon"
import { useUser } from "../../context/UserContext"
import { getFlightLogById } from "../../services/api"
import type { FlightLog } from "../../types/api"
import { formatTimeFromUTC } from "../../utils/dateUtils"

const ARGENTINA_ZONE = "America/Argentina/Buenos_Aires"

const EMPTY_ROWS = 11
const FLIGHT_COLS = 20

const formatDateShort = (isoDate?: string) => {
  if (!isoDate) return ""
  const dt = DateTime.fromISO(isoDate, { zone: "utc" }).setZone(ARGENTINA_ZONE)
  return dt.isValid ? dt.toFormat("dd/MM/yy") : ""
}

const num = (v?: number | null, digits = 2) =>
  v == null || Number.isNaN(v) ? "" : v.toFixed(digits)

const int = (v?: number | null) => (v == null ? "" : String(v))

const fuelLoaded = (start?: number | null, end?: number | null) => {
  if (start == null || end == null) return ""
  const diff = start - end
  return diff > 0 ? `${diff.toFixed(0)} L` : ""
}

export default function FlightTechnicalLog() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { accessToken } = useUser()
  const [flight, setFlight] = useState<FlightLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !accessToken) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const data = await getFlightLogById(Number(id), accessToken)
        if (!cancelled) setFlight(data)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error cargando la bitácora")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [id, accessToken])

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Cargando bitácora...</div>
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>{error}</div>
  if (!flight) return <div style={{ padding: 40, textAlign: "center" }}>Vuelo no encontrado</div>

  const formNo = String(flight.id).padStart(5, "0")
  const dateFmt = formatDateShort(flight.date)
  const pilotName = flight.pilot?.user
    ? `${flight.pilot.user.firstName} ${flight.pilot.user.lastName}`
    : ""
  const startTime = flight.startTime ? formatTimeFromUTC(flight.startTime) : ""
  const stopTime = flight.landingTime ? formatTimeFromUTC(flight.landingTime) : ""
  const model = flight.helicopter?.model?.name || ""
  const registration = flight.helicopter?.registration || ""

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 8mm; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .btc-wrapper { padding: 0 !important; background: #fff !important; }
        }
        .btc-wrapper {
          background: #f3f4f6;
          min-height: 100vh;
          padding: 20px;
        }
        .btc-actions {
          max-width: 297mm;
          margin: 0 auto 12px;
          display: flex;
          gap: 8px;
          justify-content: space-between;
          align-items: center;
        }
        .btc-actions .left, .btc-actions .right { display: flex; gap: 8px; }
        .btc-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 6px; cursor: pointer;
          font-size: 14px; border: 1px solid #d1d5db; background: #fff;
        }
        .btc-btn.primary {
          background: #f97316; color: #fff; border-color: #f97316;
        }
        .btc-btn.primary:hover { background: #ea580c; }
        .btc {
          font-family: Arial, Helvetica, sans-serif;
          color: #000; background: #fff;
          font-size: 9px;
          width: 100%;
          max-width: 297mm;
          margin: 0 auto;
          padding: 6mm;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        @media print {
          .btc { box-shadow: none; padding: 0; max-width: none; }
        }
        .btc table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .btc th, .btc td {
          border: 1px solid #000;
          padding: 2px 3px;
          text-align: center;
          vertical-align: middle;
          font-size: 8px;
          word-wrap: break-word;
          overflow: hidden;
        }
        .btc th {
          background: #fff;
          font-weight: bold;
          font-size: 7.5px;
          line-height: 1.1;
        }
        .btc .header {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          align-items: center;
          gap: 8px;
          border: 1px solid #000;
          padding: 8px 10px;
          margin-bottom: 4px;
        }
        .btc .company { font-size: 9px; line-height: 1.25; }
        .btc .company .brand { font-size: 13px; font-weight: bold; letter-spacing: 0.5px; }
        .btc .title { text-align: center; font-size: 15px; font-weight: bold; }
        .btc .subtitle { text-align: center; font-size: 11px; margin-top: 2px; letter-spacing: 4px; }
        .btc .form-no { text-align: right; font-size: 13px; font-weight: bold; }
        .btc .section-title {
          background: #fff;
          font-weight: bold;
          text-align: left;
          padding: 3px 6px;
          border: 1px solid #000;
          border-bottom: none;
          font-size: 9px;
          letter-spacing: 0.5px;
        }
        .btc .row-empty td { height: 16px; }
        .btc .filled { background: #fffbe6; }
        .btc .notes-box {
          border: 1px solid #000;
          padding: 4px 8px;
          min-height: 34px;
          font-size: 9px;
          text-align: left;
        }
        .btc .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
        }
        .btc .mt-1 { margin-top: 4px; }
        .btc .mt-2 { margin-top: 8px; }
      `}</style>

      <div className="btc-wrapper">
        <div className="btc-actions no-print">
          <div className="left">
            <button className="btc-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={16} /> Volver
            </button>
          </div>
          <div className="right">
            <button className="btc-btn primary" onClick={() => window.print()}>
              <Printer size={16} /> Imprimir / Guardar PDF
            </button>
          </div>
        </div>

        <div className="btc">
          {/* Header */}
          <div className="header">
            <div className="company">
              <div className="brand">ROTORWAY S.A.</div>
              <div>CUIT 30-71344654-3</div>
              <div>Lima 733 5°</div>
              <div>CABA (1073)</div>
            </div>
            <div>
              <div className="title">FLIGHT TECHNICAL LOG</div>
              <div className="subtitle">BITÁCORA</div>
            </div>
            <div className="form-no">N° {formNo}</div>
          </div>

          {/* Top summary: A/C, Engine #1, Engine #2, Hoist */}
          <table>
            <thead>
              <tr>
                <th colSpan={3}>A/C</th>
                <th colSpan={5}>Engine #1</th>
                <th colSpan={5}>Engine #2</th>
                <th colSpan={5}>Hoist</th>
              </tr>
              <tr>
                <th>FLT Number</th>
                <th>Total BFF</th>
                <th>Model / Reg.</th>
                <th>Flight time</th>
                <th>LDN</th>
                <th>Starts</th>
                <th>Kg/N1</th>
                <th>NT/N2</th>
                <th>Flight time</th>
                <th>LDN</th>
                <th>Starts</th>
                <th>Kg/N1</th>
                <th>NT/N2</th>
                <th>S/N</th>
                <th>Op.H</th>
                <th>Cy Amount</th>
                <th>Cy H</th>
                <th>Hoist Cycles</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="filled">{flight.flightNumber || ""}</td>
                <td></td>
                <td className="filled">{model}{registration ? ` / ${registration}` : ""}</td>
                <td className="filled">{num(flight.flightTime)}</td>
                <td className="filled">{int(flight.landings)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* Flight rows */}
          <div className="mt-1">
            <div className="section-title">Vuelo</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "3%" }}>#</th>
                  <th style={{ width: "5%" }}>DATE<br />(dd/mm)</th>
                  <th style={{ width: "5%" }}>BFF acc.<br />AFM</th>
                  <th style={{ width: "8%" }}>Pilot</th>
                  <th style={{ width: "6%" }}>Copilot</th>
                  <th style={{ width: "3%" }}>PAX</th>
                  <th style={{ width: "6%" }}>From</th>
                  <th style={{ width: "5%" }}>Route</th>
                  <th style={{ width: "6%" }}>To</th>
                  <th style={{ width: "5%" }}>Start<br />(UTC)</th>
                  <th style={{ width: "5%" }}>Stop<br />(UTC)</th>
                  <th style={{ width: "5%" }}>Block<br />Time</th>
                  <th style={{ width: "5%" }}>Flight<br />Time</th>
                  <th style={{ width: "3%" }}>LDN</th>
                  <th style={{ width: "3%" }}>Starts</th>
                  <th style={{ width: "5%" }}>Fuel<br />loaded</th>
                  <th style={{ width: "3%" }}>T/O</th>
                  <th style={{ width: "3%" }}>Land</th>
                  <th style={{ width: "3%" }}>VDO</th>
                  <th style={{ width: "8%" }}>Signature /<br />Print name</th>
                </tr>
              </thead>
              <tbody>
                <tr className="filled">
                  <td>1</td>
                  <td>{dateFmt}</td>
                  <td></td>
                  <td>{pilotName}</td>
                  <td></td>
                  <td>{int(flight.passengers)}</td>
                  <td>{flight.origin?.name || ""}</td>
                  <td></td>
                  <td>{flight.destination?.name || ""}</td>
                  <td>{startTime}</td>
                  <td>{stopTime}</td>
                  <td>{num(flight.blockTime)}</td>
                  <td>{num(flight.flightTime)}</td>
                  <td>{int(flight.landings)}</td>
                  <td></td>
                  <td>{fuelLoaded(flight.fuelStart, flight.fuelEnd)}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{pilotName}</td>
                </tr>
                {Array.from({ length: EMPTY_ROWS }).map((_, i) => (
                  <tr key={i} className="row-empty">
                    <td>{i + 2}</td>
                    {Array.from({ length: FLIGHT_COLS - 1 }).map((_, j) => (
                      <td key={j}></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes / Remarks */}
          <div className="mt-1">
            <div className="section-title">Notas / Remarks</div>
            <div className="notes-box">{flight.notes || flight.remarks || ""}</div>
          </div>

          {/* Fuel & Oil + Next Inspection */}
          <div className="mt-1 grid-2">
            <div>
              <div className="section-title">Fuel &amp; Oil Quantity Filled Up</div>
              <table>
                <thead>
                  <tr>
                    <th>Engine Oil</th>
                    <th>Aux ADD1</th>
                    <th>JAN AGN</th>
                    <th>DKF</th>
                    <th>Nose gear<br />Cy/H</th>
                    <th>MR Brake<br />Cy/H</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-empty">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <div className="section-title">Next Inspection</div>
              <table>
                <thead>
                  <tr>
                    <th>Hours</th>
                    <th>Cycles</th>
                    <th>Op hours</th>
                    <th>Calendar</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-empty">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Operator / Maintenance Center Report */}
          <div className="mt-1">
            <div className="section-title">Operator / Maintenance Center Report</div>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "50%" }}>Defects</th>
                  <th style={{ width: "50%" }}>Corrective / Maintenance actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ height: 44 }}></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures footer */}
          <div className="mt-1">
            <table>
              <thead>
                <tr>
                  <th style={{ width: "20%" }}>Pilot Sign</th>
                  <th style={{ width: "20%" }}>TMA Sign</th>
                  <th style={{ width: "20%" }}>BFF Sign / Stamp</th>
                  <th style={{ width: "20%" }}>Date</th>
                  <th style={{ width: "20%" }}>LT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ height: 32 }}>{pilotName}</td>
                  <td></td>
                  <td></td>
                  <td>{dateFmt}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
