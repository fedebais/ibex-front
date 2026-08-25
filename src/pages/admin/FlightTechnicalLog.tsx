import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Printer, ArrowLeft } from "lucide-react"
import { DateTime } from "luxon"
import { useUser } from "../../context/UserContext"
import { getBitacora } from "../../services/api"
import type { FlightLog } from "../../types/api"
import { formatTimeFromUTC } from "../../utils/dateUtils"

const ARGENTINA_ZONE = "America/Argentina/Buenos_Aires"
const MIN_FLIGHT_ROWS = 10
const MIN_DEFECT_ROWS = 6

const formatDateShort = (isoDate?: string) => {
  if (!isoDate) return ""
  const dt = DateTime.fromISO(isoDate, { zone: "utc" }).setZone(ARGENTINA_ZONE)
  return dt.isValid ? dt.toFormat("dd/MM/yy") : ""
}

const formatDateFromYmd = (ymd?: string) => {
  if (!ymd) return ""
  const dt = DateTime.fromISO(ymd, { zone: ARGENTINA_ZONE })
  return dt.isValid ? dt.toFormat("dd/MM/yy") : ymd
}

const num = (v?: number | null, digits = 2) =>
  v == null || Number.isNaN(v) ? "" : v.toFixed(digits)

const int = (v?: number | null) => (v == null ? "" : String(v))

const pilotName = (flight: FlightLog) =>
  flight.pilot?.user ? `${flight.pilot.user.firstName} ${flight.pilot.user.lastName}` : ""

export default function FlightTechnicalLog() {
  const { helicopterId, date } = useParams<{ helicopterId: string; date: string }>()
  const navigate = useNavigate()
  const { accessToken } = useUser()
  const [data, setData] = useState<{
    helicopter: any
    date: string
    formNumber: number
    flights: FlightLog[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!helicopterId || !date || !accessToken) return
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const res = await getBitacora(Number(helicopterId), date, accessToken)
        if (!cancelled) setData(res)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Error cargando la bitácora")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [helicopterId, date, accessToken])

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Cargando bitácora...</div>
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "#dc2626" }}>{error}</div>
  if (!data) return <div style={{ padding: 40, textAlign: "center" }}>Bitácora no encontrada</div>

  const { helicopter, date: dateYmd, formNumber, flights } = data
  const formNo = `${String(helicopter.id).padStart(2, "0")}-${String(formNumber).padStart(5, "0")}`
  const dateFmt = formatDateFromYmd(dateYmd)
  const model = helicopter?.model?.name || ""
  const registration = helicopter?.registration || ""

  const filledCount = flights.length
  const emptyRows = Math.max(0, MIN_FLIGHT_ROWS - filledCount)

  return (
    <>
      <style>{`
        @page { size: A4 landscape; margin: 5mm; }
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
        .btc-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 6px; cursor: pointer;
          font-size: 14px; border: 1px solid #d1d5db; background: #fff;
        }
        .btc-btn.primary { background: #f97316; color: #fff; border-color: #f97316; }
        .btc-btn.primary:hover { background: #ea580c; }

        .btc {
          font-family: Arial, Helvetica, sans-serif;
          color: #000; background: #fff;
          width: 100%; max-width: 297mm;
          margin: 0 auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          box-sizing: border-box;
        }
        @media print { .btc { box-shadow: none; max-width: none; } }

        .btc table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 7px;
        }
        .btc th, .btc td {
          border: 1px solid #000;
          padding: 1px 2px;
          text-align: center;
          vertical-align: middle;
          word-wrap: break-word;
          overflow: hidden;
          line-height: 1.05;
        }
        .btc th { font-weight: bold; background: #fff; font-size: 6.5px; }
        .btc .b { font-weight: bold; }
        .btc .l { text-align: left; padding-left: 3px; }
        .btc .r { text-align: right; padding-right: 3px; }
        .btc .brand { font-weight: bold; font-size: 10.5px; text-align: left; padding: 2px 4px; }
        .btc .title { font-weight: bold; font-size: 16px; letter-spacing: 1px; padding: 2px 4px; text-align: center; }
        .btc .lbl { font-weight: bold; font-size: 7px; text-align: left; padding-left: 3px; }
        .btc .lbl-c { font-weight: bold; font-size: 7px; }
        .btc .lbl-sm { font-weight: bold; font-size: 6.5px; text-align: left; padding-left: 3px; }
        .btc .data { font-size: 8.5px; }
        .btc .tall { height: 13px; }
        .btc .taller { height: 16px; }
        .btc .section { font-weight: bold; font-size: 8px; text-align: left; padding: 2px 4px; }

        .btc .foot {
          display: grid;
          grid-template-columns: 20% 60% 20%;
          border-top: 1px solid #000;
          padding: 6px 8px 4px;
          align-items: center;
        }
        .btc .foot .fno { font-weight: bold; font-size: 12px; letter-spacing: 0.5px; }
        .btc .foot .btit { font-weight: bold; font-size: 12px; letter-spacing: 6px; text-align: center; }
        .btc .disclaimer { font-size: 6px; padding: 2px 8px 4px; line-height: 1.2; }
      `}</style>

      <div className="btc-wrapper">
        <div className="btc-actions no-print">
          <button className="btc-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Volver
          </button>
          <button className="btc-btn primary" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir / Guardar PDF
          </button>
        </div>

        <div className="btc">
          {/* ============ HEADER + TOP SUMMARY ============
              21 cols: ROTORWAY(1) + label(1) + valA(1) + labelB(1) + valB(1) + A/C(1) + Engine#1(6) + Engine#2(6) + HoistSN(1) + Hoist(2) */}
          <table>
            <colgroup>
              <col style={{ width: "9%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="brand" rowSpan={5}>
                  ROTORWAY S.A.
                  <div style={{ fontWeight: "normal", fontSize: 6.5, marginTop: 3 }}>CUIT 30-71244434-3</div>
                  <div style={{ fontWeight: "normal", fontSize: 6.5 }}>Lima 711 5°</div>
                  <div style={{ fontWeight: "normal", fontSize: 6.5 }}>CABA (1073)</div>
                </td>
                <td className="title" colSpan={4}>FLIGHT TECHNICAL LOG</td>
                <th>A/C</th>
                <th colSpan={6}>Engine #1</th>
                <th colSpan={6}>Engine #2</th>
                <th>Hoist S/N</th>
                <th colSpan={2}>Hoist</th>
              </tr>
              <tr>
                <td className="lbl">FTL Number:</td>
                <td className="data" colSpan={3}></td>
                <td className="data" rowSpan={4}></td>
                <th>Flight time</th>
                <th>LDN</th>
                <th>Flight time</th>
                <th>Starts</th>
                <th>Ng/N1</th>
                <th>NT/N2</th>
                <th>Flight Time</th>
                <th>Starts</th>
                <th>Ng/N1</th>
                <th>Nf/N2</th>
                <th>Op.H</th>
                <th>Cy Bamb</th>
                <td className="data" rowSpan={4}></td>
                <th>Cy</th>
                <th>Op.H</th>
              </tr>
              <tr>
                <td className="lbl">Date:</td>
                <td className="data">{dateFmt}</td>
                <td className="lbl b">TOTAL BFF</td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
              </tr>
              <tr>
                <td className="lbl">Model:</td>
                <td className="data">{model}</td>
                <td className="lbl b">Partial</td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
              </tr>
              <tr>
                <td className="lbl">Reg:</td>
                <td className="data">{registration}</td>
                <td className="lbl b">TOTAL ALF</td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
                <td className="data"></td>
              </tr>
            </tbody>
          </table>

          {/* ============ FLIGHT ROWS (30 columns) ============ */}
          <table>
            <colgroup>
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "3.5%" }} />
              <col style={{ width: "3.5%" }} />
              <col style={{ width: "3.5%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "3.5%" }} />
              <col style={{ width: "3.5%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "2%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3.5%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "2.5%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "3%" }} />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2}>S/N</th>
                <th rowSpan={2}>TA**<br/>CRS*<br/>Sign./<br/>Stamp</th>
                <th rowSpan={2}>TA<br/>Sign./<br/>Stamp</th>
                <th rowSpan={2}>Pilot's<br/>acceptance<br/>Sign.</th>
                <th rowSpan={2}>Flight<br/>Type</th>
                <th rowSpan={2}>Pilot</th>
                <th rowSpan={2}>Copilot</th>
                <th rowSpan={2}>Pax<br/>Nr</th>
                <th colSpan={2}>Route</th>
                <th rowSpan={2}>Start<br/>time</th>
                <th rowSpan={2}>Stop<br/>time</th>
                <th rowSpan={2}>Block<br/>time</th>
                <th rowSpan={2}>Flight<br/>time</th>
                <th rowSpan={2}>LDN</th>
                <th rowSpan={2}>Start<br/>Nr</th>
                <th colSpan={2}>Fuel</th>
                <th rowSpan={2}>Rapid<br/>T/O</th>
                <th rowSpan={2}>VEMO<br/>Flight Nr</th>
                <th colSpan={3}>Eng.#1 Cycles</th>
                <th colSpan={3}>Eng.#2 Cycles</th>
                <th rowSpan={2}>Hook<br/>P/(LR/WR)</th>
                <th rowSpan={2}>Lifts<br/>Cy/H</th>
                <th rowSpan={2}>Hoist<br/>Cy/H</th>
                <th rowSpan={2}>MR<br/>Brake<br/>Cy/H</th>
              </tr>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>T/O</th>
                <th>Land</th>
                <th>Ng/N1</th>
                <th>Nf/N2</th>
                <th>Ng/<br/>Usage</th>
                <th>Ng/N1</th>
                <th>Nf/N2</th>
                <th>Ng/<br/>Usage</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f, idx) => (
                <tr key={f.id}>
                  <td>{idx + 1}</td>
                  <td></td><td></td><td></td><td></td>
                  <td className="l data">{pilotName(f)}</td>
                  <td></td>
                  <td>{int(f.passengers)}</td>
                  <td className="data">{f.origin?.name || ""}</td>
                  <td className="data">{f.destination?.name || ""}</td>
                  <td>{f.startTime ? formatTimeFromUTC(f.startTime) : ""}</td>
                  <td>{f.landingTime ? formatTimeFromUTC(f.landingTime) : ""}</td>
                  <td>{num(f.blockTime)}</td>
                  <td>{num(f.flightTime)}</td>
                  <td>{int(f.landings)}</td>
                  <td></td>
                  <td></td>
                  <td>{f.fuelStart != null && f.fuelEnd != null ? Math.max(0, f.fuelStart - f.fuelEnd).toFixed(0) : ""}</td>
                  <td></td>
                  <td>{f.flightNumber || ""}</td>
                  <td></td><td></td><td></td>
                  <td></td><td></td><td></td>
                  <td></td><td></td><td></td><td></td>
                </tr>
              ))}
              {Array.from({ length: emptyRows }).map((_, i) => (
                <tr key={`e-${i}`}>
                  <td className="tall">{filledCount + i + 1}</td>
                  {Array.from({ length: 29 }).map((_, j) => <td key={j}></td>)}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ============ BFF ACCORDING TO AFM + ACCUMULATED / FUEL & OIL + NEXT MAINT ============
              21 cols: BFF(1) + 3sets*4(12) + Accum(1) + FUEL/OIL(4:T,FUEL,#1OIL,#2OIL) + NextMaint(3:Type,Hours,Cycles/Date) */}
          <table>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="lbl-sm" colSpan={13}>* Performed in accordance with WO ________________________________________________</td>
                <td className="lbl-c">Accumulated:</td>
                <td className="lbl-sm" colSpan={4} style={{ textAlign: "center" }}>FUEL &amp; OIL QUANTITY FILLED UP</td>
                <td className="lbl-sm" colSpan={3} style={{ textAlign: "center" }}>Next Maintenance</td>
              </tr>
              <tr>
                <td className="lbl-sm" rowSpan={2}>BFF<br/>according to<br/>AFM</td>
                <th>DATE:<br/>(dd/mm)</th>
                <th>UTC:</th>
                <th>Signature</th>
                <th>Pilot name</th>
                <th>DATE:<br/>(dd/mm)</th>
                <th>UTC:</th>
                <th>Signature</th>
                <th>Pilot name</th>
                <th>DATE:<br/>(dd/mm)</th>
                <th>UTC:</th>
                <th>Signature</th>
                <th>Pilot name</th>
                <td rowSpan={2} className="data"></td>
                <th>T</th>
                <th>FUEL</th>
                <th>ENG.#1 OIL</th>
                <th>ENG.#2 OIL</th>
                <th>Type</th>
                <th>Hours</th>
                <th>Cycles/Date</th>
              </tr>
              <tr>
                <td className="data">{dateFmt}</td>
                <td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td>
                <td className="tall"></td><td></td><td></td><td></td>
                <td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>

          {/* ============ HOIST + ENGINE POWER CHECK ============
              19 cols: Hoist section(6: S/N, Cal, Cyc, Op.h, Cyc, Op.h) + Engine power(13) */}
          <table>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "4%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="lbl-c" colSpan={6} style={{ textAlign: "center" }}>Hoist</td>
                <td className="lbl-sm" colSpan={13} style={{ textAlign: "center" }}>Engine's power check. Next at TT A/C: __________________________ A</td>
              </tr>
              <tr>
                <th rowSpan={2}>S/N</th>
                <th colSpan={3}>Next Inspection</th>
                <th colSpan={2}>Used for maintenance</th>
                <th rowSpan={2}>Eng.</th>
                <th rowSpan={2}>Fl. Nr</th>
                <th rowSpan={2}>IAS</th>
                <th rowSpan={2}>OAT/<br/>T1</th>
                <th rowSpan={2}>T2/<br/>P0</th>
                <th rowSpan={2}>Q</th>
                <th rowSpan={2}>Ng/<br/>N1</th>
                <th rowSpan={2}>Nf/N2</th>
                <th rowSpan={2}>T</th>
                <th rowSpan={2}>ΔT ΔQ/ΔT</th>
                <th rowSpan={2}>ΔQ</th>
                <th rowSpan={2}>ΔN1 ΔQ/ΔN1</th>
                <th rowSpan={2}>OK?</th>
              </tr>
              <tr>
                <th>Calendar</th>
                <th>Cycles</th>
                <th>Op. hours</th>
                <th>Cycles</th>
                <th>Op. hours</th>
              </tr>
              <tr>
                <td className="tall"></td>
                <td></td><td></td><td></td>
                <td></td><td></td>
                <td className="tall b">#1</td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td className="tall"></td>
                <td></td><td></td><td></td>
                <td></td><td></td>
                <td className="tall b">#2</td>
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>

          {/* ============ MAINTENANCE CENTER REPORT ============
              12 cols: OPERATOR(4: T, Defects, PilotSign, TMASign) + MAINTENANCE(8: T, Corrective, Date, LocalTime, MEC, SUP, DefNr, CatMEL) */}
          <table>
            <colgroup>
              <col style={{ width: "3%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "34%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "5%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="section" colSpan={4}>OPERATOR / MAINTENANCE CENTER REPORT</td>
                <td className="section" colSpan={8}>MAINTENANCE CENTER REPORT</td>
              </tr>
              <tr>
                <th rowSpan={2}>T</th>
                <th rowSpan={2}>Defects</th>
                <th rowSpan={2}>Pilot Sign</th>
                <th rowSpan={2}>TMA Sign</th>
                <th rowSpan={2}>T</th>
                <th rowSpan={2}>Corrective / Maintenance actions</th>
                <th rowSpan={2}>Date</th>
                <th rowSpan={2}>Local<br/>Time</th>
                <th colSpan={2}>CRS*</th>
                <th rowSpan={2}>Def.<br/>Nr.</th>
                <th rowSpan={2}>Cat.<br/>MEL</th>
              </tr>
              <tr>
                <th>MEC</th>
                <th>SUP</th>
              </tr>
              {Array.from({ length: MIN_DEFECT_ROWS }).map((_, i) => (
                <tr key={`d-${i}`}>
                  <td className="taller"></td>
                  <td></td><td></td><td></td>
                  <td></td><td></td>
                  <td></td><td></td><td></td><td></td><td></td><td></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ============ SIGNATURES ============
              16 cols: 4 sets × {label, Sign./Stamp*, Date, LT} */}
          <table>
            <colgroup>
              <col style={{ width: "4%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "3%" }} />
              <col style={{ width: "4%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "3%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>BFF<sup>(0)</sup></th>
                <th>Sign./Stamp*</th>
                <th>Date</th>
                <th>LT</th>
                <th>BFF<sup>(1)</sup></th>
                <th>Sign./Stamp*</th>
                <th>Date</th>
                <th>LT</th>
                <th>BFF<sup>(2)</sup></th>
                <th>Sign./Stamp*</th>
                <th>Date</th>
                <th>LT</th>
                <th>ALF<sup>(3)</sup></th>
                <th>Sign./Stamp*</th>
                <th>Date</th>
                <th>LT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="tall"></td>
                <td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td>
                <td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>

          <div className="disclaimer">
            <b><sup>(2)</sup></b> Performed i.a.w. WO ________________________________________________
            &nbsp;&nbsp;&nbsp;&nbsp;
            <b><sup>(3)</sup></b> Performed i.a.w. WO ________________________________________________
            <br /><b>*</b> Certifies that work specified, except as otherwise specified, was carried out in accordance with DAR-145 and in respect to this work, the aircraft is considered ready for release to service.
          </div>

          {/* ============ N° 00083 / BITACORA (footer) ============ */}
          <div className="foot">
            <div className="fno">N° {formNo}</div>
            <div className="btit">BITÁCORA</div>
            <div>&nbsp;</div>
          </div>
        </div>
      </div>
    </>
  )
}
