// Tipos para autenticación
export interface LoginResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  active: boolean
  role: UserRole
  accessToken: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: UserRole
}

// Tipos para usuarios - Corregido para coincidir con el enum del backend
export type UserRole = "ADMIN" | "PILOT" | "TECNICO"
export type FlightStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED"
export type PaymentStatus = "PENDING_INVOICE" | "INVOICED" | "PENDING_PAYMENT" | "PAID"
export type HelicopterStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE"
// Enums reflejando los del schema Prisma
export type TechnicianSpecialty =
  | "MOTORES"
  | "AVIONICA"
  | "ESTRUCTURAS"
  | "SISTEMAS_HIDRAULICOS"
  | "SISTEMAS_ELECTRICOS"
  | "MANTENIMIENTO_GENERAL"
export type CertificationLevel = "BASICO" | "INTERMEDIO" | "AVANZADO" | "EXPERTO"

export interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  active: boolean
  role: UserRole
  profileImage?: string
}

// Tipos para pilotos - Actualizado según la respuesta de la API
export interface Pilot {
  id: number
  userId: number
  license: string
  flightHours: number
  medicalExpiry: string
  lastTraining: string
  active: boolean
  user: User
  certifications?: CertificationAssignment[]
  aircraftRatings?: AircraftRating[]
}

// Tipo para crear un piloto
export interface CreatePilotInput {
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }
  license: string
  flightHours: number
  medicalExpiry: string
  lastTraining: string
  certificationTypeIds: number[]
  aircraftCertifications: {
    modelId: number
    certificationDate: string
  }[]
}

// Tipo para actualizar un piloto (sin password)
export interface UpdatePilotInput extends Omit<CreatePilotInput, "user"> {
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

export interface CertificationType {
  id: number
  name: string
}

export interface CertificationAssignment {
  id: number
  pilotId: number
  certificationTypeId: number
  certificationType: {
    id: number
    name: string
  }
}

export interface AircraftRating {
  id: number
  pilotId: number
  helicopterModelId: number
  certificationDate: string
  helicopterModel: {
    id: number
    name: string
  }
}

// src/types/api.ts

// Actualizado para coincidir con la respuesta real de la API
export interface Technician {
  id: number
  userId: number
  specialty: TechnicianSpecialty // Cambiado de specialization a specialty
  certificationLevel: CertificationLevel
  yearsOfExperience: number // Cambiado de experienceYears a yearsOfExperience
  lastCertification: string
  active: boolean // Campo directo en el técnico
  user: User
}

export interface Certification {
  id: number
  name: string
  issuedDate: string
  expiryDate?: string
  issuingAuthority?: string
}

// Tipo para crear técnico
export interface CreateTechnicianInput {
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
    profileImage?: string
  }
  specialization: TechnicianSpecialty
  certificationLevel: CertificationLevel
  experienceYears: number
  lastCertification: string
}

export interface UpdateTechnicianInput {
  specialization: TechnicianSpecialty
  certificationLevel: CertificationLevel
  experienceYears: number
  lastCertification: string
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
}

// Tipos para registros de vuelo
export interface FlightLog {
  id: number
  date: string
  pilotId: number
  helicopterId: number
  clientId: number
  originId: number
  destinationId: number
  duration: number
  passengers?: number
  notes?: string
  status: FlightStatus
  paymentStatus: PaymentStatus

  startTime?: string
  landingTime?: string
  odometer?: number
  fuelStart?: number
  fuelEnd?: number
  hookUsed?: boolean
  remarks?: string
  odometerPhotoUrl?: string

  createdAt?: string
  updatedAt?: string

  // Relaciones incluidas en el backend
  pilot?: Pilot
  helicopter?: Helicopter
  client?: Client
  destination?: Destination
}

export interface NewFlightLog {
  pilotId: number
  helicopterId: number
  clientId: number
  originId: number
  destinationId: number
  date: string
  duration: number
  passengers?: number
  notes?: string
  status: FlightStatus
  paymentStatus: PaymentStatus
  startTime?: string
  landingTime?: string
  odometer?: number
  fuelStart?: number
  fuelEnd?: number
  hookUsed?: boolean
  remarks?: string
  odometerPhotoUrl?: string
}

// Tipos para clientes - SIN campo company
export interface Client {
  id: number
  name: string
  contact: string
  cuit: string // Campo único requerido
  email: string | null
  phone: string | null
  address: string | null
  type: string | null
  notes: string | null
  active: boolean
  status?: string
  contactPerson?: string
}

// Tipos para helicópteros - Actualizado según la respuesta de la API
export interface Helicopter {
  id: number
  modelId: number
  model: {
    id: number
    name: string
  }
  registration: string
  manufactureYear: number | null
  lastMaintenance: string | null // ISO string
  totalFlightHours: number | null
  status: HelicopterStatus | null
  imageUrl: string | null
  capacity: number | null
  speedKmh: number | null
  rangeKm: number | null
  ceilingMeters: number | null
}

export interface MaintenanceFormData {
  type: string
  name: string
  date: string
  details: string
  technician: string
}

export interface CreateHelicopterInput {
  modelId: number
  registration: string
  manufactureYear?: number
  lastMaintenance?: string
  totalFlightHours?: number
  status?: HelicopterStatus
  imageUrl?: string
  capacity?: number
  speedKmh?: number
  rangeKm?: number
  ceilingMeters?: number
}

// Agregar el tipo HelicopterModel después de la interfaz Helicopter

export interface HelicopterModel {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface Maintenance {
  id: number
  helicopterId: number
  type: string
  description?: string
  technicianName?: string
  date: string
  createdAt?: string
  updatedAt?: string
}

export interface Destination {
  id: number
  name: string
  latitude: number
  longitude: number
  altitude: number
  active: boolean
}

// Tipos para estadísticas
export interface StatsParams {
  month?: string
  startDate?: string
  endDate?: string
}

export interface Stats {
  totalFlights: number
  totalFlightHours: number
  totalFuelConsumed: number
  totalPassengers: number
  totalHookTime: number
  flightsByHelicopter: {
    helicopterId: string
    registration: string
    flightCount: number
    flightHours: number
  }[]
  flightsByPilot: {
    pilotId: string
    pilotName: string
    flightCount: number
    flightHours: number
  }[]
  flightsByClient: {
    clientId: string
    clientName: string
    flightCount: number
    flightHours: number
  }[]
  flightsByMonth?: {
    month: string
    flightCount: number
    flightHours: number
  }[]
}

// Tipos para respuestas genéricas
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

// Añadir tipos para el dashboard de administrador
export interface AdminDashboardData {
  role: UserRole
  summary: {
    totalFlights: number
    flightHours: number
    monthlyFlights: number
    monthlyHours: number
    totalPilots: number
    activePilots: number
    totalHelicopters: number
    activeHelicopters: number
    maintenanceHelicopters: number
  }
  fleetStatus: {
    byStatus: Record<string, number>
    byModel: Record<string, number>
  }
  flightActivity: {
    flightsPerMonth: Array<{
      month: string
      count: number
    }>
    hoursPerMonth: Array<{
      month: string
      hours: number
    }>
  }
}

// Tipos para certificaciones de aeronaves (reutilizable)
export interface AircraftCertification {
  modelId: number
  certificationDate: string
}

// Tipos para formularios de edición (solo los que realmente necesitan ser diferentes)
export interface EditHelicopterFormData {
  modelId: number
  registration: string
  manufactureYear: number | null
  totalFlightHours: number | null
  status: "ACTIVE" | "MAINTENANCE" | "INACTIVE"
  imageUrl: string
}

// Tipos para props de modales
export interface AddPilotModalProps {
  isOpen: boolean
  onClose: () => void
  onPilotAdded: () => void
  darkMode?: boolean
}

export interface EditPilotModalProps {
  isOpen: boolean
  onClose: () => void
  pilot: Pilot | null
  onPilotUpdated: () => void
  darkMode?: boolean
}

export interface EditHelicopterModelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void>
  model: HelicopterModel | null
  darkMode?: boolean
}

// Props para ClientDetailsModal
export interface ClientDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  darkMode?: boolean
  onUpdateClient?: () => void
}

// Props para EditHelicopterModelModal
export interface EditHelicopterModelModalProps {
  isOpen: boolean
  onClose: () => void
  model: HelicopterModel | null
}
