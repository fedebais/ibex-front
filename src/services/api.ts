import type {
  LoginResponse,
  RegisterData,
  User,
  Pilot,
  CreatePilotInput,
  UpdatePilotInput,
  Technician,
  CreateTechnicianInput,
  FlightLog,
  Client,
  Helicopter,
  HelicopterModel,
  Maintenance,
  Destination,
  StatsParams,
  Stats,
  ErrorResponse,
  AdminDashboardData,
  CertificationType,
} from "../types/api"

// Base URL de la API - se puede cambiar fácilmente para desarrollo/producción
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Método privado para hacer requests con manejo de errores
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`

      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as ErrorResponse
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error)
      throw error
    }
  }

  // Método privado para crear headers con autorización
  private getAuthHeaders(token: string) {
    return {
      Authorization: `Bearer ${token}`,
    }
  }

  // ==================== AUTH ENDPOINTS ====================

  async register(data: RegisterData): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  // ==================== USER ENDPOINTS ====================

  async getUsers(token: string): Promise<User[]> {
    return this.makeRequest<User[]>("/users", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getUserById(id: string, token: string): Promise<User> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async updateUser(id: string, data: Partial<User>, token: string): Promise<User> {
    return this.makeRequest<User>(`/users/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== PILOT ENDPOINTS ====================

  async getPilots(token: string): Promise<Pilot[]> {
    return this.makeRequest<Pilot[]>("/pilots", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getPilotById(id: number, token: string): Promise<Pilot> {
    return this.makeRequest<Pilot>(`/pilots/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createPilot(data: CreatePilotInput, token: string): Promise<Pilot> {
    return this.makeRequest<Pilot>("/pilots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updatePilot(id: number, data: UpdatePilotInput, token: string): Promise<Pilot> {
    return this.makeRequest<Pilot>(`/pilots/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async deletePilot(id: number, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/pilots/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== Certifications Types ENDPOINTS ====================

  async getCertificationTypes(token: string): Promise<CertificationType[]> {
    return this.makeRequest<CertificationType[]>("/certifications-types", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== TECHNICIAN ENDPOINTS ====================

  async getTechnicians(token: string): Promise<Technician[]> {
    return this.makeRequest<Technician[]>("/technicians", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getTechnicianById(id: number, token: string): Promise<Technician> {
    return this.makeRequest<Technician>(`/technicians/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createTechnician(data: CreateTechnicianInput, token: string): Promise<Technician> {
    return this.makeRequest<Technician>("/technicians", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateTechnician(id: number, data: Partial<CreateTechnicianInput>, token: string): Promise<Technician> {
    return this.makeRequest<Technician>(`/technicians/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async deleteTechnician(id: number, token: string): Promise<Technician> {
    return this.makeRequest<Technician>(`/technicians/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== FLIGHT LOG ENDPOINTS ====================

  async getFlightLogs(token: string): Promise<FlightLog[]> {
    return this.makeRequest<FlightLog[]>("/flightlogs", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getFlightLogsByPilotId(pilotId: number, token: string): Promise<FlightLog[]> {
    return this.makeRequest<FlightLog[]>(`/flightlogs/pilot/${pilotId}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createFlightLog(data: Partial<FlightLog>, token: string): Promise<FlightLog> {
    return this.makeRequest<FlightLog>("/flightlogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateFlightLog(id: string, data: Partial<FlightLog>, token: string): Promise<FlightLog> {
    return this.makeRequest<FlightLog>(`/flightlogs/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    })
  }

  async deleteFlightLog(id: string, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/flightlogs/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== CLIENT ENDPOINTS ====================

  async getClients(token: string): Promise<Client[]> {
    return this.makeRequest<Client[]>("/clients", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getClientById(id: number, token: string): Promise<Client> {
    return this.makeRequest<Client>(`/clients/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createClient(data: Partial<Client>, token: string): Promise<Client> {
    return this.makeRequest<Client>("/clients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateClient(id: string, data: Partial<Client>, token: string): Promise<Client> {
    return this.makeRequest<Client>(`/clients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async deleteClient(id: string, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/clients/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== HELICOPTER ENDPOINTS ====================

  async getHelicopters(token: string): Promise<Helicopter[]> {
    return this.makeRequest<Helicopter[]>("/helicopters", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getHelicopterById(id: number, token: string): Promise<Helicopter> {
    return this.makeRequest<Helicopter>(`/helicopters/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createHelicopter(data: Partial<Helicopter>, token: string): Promise<Helicopter> {
    return this.makeRequest<Helicopter>("/helicopters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateHelicopter(id: number, data: Partial<Helicopter>, token: string): Promise<Helicopter> {
    return this.makeRequest<Helicopter>(`/helicopters/${id}`, {
      method: "PUT",
        headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async deleteHelicopter(id: number, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/helicopters/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== HELICOPTER MODEL ENDPOINTS ====================

  async getHelicopterModels(token: string): Promise<HelicopterModel[]> {
    return this.makeRequest<HelicopterModel[]>("/helicopters/models", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getHelicopterModelById(id: number, token: string): Promise<HelicopterModel> {
    return this.makeRequest<HelicopterModel>(`/helicopters/models/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createHelicopterModel(data: { name: string; manufacturer?: string }, token: string): Promise<HelicopterModel> {
    return this.makeRequest<HelicopterModel>("/helicopters/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateHelicopterModel(
    id: number,
    data: { name: string; manufacturer?: string },
    token: string,
  ): Promise<HelicopterModel> {
    return this.makeRequest<HelicopterModel>(`/helicopters/models/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async deleteHelicopterModel(id: number, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/helicopters/models/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== MAINTENANCE ENDPOINTS ====================

  async getMaintenances(token: string): Promise<Maintenance[]> {
    return this.makeRequest<Maintenance[]>("/maintenance", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getMaintenanceById(id: number, token: string): Promise<Maintenance> {
    return this.makeRequest<Maintenance>(`/maintenance/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async getMaintenanceByHelicopterId(helicopterId: number, token: string): Promise<Maintenance[]> {
    return this.makeRequest<Maintenance[]>(`/maintenance/helicopter/${helicopterId}`, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createMaintenance(data: Partial<Maintenance>, token: string): Promise<Maintenance> {
    return this.makeRequest<Maintenance>("/maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateMaintenance(id: number, data: Partial<Maintenance>, token: string): Promise<Maintenance> {
    return this.makeRequest<Maintenance>(`/maintenance/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    })
  }

  async deleteMaintenance(id: number, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/maintenance/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== DESTINATION ENDPOINTS ====================

  async getDestinations(token: string): Promise<Destination[]> {
    return this.makeRequest<Destination[]>("/destinations", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  async createDestination(data: Partial<Destination>, token: string): Promise<Destination> {
    return this.makeRequest<Destination>("/destinations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async updateDestination(id: string, data: Partial<Destination>, token: string): Promise<Destination> {
    return this.makeRequest<Destination>(`/destinations/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // 👈 esto es esencial
        ...this.getAuthHeaders(token),
      },
      body: JSON.stringify(data),
    })
  }

  async deleteDestination(id: number, token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/destinations/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== STATS ENDPOINTS ====================

  async getStats(params: StatsParams = {}, token: string): Promise<Stats> {
    const queryParams = new URLSearchParams()

    if (params.month) queryParams.append("month", params.month)
    if (params.startDate) queryParams.append("startDate", params.startDate)
    if (params.endDate) queryParams.append("endDate", params.endDate)

    const queryString = queryParams.toString()
    const endpoint = `/stats${queryString ? `?${queryString}` : ""}`

    return this.makeRequest<Stats>(endpoint, {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }

  // ==================== UTILITY METHODS ====================

  // Método para verificar si el token es válido
  async verifyToken(token: string): Promise<boolean> {
    try {
      await this.makeRequest<any>("/auth/verify", {
        method: "GET",
        headers: this.getAuthHeaders(token),
      })
      return true
    } catch (error) {
      return false
    }
  }

  // Método para refrescar el token
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    })
  }

  // Método para logout
  async logout(token: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>("/auth/logout", {
      method: "POST",
      headers: this.getAuthHeaders(token),
    })
  }

  // Añadir el método para obtener los datos del dashboard de administrador
  async getAdminDashboard(token: string): Promise<AdminDashboardData> {
    return this.makeRequest<AdminDashboardData>("/dashboard/admin", {
      method: "GET",
      headers: this.getAuthHeaders(token),
    })
  }
}

// Instancia exportada de la API
export const api = new ApiService(baseURL)

// También exportamos funciones individuales para compatibilidad (usando bind para mantener el contexto)
export const register = api.register.bind(api)
export const login = api.login.bind(api)
export const getUsers = api.getUsers.bind(api)
export const getUserById = api.getUserById.bind(api)
export const updateUser = api.updateUser.bind(api)
export const deleteUser = api.deleteUser.bind(api)
export const getPilots = api.getPilots.bind(api)
export const getPilotById = api.getPilotById.bind(api)
export const createPilot = api.createPilot.bind(api)
export const updatePilot = api.updatePilot.bind(api)
export const deletePilot = api.deletePilot.bind(api)
export const getFlightLogs = api.getFlightLogs.bind(api)
export const getFlightLogsByPilotId = api.getFlightLogsByPilotId.bind(api)
export const createFlightLog = api.createFlightLog.bind(api)
export const updateFlightLog = api.updateFlightLog.bind(api)
export const deleteFlightLog = api.deleteFlightLog.bind(api)
export const getClients = api.getClients.bind(api)
export const getClientById = api.getClientById.bind(api)
export const createClient = api.createClient.bind(api)
export const updateClient = api.updateClient.bind(api)
export const deleteClient = api.deleteClient.bind(api)
export const getHelicopters = api.getHelicopters.bind(api)
export const getHelicopterById = api.getHelicopterById.bind(api)
export const createHelicopter = api.createHelicopter.bind(api)
export const updateHelicopter = api.updateHelicopter.bind(api)
export const deleteHelicopter = api.deleteHelicopter.bind(api)
export const getHelicopterModels = api.getHelicopterModels.bind(api)
export const getHelicopterModelById = api.getHelicopterModelById.bind(api)
export const createHelicopterModel = api.createHelicopterModel.bind(api)
export const updateHelicopterModel = api.updateHelicopterModel.bind(api)
export const deleteHelicopterModel = api.deleteHelicopterModel.bind(api)
export const getMaintenances = api.getMaintenances.bind(api)
export const getMaintenanceById = api.getMaintenanceById.bind(api)
export const getMaintenanceByHelicopterId = api.getMaintenanceByHelicopterId.bind(api)
export const createMaintenance = api.createMaintenance.bind(api)
export const updateMaintenance = api.updateMaintenance.bind(api)
export const deleteMaintenance = api.deleteMaintenance.bind(api)
export const getDestinations = api.getDestinations.bind(api)
export const createDestination = api.createDestination.bind(api)
export const updateDestination = api.updateDestination.bind(api)
export const deleteDestination = api.deleteDestination.bind(api)
export const getStats = api.getStats.bind(api)
export const verifyToken = api.verifyToken.bind(api)
export const refreshToken = api.refreshToken.bind(api)
export const logout = api.logout.bind(api)
export const getAdminDashboard = api.getAdminDashboard.bind(api)
export const getCertificationTypes = api.getCertificationTypes.bind(api)
export const getTechnicians = api.getTechnicians.bind(api)
export const getTechnicianById = api.getTechnicianById.bind(api)
export const createTechnician = api.createTechnician.bind(api)
export const updateTechnician = api.updateTechnician.bind(api)
export const deleteTechnician = api.deleteTechnician.bind(api)
