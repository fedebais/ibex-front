import { DateTime } from 'luxon'

/**
 * Utilidades para manejar fechas con luxon
 * Resuelve el problema de zona horaria donde las fechas de la DB se muestran con diferencia horaria
 */

// Zona horaria de Argentina (UTC-3)
const ARGENTINA_ZONE = 'America/Argentina/Buenos_Aires'

/**
 * Convierte una fecha string de la DB a DateTime de luxon
 * Asume que la fecha viene en formato UTC y la convierte a zona horaria de Argentina
 */
export const parseDBDate = (dateString: string): DateTime => {
  // Si la fecha no tiene zona horaria, asumimos que es UTC
  if (!dateString.includes('Z') && !dateString.includes('+')) {
    // Agregar Z para indicar que es UTC
    dateString = dateString + 'Z'
  }
  
  // Parsear como UTC y convertir a zona horaria de Argentina
  const utcDate = DateTime.fromISO(dateString, { zone: 'utc' })
  
  // Si la fecha es inválida, intentar parsear sin zona horaria
  if (!utcDate.isValid) {
    console.warn('Fecha inválida detectada:', dateString)
    // Intentar parsear como fecha local
    const localDate = DateTime.fromISO(dateString.replace('Z', ''))
    if (localDate.isValid) {
      return localDate.setZone(ARGENTINA_ZONE)
    }
  }
  
  return utcDate.setZone(ARGENTINA_ZONE)
}

/**
 * Nueva función para parsear fechas de la DB que ya están en zona horaria local
 */
export const parseDBDateAsLocal = (dateString: string): DateTime => {
  // Si la fecha no tiene zona horaria, la tratamos como local
  if (!dateString.includes('Z') && !dateString.includes('+')) {
    // Parsear como fecha local
    const localDate = DateTime.fromISO(dateString)
    if (localDate.isValid) {
      return localDate.setZone(ARGENTINA_ZONE)
    }
  }
  
  // Si tiene zona horaria, usar el método original
  return parseDBDate(dateString)
}

/**
 * Función para tratar fechas UTC como si fueran fechas locales
 * Útil cuando las fechas están guardadas en UTC pero representan fechas locales
 */
export const parseDBDateAsLocalFromUTC = (dateString: string): DateTime => {
  // Si la fecha tiene Z (UTC), la tratamos como si fuera local
  if (dateString.includes('Z')) {
    // Remover la Z y parsear como fecha local
    const localDateString = dateString.replace('Z', '')
    const localDate = DateTime.fromISO(localDateString)
    if (localDate.isValid) {
      return localDate.setZone(ARGENTINA_ZONE)
    }
  }
  
  // Si no tiene Z, usar el método normal
  return parseDBDate(dateString)
}

/**
 * Formatea una fecha para mostrar solo la fecha (sin hora)
 */
export const formatDate = (dateString: string): string => {
  const date = parseDBDateAsLocalFromUTC(dateString)
  return date.toFormat('dd/MM/yyyy')
}

/**
 * Formatea una fecha para mostrar fecha y hora
 */
export const formatDateTime = (dateString: string): string => {
  const date = parseDBDateAsLocalFromUTC(dateString)
  return date.toFormat('dd/MM/yyyy HH:mm')
}

/**
 * Formatea una fecha para mostrar solo la hora
 */
export const formatTime = (dateString: string): string => {
  const date = parseDBDateAsLocalFromUTC(dateString)
  return date.toFormat('HH:mm')
}

/**
 * Formatea una fecha para mostrar en formato largo (ej: "Lunes, 14 de Agosto de 2025")
 */
export const formatDateLong = (dateString: string): string => {
  const date = parseDBDateAsLocalFromUTC(dateString)
  return date.setLocale('es').toFormat('EEEE, dd \'de\' MMMM \'de\' yyyy')
}

/**
 * Formatea una fecha para mostrar en formato corto con hora (ej: "14/08/2025 15:30")
 */
export const formatDateShort = (dateString: string): string => {
  const date = parseDBDateAsLocalFromUTC(dateString)
  return date.toFormat('dd/MM/yyyy HH:mm')
}

/**
 * Obtiene solo la fecha sin hora para comparaciones
 */
export const getDateOnly = (dateString: string): DateTime => {
  const date = parseDBDateAsLocalFromUTC(dateString)
  return date.startOf('day')
}

/**
 * Compara si dos fechas son del mismo día
 */
export const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = getDateOnly(date1)
  const d2 = getDateOnly(date2)
  return d1.equals(d2)
}

/**
 * Obtiene la fecha actual en zona horaria de Argentina
 */
export const getCurrentDate = (): DateTime => {
  return DateTime.now().setZone(ARGENTINA_ZONE)
}

/**
 * Convierte una fecha local a formato UTC para enviar al backend
 */
export const toUTCString = (date: DateTime): string => {
  return date.toUTC().toISO() || ''
}

/**
 * Crea una fecha a partir de componentes (año, mes, día, hora, minuto)
 */
export const createDate = (
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0
): DateTime => {
  return DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: ARGENTINA_ZONE }
  )
}

/**
 * Obtiene el nombre del mes en español
 */
export const getMonthName = (month: number): string => {
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  return monthNames[month - 1] || ''
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export const getWeekdayName = (weekday: number): string => {
  const weekdayNames = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ]
  return weekdayNames[weekday] || ''
}

/**
 * Obtiene el nombre del día de la semana corto en español
 */
export const getWeekdayShort = (weekday: number): string => {
  const weekdayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return weekdayNames[weekday] || ''
}

/**
 * Función de debug para verificar el procesamiento de fechas
 */
export const debugDate = (dateString: string): void => {
  console.log('=== DEBUG FECHA ===')
  console.log('Fecha original:', dateString)
  
  const localDate = parseDBDateAsLocalFromUTC(dateString)
  console.log('Parseado como local desde UTC:', localDate.toISO())
  console.log('Es válido:', localDate.isValid)
  console.log('Fecha formateada:', localDate.toFormat('dd/MM/yyyy HH:mm'))
  console.log('Fecha larga:', localDate.setLocale('es').toFormat('EEEE, dd \'de\' MMMM \'de\' yyyy'))
  console.log('==================')
}

/**
 * Crea una fecha para enviar al backend (fecha del vuelo sin hora)
 * Convierte la fecha local a UTC para almacenamiento
 */
export const createFlightDate = (dateString: string): string => {
  // dateString viene en formato "YYYY-MM-DD" (fecha local)
  const localDate = DateTime.fromISO(dateString, { zone: ARGENTINA_ZONE })
  
  if (!localDate.isValid) {
    throw new Error(`Fecha inválida: ${dateString}`)
  }
  
  // Convertir a UTC para almacenamiento en la DB
  return localDate.toUTC().toISO() || ''
}

/**
 * Convierte un tiempo HH:MM a DateTime ISO para enviar al backend
 * Combina la fecha del vuelo con el tiempo especificado
 */
export const createFlightTime = (timeString: string, baseDate: string): string => {
  // timeString viene en formato "HH:MM" (hora local)
  // baseDate viene en formato "YYYY-MM-DD" (fecha local)
  
  if (!timeString || !baseDate) {
    throw new Error('Tiempo y fecha son requeridos')
  }
  
  // Crear DateTime en zona horaria de Argentina
  const localDateTime = DateTime.fromISO(`${baseDate}T${timeString}:00`, { zone: ARGENTINA_ZONE })
  
  if (!localDateTime.isValid) {
    throw new Error(`Fecha/hora inválida: ${baseDate}T${timeString}:00`)
  }
  
  // Convertir a UTC para almacenamiento en la DB
  return localDateTime.toUTC().toISO() || ''
}

/**
 * Calcula la duración entre dos tiempos en minutos
 * Usa Luxon para manejo correcto de timezone
 */
export const calculateFlightDuration = (startTime: string, endTime: string, baseDate: string): number => {
  try {
    const startDateTime = createFlightTime(startTime, baseDate)
    const endDateTime = createFlightTime(endTime, baseDate)
    
    const start = DateTime.fromISO(startDateTime)
    const end = DateTime.fromISO(endDateTime)
    
    if (!start.isValid || !end.isValid) {
      throw new Error('Tiempos inválidos para calcular duración')
    }
    
    // Calcular diferencia en minutos
    const diff = end.diff(start, 'minutes')
    
    // Si la diferencia es negativa, asumir que cruza medianoche
    if (diff.minutes < 0) {
      return diff.minutes + (24 * 60) // Agregar 24 horas
    }
    
    return Math.floor(diff.minutes)
  } catch (error) {
    console.error('Error calculando duración del vuelo:', error)
    return 0
  }
}
